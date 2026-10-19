import { getStripeEnvironment } from "@/lib/stripe";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/DraftPanel";
import { generateDraft } from "@/lib/generate.functions";
import {
  buildMilestones,
  daysUntil,
  loadDeals,
  milestoneDate,
  saveDeals,
  type Deal,
  type Milestone,
} from "@/lib/deals";
import { loadProfile, withVoice, type Profile, EMPTY_PROFILE } from "@/lib/toolkit";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Deal Timeline — AgentOS" },
      { name: "description", content: "Track every deadline from contract to close, and draft chase emails to lenders, title and the other agent in one click." },
      { property: "og:title", content: "Deal Timeline — AgentOS" },
      { property: "og:description", content: "Never miss an inspection, appraisal or loan-commitment deadline again." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Deals,
});

const EMPTY_FORM = { address: "", side: "buyer" as Deal["side"], clientName: "", contractDate: "", closingDate: "" };

function Deals() {
  const gen = useServerFn(generateDraft);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");

  useEffect(() => {
    setDeals(loadDeals());
    setProfile(loadProfile());
  }, []);

  function addDeal() {
    if (!form.address.trim() || !form.contractDate || !form.closingDate) return;
    const deal: Deal = {
      id: String(Date.now()),
      ...form,
      milestones: buildMilestones(form.contractDate, form.closingDate),
      createdAt: Date.now(),
    };
    const next = [...deals, deal];
    setDeals(next);
    saveDeals(next);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function toggle(dealId: string, key: string) {
    const next = deals.map((d) =>
      d.id === dealId ? { ...d, milestones: d.milestones.map((m) => (m.key === key ? { ...m, done: !m.done } : m)) } : d,
    );
    setDeals(next);
    saveDeals(next);
  }

  function removeDeal(dealId: string) {
    const next = deals.filter((d) => d.id !== dealId);
    setDeals(next);
    saveDeals(next);
  }

  async function chase(deal: Deal, m: Milestone) {
    const k = `${deal.id}:${m.key}`;
    setBusy({ ...busy, [k]: true });
    setErr("");
    const date = milestoneDate(deal, m);
    const prompt = withVoice(
      `Draft a short, friendly but firm follow-up email about a pending transaction item.
Property: ${deal.address}
My client: ${deal.clientName || "[CLIENT NAME]"} (${deal.side} side)
Pending item: ${m.label} — was due ${date} (owner: ${m.owner})
Write a subject line and a body under 90 words asking for a status update and a firm date. Professional, no blame, one clear ask.
From: ${[profile.name, profile.brokerage, profile.phone, profile.email].filter(Boolean).join(", ") || "[AGENT NAME, BROKERAGE, PHONE, EMAIL]"}`,
      profile,
    );
    const res = await gen({ data: { prompt, environment: getStripeEnvironment() } });
    setBusy({ ...busy, [k]: false });
    if (res.ok) setDrafts({ ...drafts, [k]: res.text });
    else setErr(res.error);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Deal Timeline</h1>
          <a href="/reminders" className="mt-1 inline-block text-sm text-accent underline">Schedule reminders →</a>
          <p className="mt-2 text-muted-foreground">
            Every deadline from contract to close, on one page. Overdue items get a one-click chase email.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add a deal"}</Button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border bg-card p-5 shadow-card">
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Property address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <Input placeholder="Client name" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            <label className="text-sm text-muted-foreground">
              Contract date
              <Input type="date" className="mt-1" value={form.contractDate} onChange={(e) => setForm({ ...form, contractDate: e.target.value })} />
            </label>
            <label className="text-sm text-muted-foreground">
              Closing date
              <Input type="date" className="mt-1" value={form.closingDate} onChange={(e) => setForm({ ...form, closingDate: e.target.value })} />
            </label>
            <label className="text-sm text-muted-foreground">
              You represent the
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.side}
                onChange={(e) => setForm({ ...form, side: e.target.value as Deal["side"] })}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </label>
          </div>
          <Button className="mt-4" onClick={addDeal} disabled={!form.address.trim() || !form.contractDate || !form.closingDate}>
            Build the timeline
          </Button>
        </div>
      )}

      {err && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}

      {deals.length === 0 && !showForm && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No deals yet. Add one and the full deadline checklist builds itself.
        </div>
      )}

      {deals.map((d) => {
        const done = d.milestones.filter((m) => m.done).length;
        return (
          <section key={d.id} className="mt-8 rounded-lg border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold text-primary">{d.address}</h2>
                <p className="text-sm text-muted-foreground">
                  {d.clientName || "Client"} · {d.side} side · closes {d.closingDate} ({daysUntil(d.closingDate)} days)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {done}/{d.milestones.length} done
                </span>
                <button onClick={() => removeDeal(d.id)} className="text-sm text-muted-foreground underline hover:text-destructive">
                  Remove
                </button>
              </div>
            </div>
            <ul className="mt-4 divide-y">
              {d.milestones.map((m) => {
                const date = milestoneDate(d, m);
                const overdue = !m.done && date < today;
                const k = `${d.id}:${m.key}`;
                return (
                  <li key={m.key} className="py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={() => toggle(d.id, m.key)}
                        className="h-4 w-4 accent-[hsl(var(--primary))]"
                        aria-label={`Mark ${m.label} done`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={m.done ? "text-muted-foreground line-through" : "font-medium"}>{m.label}</p>
                        <p className={`text-sm ${overdue ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                          {date} · {m.owner}
                          {overdue && " — overdue"}
                        </p>
                      </div>
                      {!m.done && (
                        <Button size="sm" variant="outline" disabled={busy[k]} onClick={() => chase(d, m)}>
                          {busy[k] ? "Drafting…" : "Draft chase email"}
                        </Button>
                      )}
                    </div>
                    {drafts[k] && (
                      <div className="mt-3 rounded-md border bg-muted/40 p-3">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{drafts[k]}</pre>
                        <div className="mt-2">
                          <CopyButton text={drafts[k] ?? ""} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="mt-8 text-sm text-muted-foreground">
        Deals are saved on this device only. Want them everywhere and automatic email reminders?{" "}
        <Link to="/profile" className="underline">
          Set up your profile
        </Link>{" "}
        and ask about accounts later.
      </p>
    </div>
  );
}
