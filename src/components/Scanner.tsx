import { useState } from "react";
import { FIXTURES } from "@/lib/fixtures";

export function Scanner({ onScan, busy }: { onScan: (url: string) => void; busy: boolean }) {
  const [value, setValue] = useState("");

  function submit(url?: string) {
    const next = (url ?? value).trim();
    if (!next) return;
    setValue(next);
    onScan(next);
  }

  return (
    <section className="rounded-xl bg-surface p-5 sm:p-7">
      <div className="mb-4 flex justify-center sm:justify-start">
        <img
          src="/logo.jpg"
          alt="WOLF SIGNAL"
          className="h-36 w-auto rounded-md object-contain sm:h-44"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/wolf-mark.svg";
          }}
        />
      </div>
      <p className="text-xs tracking-wide text-muted uppercase">Analyze a URL</p>
      <p className="mt-1 font-display text-2xl tracking-tight">Where does this link actually go?</p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://short.example/ABC123"
          className="min-w-0 flex-1 rounded-md bg-elevated px-3 py-2.5 font-mono text-sm text-ink outline-none ring-1 ring-border focus:ring-gold"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button type="submit" disabled={busy} className="rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Scanning…" : "Scan"}
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {FIXTURES.slice(0, 6).map((fixture) => (
          <button
            key={fixture.id}
            type="button"
            onClick={() => submit(fixture.input)}
            className="rounded-full bg-elevated px-2.5 py-1 font-mono text-[11px] text-frost hover:text-ink"
          >
            {fixture.id}
          </button>
        ))}
      </div>
    </section>
  );
}
