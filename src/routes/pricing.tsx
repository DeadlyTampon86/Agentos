import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AgentOS" },
      { name: "description", content: "One membership. Every tool a real estate agent needs. $59/month, $590/year, or $39/month locked in for the first 100 agents." },
      { property: "og:title", content: "AgentOS Pricing" },
      { property: "og:description", content: "Every tool a real estate agent needs, one membership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

const FEATURES = [
  "Listing Launch Kit — full marketing pack from one property entry",
  "All 60 fill-in-the-blank prompts with AI writing",
  "Deal Timeline with automatic deadline tracking",
  "Client Cards with follow-up reminders",
  "Follow-Up Sequences for every situation",
  "Open House sign-in sheet with instant thank-you texts",
  "Offer & negotiation scripts",
  "Price Talk prep for listing appointments",
  "Weekly social media calendar",
  "Automatic Fair Housing check on everything",
];

const FOUNDING = ["agentos_founding_monthly", "agentos_founding_yearly"];

const PLANS = [
  {
    id: "agentos_founding_monthly",
    name: "Founding Member",
    price: "$39",
    period: "/month",
    note: "First 100 agents only — locked in for life",
    badge: "Best deal",
  },
  {
    id: "agentos_founding_yearly",
    name: "Founding Annual",
    price: "$390",
    period: "/year",
    note: "First 100 agents only — locked in for life",
    badge: null,
  },
  {
    id: "agentos_monthly",
    name: "Monthly",
    price: "$59",
    period: "/month",
    note: "Cancel anytime",
    badge: null,
  },
  {
    id: "agentos_yearly",
    name: "Yearly",
    price: "$590",
    period: "/year",
    note: "Two months free",
    badge: null,
  },
];

function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const sub = useSubscription();
  const { openCheckout, isOpen, closeCheckout, checkoutElement } = useStripeCheckout();
  const navigate = useNavigate();
  const [justPaid, setJustPaid] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("checkout") === "success") {
      setJustPaid(true);
    }
    supabase
      .rpc("founding_spots_left", { check_env: getStripeEnvironment() })
      .then(({ data }) => setSpotsLeft(typeof data === "number" ? data : 0));
  }, []);

  const plans = PLANS.filter(
    (p) =>
      !FOUNDING.includes(p.id) ||
      (spotsLeft !== null && spotsLeft > 0) ||
      (sub.isActive && sub.priceId === p.id),
  ).map((p) =>
    FOUNDING.includes(p.id) && spotsLeft !== null && spotsLeft > 0
      ? { ...p, note: `Only ${spotsLeft} of 100 spots left — locked in for life` }
      : p,
  );

  const buy = (priceId: string) => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    // Members change plans in place from their dashboard — never a second membership.
    if (sub.isActive) {
      navigate({ to: "/dashboard" });
      return;
    }
    openCheckout({
      priceId,
      quantity: 1,
      ...(user.email ? { customerEmail: user.email } : {}),
      userId: user.id,
      returnUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 p-4">
          <div className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={closeCheckout}
              className="mb-3 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to plans
            </button>
            {checkoutElement}
          </div>
        </div>
      )}
      <div className="text-center">
        <h1 className="font-serif text-4xl font-semibold text-foreground">
          One membership. Every tool.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Agents pay $262–$431 a month stitching together separate tools. AgentOS replaces
          all of them — honestly priced, no add-ons, no surprises.
        </p>
      </div>

      {justPaid && (
        <div className="mx-auto mt-6 max-w-xl rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-center text-sm text-foreground">
          Payment received! Your membership activates as soon as the payment confirms — usually a few seconds.
        </div>
      )}

      {sub.isActive && (
        <div className="mx-auto mt-6 max-w-xl rounded-lg border bg-card px-4 py-3 text-center text-sm text-card-foreground">
          You're an active member
          {sub.priceId && FOUNDING.includes(sub.priceId) && " (Founding Member — locked in for life)"}
          {sub.currentPeriodEnd && ` — renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}.
        </div>
      )}

      <div className={`mt-10 grid gap-6 ${
          plans.length === 4
            ? "md:grid-cols-2 lg:grid-cols-4"
            : plans.length === 3
              ? "md:grid-cols-3"
              : "mx-auto max-w-3xl md:grid-cols-2"
        }`}>
        {plans.map((plan) => {
          const isCurrent = sub.isActive && sub.priceId === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border bg-card p-6 shadow-sm ${
                plan.badge ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {plan.badge}
                </span>
              )}
              <h2 className="text-lg font-semibold text-card-foreground">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-card-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
              <button
                onClick={() => buy(plan.id)}
                disabled={authLoading || isCurrent}
                className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isCurrent ? "Your current plan" : sub.isActive ? "Switch from My Membership" : user ? "Get started" : "Sign in to subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-2xl rounded-xl border bg-card p-6">
        <h3 className="font-semibold text-card-foreground">Every plan includes all of this:</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-card-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Secure checkout. Cancel anytime from your account. Founding Member pricing was limited to the
        first 100 agents and stays $39/month — or $390/year — for as long as the membership stays active.
      </p>
    </main>
  );
}
