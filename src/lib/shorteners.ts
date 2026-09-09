export const SHORTENER_HOSTS = new Set([
  "bit.ly", "t.co", "tinyurl.com", "ow.ly", "rebrand.ly", "cutt.ly", "is.gd",
  "buff.ly", "rb.gy", "shorturl.at", "lnkd.in", "tiny.cc",
]);

export function isShortener(hostname: string): boolean {
  return SHORTENER_HOSTS.has(hostname.toLowerCase());
}
