import { collectIndicators } from "./heuristics.ts";
import { intelForHost } from "./intel.ts";
import { computeScore } from "./score.ts";
import { isBlockedScheme, isPrivateOrLocalIp, ssrfReason } from "./ssrf.ts";
import { parseUrl } from "./url.ts";
import type { DestinationPeek, RedirectHop, ScanReport } from "./types.ts";

export type AnalyzeOptions = {
  live?: boolean;
  hops?: RedirectHop[];
  destination?: DestinationPeek | null;
  fetchAttempted?: boolean;
  fetchSucceeded?: boolean;
  fetchFailed?: boolean;
  resolved?: boolean;
  blockedReason?: string;
  notes?: string[];
};

function idFor(input: string): string {
  const stamp = Date.now().toString(36);
  const slug = input.slice(0, 24).replace(/[^a-z0-9]+/gi, "-");
  return `scan-${stamp}-${slug || "url"}`;
}

export function analyzeStatic(input: string, opts: AnalyzeOptions = {}): ScanReport {
  const raw = (input ?? "").trim();
  const blockedScheme = isBlockedScheme(raw);
  const parts = blockedScheme ? null : parseUrl(raw);
  const hops = opts.hops ?? [];
  const destination = opts.destination ?? null;
  const indicators = collectIndicators(parts, raw, hops, destination);
  const ssrf = parts?.isIp && isPrivateOrLocalIp(parts.hostname) ? ssrfReason(parts.href) : blockedScheme ? ssrfReason(raw) : parts ? ssrfReason(parts.href) : ssrfReason(raw);
  const blocked = Boolean(opts.blockedReason) || Boolean(ssrf) || indicators.some((i) => i.id === "ssrf" || i.id === "javascript-scheme" || i.id === "blocked-scheme");
  const intel = parts ? intelForHost(parts.hostname) : [];
  const liveSucceeded = Boolean(opts.fetchSucceeded || opts.resolved);

  const syntheticHops: RedirectHop[] =
    hops.length > 0
      ? hops
      : parts && !blocked
        ? [
            {
              index: 0,
              url: parts.href,
              host: parts.hostname,
              registrableDomain: parts.registrableDomain,
              status: null,
              method: "SYNTHETIC",
              location: null,
              timingMs: null,
              blocked: false,
            },
          ]
        : [];

  const scored = computeScore({
    parts,
    indicators,
    intelHits: intel.filter((hit) => hit.verdict === "phishing" || hit.verdict === "malware").length,
    liveSucceeded,
    blocked,
  });

  const notes = [...(opts.notes ?? [])];
  if (!liveSucceeded) notes.push("Heuristic scan. Live redirect following did not complete.");
  if (blocked) notes.push(opts.blockedReason ?? ssrf ?? "Fetch blocked by scheme or SSRF policy.");
  if (opts.fetchFailed) notes.push("Remote fetch failed.");

  return {
    id: idFor(raw),
    scannedAt: Date.now(),
    originalUrl: raw,
    normalizedUrl: parts?.href ?? raw,
    finalUrl: hops.at(-1)?.url ?? (blocked ? null : parts?.href ?? null),
    hops: syntheticHops,
    indicators,
    intel,
    destination,
    ...scored,
    fetchAttempted: Boolean(opts.fetchAttempted),
    fetchSucceeded: liveSucceeded,
    blockedReason: blocked ? opts.blockedReason ?? indicators.find((i) => i.id === "ssrf" || i.id === "javascript-scheme" || i.id === "blocked-scheme")?.title : undefined,
    notes,
  };
}

export async function analyzeUrl(input: string, opts: AnalyzeOptions = {}): Promise<ScanReport> {
  if (opts.live && typeof fetch === "function") {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input, followRedirects: true }),
      });
      if (response.ok) return (await response.json()) as ScanReport;
    } catch {
      // fall through to static
    }
  }
  return analyzeStatic(input, { ...opts, fetchAttempted: false, fetchSucceeded: false });
}

export { analyzeStatic as analyze };
