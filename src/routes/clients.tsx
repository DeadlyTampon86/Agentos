import { getStripeEnvironment } from "@/lib/stripe";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/DraftPanel";
import { generateDraft } from "@/lib/generate.functions";
import { loadClients, saveClients, type ClientCard } from "@/lib/deals";
import { loadProfile, withVoice, type Profile, EMPTY_PROFILE } from "@/lib/toolkit";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Client Cards — AgentOS" },
      { name: "description", content: "Remember every client detail and get a ready-to-send check-in message written in your voice." },
      { property: "og:title", content: "Client Cards — AgentOS" },
      { property: "og:description", content: "Never forget a client's kids' names, budget or timeline again." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Clients,
});

const EMPTY: Omit<ClientCard, "id"> = { name: "", type: "lead", details: "", lastTouch: "", nextTouch: "", notes: "" };

function Clients() {
  const gen = useServerFn(generateDraft);
  const [clients, setClients] = useState<ClientCard[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");

  useEffect(() => {
    setClients(loadClients());
    setProfile(loadProfile());
  }, []);

  function add() {
    if (!form.name.trim()) return;
    const next = [...clients, { ...form, id: String(Date.now()) }];
    setClients(next);
    saveClients(next);
    setForm(EMPTY);
    setShowForm(false);
  }

  function remove(id: string) {
    const next = clients.filter((c) => c.id !== id);
    setClients(next);
    saveClients(next);
  }

  async function checkIn(c: ClientCard) {
    setBusy({ ...busy, [c.id]: true });
    setErr("");
    const prompt = withVoice(
      `Write a short, warm check-in text message (under 60 words) to a real estate ${c.type}.
Name: ${c.name}
What I remember about them: ${c.details || "nothing noted"}
Context: ${c.notes || "general check-in"}
Reference one personal detail naturally so it doesn't feel like a mass text. No sales pitch. End with a soft question.
Sign off as ${profile.name || "[AGENT NAME]"}.`,
      profile,
    );
    const res = await gen({ data: { prompt, environment: getStripeEnvironment() } });
    setBusy({ ...busy, [c.id]: false });
    if (res.ok) {
      setDrafts({ ...drafts, [c.id]: res.text });
      const today = new Date().toISOString().slice(0, 10);
      const next = clients.map((x) => (x.id === c.id ? { ...x, lastTouch: today } : x));
      setClients(next);
      saveClients(next);
    } else setErr(res.error);
  }

  const today = new Date().toISOString().slice(0, 10);
  const due = clients.filter((c) => c.nextTouch && c.nextTouch <= today);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Client Cards</h1>
          <a href="/reminders" className="mt-1 inline-block text-sm text-accent underline">Schedule reminders →</a>
          <p className="mt-2 text-muted-foreground">
            The details that win referrals — kids' names, budgets, timelines — kept in one place, with a one-click check-in text.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add a client"}</Button>
      </div>

      {due.length > 0 && (
        <p className="mt-4 rounded-md border border-accent/50 bg-accent/10 p-3 text-sm">
          {due.length} follow-up{due.length > 1 ? "s" : ""} due today: {due.map((c) => c.name).join(", ")}
        </p>
      )}

      {showForm && (
        <div className="mt-6 grid gap-3 rounded-lg border bg-card p-5 shadow-card md:grid-cols-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select
            className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="lead">Lead</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="past client">Past client</option>
          </select>
          <Input
            className="md:col-span-2"
            placeholder="Details to remember — family, job, hobbies, budget, timeline"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
          />
          <label className="text-sm text-muted-foreground">
            Last contact
            <Input type="date" className="mt-1" value={form.lastTouch} onChange={(e) => setForm({ ...form, lastTouch: e.target.value })} />
          </label>
          <label className="text-sm text-muted-foreground">
            Next follow-up
            <Input type="date" className="mt-1" value={form.nextTouch} onChange={(e) => setForm({ ...form, nextTouch: e.target.value })} />
          </label>
          <Input
            className="md:col-span-2"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Button className="md:col-span-2" onClick={add} disabled={!form.name.trim()}>
            Save client
          </Button>
        </div>
      )}

      {err && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}

      {clients.length === 0 && !showForm && (
        <div className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No clients yet. Add your first one — even a lead you met at an open house.
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {clients.map((c) => (
          <section key={c.id} className="rounded-lg border bg-card p-5 shadow-card">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-primary">{c.name}</h2>
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{c.type}</span>
            </div>
            {c.details && <p className="mt-2 text-sm">{c.details}</p>}
            {c.notes && <p className="mt-1 text-sm text-muted-foreground">{c.notes}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              {c.lastTouch ? `Last contact ${c.lastTouch}` : "No contact logged"}
              {c.nextTouch && ` · follow up ${c.nextTouch}`}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" disabled={busy[c.id]} onClick={() => checkIn(c)}>
                {busy[c.id] ? "Writing…" : "Write check-in text"}
              </Button>
              <button onClick={() => remove(c.id)} className="text-sm text-muted-foreground underline hover:text-destructive">
                Remove
              </button>
            </div>
            {drafts[c.id] && (
              <div className="mt-3 rounded-md border bg-muted/40 p-3">
                <pre className="whitespace-pre-wrap font-sans text-sm">{drafts[c.id]}</pre>
                <div className="mt-2">
                  <CopyButton text={drafts[c.id] ?? ""} />
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
