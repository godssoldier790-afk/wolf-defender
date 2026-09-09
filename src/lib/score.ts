import { isOfficialHost } from "./brands.ts";
import type { Indicator, RecommendationCode, RiskBand, ScanReport, UrlParts } from "./types.ts";
import { BAND_COPY } from "./types.ts";

export function bandFor(risk: number): RiskBand {
  if (risk >= 80) return "CRITICAL";
  if (risk >= 60) return "HIGH";
  if (risk >= 40) return "MEDIUM";
  if (risk >= 20) return "GUARDED";
  return "LOW";
}

export function recommendationFor(band: RiskBand): RecommendationCode {
  switch (band) {
    case "CRITICAL":
      return "DO_NOT_VISIT";
    case "HIGH":
      return "NO_CREDENTIALS";
    case "MEDIUM":
      return "PROCEED_WITH_CAUTION";
    case "GUARDED":
      return "REVIEW_INDICATORS";
    default:
      return "INSUFFICIENT_EVIDENCE";
  }
}

export function computeScore(args: {
  parts: UrlParts | null;
  indicators: Indicator[];
  intelHits: number;
  liveSucceeded: boolean;
  blocked: boolean;
}): Pick<ScanReport, "risk" | "band" | "confidence" | "recommendation" | "recommendationText"> {
  const indicators = [...args.indicators];
  let risk = indicators.reduce((sum, item) => sum + item.points, 0);

  const hasTyposquat = indicators.some((i) => i.id === "typosquat" || i.id === "brand-in-subdomain");
  const hasLogin = indicators.some((i) => i.id === "login-path" || i.id === "login-form");
  const hasIp = indicators.some((i) => i.id === "ip-literal");
  const hasShortener = indicators.some((i) => i.id === "shortener");

  if (hasLogin && (hasTyposquat || hasIp)) risk += 20;

  if (hasShortener && !args.liveSucceeded && !indicators.some((i) => i.id === "unresolved-destination")) {
    risk += 15;
    indicators.push({
      id: "unresolved-destination",
      title: "Destination not resolved",
      detail: "Live hop following was not completed, so the shortener still hides the next site.",
      severity: "low",
      points: 15,
      category: "redirect",
    });
    args.indicators.push(indicators[indicators.length - 1]);
  }

  if (args.intelHits > 0) risk += 80;

  if (args.parts && isOfficialHost(args.parts.hostname) && !hasTyposquat) {
    risk = Math.max(0, risk - 25);
  }

  risk = Math.max(0, Math.min(100, risk));
  if (args.indicators.some((i) => i.id === "javascript-scheme")) risk = 100;

  const band = bandFor(risk);
  let confidence = 42;
  if (args.parts) confidence += 15;
  if (args.liveSucceeded) confidence += 15;
  if (args.intelHits > 0) confidence += 15;
  if (!args.liveSucceeded) confidence -= 10;
  if (args.blocked) confidence += 8;
  confidence = Math.max(5, Math.min(args.intelHits > 0 ? 95 : 90, confidence));

  return {
    risk,
    band,
    confidence,
    recommendation: recommendationFor(band),
    recommendationText: BAND_COPY[band],
  };
}
