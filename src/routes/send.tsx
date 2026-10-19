import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OUTREACH, REPLIES, mailtoLink, fullText, type OutreachEmail } from "@/data/outreach";
import { sendOutreachEmail, listOutreachSends } from "@/lib/outreach-send.functions";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send Kit — AgentOS" },
      {
        name: "description",
        content: "Tap an agent, your email app opens with the message already written. All you do is press send.",
      },
      { property: "og:title", content: "Send Kit — AgentOS" },
      {
        property: "og:description",
        content: "Six ready emails. Tap, then send.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SendKitPage,
});

const SENT_KEY = "agentos-outreach-sent-v1";

const ONE_PAGER: Record<string, string> = {
  chris: "AgentOS-1-Chris-Clark.pdf",
  wyatt: "AgentOS-2-Wyatt-Poindexter.pdf",
  krista: "AgentOS-3-Krista-Martin.pdf",
  julie: "AgentOS-4-Julie-Hoff.pdf",
  polly: "AgentOS-5-Polly-Beasley.pdf",
  april: "AgentOS-6-April-Rager.pdf",
};

const GENERIC_ONE_PAGER = "AgentOS-Overview.pdf";
function onePagerFor(id: string): string {
  return ONE_PAGER[id] ?? GENERIC_ONE_PAGER;
}

type SentRecord = { sent: string; replied?: string };

function readSent(): Record<string, SentRecord> {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SENT_KEY) || "{}") as Record<string, string | SentRecord>;
    // Migrate old shape (id -> ISO string) to id -> { sent }
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? { sent: v } : v]),
    );
  } catch {
    return {};
  }
}

function writeSent(next: Record<string, SentRecord>) {
  try {
    window.localStorage.setItem(SENT_KEY, JSON.stringify(next));
  } catch {
    /* private mode — the tally just won't persist */
  }
}

const FOLLOWUP_DAYS = 7;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function followupDate(iso: string): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + FOLLOWUP_DAYS);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function followupDue(iso: string): boolean {
  const d = new Date(iso);
  d.setDate(d.getDate() + FOLLOWUP_DAYS);
  return d.getTime() <= Date.now();
}

