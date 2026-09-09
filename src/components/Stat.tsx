import { cn } from "@/lib/cn";

export function Stat({
  label,
  value,
  tone,
  mono = true,
}: {
  label: string;
  value: string;
  tone?: "safe" | "caution" | "danger" | "critical" | "frost";
  mono?: boolean;
}) {
  return (
    <div className="rounded-md bg-elevated px-4 py-3">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm leading-snug break-all",
          mono && "font-mono tabular-nums",
          tone === "safe" && "text-safe",
          tone === "caution" && "text-caution",
          tone === "danger" && "text-danger",
          tone === "critical" && "text-critical",
          tone === "frost" && "text-frost",
        )}
      >
        {value}
      </p>
    </div>
  );
}
