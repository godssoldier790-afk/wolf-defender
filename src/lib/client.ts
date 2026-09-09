import { analyzeStatic } from "./analyze.ts";
import type { ScanReport } from "./types.ts";

export async function scanUrl(raw: string): Promise<ScanReport> {
  const local = analyzeStatic(raw);
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: raw, followRedirects: true }),
    });
    if (!response.ok) return local;
    return (await response.json()) as ScanReport;
  } catch {
    return {
      ...local,
      notes: [...local.notes, "Live resolver unavailable. Showing static heuristics only."],
    };
  }
}
