export type RiskBand = "LOW" | "GUARDED" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IndicatorSeverity = "info" | "low" | "medium" | "high" | "critical";

export type RecommendationCode =
  | "DO_NOT_VISIT"
  | "NO_CREDENTIALS"
  | "PROCEED_WITH_CAUTION"
  | "REVIEW_INDICATORS"
  | "INSUFFICIENT_EVIDENCE";

export interface UrlParts {
  raw: string;
  href: string;
  protocol: string;
  username: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  registrableDomain: string | null;
  subdomain: string | null;
  tld: string | null;
  isIp: boolean;
  isIpv6: boolean;
  punycode: boolean;
  unicodeHost: string;
}

export interface RedirectHop {
  index: number;
  url: string;
  host: string;
  registrableDomain: string | null;
  status: number | null;
  method: "HEAD" | "GET" | "SYNTHETIC";
  location: string | null;
  timingMs: number | null;
  blocked: boolean;
  reason?: string;
}

export interface Indicator {
  id: string;
  title: string;
  detail: string;
  severity: IndicatorSeverity;
  points: number;
  category:
    | "structure"
    | "brand"
    | "homograph"
    | "redirect"
    | "content"
    | "intel"
    | "transport"
    | "policy";
}

export interface IntelHit {
  source: string;
  verdict: "phishing" | "malware" | "suspicious" | "benign-watch";
  identifier: string;
  detail: string;
  listedAt?: string;
}

export interface ScanReport {
  id: string;
  scannedAt: number;
  originalUrl: string;
  normalizedUrl: string;
  finalUrl: string | null;
  hops: RedirectHop[];
  indicators: Indicator[];
  intel: IntelHit[];
  risk: number;
  band: RiskBand;
  confidence: number;
  recommendation: RecommendationCode;
  recommendationText: string;
  fetchAttempted: boolean;
  fetchSucceeded: boolean;
  blockedReason?: string;
  notes: string[];
}

export interface HistoryEntry {
  id: string;
  scannedAt: number;
  originalUrl: string;
  finalUrl: string | null;
  risk: number;
  band: RiskBand;
  confidence: number;
  indicatorCount: number;
}

export const BAND_COPY: Record<RiskBand, string> = {
  LOW: "No strong indicators found. Insufficient evidence to determine whether this URL is safe.",
  GUARDED: "Review indicators before continuing.",
  MEDIUM: "Proceed with caution; verify the final domain yourself.",
  HIGH: "Do not enter credentials or personal information.",
  CRITICAL: "DO NOT VISIT",
};

export const BAND_RANGE: Record<RiskBand, string> = {
  LOW: "0–19",
  GUARDED: "20–39",
  MEDIUM: "40–59",
  HIGH: "60–79",
  CRITICAL: "80–100",
};
