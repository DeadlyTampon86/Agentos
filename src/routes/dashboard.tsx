import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeftRight, BadgeCheck, Clock, CreditCard, Sparkles, TriangleAlert, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { changePlan, createPortalSession, getStripeData, type InvoiceRow } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Membership — AgentOS" },
      {
        name: "description",
        content: "View your AgentOS plan, renewal date, and account status in one place.",
      },
      { property: "og:title", content: "My Membership — AgentOS" },
      {
        property: "og:description",
        content: "View your AgentOS plan, renewal date, and account status in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

const PLAN_NAMES: Record<string, { name: string; detail: string }> = {
  agentos_founding_monthly: { name: "Founding Member", detail: "$39/month, locked in for life" },
  agentos_founding_yearly: { name: "Founding Member", detail: "$390/year, locked in for life" },
  agentos_monthly: { name: "Monthly Membership", detail: "$59/month" },
  agentos_yearly: { name: "Yearly Membership", detail: "$590/year" },
};

// Plans a member can switch to. Founding pricing is invite-only (first 100
// agents) and never offered as a switch target.
const SWITCHABLE_PLANS = ["agentos_monthly", "agentos_yearly"];

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment issue",
  paused: "Paused",
  canceled: "Canceled",
};

type BillingInvoice = InvoiceRow;

