import { BRANDS, isOfficialHost } from "./brands.ts";
import { isShortener } from "./shorteners.ts";
import { isBlockedScheme, isPrivateOrLocalIp, schemeOf } from "./ssrf.ts";
import type { DestinationPeek, Indicator, RedirectHop, UrlParts } from "./types.ts";

const SUSPICIOUS_TLDS = new Set([
  "zip", "xyz", "top", "click", "gq", "tk", "ml", "cf", "ga", "rest", "quest",
  "loan", "win", "country", "link", "work", "mov",
]);

const LOGIN_RE = /login|signin|sign-in|wp-login|account|verify|password|passwd|credential|auth/i;

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function indicator(
  id: string,
  title: string,
  detail: string,
  severity: Indicator["severity"],
  points: number,
  category: Indicator["category"],
): Indicator {
  return { id, title, detail, severity, points, category };
}

export function collectIndicators(
  parts: UrlParts | null,
  raw: string,
  hops: RedirectHop[] = [],
  destination: DestinationPeek | null = null,
): Indicator[] {
  const out: Indicator[] = [];
  const scheme = schemeOf(raw);

  if (scheme === "javascript" || (isBlockedScheme(raw) && scheme === "javascript")) {
    out.push(indicator(
      "javascript-scheme",
      "JavaScript URL",
      "javascript: URLs can execute code in the current page and must not be opened.",
      "critical",
      100,
      "policy",
    ));
    return out;
  }
  if (scheme === "data" || scheme === "file" || scheme === "blob") {
    out.push(indicator(
      "blocked-scheme",
      "Blocked scheme",
      `${scheme}: URLs are not fetched by Wolf Defender.`,
      "critical",
      80,
      "policy",
    ));
    return out;
  }

  if (!parts) {
    out.push(indicator("unparseable", "Unparseable URL", "The input is not a valid URL.", "high", 40, "structure"));
    return out;
  }

  if (parts.isIp && isPrivateOrLocalIp(parts.hostname)) {
    out.push(indicator(
      "ssrf",
      "Private or local address",
      "This host is loopback, RFC1918, link-local, or metadata. Wolf Defender will not fetch it.",
      "critical",
      40,
      "policy",
    ));
  }

  if (parts.isIp) {
    out.push(indicator(
      "ip-literal",
      "IP-literal host",
      "Legitimate consumer sites almost never ask you to log in on a raw IP address.",
      "high",
      25,
      "structure",
    ));
  }

  if (parts.protocol === "http") {
    out.push(indicator("no-tls", "No TLS", "The URL uses HTTP instead of HTTPS.", "medium", 15, "transport"));
  }

  if (parts.username) {
    out.push(indicator(
      "userinfo",
      "Embedded userinfo",
      "An @ userinfo prefix can hide the real destination.",
      "high",
      25,
      "structure",
    ));
  }

  if (parts.punycode) {
    out.push(indicator(
      "homograph",
      "Punycode / IDN host",
      "Internationalized domain names can mimic familiar brands with lookalike characters.",
      "high",
      30,
      "homograph",
    ));
  }

  if (parts.tld && SUSPICIOUS_TLDS.has(parts.tld)) {
    out.push(indicator(
      "suspicious-tld",
      "Suspicious TLD",
      `.${parts.tld} is frequently abused in phishing campaigns.`,
      "medium",
      15,
      "structure",
    ));
  }

  const haystack = `${parts.pathname}${parts.search}`;
  if (LOGIN_RE.test(haystack)) {
    out.push(indicator(
      "login-path",
      "Credential path",
      "Path or query looks like a login, verification, or account-recovery page.",
      "medium",
      16,
      "content",
    ));
  }

  if (isShortener(parts.hostname)) {
    out.push(indicator(
      "shortener",
      "Known shortener",
      "Shorteners hide the next hop. Resolve the chain before you trust the destination.",
      "low",
      8,
      "redirect",
    ));
  }

  if (!isOfficialHost(parts.hostname) && !parts.isIp) {
    const labels = parts.hostname.split(".");
    const first = labels[0] ?? "";
    for (const brand of BRANDS) {
      const official = brand.suffixes.some(
        (suffix) => parts.hostname === suffix || parts.hostname.endsWith(`.${suffix}`),
      );
      if (official) continue;
      const exactLabel = labels.some((label) => label === brand.tokens[0]);
      const tokenInHost = brand.tokens.some((token) => parts.hostname.includes(token));
      if (exactLabel && parts.registrableDomain && !brand.suffixes.includes(parts.registrableDomain)) {
        out.push(indicator(
          "brand-in-subdomain",
          `${brand.name} token on a foreign domain`,
          `The brand appears in labels of ${parts.hostname}, but the registrable domain is ${parts.registrableDomain}.`,
          "high",
          30,
          "brand",
        ));
        break;
      }
      const distanceHits = brand.tokens.some((token) => {
        const d = levenshtein(first, token);
        return token.length >= 5 && d > 0 && d <= 2;
      });
      if (distanceHits) {
        out.push(indicator(
          "typosquat",
          `${brand.name} lookalike host`,
          `${parts.hostname} is edit-close to ${brand.name} but is not an official host.`,
          "high",
          35,
          "brand",
        ));
        break;
      }
      if (tokenInHost && parts.registrableDomain && !brand.suffixes.includes(parts.registrableDomain)) {
        out.push(indicator(
          "brand-in-subdomain",
          `${brand.name} token on a foreign domain`,
          `The brand appears in labels of ${parts.hostname}, but the registrable domain is ${parts.registrableDomain}.`,
          "high",
          30,
          "brand",
        ));
        break;
      }
    }
  }

  if (parts.punycode) {
    const aceHost = parts.hostname.replace(/xn--/g, "").split(".")[0] ?? "";
    const brandish = BRANDS.some((brand) =>
      brand.tokens.some((token) => {
        const core = token.replace(/[01]/g, "");
        const aceAlpha = (aceHost.split("-")[0] ?? "").replace(/[^a-z]/g, "");
        return aceAlpha.includes(core.slice(0, 4)) || levenshtein(aceAlpha, core) <= 2;
      }),
    );
    if (brandish && !out.some((item) => item.id === "typosquat" || item.id === "brand-in-subdomain")) {
      out.push(indicator(
        "typosquat",
        "IDN brand lookalike",
        "The punycode host contains fragments of a watched payment or tech brand.",
        "high",
        35,
        "brand",
      ));
    }
  }

  const domains = new Set(hops.map((h) => h.registrableDomain).filter(Boolean));
  if (domains.size >= 2) {
    out.push(indicator(
      "multi-domain-hops",
      "Multi-domain redirect chain",
      "The chain crosses more than one registrable domain.",
      "medium",
      20,
      "redirect",
    ));
  }

  if (destination?.loginFormDetected) {
    out.push(indicator(
      "login-form",
      "Login form in destination",
      "The retrieved page contains a password field or login form.",
      "high",
      25,
      "content",
    ));
  }
  if (destination?.obfuscatedJs) {
    out.push(indicator(
      "obfuscated-js",
      "Obfuscated JavaScript patterns",
      "eval / fromCharCode / atob patterns were present in the peeked body.",
      "medium",
      15,
      "content",
    ));
  }
  if (destination?.executableHint) {
    out.push(indicator(
      "executable-hint",
      "Executable download hint",
      "Path or content-type looks like an unexpected binary download.",
      "high",
      30,
      "content",
    ));
  }

  return out;
}
