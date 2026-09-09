import { useMemo, useState } from "react";
import { ColorRail, LiveDot, WolfMark } from "@/components/Mark";
import { Scanner } from "@/components/Scanner";
import { Report } from "@/components/Report";
import { Chain } from "@/components/Chain";
import { Indicators } from "@/components/Indicators";
import { Intel } from "@/components/Intel";
import { HistoryPanel } from "@/components/History";
import { analyzeStatic } from "@/lib/analyze";
import { clearHistory, loadHistory, recordScan } from "@/lib/history";
import type { HistoryEntry, ScanReport } from "@/lib/types";
import { cn } from "@/lib/cn";

type Tab = "report" | "chain" | "indicators" | "intel" | "history";

export default function App() {
  const [report, setReport] = useState<ScanReport | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [tab, setTab] = useState<Tab>("report");
  const [busy, setBusy] = useState(false);

  async function onScan(url: string) {
    setBusy(true);
    try {
      let next = analyzeStatic(url);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (response.ok) {
          const live = (await response.json()) as ScanReport;
          if (live && live.originalUrl) next = live;
        }
      } catch {
        /* live resolver optional */
      }
      setReport(next);
      setHistory(recordScan(next));
      setTab("report");
    } finally {
      setBusy(false);
    }
  }

  const tabs = useMemo(
    () =>
      [
        ["report", "Report"],
        ["chain", "Chain"],
        ["indicators", "Indicators"],
        ["intel", "Intel"],
        ["history", "History"],
      ] as const,
    [],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <ColorRail />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-16 sm:px-6 sm:pt-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-16 items-center overflow-hidden rounded-md bg-night">
              <WolfMark className="h-16 w-auto max-w-[220px] object-contain" />
            </span>
            <div>
              <p className="font-display text-base leading-none font-semibold tracking-tight">WOLF DEFENDER</p>
              <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">Malicious link tracker</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <LiveDot />
            <span className="hidden text-safe sm:inline">Defensive</span>
          </div>
        </header>

        <main className="mt-8 flex-1 space-y-4">
          <Scanner onScan={onScan} busy={busy} />
          {report ? (
            <>
              <div className="flex flex-wrap gap-1 rounded-md bg-surface p-1">
                {tabs.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "rounded px-3 py-1.5 text-xs tracking-wide uppercase",
                      tab === id ? "bg-elevated text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {tab === "report" ? <Report report={report} /> : null}
              {tab === "chain" ? <Chain report={report} /> : null}
              {tab === "indicators" ? <Indicators report={report} /> : null}
              {tab === "intel" ? <Intel report={report} /> : null}
              {tab === "history" ? (
                <HistoryPanel
                  entries={history}
                  onClear={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                />
              ) : null}
            </>
          ) : (
            <HistoryPanel
              entries={history}
              onClear={() => {
                clearHistory();
                setHistory([]);
              }}
            />
          )}
        </main>

        <footer className="mt-12 flex flex-col gap-1 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>Safe URL Redirect & Threat Analyzer. No JS execution. SSRF guarded.</p>
          <p>A LOW score is not a safety guarantee.</p>
        </footer>
      </div>
    </div>
  );
}
