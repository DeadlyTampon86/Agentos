import { getStripeEnvironment } from "@/lib/stripe";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/DraftPanel";
import { agentLine, meta } from "@/components/AiTool";
import { generateDraft } from "@/lib/generate.functions";
import { loadProfile, withVoice, type Profile, EMPTY_PROFILE } from "@/lib/toolkit";

export const Route = createFileRoute("/openhouse")({
  head: () => meta("Open House Sign-In", "A digital open house sign-in sheet that saves visitors and writes each one a personal follow-up."),
  component: OpenHouse,
});

type Visitor = { id: string; name: string; phone: string; email: string; agent: string; timeline: string; notes: string; at: string };
const KEY = "reat-openhouse";

function OpenHouse() {
  const gen = useServerFn(generateDraft);
  const [address, setAddress] = useState("");
  const [list, setList] = useState<Visitor[]>([]);
  const [f, setF] = useState({ name: "", phone: "", email: "", agent: "No", timeline: "Just looking", notes: "" });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

  useEffect(() => {
    setProfile(loadProfile());
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}");
      setList(s.list ?? []);
      setAddress(s.address ?? "");
    } catch {}
  }, []);
  const save = (l: Visitor[], a = address) => {
    setList(l);
    localStorage.setItem(KEY, JSON.stringify({ list: l, address: a }));
  };

  function add() {
    if (!f.name.trim()) return;
    save([{ ...f, id: crypto.randomUUID(), at: new Date().toLocaleString() }, ...list]);
    setF({ name: "", phone: "", email: "", agent: "No", timeline: "Just looking", notes: "" });
  }

  async function draft(v: Visitor) {
    setBusy(v.id);
    const res = await gen({
      data: {
        environment: getStripeEnvironment(),
        prompt: withVoice(
          `Write a same-day thank-you follow-up text (under 60 words) and a short email (under 120 words, with subject) to an open house visitor.
Property: ${address || "[ADDRESS]"}
Visitor: ${v.name}. Working with an agent: ${v.agent}. Timeline: ${v.timeline}. Notes: ${v.notes || "none"}.
${v.agent === "Yes" ? "They already have an agent — be gracious, offer info only, do not solicit them." : "Offer helpful next steps and a soft question."}
From: ${agentLine(profile)}`,
          profile,
        ),
      },
    });
    setBusy("");
    setDrafts((d) => ({ ...d, [v.id]: res.ok ? res.text : res.error }));
  }

  const csv = () => {
    const rows = [["Name", "Phone", "Email", "Has agent", "Timeline", "Notes", "Signed in"], ...list.map((v) => [v.name, v.phone, v.email, v.agent, v.timeline, v.notes, v.at])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "open-house-visitors.csv";
    a.click();
  };

  const sel = "mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-primary">Open House Sign-In</h1>
      <p className="mt-2 text-muted-foreground">Hand visitors your phone or tablet. Every sign-in saves here, and one click writes each person a personal follow-up.</p>

      <div className="mt-6 grid gap-3 rounded-lg border bg-card p-5 shadow-card md:grid-cols-2">
        <Input className="md:col-span-2" placeholder="Open house address" value={address} onChange={(e) => { setAddress(e.target.value); save(list, e.target.value); }} />
        <Input placeholder="Visitor name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <label className="text-sm text-muted-foreground">Working with an agent?
          <select className={sel} value={f.agent} onChange={(e) => setF({ ...f, agent: e.target.value })}><option>No</option><option>Yes</option></select>
        </label>
        <label className="text-sm text-muted-foreground">Timeline
          <select className={sel} value={f.timeline} onChange={(e) => setF({ ...f, timeline: e.target.value })}>
            {["Just looking", "0–3 months", "3–6 months", "6+ months", "Need to sell first"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <Input placeholder="Notes (liked the kitchen…)" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <Button className="md:col-span-2" onClick={add}>Sign in</Button>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">Visitors ({list.length})</h2>
        {list.length > 0 && <Button variant="outline" size="sm" onClick={csv}>Download list</Button>}
      </div>
      <div className="mt-3 space-y-3">
        {list.map((v) => (
          <div key={v.id} className="rounded-lg border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{v.name}</p>
                <p className="text-sm text-muted-foreground">{[v.phone, v.email].filter(Boolean).join(" · ")} — {v.timeline}{v.agent === "Yes" ? " · has an agent" : ""}</p>
                {v.notes && <p className="text-sm">{v.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => draft(v)} disabled={busy === v.id}>{busy === v.id ? "Writing…" : "Write follow-up"}</Button>
                <Button size="sm" variant="ghost" onClick={() => save(list.filter((x) => x.id !== v.id))}>Remove</Button>
              </div>
            </div>
            {drafts[v.id] && (
              <div className="mt-3 rounded-md bg-muted p-3">
                <div className="flex justify-end"><CopyButton text={drafts[v.id] ?? ""} /></div>
                <pre className="whitespace-pre-wrap font-sans text-sm">{drafts[v.id]}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
