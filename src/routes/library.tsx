import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton, DraftOutput, useDraft } from "@/components/DraftPanel";
import {
  EMPTY_PROFILE,
  PROMPTS,
  SECTIONS,
  fill,
  loadProfile,
  placeholders,
  profileValue,
  splitHint,
  withVoice,
  type Profile,
} from "@/lib/toolkit";

export const Route = createFileRoute("/library")({
  validateSearch: z.object({ section: z.string().optional(), p: z.union([z.string(), z.number()]).transform(String).optional() }),
  head: () => ({
    meta: [
      { title: "Prompt Library — AgentOS" },
      { name: "description", content: "60 real estate AI prompts that turn into simple forms and write the draft for you." },
      { property: "og:title", content: "Prompt Library — AgentOS" },
      { property: "og:description", content: "Listings, lead follow-up, client talks, social, admin and objection scripts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Library,
});

function Library() {
  const { section, p } = Route.useSearch();
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      PROMPTS.filter(
        (x) =>
          (!section || x.section === section) &&
          (!q || (x.title + x.body).toLowerCase().includes(q.toLowerCase())),
      ),
    [section, q],
  );
  const active = PROMPTS.find((x) => x.id === p);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
      <aside className={active ? "hidden lg:block" : ""}>
        <Input placeholder="Search prompts…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link to="/library" search={{ p }} className={chip(!section)}>All</Link>
          {SECTIONS.map((s) => (
            <Link key={s} to="/library" search={{ section: s, p }} className={chip(section === s)}>
              {s.split(" ")[0]}
            </Link>
          ))}
        </div>
        <ul className="mt-4 max-h-[70vh] space-y-1 overflow-auto pr-1">
          {list.map((x) => (
            <li key={x.id}>
              <Link
                to="/library"
                search={{ section, p: x.id }}
                className={`block rounded-md px-3 py-2 text-sm ${x.id === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <span className="mr-2 opacity-60">{x.id}</span>
                {x.title}
              </Link>
            </li>
          ))}
          {!list.length && <li className="px-3 py-2 text-sm text-muted-foreground">No prompts match.</li>}
        </ul>
      </aside>
      <main>{active ? <PromptWorkspace key={active.id} id={active.id} /> : <Empty />}</main>
    </div>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-accent"}`;

function Empty() {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
      <h1 className="text-2xl font-semibold text-foreground">Pick a prompt</h1>
      <p className="mt-2">Fill in a few boxes and the AI writes it for you. Your profile details fill in automatically.</p>
    </div>
  );
}

function PromptWorkspace({ id }: { id: string }) {
  const prompt = PROMPTS.find((x) => x.id === id)!;
  const phs = placeholders(prompt.body);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [values, setValues] = useState<Record<string, string>>({});
  const draft = useDraft();

  useEffect(() => {
    const pr = loadProfile();
    setProfile(pr);
    const auto: Record<string, string> = {};
    for (const ph of phs) {
      const v = profileValue(ph, pr);
      if (v) auto[ph] = v;
    }
    setValues(auto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filled = fill(prompt.body, values);
  const remaining = phs.filter((ph) => !values[ph]?.trim()).length;

  return (
    <div className="fade-up space-y-6">
      <div>
        <Link to="/library" search={{ section: prompt.section }} className="text-sm text-muted-foreground lg:hidden">← All prompts</Link>
        <p className="text-xs uppercase tracking-widest text-accent">{prompt.section}</p>
        <h1 className="mt-1 text-3xl font-semibold">{prompt.title}</h1>
        {prompt.note && <p className="mt-2 text-sm text-muted-foreground">Tip: {prompt.note}</p>}
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-5 shadow-card sm:grid-cols-2">
        {phs.map((ph) => {
          const { label, hint } = splitHint(ph, prompt.body);
          const long = ph.length > 40 || /PASTE|^LIST\b|^e\.g\.|DETAILS|FEATURES|CONTEXT/i.test(ph);
          return (
            <label key={ph} className={`text-sm ${long ? "sm:col-span-2" : ""}`}>
              <span className="font-medium capitalize">{label.toLowerCase()}</span>
              {long ? (
                <textarea
                  className="mt-1 min-h-20 w-full rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder={hint}
                  value={values[ph] ?? ""}
                  onChange={(e) => setValues({ ...values, [ph]: e.target.value })}
                />
              ) : (
                <Input className="mt-1" placeholder={hint} value={values[ph] ?? ""} onChange={(e) => setValues({ ...values, [ph]: e.target.value })} />
              )}
            </label>
          );
        })}
        {!profile.name && (
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Tip: <Link to="/profile" className="underline">save your profile</Link> and your name, brokerage and contact fill in on every prompt.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => draft.run(withVoice(filled, profile))} disabled={draft.loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {draft.loading ? "Writing…" : "Write it for me"}
        </Button>
        <CopyButton text={filled} label="Copy prompt only" />
        <span className="text-xs text-muted-foreground">{remaining ? `${remaining} blank${remaining > 1 ? "s" : ""} left (optional)` : "All filled in"}</span>
      </div>
      {draft.error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{draft.error}</p>}
      {draft.text && <DraftOutput text={draft.text} setText={draft.setText} />}

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">Show the full prompt</summary>
        <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3">{filled}</p>
      </details>
    </div>
  );
}
