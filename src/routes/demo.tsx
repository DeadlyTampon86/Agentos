import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/DraftPanel";
import { FlagList } from "@/components/FlagList";
import { generateDraft } from "@/lib/generate.functions";
import { checkFairHousing } from "@/lib/toolkit";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Try It Free — AgentOS" },
      { name: "description", content: "Five of our best real estate AI tools, pre-filled with sample data. One click, real results, no sign-up." },
      { property: "og:title", content: "Try AgentOS free — five tools, one click each" },
      { property: "og:description", content: "Listing descriptions, follow-up sequences, chase emails and Fair Housing checks — try them all with sample data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Demo,
});

type Tool = {
  key: string;
  title: string;
  blurb: string;
  button: string;
  prompt: string;
};

const SAMPLE_PROPERTY = `Address: 4218 Maple Ridge Lane, Austin, TX
Type: Single-family
Price: $485,000
Beds/Baths: 4 bed / 2.5 bath
Square feet: 2,340
Features: updated kitchen with quartz counters, hardwood floors throughout main level, home office with French doors, covered back patio, oversized two-car garage, 2023 roof
Nearby (verifiable): 0.4 miles to Walnut Creek park, 5 minutes to MetroRail station
Open house: Saturday 1–3pm
Agent: Jordan Lee, Hill Country Realty, (512) 555-0148, jordan@hillcountryrealty.com`;

const TOOLS: Tool[] = [
  {
    key: "listing",
    title: "1. Listing Description Writer",
    blurb: "A polished MLS-ready description from raw property facts.",
    button: "Write the listing",
    prompt: `Write a 200–250 word listing description, ending with a call to action to schedule a showing, for this property.\n${SAMPLE_PROPERTY}`,
  },
  {
    key: "social",
    title: "2. Social Post Generator",
    blurb: "A Just-Listed Instagram/Facebook post with hashtags, ready to paste.",
    button: "Write the post",
    prompt: `Write an Instagram/Facebook post under 120 words: hook first line, 3–5 short highlight lines with sparing emoji, open house line, a call to action, then 10 hashtags mixing local and real estate tags, for this property.\n${SAMPLE_PROPERTY}`,
  },
  {
    key: "followup",
    title: "3. Follow-Up Sequence Builder",
    blurb: "A full multi-touch plan for a lead who went quiet after an open house.",
    button: "Build the sequence",
    prompt: `Build a complete follow-up sequence for a real estate lead.
Situation: Met at an open house, seemed interested, went quiet
Lead name: Taylor
What I know: relocating for work, liked the kitchen and the home office, timeline 60–90 days
Length: 5 touches over 3 weeks, mixing text, email and one phone call.
For each touch give: day number, channel, and the exact ready-to-send message (texts under 50 words, emails under 120 words with a subject line). Vary the angle — value, market update, personal check-in, soft ask. Never pushy. Format as "Day X — Channel:" followed by the message.
From: Jordan Lee, Hill Country Realty, (512) 555-0148`,
  },
  {
    key: "chase",
    title: "4. Deadline Chase Email",
    blurb: "The appraisal is late. Get a firm but friendly status email, instantly.",
    button: "Draft the email",
    prompt: `Draft a short, friendly but firm follow-up email about a pending transaction item.
Property: 4218 Maple Ridge Lane, Austin, TX
My client: The Riveras (buyer side)
Pending item: Appraisal ordered & completed — was due last Friday (owner: Lender)
Write a subject line and a body under 90 words asking for a status update and a firm date. Professional, no blame, one clear ask.
From: Jordan Lee, Hill Country Realty, (512) 555-0148, jordan@hillcountryrealty.com`,
  },
  {
    key: "checkin",
    title: "5. Past-Client Check-In Text",
    blurb: "A warm, personal text that keeps referrals coming — written for you.",
    button: "Write the text",
    prompt: `Write a short, warm check-in text message (under 60 words) to a past real estate client.
Name: Maria
What I remember about them: bought their first home last spring, has a golden retriever named Biscuit, was nervous about the inspection process
Context: one-year home anniversary coming up
Reference one personal detail naturally so it doesn't feel like a mass text. No sales pitch. End with a soft question.
Sign off as Jordan Lee.`,
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const gen = useServerFn(generateDraft);
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setErr("");
    const res = await gen({ data: { prompt: tool.prompt, demo: true } });
    setBusy(false);
    if (res.ok) setOut(res.text);
    else setErr(res.error);
  }

  return (
    <section className="rounded-lg border bg-card p-6 shadow-card">
      <h2 className="text-xl font-semibold text-primary">{tool.title}</h2>
      <p className="mt-1 text-muted-foreground">{tool.blurb}</p>
      <Button className="mt-4" onClick={run} disabled={busy}>
        {busy ? "Writing…" : out ? "Run it again" : tool.button}
      </Button>
      {err && <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
      {out && (
        <div className="mt-4 rounded-md border bg-muted/40 p-4">
          <pre className="whitespace-pre-wrap font-sans text-sm">{out}</pre>
          <div className="mt-3 flex items-center gap-3">
            <CopyButton text={out} />
          </div>
          <FlagList flags={checkFairHousing(out)} />
        </div>
      )}
    </section>
  );
}

function Demo() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-accent">Free hands-on demo</p>
      <h1 className="mt-2 text-3xl font-semibold text-primary md:text-4xl">Try the five tools agents love most</h1>
      <p className="mt-3 text-muted-foreground">
        Each one is pre-filled with a realistic sample scenario — just hit the button and watch it work. No sign-up, no
        setup. Like what you see? The full app does this with your own properties, clients and voice.
      </p>

      <div className="mt-8 grid gap-6">
        {TOOLS.map((t) => (
          <ToolCard key={t.key} tool={t} />
        ))}
      </div>

      <section className="mt-10 rounded-lg border bg-hero p-6 text-primary-foreground">
        <h2 className="text-xl font-semibold">Ready to use it on your own business?</h2>
        <p className="mt-2 opacity-85">
          Set up your profile once and every tool writes in your voice, with your name and contact details already
          filled in.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/profile">Set up my profile</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/launch">Launch a real listing</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
