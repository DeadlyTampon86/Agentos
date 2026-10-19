import { getStripeEnvironment } from "@/lib/stripe";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/DraftPanel";
import { FlagList } from "@/components/FlagList";
import { generateDraft } from "@/lib/generate.functions";
import { checkFairHousing, loadProfile, withVoice, type Profile, EMPTY_PROFILE } from "@/lib/toolkit";

export const Route = createFileRoute("/followup")({
  head: () => ({
    meta: [
      { title: "Follow-Up Sequences — AgentOS" },
      { name: "description", content: "Generate a complete multi-touch follow-up plan — texts, emails and calls — for any lead situation." },
      { property: "og:title", content: "Follow-Up Sequences — AgentOS" },
      { property: "og:description", content: "A full follow-up cadence written in your voice, in one click." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FollowUp,
});

const SITUATIONS = [
  { v: "open-house", label: "Met at an open house" },
  { v: "online-lead", label: "Online lead went quiet" },
  { v: "past-client", label: "Past client — stay in touch / ask for referrals" },
  { v: "seller-lead", label: "Thinking of selling, not ready yet" },
  { v: "buyer-cold", label: "Buyer went cold after showings" },
  { v: "just-closed", label: "Just closed — first year of homeownership" },
];

function FollowUp() {
  const gen = useServerFn(generateDraft);
  const [situation, setSituation] = useState(SITUATIONS[0]!.v);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [touches, setTouches] = useState("5");
  const [weeks, setWeeks] = useState("4");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  useEffect(() => setProfile(loadProfile()), []);

  async function build() {
    setBusy(true);
    setErr("");
    setOut("");
    const sLabel = SITUATIONS.find((s) => s.v === situation)?.label ?? situation;
    const prompt = withVoice(
      `Build a complete follow-up sequence for a real estate lead.
Situation: ${sLabel}
Lead name: ${name || "[FIRST NAME]"}
What I know about them: ${details || "nothing extra"}
Length: ${touches} touches spread over ${weeks} weeks, mixing text, email and phone call.
For each touch give: day number, channel, and the exact ready-to-send message (texts under 50 words, emails under 120 words with a subject line). Vary the angle each time — value, market update, personal check-in, soft ask. Never desperate, never pushy. Format as "Day X — Channel:" followed by the message.
From: ${[profile.name, profile.brokerage, profile.phone, profile.email].filter(Boolean).join(", ") || "[AGENT NAME, BROKERAGE, PHONE, EMAIL]"}`,
      profile,
    );
    const res = await gen({ data: { prompt, environment: getStripeEnvironment() } });
    setBusy(false);
    if (res.ok) setOut(res.text);
    else setErr(res.error);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-primary">Follow-Up Sequences</h1>
          <a href="/reminders" className="mt-1 inline-block text-sm text-accent underline">Schedule reminders →</a>
      <p className="mt-2 text-muted-foreground">
        Most deals are won in the follow-up. Get a full multi-touch plan — every text, email and call script written for you.
      </p>

      <div className="mt-6 grid gap-3 rounded-lg border bg-card p-5 shadow-card md:grid-cols-2">
        <label className="text-sm text-muted-foreground md:col-span-2">
          Situation
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          >
            {SITUATIONS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <Input placeholder="Lead's first name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="What you know about them (optional)" value={details} onChange={(e) => setDetails(e.target.value)} />
        <label className="text-sm text-muted-foreground">
          Touches
          <Input type="number" min={3} max={10} className="mt-1" value={touches} onChange={(e) => setTouches(e.target.value)} />
        </label>
        <label className="text-sm text-muted-foreground">
          Over how many weeks
          <Input type="number" min={1} max={12} className="mt-1" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
        </label>
        <Button className="md:col-span-2" onClick={build} disabled={busy}>
          {busy ? "Writing your sequence…" : "Build my sequence"}
        </Button>
      </div>

      {err && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}

      {out && (
        <section className="mt-8 rounded-lg border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Your sequence</h2>
            <CopyButton text={out} />
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{out}</pre>
          <FlagList flags={checkFairHousing(out)} />
        </section>
      )}
    </div>
  );
}
