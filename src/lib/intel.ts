import type { IntelHit } from "./types";

const PHISHING_HOSTS = new Set(["paypa1.com", "paypal.com.secure-login.tk", "secure-login.tk"]);

export function intelForHost(hostname: string): IntelHit[] {
  const host = hostname.toLowerCase();
  if (PHISHING_HOSTS.has(host)) {
    return [
      {
        source: "WOLF bundled watchlist",
        verdict: "phishing",
        identifier: host,
        detail: "Host appears on the bundled phishing watchlist.",
      },
    ];
  }
  return [];
}
