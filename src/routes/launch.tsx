import { getStripeEnvironment } from "@/lib/stripe";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/DraftPanel";
import { FlagList } from "@/components/FlagList";
import { generateDraft } from "@/lib/generate.functions";
import { EMPTY_PROFILE, checkFairHousing, loadProfile, withVoice, type Profile } from "@/lib/toolkit";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Listing Launch Kit — AgentOS" },
      { name: "description", content: "Enter a property once and get the description, MLS remarks, social post, flyer copy and email blast together." },
      { property: "og:title", content: "Listing Launch Kit — AgentOS" },
      { property: "og:description", content: "One property entry, five ready-to-use marketing pieces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Launch,
});

type Prop = { address: string; price: string; beds: string; baths: string; sqft: string; type: string; features: string; nearby: string; openHouse: string; mlsLimit: string };
const EMPTY: Prop = { address: "", price: "", beds: "", baths: "", sqft: "", type: "Single-family", features: "", nearby: "", openHouse: "", mlsLimit: "500" };

const ASSETS = [
  { k: "desc", t: "Full listing description", ask: "a 200–250 word listing description, ending with a call to action to schedule a showing" },
  { k: "mls", t: "MLS public remarks", ask: "MLS public remarks that fit within {LIMIT} characters total, keeping the 3 strongest selling points" },
  { k: "social", t: "Instagram / Facebook post", ask: "an Instagram/Facebook post under 120 words: hook first line, 3–5 short highlight lines with sparing emoji, open house line if given, a call to action, then 10 hashtags mixing local and real estate tags" },
  { k: "flyer", t: "Open house flyer copy", ask: "one-page open house flyer copy: headline, 50-word intro, bulleted features, a 'what's nearby' section with verifiable distances only, and a footer with agent name, brokerage, phone, email, license # and 'Equal Housing Opportunity'" },
  { k: "email", t: "Email blast to your list", ask: "a 'Just Listed' email to my database: subject line, preview text, and a body under 150 words with one clear call to action" },
] as const;

function Launch() {
  const gen = useServerFn(generateDraft);
  const [p, setP] = useState<Prop>(EMPTY);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [out, setOut] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");
  useEffect(() => setProfile(loadProfile()), []);

  const set = (k: keyof Prop) => (e: { target: { value: string } }) => setP({ ...p, [k]: e.target.value });
  const ready = p.address.trim() && p.features.trim();

  function build(ask: string) {
    const agent = [profile.name, profile.brokerage, profile.phone, profile.email, profile.license && `License ${profile.license}`].filter(Boolean).join(", ");
    return withVoice(
      `Write ${ask.replace("{LIMIT}", p.mlsLimit || "500")} for this property.
Address: ${p.address}
Type: ${p.type}
Price: ${p.price || "[LIST PRICE]"}
Beds/Baths: ${p.beds || "[BEDS]"} bed / ${p.baths || "[BATHS]"} bath
Square feet: ${p.sqft || "[SQ FT]"}
Features: ${p.features}
Nearby (verifiable): ${p.nearby || "none provided"}
Open house: ${p.openHouse || "none scheduled"}
Agent: ${agent || "[AGENT NAME, BROKERAGE, PHONE, EMAIL]"}`,
      profile,
    );
  }

  async function runAll() {
    setErr("");
    setBusy(Object.fromEntries(ASSETS.map((a) => [a.k, true])));
    // Run one after another to stay within rate limits.
    for (const a of ASSETS) {
      try {
        const r = await gen({ data: { prompt: build(a.ask), environment: getStripeEnvironment() } });
        if (r.ok) setOut((o) => ({ ...o, [a.k]: r.text }));
        else {
          setErr(r.error);
          setBusy({});
          return;
        }
      } catch {
        setErr("Couldn't reach the writer. Try again.");
        setBusy({});
        return;
      }
      setBusy((b) => ({ ...b, [a.k]: false }));
    }
  }

  const anyBusy = Object.values(busy).some(Boolean);
  const all = ASSETS.filter((a) => out[a.k]).map((a) => `=== ${a.t} ===\n${out[a.k]}`).join("\n\n");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Listing Launch Kit</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Enter the property once. Get 5 marketing pieces, each checked for Fair Housing issues. That's about an hour of writing done in a minute.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="h-fit space-y-3 rounded-lg border bg-card p-5 shadow-card lg:sticky lg:top-20">
          <F l="Property address *"><Input value={p.address} onChange={set("address")} placeholder="123 Oak St, Austin TX" /></F>
          <div className="grid grid-cols-2 gap-3">
            <F l="List price"><Input value={p.price} onChange={set("price")} placeholder="$549,000" /></F>
            <F l="Type"><Input value={p.type} onChange={set("type")} /></F>
            <F l="Beds"><Input value={p.beds} onChange={set("beds")} placeholder="3" /></F>
            <F l="Baths"><Input value={p.baths} onChange={set("baths")} placeholder="2" /></F>
            <F l="Sq ft"><Input value={p.sqft} onChange={set("sqft")} placeholder="1,850" /></F>
            <F l="MLS character limit"><Input value={p.mlsLimit} onChange={set("mlsLimit")} /></F>
          </div>
          <F l="Key features & updates *">
            <textarea className="min-h-24 w-full rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring" value={p.features} onChange={set("features")} placeholder="Renovated kitchen 2023, quartz, new roof 2022, fenced yard, 2-car garage" />
          </F>
          <F l="Nearby (with distances)"><Input value={p.nearby} onChange={set("nearby")} placeholder="0.3 mi to Zilker Park, 1 mi to H-E-B" /></F>
          <F l="Open house"><Input value={p.openHouse} onChange={set("openHouse")} placeholder="Sat 6/14, 1–4pm" /></F>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!ready || anyBusy} onClick={runAll}>
            {anyBusy ? "Writing your kit…" : "Create all 5 pieces"}
          </Button>
          {!profile.name && <p className="text-xs text-muted-foreground"><Link to="/profile" className="underline">Add your profile</Link> so your contact info is included.</p>}
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>

        <div className="space-y-5">
          {all && <div className="flex justify-end"><CopyButton text={all} label="Copy everything" /></div>}
          {ASSETS.map((a) => {
            const text = out[a.k] ?? "";
            return (
            <section key={a.k} className="rounded-lg border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">{a.t}</h2>
                {text && <CopyButton text={text} />}
              </div>
              {busy[a.k] && !out[a.k] ? (
                <div className="mt-3 h-24 animate-pulse rounded-md bg-muted" />
              ) : out[a.k] ? (
                <div className="mt-3 space-y-3">
                  <textarea className="min-h-48 w-full rounded-md border bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring" value={text} onChange={(e) => setOut({ ...out, [a.k]: e.target.value })} />
                  {a.k === "mls" && <p className="text-xs text-muted-foreground">{text.length} / {p.mlsLimit} characters</p>}
                  <FlagList flags={checkFairHousing(text)} />
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Waiting for property details.</p>
              )}
            </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function F({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {l}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}
