import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateDraft } from "@/lib/generate.functions";
import { checkFairHousing } from "@/lib/toolkit";
import { Button } from "@/components/ui/button";

const FIELDS = [
  ["address", "Address", "4218 Maple Ridge Lane, Austin, TX"],
  ["price", "Price", "$485,000"],
  ["beds", "Beds / baths", "4 bed / 2.5 bath"],
  ["sqft", "Square feet", "2,340"],
] as const;

export function HeroListingWriter() {
  const gen = useServerFn(generateDraft);
  const [v, setV] = useState<Record<string, string>>({
    address: FIELDS[0][2], price: FIELDS[1][2], beds: FIELDS[2][2], sqft: FIELDS[3][2],
    features: "Updated kitchen with quartz counters, covered back patio, big shade trees, two-car garage",
  });
  const [out, setOut] = useState("");
  const [shown, setShown] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const typing = shown.length < out.length;

  // Live-caption reveal: the finished text types on screen word by word.
  useEffect(() => {
    if (!out) { setShown(""); return; }
    const tokens = out.split(/(\s+)/);
    let i = 0;
    const t = setInterval(() => {
      i += 6; // ~3 words + their spaces per tick
      setShown(tokens.slice(0, i).join(""));
      if (i >= tokens.length) clearInterval(t);
    }, 70);
    return () => clearInterval(t);
  }, [out]);

  async function run() {
    setBusy(true); setErr(""); setOut("");
    const prompt = `Write an MLS-ready listing description (150-200 words) plus a one-line headline.
Address: ${v["address"]}
Price: ${v["price"]}
Beds/baths: ${v["beds"]}
Square feet: ${v["sqft"]}
Key features: ${v["features"]}
Describe the property only. Warm, specific, no clichés. Sign off as Jordan Lee, Hill Country Realty.`;
    try {
      const res = await gen({ data: { prompt, demo: true } });
      if (res.ok) setOut(res.text); else setErr(res.error || "The writer could not finish. Please try again.");
    } catch {
      setErr("Connection problem — the request didn't go through. Check your internet and try again.");
    }
    setBusy(false);
  }

  const flags = out ? checkFairHousing(out) : [];
  const set = (k: string) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value.slice(0, 300) }));

  return (
    <div className="lacquer-panel gold-rule rounded-sm border p-5 shadow-card">
      <p className="text-xs not-italic uppercase tracking-[0.25em] text-accent">Live · Listing writer</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {FIELDS.map(([k, label]) => (
          <label key={k} className={k === "address" ? "col-span-2 text-sm" : "text-sm"}>
            <span className="text-muted-foreground">{label}</span>
            <input value={v[k]} onChange={set(k)} className="mt-1 w-full rounded-sm border border-input bg-background/60 px-3 py-2 text-foreground" />
          </label>
        ))}
        <label className="col-span-2 text-sm">
          <span className="text-muted-foreground">Best features</span>
          <textarea value={v["features"]} onChange={set("features")} rows={2} className="mt-1 w-full rounded-sm border border-input bg-background/60 px-3 py-2 text-foreground" />
        </label>
      </div>
      <Button onClick={run} disabled={busy} className="mt-4 w-full bg-gold border border-accent font-semibold text-accent-foreground shadow-gold">
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <span aria-hidden="true" className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
            Writing your listing…
          </span>
        ) : out ? "Write it again" : "WRITE MY LISTING →"}
      </Button>
      {busy && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          Drafting now — this takes about ten seconds. Your description will appear below.
        </p>
      )}
      {err && !busy && (
        <div role="alert" className="mt-3 rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <p>{err}</p>
          <button onClick={run} className="mt-2 underline underline-offset-2 hover:text-foreground">
            Try again
          </button>
        </div>
      )}
      {out && (
        <div className="mt-4 max-h-72 overflow-auto rounded-sm border border-accent/40 bg-background/60 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
            {shown}
            {typing && <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />}
          </pre>
          <p className="mt-3 text-xs text-accent">
            {typing
              ? "Writing…"
              : flags.length
                ? `⚠ ${flags.length} Fair Housing flag(s) — review wording`
                : "✓ Fair Housing check passed"}
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">No signup. AI draft — review every fact before publishing.</p>
    </div>
  );
}
