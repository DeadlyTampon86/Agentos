import { getStripeEnvironment } from "@/lib/stripe";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/DraftPanel";
import { FlagList } from "@/components/FlagList";
import { generateDraft } from "@/lib/generate.functions";
import { checkFairHousing, loadProfile, withVoice, type Profile, EMPTY_PROFILE } from "@/lib/toolkit";

export type Field = { key: string; label: string; type?: "text" | "area" | "select"; options?: string[]; placeholder?: string };

export function agentLine(p: Profile) {
  return [p.name, p.brokerage, p.phone, p.email].filter(Boolean).join(", ") || "[AGENT NAME, BROKERAGE, PHONE, EMAIL]";
}

export function AiTool({
  title,
  intro,
  fields,
  button,
  build,
}: {
  title: string;
  intro: string;
  fields: Field[];
  button: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (v: any, p: Profile) => string;
}) {
  const gen = useServerFn(generateDraft);
  const [v, setV] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.type === "select" ? (f.options?.[0] ?? "") : ""])),
  );
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => setProfile(loadProfile()), []);

  async function run() {
    setBusy(true);
    setErr("");
    setOut("");
    const res = await gen({ data: { prompt: withVoice(build(v, profile), profile), environment: getStripeEnvironment() } });
    setBusy(false);
    if (res.ok) setOut(res.text);
    else setErr(res.error);
  }

  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-primary">{title}</h1>
      <p className="mt-2 text-muted-foreground">{intro}</p>
      <div className="mt-6 grid gap-3 rounded-lg border bg-card p-5 shadow-card md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={`text-sm text-muted-foreground ${f.type === "area" || f.type === "select" ? "md:col-span-2" : ""}`}>
            {f.label}
            {f.type === "select" ? (
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={v[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              >
                {f.options?.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : f.type === "area" ? (
              <Textarea className="mt-1" rows={3} placeholder={f.placeholder} value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
            ) : (
              <Input className="mt-1" placeholder={f.placeholder} value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
            )}
          </label>
        ))}
        <Button className="md:col-span-2" onClick={run} disabled={busy}>
          {busy ? "Writing…" : button}
        </Button>
      </div>
      {err && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
      {out && (
        <section className="mt-8 rounded-lg border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Your draft</h2>
            <CopyButton text={out} />
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{out}</pre>
          <FlagList flags={checkFairHousing(out)} />
        </section>
      )}
    </div>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — AgentOS` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — AgentOS` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
