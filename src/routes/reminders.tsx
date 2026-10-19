import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const search = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
  date: z.string().optional(),
  kind: z.enum(["client", "deal", "lead"]).optional(),
  name: z.string().optional(),
});

export const Route = createFileRoute("/reminders")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Scheduled Reminders — AgentOS" },
      { name: "description", content: "Schedule text and email reminders for your clients, deals, and leads." },
      { property: "og:title", content: "Scheduled Reminders — AgentOS" },
      { property: "og:description", content: "Never miss a follow-up: AgentOS texts and emails on the right day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RemindersPage,
});

type Reminder = {
  id: string; kind: string; title: string; message: string; channel: string; recipient: string;
  recipient_name: string | null; to_phone: string | null; to_email: string | null;
  send_at: string; status: string; last_error: string | null;
};

function toE164(p: string) {
  const d = p.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  const n = d.replace(/\D/g, "");
  return n.length === 10 ? `+1${n}` : n.length === 11 && n.startsWith("1") ? `+${n}` : d;
}

function RemindersPage() {
  const s = Route.useSearch();
  const { user, loading } = useAuth();
  const [list, setList] = useState<Reminder[]>([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    kind: s.kind ?? "client",
    title: s.title ?? "",
    message: s.message ?? "",
    date: s.date ?? new Date().toISOString().slice(0, 10),
    time: "09:00",
    channel: "sms",
    recipient: "agent",
    name: s.name ?? "",
    phone: "",
    email: "",
    consent: false,
  });

  const load = useCallback(async () => {
    const { data } = await supabase.from("reminders").select("*").order("send_at", { ascending: true });
    setList((data as Reminder[]) ?? []);
  }, []);
  useEffect(() => { if (user) void load(); }, [user, load]);

  async function save() {
    setErr("");
    if (!user) return;
    if (!f.title.trim() || !f.message.trim()) return setErr("Add a title and the message to send.");
    if (f.channel === "sms" && !f.phone.trim()) return setErr("Add the phone number to text.");
    if (f.channel === "email" && !f.email.trim()) return setErr("Add the email address.");
    if (f.recipient === "client" && !f.consent) return setErr("Confirm the client agreed to receive messages from you.");
    setSaving(true);
    const { error } = await supabase.from("reminders").insert({
      user_id: user.id, kind: f.kind, title: f.title.trim(), message: f.message.trim(),
      channel: f.channel, recipient: f.recipient, recipient_name: f.name || null,
      to_phone: f.channel === "sms" ? toE164(f.phone) : null,
      to_email: f.channel === "email" ? f.email.trim() : null,
      client_consent: f.recipient === "client" && f.consent,
      send_at: new Date(`${f.date}T${f.time}`).toISOString(),
    });
    setSaving(false);
    if (error) return setErr(error.message);
    setF({ ...f, title: "", message: "", consent: false });
    void load();
  }

  async function markSent(id: string) {
    await supabase.from("reminders").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);
    void load();
  }

  async function remove(id: string) {
    await supabase.from("reminders").delete().eq("id", id);
    void load();
  }

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-16 text-muted-foreground">Loading…</div>;
  if (!user)
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-6xl">Scheduled Reminders</h1>
        <p className="mt-4 text-muted-foreground">Sign in so AgentOS can send your reminders on the right day, even when the app is closed.</p>
        <Button asChild className="mt-6"><Link to="/auth">Sign in to schedule reminders</Link></Button>
      </div>
    );

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-6xl">Scheduled Reminders</h1>
      <p className="mt-2 text-muted-foreground">Pick a day and AgentOS sends it — a nudge to you, or the message straight to your client.</p>

      <div className="lacquer-panel gold-rule mt-8 rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">For
            <select className="mt-1 w-full rounded-md border border-input bg-background p-2" value={f.kind} onChange={set("kind")}>
              <option value="client">Client</option><option value="deal">Deal</option><option value="lead">Lead</option>
            </select>
          </label>
          <label className="text-sm">Send by
            <select className="mt-1 w-full rounded-md border border-input bg-background p-2" value={f.channel} onChange={set("channel")}>
              <option value="sms">Text</option><option value="email">Email</option>
            </select>
          </label>
          <label className="text-sm">Send to
            <select className="mt-1 w-full rounded-md border border-input bg-background p-2" value={f.recipient} onChange={set("recipient")}>
              <option value="agent">Me (a nudge)</option><option value="client">The client directly</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">Title<Input className="mt-1" placeholder="Check in with Sarah about the inspection" value={f.title} onChange={set("title")} /></label>
        <label className="block text-sm">Message<Textarea className="mt-1" rows={4} value={f.message} onChange={set("message")} /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">Name<Input className="mt-1" value={f.name} onChange={set("name")} /></label>
          {f.channel === "sms"
            ? <label className="text-sm">Phone<Input className="mt-1" placeholder="(512) 555-0148" value={f.phone} onChange={set("phone")} /></label>
            : <label className="text-sm">Email<Input className="mt-1" type="email" value={f.email} onChange={set("email")} /></label>}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">Day<Input className="mt-1" type="date" value={f.date} onChange={set("date")} /></label>
            <label className="text-sm">Time<Input className="mt-1" type="time" value={f.time} onChange={set("time")} /></label>
          </div>
        </div>
        {f.recipient === "client" && (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
            <span>This client agreed to receive {f.channel === "sms" ? "texts" : "emails"} from me. (Required by law for automated texts.)</span>
          </label>
        )}
        <p className="text-sm text-muted-foreground">Free: reminders send themselves automatically once the free sending accounts are connected — and anything due right now shows below with one tap to send from your own phone or email.</p>
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <Button className="bg-gold" onClick={save} disabled={saving}>{saving ? "Scheduling…" : "SCHEDULE REMINDER →"}</Button>
      </div>

      <h2 className="mt-12 text-5xl">Coming up</h2>
      {list.length === 0 && <p className="mt-2 text-muted-foreground">Nothing scheduled yet.</p>}
      {list.some((r) => r.status === "scheduled" && new Date(r.send_at) <= new Date()) && (
        <p className="mt-3 rounded-md border border-accent p-3 text-sm">You have reminders due now — tap to send.</p>
      )}
      <ul className="mt-4 space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{r.title}</div>
              <span className="text-xs uppercase tracking-widest text-accent">{r.status}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(r.send_at).toLocaleString()} · {r.channel === "sms" ? "Text" : "Email"} to {r.recipient === "agent" ? "you" : r.recipient_name || "client"} · {r.kind}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{r.message}</p>
            {r.last_error && <p className="mt-1 text-xs text-destructive">{r.last_error}</p>}
            {r.status === "scheduled" && new Date(r.send_at) <= new Date() && (
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="rounded-md bg-gold px-3 py-1.5 text-sm text-primary-foreground" href={r.channel === "sms" ? `sms:${r.to_phone ?? ""}?&body=${encodeURIComponent(r.message)}` : `mailto:${r.to_email ?? ""}?subject=${encodeURIComponent(r.title)}&body=${encodeURIComponent(r.message)}`}>
                  {r.channel === "sms" ? "Send text from my phone" : "Send from my email"}
                </a>
                <button className="text-sm underline" onClick={() => markSent(r.id)}>Mark done</button>
              </div>
            )}
            {r.status !== "sent" && <button className="mt-2 text-xs underline" onClick={() => remove(r.id)}>Remove</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
