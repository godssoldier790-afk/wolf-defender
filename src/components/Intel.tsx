import type { ScanReport } from "@/lib/types";

export function Intel({ report }: { report: ScanReport }) {
  if (!report.intel.length) {
    return (
      <section className="rounded-xl bg-surface p-5 text-sm text-muted">
        No confirmed malicious listing found. Absence of a listing is not proof the URL is safe.
      </section>
    );
  }
  return (
    <ul className="space-y-2">
      {report.intel.map((hit) => (
        <li key={`${hit.source}-${hit.identifier}`} className="rounded-xl bg-surface p-4">
          <p className="text-xs tracking-wide text-danger uppercase">{hit.verdict}</p>
          <p className="mt-1 font-mono text-xs text-frost">{hit.identifier}</p>
          <p className="mt-1 text-xs text-muted">
            {hit.source}: {hit.detail}
          </p>
        </li>
      ))}
    </ul>
  );
}
