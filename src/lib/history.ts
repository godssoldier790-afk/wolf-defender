import type { HistoryEntry, ScanReport } from "./types";

const KEY = "wolf-defender.history.v1";
const LIMIT = 80;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function toHistoryEntry(report: ScanReport): HistoryEntry {
  return {
    id: report.id,
    scannedAt: report.scannedAt,
    originalUrl: report.originalUrl,
    finalUrl: report.finalUrl,
    risk: report.risk,
    band: report.band,
    confidence: report.confidence,
    indicatorCount: report.indicators.length,
  };
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, LIMIT)));
}

export function recordScan(report: ScanReport): HistoryEntry[] {
  const next = [toHistoryEntry(report), ...loadHistory().filter((e) => e.id !== report.id)].slice(
    0,
    LIMIT,
  );
  saveHistory(next);
  return next;
}

export function clearHistory() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(KEY);
}