function SendKitPage() {
  const [sent, setSent] = useState<Record<string, SentRecord>>({});
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState("");
  const [sending, setSending] = useState("");
  const [sendError, setSendError] = useState<Record<string, string>>({});

  const [confirmed, setConfirmed] = useState<Record<string, string>>({});

  useEffect(() => {
    const local = readSent();
    setSent(local);
    listOutreachSends()
      .then((rows) => {
        const conf: Record<string, string> = {};
        const merged = { ...local };
        for (const r of rows) {
          if (r.status === "sent" && r.sent_at) {
            conf[r.recipient_id] = r.sent_at;
            merged[r.recipient_id] = { ...merged[r.recipient_id], sent: r.sent_at };
          }
        }
        setConfirmed(conf);
        setSent(merged);
        writeSent(merged);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  function toggleSent(e: OutreachEmail) {
    const next = { ...sent };
    if (next[e.id]) delete next[e.id];
    else next[e.id] = { sent: new Date().toISOString() };
    setSent(next);
    writeSent(next);
  }

  function toggleReplied(e: OutreachEmail) {
    const rec = sent[e.id];
    if (!rec) return;
    const next = { ...sent, [e.id]: rec.replied ? { sent: rec.sent } : { ...rec, replied: new Date().toISOString() } };
    setSent(next);
    writeSent(next);
  }

  async function sendForMe(e: OutreachEmail) {
    if (sending || confirmed[e.id]) return;
    setSending(e.id);
    setSendError((prev) => ({ ...prev, [e.id]: "" }));
    try {
      const res = await sendOutreachEmail({ data: { id: e.id } });
      const at = res.sent_at ?? new Date().toISOString();
      setConfirmed((c) => ({ ...c, [e.id]: at }));
      const next = { ...sent, [e.id]: { ...sent[e.id], sent: at } };
      setSent(next);
      writeSent(next);
    } catch (err) {
      setSendError((prev) => ({
        ...prev,
        [e.id]: err instanceof Error ? err.message : "Something went wrong — use the manual buttons below.",
      }));
    } finally {
      setSending("");
    }
  }

  async function copy(e: OutreachEmail) {
    const text = fullText(e);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(e.id);
    window.setTimeout(() => setCopied(""), 2500);
  }

  const done = OUTREACH.filter((e) => sent[e.id]).length;
  const nextUp = OUTREACH.find((e) => !sent[e.id]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Your outreach desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Tap. Then send.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Every message is already written, and each agent's one-pager is attached automatically.
        Tap the gold button and the email goes straight from your Gmail — addressed, written,
        attachment included. One tap per agent, one per morning.
      </p>

      <div className="lacquer-panel gold-rule mt-6 rounded-lg border p-4 text-sm">
        <span className="text-accent">{ready ? `${done} of ${OUTREACH.length}` : `${OUTREACH.length}`}</span>
        <span className="text-muted-foreground"> sent. </span>
        {nextUp ? (
          <span className="text-muted-foreground">
            Up next: <span className="text-foreground">{nextUp.name}</span> — {nextUp.when.toLowerCase()}.
          </span>
        ) : (
          <span className="text-foreground">All six are out. Now wait on replies — don't chase.</span>
        )}
      </div>

      <ol className="mt-6 space-y-5">
        {OUTREACH.map((e, i) => {
          const rec = sent[e.id];
          const isSent = Boolean(rec);
          return (
            <li
              key={e.id}
              className={`lacquer-panel rounded-lg border p-5 ${isSent ? "gold-rule opacity-60" : "border-accent/40"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="font-script text-3xl leading-none text-accent">{i + 1}</span>
                  <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">{e.name}</h2>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {e.firm} · {e.city}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-accent/40 px-3 py-1 text-[11px] uppercase tracking-widest text-accent">
                  {rec ? (rec.replied ? "Replied" : "Sent") : e.when}
                </span>
              </div>

              {rec && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border bg-background/60 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Sent <span className="text-foreground">{fmtDate(rec.sent)}</span>
                  </span>
                  {rec.replied ? (
                    <span className="text-accent">Replied {fmtDate(rec.replied)} — done, no follow-up</span>
                  ) : (
                    <span className={followupDue(rec.sent) ? "text-accent" : "text-muted-foreground"}>
                      Follow up {followupDate(rec.sent)}
                      {followupDue(rec.sent) ? " — due" : ""}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleReplied(e)}
                    className="ml-auto underline underline-offset-4 text-muted-foreground hover:text-foreground"
                  >
                    {rec.replied ? "Unmark reply" : "Mark as replied"}
                  </button>
                </div>
              )}

              <p className="mt-3 text-sm text-muted-foreground">
                <span className="text-foreground">Subject:</span> {e.subject}
              </p>

              <button
                type="button"
                disabled={sending !== ""}
                onClick={() => void sendForMe(e)}
                className="bg-gold shadow-gold mt-4 flex w-full items-center justify-center rounded-md px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60"
              >
                {sending === e.id ? "Sending…" : isSent ? "Send again →" : "Send it for me →"}
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Goes straight from your Gmail with their one-pager attached. Nothing else to do.
              </p>
              {sendError[e.id] ? (
                <p className="mt-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-foreground">
                  {sendError[e.id]}
                </p>
              ) : null}

              <details className="mt-3">
                <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground">
                  Send it by hand instead
                </summary>
                <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 p-3">
                  <a
                    href={mailtoLink(e)}
                    className="flex w-full items-center justify-center rounded-md border border-accent/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                  >
                    Open in my email app →
                  </a>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Then attach their one-pager: tap below to save it to your phone, and in the email
                    tap the paperclip and pick it from Downloads.
                  </p>
                  <a
                    href={`/one-pagers/${onePagerFor(e.id)}`}
                    download={onePagerFor(e.id)}
                    className="mt-2 flex w-full items-center justify-center rounded-md border border-accent/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                  >
                    Download {onePagerFor(e.id)} ↓
                  </a>
                </div>
              </details>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => void copy(e)}
                  className="rounded border border-border px-3 py-2 uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  {copied === e.id ? "Copied ✓" : "Copy instead"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleSent(e)}
                  className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  {isSent ? "Unmark as sent" : "Mark as sent"}
                </button>
                <span className="text-muted-foreground">{e.to}</span>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground">
                  Read it first
                </summary>
                <pre className="mt-3 whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-xs leading-relaxed text-foreground">
                  {e.body}
                </pre>
              </details>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-12 font-display text-3xl font-semibold">If they reply</h2>
      <p className="mt-2 text-sm text-muted-foreground">Word for word. Nothing to invent on the spot.</p>
      <div className="mt-5 space-y-4">
        {REPLIES.map((r) => (
          <section key={r.q} className="lacquer-panel rounded-lg border border-border p-4">
            <h3 className="font-display text-lg font-semibold">{r.q}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{r.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm leading-relaxed">
        One a day, in the morning. If your email app doesn't open, tap <span className="text-foreground">Copy instead</span>,
        open Gmail, and paste — the first line is the address, the second is the subject.
      </p>
    </main>
  );
}
