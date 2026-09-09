import type { ScanReport } from "@/lib/types";

export function Chain({ report }: { report: ScanReport }) {
  if (!report.hops.length) {
    return (
      <section className="rounded-xl bg-surface p-5 text-sm text-muted">
        No redirect hops recorded. Original and final URL are still shown separately.
        <p className="mt-3 font-mono text-xs text-frost">
          {report.originalUrl}
          <br />
          → {report.finalUrl ?? "(unresolved)"}
        </p>
      </section>
    );
  }
  return (
    <ol className="space-y-2">
      {report.hops.map((hop) => (
        <li key={`${hop.index}-${hop.url}`} className="rounded-xl bg-surface p-4">
          <p className="text-xs tracking-wide text-muted uppercase">
            Hop {hop.index} · {hop.method} · {hop.status ?? "—"} {hop.blocked ? "· BLOCKED" : ""}
          </p>
          <p className="mt-1 break-all font-mono text-xs text-frost">{hop.url}</p>
          {hop.location ? <p className="mt-1 break-all font-mono text-xs text-gold">→ {hop.location}</p> : null}
          {hop.reason ? <p className="mt-2 text-xs text-danger">{hop.reason}</p> : null}
        </li>
      ))}
    </ol>
  );
}
