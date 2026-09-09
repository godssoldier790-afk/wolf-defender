import { analyzeStatic } from "../src/lib/analyze";
import { ssrfReason } from "../src/lib/ssrf";
import type { DestinationPeek, RedirectHop, ScanReport } from "../src/lib/types";
import { executableHint, parseUrl, registrableDomain } from "../src/lib/url";

const MAX_HOPS = 8;
const TIMEOUT_MS = 6000;
const MAX_BODY = 64_000;
const UA = "WolfDefender/1.0 (+defensive-url-scanner; no-js)";

function abortableTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

async function safeFetch(url: URL, method: "HEAD" | "GET"): Promise<Response> {
  const reason = ssrfReason(url);
  if (reason) throw new Error(reason);
  const { controller, timer } = abortableTimeout(TIMEOUT_MS);
  try {
    return await fetch(url.href, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function peekBody(text: string, url: URL, contentType: string | null, status: number | null): DestinationPeek {
  const lower = text.toLowerCase();
  return {
    inspected: true,
    title: /<title[^>]*>([^<]{1,180})<\/title>/i.exec(text)?.[1]?.trim() ?? null,
    status,
    contentType,
    bytesRead: text.length,
    loginFormDetected:
      /type\s*=\s*["']password["']/.test(lower) ||
      /<form[^>]*(login|signin|sign-in)/.test(lower) ||
      /name\s*=\s*["'](password|passwd|pass)["']/.test(lower),
    executableHint: executableHint(url, contentType),
    obfuscatedJs: /eval\s*\(|fromcharcode|unescape\s*\(|atob\s*\(/.test(lower),
  };
}

export async function resolveAndAnalyze(raw: string): Promise<ScanReport> {
  const start = parseUrl(raw);
  if (!start) return analyzeStatic(raw, { fetchAttempted: false, fetchSucceeded: false });

  const blocked = ssrfReason(start.href);
  if (blocked) {
    return analyzeStatic(raw, {
      fetchAttempted: false,
      fetchSucceeded: false,
      blockedReason: blocked,
      notes: [blocked],
    });
  }

  const hops: RedirectHop[] = [];
  const notes: string[] = [];
  let current = new URL(start.href);
  let destination: DestinationPeek | null = null;
  let fetchSucceeded = false;

  for (let i = 0; i < MAX_HOPS; i += 1) {
    const reason = ssrfReason(current);
    if (reason) {
      notes.push(reason);
      hops.push({
        index: i,
        url: current.href,
        host: current.hostname,
        registrableDomain: registrableDomain(current.hostname),
        status: null,
        method: "SYNTHETIC",
        location: null,
        timingMs: 0,
        blocked: true,
        reason,
      });
      break;
    }

    const t0 = Date.now();
    let response: Response | null = null;
    let method: "HEAD" | "GET" = "HEAD";
    try {
      response = await safeFetch(current, "HEAD");
      if (response.status === 405 || response.status === 501 || response.status === 403) {
        method = "GET";
        response = await safeFetch(current, "GET");
      }
    } catch {
      try {
        method = "GET";
        response = await safeFetch(current, "GET");
      } catch (inner) {
        notes.push(inner instanceof Error ? inner.message : "Fetch failed");
        hops.push({
          index: i,
          url: current.href,
          host: current.hostname,
          registrableDomain: registrableDomain(current.hostname),
          status: null,
          method,
          location: null,
          timingMs: Date.now() - t0,
          blocked: false,
          reason: "fetch-failed",
        });
        break;
      }
    }

    if (!response) break;
    fetchSucceeded = true;
    const location = response.headers.get("location");
    hops.push({
      index: i,
      url: current.href,
      host: current.hostname,
      registrableDomain: registrableDomain(current.hostname),
      status: response.status,
      method,
      location,
      timingMs: Date.now() - t0,
      blocked: false,
    });

    if (location && response.status >= 300 && response.status < 400) {
      try {
        current = new URL(location, current);
        continue;
      } catch {
        notes.push(`Unparseable redirect location: ${location}`);
        break;
      }
    }

    try {
      const getRes = method === "GET" ? response : await safeFetch(current, "GET");
      const contentType = getRes.headers.get("content-type");
      const buf = new Uint8Array(await getRes.arrayBuffer());
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, MAX_BODY));
      destination = peekBody(text, current, contentType, getRes.status);
    } catch (error) {
      notes.push(error instanceof Error ? error.message : "Body peek failed");
    }
    break;
  }

  if (hops.length >= MAX_HOPS) {
    notes.push("Redirect hop limit reached (8).");
    const last = hops[hops.length - 1];
    if (last) last.reason = last.reason ?? "hop-limit";
  }

  return analyzeStatic(raw, {
    hops,
    destination,
    fetchAttempted: true,
    fetchSucceeded,
    notes,
  });
}
