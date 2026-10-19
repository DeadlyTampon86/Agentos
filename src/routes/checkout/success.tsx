import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Welcome to AgentOS — Membership Confirmed" },
      {
        name: "description",
        content: "Your AgentOS membership is confirmed. See your activated plan, renewal date, and jump straight into your tools.",
      },
      { property: "og:title", content: "Welcome to AgentOS — Membership Confirmed" },
      {
        property: "og:description",
        content: "Your AgentOS membership is confirmed. See your plan, renewal date, and start working.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutSuccessPage,
});

const PLAN_NAMES: Record<string, { name: string; detail: string }> = {
  agentos_founding_monthly: {
    name: "Founding Member",
    detail: "$39/month, locked in for life",
  },
  agentos_founding_yearly: {
    name: "Founding Member",
    detail: "$390/year, locked in for life",
  },
  agentos_monthly: {
    name: "Monthly Membership",
    detail: "$59/month",
  },
  agentos_yearly: {
    name: "Yearly Membership",
    detail: "$590/year",
  },
};

function CheckoutSuccessPage() {
  const { user, loading: authLoading } = useAuth();
  const sub = useSubscription();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const plan = sub.priceId ? PLAN_NAMES[sub.priceId] ?? null : null;
  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
  const formattedEnd = periodEnd
    ? periodEnd.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  if (authLoading || sub.loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="mt-6 font-display text-xl">Checking your membership…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Almost there</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Sign in to see your membership</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your payment went through. Sign in with the same email you used at checkout and your
          membership will appear here.
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

  if (!sub.isActive) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="mt-6 font-display text-xl">Confirming your payment…</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Thank you — your payment was received. Your membership activates as soon as the payment
          finishes confirming, usually within a minute. This page updates by itself.
        </p>
        {elapsed > 60 && (
          <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">
            Still confirming. If this takes more than a few minutes, refresh the page or{" "}
            <Link to="/pricing" className="underline underline-offset-2">
              return to pricing
            </Link>
            .
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-xl border bg-card p-8 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/60 bg-accent/10">
            <Check className="h-5 w-5 text-accent" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Membership confirmed
          </p>
        </div>

        <h1 className="mt-6 font-display text-4xl font-semibold">
          Welcome to the desk, {user.email?.split("@")[0] ?? "agent"}.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your payment went through and your membership is active. Everything is unlocked.
        </p>

        <div className="mt-8 space-y-3 rounded-lg border bg-background/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Plan</span>
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
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
        </div>

        {sub.cancelAtPeriodEnd ? (
          <p className="mt-4 text-xs text-muted-foreground">
            You canceled, so nothing renews — you keep full access until the date above.
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Cancel anytime from your account — you'll keep access until the end of the period you
            already paid for.
          </p>
        )}
      </div>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Start here</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            to="/launch"
            className="rounded-lg border bg-card p-4 shadow-card transition-colors hover:border-accent/60"
          >
            <span className="font-display text-lg font-semibold">Listing Launch</span>
            <p className="mt-1 text-sm text-muted-foreground">
              Full marketing pack from one property entry.
            </p>
          </Link>
          <Link
            to="/library"
            className="rounded-lg border bg-card p-4 shadow-card transition-colors hover:border-accent/60"
          >
            <span className="font-display text-lg font-semibold">All 60 tools</span>
            <p className="mt-1 text-sm text-muted-foreground">
              Every prompt, writer, and script in the library.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
