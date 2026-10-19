import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMPTY_PROFILE, loadProfile, saveProfile, type Profile } from "@/lib/toolkit";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — AgentOS" },
      { name: "description", content: "Save your name, brokerage, contact and writing voice once; every draft uses them." },
      { property: "og:title", content: "My Profile — AgentOS" },
      { property: "og:description", content: "Set it once, auto-filled everywhere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

const FIELDS: { k: keyof Profile; l: string; p: string }[] = [
  { k: "name", l: "Your name", p: "Jordan Lee" },
  { k: "brokerage", l: "Brokerage", p: "Lee & Co. Realty" },
  { k: "phone", l: "Phone", p: "(555) 123-4567" },
  { k: "email", l: "Email", p: "jordan@leeco.com" },
  { k: "license", l: "License #", p: "TX 0123456" },
  { k: "city", l: "Main market / city", p: "Austin, TX" },
];

function ProfilePage() {
  const [p, setP] = useState<Profile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);
  useEffect(() => setP(loadProfile()), []);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl font-semibold">My Profile</h1>
      <p className="mt-2 text-muted-foreground">Fill this in once. It's added to every prompt automatically and saved on this device.</p>
      <form
        className="mt-6 grid gap-4 rounded-lg border bg-card p-6 shadow-card sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveProfile(p);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        {FIELDS.map((f) => (
          <label key={f.k} className="text-sm font-medium">
            {f.l}
            <Input className="mt-1" placeholder={f.p} value={p[f.k]} onChange={(e) => setP({ ...p, [f.k]: e.target.value })} />
          </label>
        ))}
        <label className="text-sm font-medium sm:col-span-2">
          Your writing voice
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border bg-background p-2 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. Warm and straightforward, short sentences, no exclamation points. Or paste an email you've written and we'll match it."
            value={p.voice}
            onChange={(e) => setP({ ...p, voice: e.target.value })}
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit">{saved ? "Saved ✓" : "Save profile"}</Button>
        </div>
      </form>
    </div>
  );
}