const INVOICE_STATUS_LABELS: Record<string, string> = {
  completed: "Paid",
  paid: "Paid",
  billed: "Paid",
  draft: "Draft",
  ready: "Processing",
  canceled: "Canceled",
  past_due: "Payment issue",
};

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const sub = useSubscription();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<BillingInvoice[] | null>(null);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [switchBusy, setSwitchBusy] = useState<string | null>(null);
  const [switchMsg, setSwitchMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user || !sub.isActive) return;
    let cancelled = false;
    getStripeData({ data: { environment: getStripeEnvironment() } })
      .then((res) => {
        if (cancelled) return;
        if ("error" in res) {
          setInvoicesError("Couldn't load your billing history. Please try again later.");
        } else {
          setInvoices(res.invoices);
        }
      })
      .catch(() => {
        if (!cancelled) setInvoicesError("Couldn't load your billing history. Please try again later.");
      });
    return () => {
      cancelled = true;
    };
  }, [user, sub.isActive, sub.priceId]);

  // Read the clock only after mount so the server and the browser agree on
  // what the renewal countdown says.
  useEffect(() => {
    setNow(Date.now());
  }, []);

  async function switchPlan(priceId: string, label: string) {
    const founding = (sub.priceId === "agentos_founding_monthly" || sub.priceId === "agentos_founding_yearly");
    const msg =
      `Switch to ${label} now? You'll be charged (or credited) only the prorated difference today.` +
      (founding ? "\n\nYour $39 founding rate will be gone for good — it can't be restored." : "");
    if (!window.confirm(msg)) return;
    setSwitchBusy(priceId);
    setSwitchMsg(null);
    try {
      const res = await changePlan({ data: { priceId, environment: getStripeEnvironment() } });
      if ("error" in res) throw new Error(res.error);
      setSwitchMsg({ ok: true, text: `Done — you're switching to ${label}. This page updates in a few seconds.` });
    } catch (err) {
      setSwitchMsg({ ok: false, text: err instanceof Error ? err.message : "The plan couldn't be changed." });
    } finally {
      setSwitchBusy(null);
    }
  }

  async function openUpdatePayment() {
    setPaymentBusy(true);
    setPaymentError(null);
    try {
      const res = await createPortalSession({ data: { environment: getStripeEnvironment(), returnUrl: window.location.href } });
      if ("error" in res) throw new Error(res.error);
      window.open(res.url, "_blank", "noopener");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function openBillingPortal() {
    setPortalBusy(true);
    setPortalError(null);
    try {
      const res = await createPortalSession({ data: { environment: getStripeEnvironment(), returnUrl: window.location.href } });
      if ("error" in res) throw new Error(res.error);
      window.open(res.url, "_blank", "noopener");
      setCancelOpen(false);
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPortalBusy(false);
    }
  }

  if (authLoading || sub.loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="mt-6 font-display text-xl">Loading your membership…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Members only</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Sign in to view your membership</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your plan, renewal date, and account status live here once you're signed in.
        </p>
        <Link
          to="/auth"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const plan = sub.priceId ? PLAN_NAMES[sub.priceId] ?? null : null;
  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
  const formattedEnd = periodEnd
    ? periodEnd.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;
  const statusLabel = sub.status ? STATUS_LABELS[sub.status] ?? sub.status : null;
  const daysUntil =
    periodEnd && now !== null
      ? Math.ceil((periodEnd.getTime() - now) / 86_400_000)
      : null;

  if (!sub.isActive) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">My membership</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">No active membership yet</h1>
        <p className="mt-3 text-muted-foreground">
          You're signed in as <span className="text-foreground">{user.email}</span>, but there's no
          active plan on this account. Unlock all 60 tools in about a minute.
        </p>
        <Link
          to="/pricing"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          See plans
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">My membership</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p>

      <div className="mt-8 rounded-xl border bg-card p-8 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/60 bg-accent/10">
            <BadgeCheck className="h-5 w-5 text-accent" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Membership active
          </p>
        </div>

        <div className="mt-6 space-y-3 rounded-lg border bg-background/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              {sub.cancelAtPeriodEnd && (
            <p className="mt-3 text-xs text-muted-foreground">
              Your membership is set to cancel, so switching is paused. Undo the cancellation in the billing portal to switch.
            </p>
          )}
          {switchMsg && (
            <p role="status" className={`mt-3 text-sm ${switchMsg.ok ? "text-accent" : "text-destructive"}`}>
              {switchMsg.text}
            </p>
          )}
          {(sub.priceId === "agentos_founding_monthly" || sub.priceId === "agentos_founding_yearly") && (
                <Sparkles className="h-3.5 w-3.5 text-accent" />
              )}
              {plan?.name ?? sub.priceId}
            </span>
          </div>
          {plan && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-sm text-foreground">{plan.detail}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              {sub.cancelAtPeriodEnd ? "Access until" : "Renews"}
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              {formattedEnd ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium text-foreground">{statusLabel ?? "—"}</span>
          </div>
        </div>

        {!sub.cancelAtPeriodEnd && daysUntil !== null && daysUntil <= 7 && (
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {daysUntil <= 0
              ? "Your membership renews today. If you'd rather not renew, cancel now and you keep full access until the date above."
              : `Your membership renews in ${daysUntil} ${daysUntil === 1 ? "day" : "days"}. Want to change or stop it? Do it before the date above and you'll never be charged again.`}
          </p>
        )}

        {sub.status === "past_due" && (
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            Your last payment didn't go through — the payment company is retrying it automatically.
            You keep full access in the meantime.
          </p>
        )}
        {sub.cancelAtPeriodEnd ? (
          <p className="mt-4 text-xs text-muted-foreground">
            You canceled, so nothing renews — you keep full access until the date above.
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Cancel anytime — you'll keep access until the end of the period you already paid for.
          </p>
        )}
      </div>

      {!sub.cancelAtPeriodEnd && (
        <div className="mt-6 rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-4 w-4 text-accent" />
            <h2 className="font-display text-xl font-semibold">Switch plan</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Move between monthly and yearly anytime. The change happens right away and you're
            only charged (or credited) the prorated difference — never billed twice.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SWITCHABLE_PLANS.filter((p) => p !== sub.priceId).map((priceId) => {
              const target = PLAN_NAMES[priceId];
              if (!target) return null;
              return (
                <div key={priceId} className="rounded-lg border bg-background/60 p-4">
                  <p className="font-display text-lg font-semibold">{target.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{target.detail}</p>
                  <button
                    type="button"
                    disabled={switchBusy !== null || sub.cancelAtPeriodEnd}
                    onClick={() => switchPlan(priceId, target.name)}
                    className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {switchBusy === priceId ? "Switching…" : "Switch to this plan"}
                  </button>
                </div>
              );
            })}
          </div>
          {sub.cancelAtPeriodEnd && (
            <p className="mt-3 text-xs text-muted-foreground">
              Your membership is set to cancel, so switching is paused. Undo the cancellation in the billing portal to switch.
            </p>
          )}
          {switchMsg && (
            <p role="status" className={`mt-3 text-sm ${switchMsg.ok ? "text-accent" : "text-destructive"}`}>
              {switchMsg.text}
            </p>
          )}
          {(sub.priceId === "agentos_founding_monthly" || sub.priceId === "agentos_founding_yearly") && (
            <p className="mt-3 text-xs text-muted-foreground">
              Heads up: your $39 founding rate is locked in for life — but only while it stays
              active. Switching away means it can't be restored.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <CreditCard className="h-4 w-4 text-accent" />
          <h2 className="font-display text-xl font-semibold">Payment method</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your card or payment details on the payment company's secure page — your card
          number never touches AgentOS.
        </p>
        {paymentError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {paymentError}
          </p>
        )}
        <button
          type="button"
          onClick={openUpdatePayment}
          disabled={paymentBusy}
          className="mt-4 rounded-md border border-accent/50 px-4 py-2 text-sm text-accent hover:bg-accent/10 disabled:opacity-60"
        >
          {paymentBusy ? "Opening…" : "Update payment method"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-accent" />
          <h2 className="font-display text-xl font-semibold">Billing history</h2>
        </div>
        {invoicesError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {invoicesError}
          </p>
        ) : invoices === null ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading your invoices…</p>
        ) : invoices.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No payments yet — your invoices will appear here after your first charge.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {inv.plan ? (PLAN_NAMES[inv.plan]?.name ?? "Membership payment") : "Payment"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {inv.created
                      ? new Date(inv.created).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {inv.amount_paid.toLocaleString(undefined, {
                      style: "currency",
                      currency: inv.currency,
                    })}
                  </p>
                  <p className="text-xs text-accent">
                    {INVOICE_STATUS_LABELS[inv.status ?? ""] ?? inv.status}
                  </p>
                  {inv.pdf_url && (inv.status === "paid") && (
                    <button
                      type="button"
                      onClick={() => window.open(inv.pdf_url!, "_blank", "noopener")}
                      className="mt-1 text-xs text-foreground underline underline-offset-2 hover:text-accent"
                    >
                      Download PDF
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!sub.cancelAtPeriodEnd && (
        <div className="mt-6 rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3">
            <XCircle className="h-4 w-4 text-accent" />
            <h2 className="font-display text-xl font-semibold">Cancel membership</h2>
          </div>
          {!cancelOpen ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                No hard feelings. If you cancel, nothing renews and you keep full access until{" "}
                <span className="text-foreground">{formattedEnd ?? "the end of your paid period"}</span>.
              </p>
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="mt-4 rounded-md border border-accent/50 px-4 py-2 text-sm text-accent hover:bg-accent/10"
              >
                I want to cancel
              </button>
            </>
          ) : (
            <>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>Before you go, here's exactly what happens:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Your membership stays fully active until{" "}
                    <span className="text-foreground">{formattedEnd ?? "the end of your paid period"}</span>{" "}
                    — you've paid for it, so you keep it.
                  </li>
                  <li>After that date, your access ends and you're never charged again.</li>
                  <li>
                    Changed your mind? You can re-subscribe anytime — though founding-member pricing
                    can't be restored once canceled.
                  </li>
                </ul>
              </div>
              {portalError && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {portalError}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openBillingPortal}
                  disabled={portalBusy}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {portalBusy ? "Opening…" : "Continue to cancellation"}
                </button>
                <button
                  type="button"
                  onClick={() => setCancelOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Keep my membership
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          to="/launch"
          className="rounded-lg border bg-card p-4 shadow-card transition-colors hover:border-accent/60"
        >
          <span className="font-display text-lg font-semibold">Listing Launch</span>
          <p className="mt-1 text-sm text-muted-foreground">Full marketing pack from one property entry.</p>
        </Link>
        <Link
          to="/billing-faq"
          className="rounded-lg border bg-card p-4 shadow-card transition-colors hover:border-accent/60"
        >
          <span className="flex items-center gap-2 font-display text-lg font-semibold">
            <CreditCard className="h-4 w-4 text-accent" /> Billing questions
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            Checkout, receipts, and the 30-day money-back guarantee.
          </p>
        </Link>
      </div>
    </main>
  );
}
