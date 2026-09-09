const BLOCKED_SCHEMES = new Set(["javascript", "data", "file", "blob"]);

export function schemeOf(raw: string): string {
  const trimmed = raw.trim();
  const idx = trimmed.indexOf(":");
  if (idx <= 0) return "";
  return trimmed.slice(0, idx).toLowerCase();
}

export function isBlockedScheme(raw: string): boolean {
  return BLOCKED_SCHEMES.has(schemeOf(raw));
}

export function isPrivateOrLocalIp(ip: string): boolean {
  const v = ip.trim().toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  if (v === "::1" || v === "localhost") return true;
  if (v.includes(":")) {
    return v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
  }
  const p = v.split(".").map((n) => Number(n));
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return false;
  const [a, b] = p;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function isIpLiteral(hostname: string): boolean {
  const host = hostname.replace(/^\[/, "").replace(/\]$/, "");
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

export function ssrfReason(input: string | URL): string | null {
  try {
    const url = typeof input === "string" ? new URL(input.includes(":") ? input : `https://${input}`) : input;
    const scheme = url.protocol.replace(":", "").toLowerCase();
    if (BLOCKED_SCHEMES.has(scheme)) return `Blocked scheme: ${scheme}:`;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost")) return "Blocked loopback hostname";
    if (isIpLiteral(host) && isPrivateOrLocalIp(host)) {
      return "Blocked private, loopback, link-local, or metadata address";
    }
    return null;
  } catch {
    if (typeof input === "string" && isBlockedScheme(input)) {
      return `Blocked scheme: ${schemeOf(input)}:`;
    }
    return null;
  }
}
