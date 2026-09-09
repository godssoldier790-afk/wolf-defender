import type { HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

export function HistoryPanel({ entries, onClear }: { entries: HistoryEntry[]; onClear: () => void }) {
  return (
    <section className="rounded-xl bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-wide text-muted uppercase">Scan history</p>
        {entries.length > 0 ? (
          <button type="button" onClick={onClear} className="text-xs text-subtle hover:text-ink">
            Clear
          </button>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No scans yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 rounded-md bg-elevated px-3 py-2">
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-frost">{entry.originalUrl}</p>
                <p className="mt-0.5 text-[11px] text-subtle">
                  {new Date(entry.scannedAt).toLocaleString()} · {entry.indicatorCount} indicators
                </p>
              </div>
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  entry.band === "CRITICAL" || entry.band === "HIGH" ? "text-danger" : entry.band === "MEDIUM" ? "text-caution" : "text-safe",
                )}
              >
                {entry.band} {entry.risk}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
