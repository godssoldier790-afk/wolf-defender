import type { ScanReport } from "@/lib/types";
import { cn } from "@/lib/cn";

export function Indicators({ report }: { report: ScanReport }) {
  if (!report.indicators.length) {
    return <section className="rounded-xl bg-surface p-5 text-sm text-muted">No indicators flagged.</section>;
  }
  return (
    <ul className="space-y-2">
      {report.indicators.map((item) => (
        <li key={item.id} className="rounded-xl bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted">{item.detail}</p>
            </div>
            <span className={cn("font-mono text-xs tabular-nums", item.points >= 25 ? "text-danger" : item.points > 0 ? "text-caution" : "text-safe")}>
              {item.points > 0 ? `+${item.points}` : item.points}
            </span>
          </div>
          <p className="mt-2 text-[11px] tracking-wide text-subtle uppercase">
            {item.severity} · {item.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
