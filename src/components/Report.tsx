import type { ScanReport } from "@/lib/types";
import { Stat } from "@/components/Stat";

const TONE: Record<string, "safe" | "caution" | "danger" | "critical" | "frost"> = {
  LOW: "safe",
  GUARDED: "frost",
  MEDIUM: "caution",
  HIGH: "danger",
  CRITICAL: "critical",
};

export function Report({ report }: { report: ScanReport }) {
  const tone = TONE[report.band] ?? "frost";
  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-wide text-muted uppercase">Risk</p>
            <p className={`font-display text-5xl leading-none text-${tone}`}>
              <span className="font-mono tabular-nums">{report.risk}</span>
              <span className="ml-2 text-lg text-muted">/100</span>
            </p>
            <p className={`mt-2 text-sm tracking-wide uppercase text-${tone}`}>{report.band}</p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-wide text-muted uppercase">Confidence</p>
            <p className="font-mono text-2xl tabular-nums">{report.confidence}/100</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-frost">{report.recommendationText}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat label="Original URL" value={report.originalUrl} tone="frost" />
        <Stat label="Final destination" value={report.finalUrl ?? "(unresolved)"} tone="caution" />
        <Stat label="Redirects" value={String(report.hops.filter((hop) => hop.location).length)} />
        <Stat label="Indicators" value={String(report.indicators.length)} />
      </div>
    </section>
  );
}
