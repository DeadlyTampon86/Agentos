import { useEffect, useState } from "react";

type Scene = { tab: string; title: string; button: string; fields: [string, string][]; output: string; badge: string };

const SCENES: Scene[] = [
  {
    tab: "Listing",
    title: "Listing Launch Kit",
    button: "Write my listing",
    fields: [["Address", "4218 Maple Ridge Lane, Austin TX"], ["Details", "$485,000 · 4 bd · 2.5 ba · 2,340 sqft"], ["Highlights", "Chef's kitchen, covered patio, new roof"]],
    output:
      "Sunlight pours through the open-concept living space of this 4-bedroom, 2.5-bath home at 4218 Maple Ridge Lane. The chef's kitchen flows onto a covered patio built for slow evenings, and a brand-new roof adds peace of mind. Offered at $485,000 — schedule your private tour with Jordan Lee today.",
    badge: "Fair Housing check passed",
  },
  {
    tab: "Deadlines",
    title: "Deal Timeline",
    button: "Draft chase email",
    fields: [["Milestone", "Appraisal — due Oct 15 (overdue)"], ["Closing", "Nov 1"], ["Send to", "Dana, lender"]],
    output:
      "Subject: Appraisal status — 4218 Maple Ridge Lane\n\nHi Dana, quick check on the appraisal for 4218 Maple Ridge Lane. It was due Oct 15 and we close Nov 1. Could you share the expected completion date today?\n\nThanks — Jordan Lee, (512) 555-0148",
    badge: "Chase email ready to send",
  },
  {
    tab: "Follow-up",
    title: "Follow-Up Sequences",
    button: "Build my plan",
    fields: [["Situation", "Open house visitor"], ["Last contact", "9 days ago"], ["Looking for", "3-bed homes under $500k"]],
    output:
      "Day 0 · Text — Great meeting you Saturday! Want a few 3-beds like Maple Ridge?\nDay 3 · Email — 3 homes worth a look this week\nDay 7 · Text — Two new 3-beds just listed. Free Thursday?\nDay 14 · Call — Check in on timing and must-haves",
    badge: "4-touch plan ready",
  },
  {
    tab: "Fair Housing",
    title: "Fair Housing Check",
    button: "Check my wording",
    fields: [["Your ad", "Perfect for families, in a safe, exclusive neighborhood near church."]],
    output:
      "⚠ \"families\" → try \"spacious layout\"\n⚠ \"safe\" → try \"quiet street\"\n⚠ \"exclusive\" → try \"private setting\"\n⚠ \"near church\" → remove, or name a landmark",
    badge: "4 risky phrases caught",
  },
];

type Phase = "typing" | "click" | "writing" | "done" | "leaving";
const total = (s: Scene) => s.fields.reduce((a, [, v]) => a + v.length, 0);

export function ProductTour() {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState(0);
  const [out, setOut] = useState(0);
  const [paused, setPaused] = useState(false);
  const s = SCENES[i]!;

  const go = (k: number) => {
    setI(k);
    setTyped(0);
    setOut(0);
    setPhase("typing");
  };

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (typed < total(s)) t = setTimeout(() => setTyped((x) => x + 2), 22);
      else t = setTimeout(() => setPhase("click"), 300);
    } else if (phase === "click") {
      t = setTimeout(() => setPhase("writing"), 650);
    } else if (phase === "writing") {
      if (out < s.output.length) t = setTimeout(() => setOut((x) => x + 4), 16);
      else t = setTimeout(() => setPhase("done"), 200);
    } else if (phase === "done" && !paused) {
      t = setTimeout(() => setPhase("leaving"), 3200);
    } else if (phase === "leaving") {
      t = setTimeout(() => go((i + 1) % SCENES.length), 350);
    }
    return () => clearTimeout(t);
  }, [phase, typed, out, paused, i, s]);

  let left = typed;
  const progress = (i + (phase === "done" || phase === "leaving" ? 1 : out / s.output.length * 0.6 + Math.min(1, typed / total(s)) * 0.4)) / SCENES.length;

  return (
    <div className="lacquer-panel gold-rule overflow-hidden rounded-lg border text-card-foreground" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="gold-rule flex items-center gap-2 border-b bg-background/80 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-destructive/70" />
        <span className="h-3 w-3 rounded-full bg-accent" />
        <span className="h-3 w-3 rounded-full bg-success" />
        <span className="ml-3 truncate text-xs text-muted-foreground">agentos.app / {s.title}</span>
        <span className="ml-auto text-xs text-muted-foreground">{i + 1} of {SCENES.length}</span>
      </div>
      <div className="gold-rule flex gap-1 border-b bg-background/55 px-3 py-2">
        {SCENES.map((x, k) => (
          <button key={x.tab} onClick={() => go(k)} className={`relative flex-1 overflow-hidden rounded-sm border px-2 py-1 text-xs transition-colors sm:text-sm ${k === i ? "border-accent bg-accent text-accent-foreground" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted"}`}>
            {x.tab}
          </button>
        ))}
      </div>

      <div key={i} className={`p-5 transition-all duration-300 ${phase === "leaving" ? "translate-x-[-12px] opacity-0" : "animate-in fade-in slide-in-from-right-3 opacity-100"}`}>
        <h3 className="text-2xl text-silver-metallic">{s.title}</h3>
        <div className="mt-3 space-y-2">
          {s.fields.map(([label, v]) => {
            const n = Math.max(0, Math.min(v.length, left));
            left -= v.length;
            const active = phase === "typing" && n > 0 && n < v.length;
            return (
              <label key={label} className="block">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className={`mt-0.5 min-h-[36px] rounded-sm border bg-background/90 px-3 py-2 text-sm transition-colors ${active ? "border-accent ring-2 ring-accent/20" : "border-border/70"}`}>
                  {v.slice(0, n)}
                  {active && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-foreground align-middle" />}
                </div>
              </label>
            );
          })}
        </div>

        <div className="relative mt-3">
          <button tabIndex={-1} className={`bg-gold w-full rounded-sm border border-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-gold transition-transform ${phase === "click" ? "scale-95 brightness-90" : ""}`}>
            {phase === "writing" ? "Writing…" : s.button}
          </button>
          {phase === "click" && <span className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-primary/30" />}
        </div>

        <div className={`mt-3 overflow-hidden rounded-md bg-muted/50 transition-all duration-300 ${phase === "writing" || phase === "done" || phase === "leaving" ? "max-h-64 p-3" : "max-h-0 p-0"}`}>
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {s.output.slice(0, out)}
            {phase === "writing" && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />}
          </p>
          <div className={`mt-3 flex items-center justify-between gap-2 transition-opacity duration-300 ${phase === "done" || phase === "leaving" ? "opacity-100" : "opacity-0"}`}>
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">✓ {s.badge}</span>
            <span className="rounded-md border bg-card px-2 py-1 text-xs">Copy</span>
          </div>
        </div>
      </div>

      <div className="h-1 bg-muted">
        <div className="h-full bg-accent transition-all duration-200" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
