import type { UrlParts } from "./types";
import { isBlockedScheme, isIpLiteral, schemeOf } from "./ssrf";

const MULTI_TLDS = new Set(["co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "co.jp", "com.br", "co.in"]);

export function normalizeInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (schemeOf(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function registrableDomain(hostname: string): string | null {
  if (isIpLiteral(hostname)) return null;
  const labels = hostname.toLowerCase().split(".").filter(Boolean);
  if (labels.length < 2) return hostname.toLowerCase();
  const lastTwo = labels.slice(-2).join(".");
  const lastThree = labels.slice(-3).join(".");
  if (MULTI_TLDS.has(lastTwo) && labels.length >= 3) return lastThree;
  return lastTwo;
}

export function executableHint(url: URL, contentType: string | null): boolean {
  const path = url.pathname.toLowerCase();
  if (/\.(exe|dll|scr|msi|apk|dmg|bat|cmd|ps1|js|vbs|jar)$/.test(path)) return true;
  if (!contentType) return false;
  return /application\/(x-msdownload|octet-stream|java-archive|x-executable)/i.test(contentType);
}

export function parseUrl(raw: string): UrlParts | null {
  if (isBlockedScheme(raw)) return null;
  try {
    const u = new URL(normalizeInput(raw));
    const hostname = u.hostname.toLowerCase();
    const reg = registrableDomain(hostname);
    const labels = hostname.split(".").filter(Boolean);
    const tld = isIpLiteral(hostname) ? null : labels.at(-1) ?? null;
    const subdomain =
      reg && hostname.endsWith(reg) && hostname !== reg ? hostname.slice(0, -(reg.length + 1)) : null;
    return {
      raw,
      href: u.href,
      protocol: u.protocol.replace(":", ""),
      username: decodeURIComponent(u.username),
      host: u.host.toLowerCase(),
      hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      registrableDomain: reg,
      subdomain,
      tld,
      isIp: isIpLiteral(hostname),
      isIpv6: hostname.includes(":"),
      punycode: hostname.includes("xn--"),
      unicodeHost: hostname,
    };
  } catch {
    return null;
  }
}
