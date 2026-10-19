import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/billing-faq")({
  head: () => ({
    meta: [
      { title: "Billing FAQ — AgentOS" },
      {
        name: "description",
        content:
          "How AgentOS checkout, Stripe payments, cancellations, and the 30-day money-back guarantee work.",
      },
      { property: "og:title", content: "Billing FAQ — AgentOS" },
      {
        property: "og:description",
        content: "How AgentOS checkout, Stripe payments, and the 30-day money-back guarantee work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BillingFaqPage,
});

const FAQS: { q: string; a: string[] }[] = [
  {
    q: "How does checkout work?",
    a: [
      "Pick a plan on the Pricing page and a secure checkout window opens right on the page — you never leave AgentOS. Enter your card or choose another payment method, and your membership activates automatically the moment payment clears.",
      "You will get a receipt by email for every payment, and your Pricing page always shows your current plan and renewal date.",
    ],
  },
  {
    q: "Who processes my payment, and what shows on my statement?",
    a: [
      "Payments are processed securely by Stripe, one of the largest payment companies in the world. For most orders, Stripe also calculates, collects, and files the sales tax, and handles fraud protection and payment support. On your card statement, the charge may appear as LINK.COM* followed by our name instead of AgentOS — that's normal.",
      "We never see or store your full card number.",
    ],
  },
  {
    q: "Which payment methods can I use?",
    a: [
      "Major credit and debit cards, plus other methods Stripe offers in your region (such as Apple Pay, Google Pay, or Cash App Pay where available). The checkout window shows exactly what is available to you.",
    ],
  },
  {
    q: "How does the 30-day money-back guarantee work?",
    a: [
      "Every plan — monthly, annual, and founding — comes with a 30-day money-back guarantee. If AgentOS is not for you, request a full refund within 30 days of your order date and you get every cent back.",
      "To request one, reply to your receipt email, use the billing portal link on your My Membership page, or contact us and we will help. Approved refunds return to your original payment method.",
      "When a refund is issued, your access ends the same day, and any locked-in pricing (like the founding-member rate) ends with it.",
    ],
  },
  {
    q: "What happens if I cancel but don't ask for a refund?",
    a: [
      "You keep full access until the end of the period you already paid for — nothing is cut off early. After that, the subscription simply does not renew.",
    ],
  },
  {
    q: "How does the founding-member $39 rate work?",
    a: [
      "The first 100 agents to subscribe lock in $39/month — or $390/year — for life. As long as your subscription stays continuously active, your price never goes up. If the subscription lapses or is refunded, the locked rate ends and the spot does not reopen.",
    ],
  },
  {
    q: "Can I switch between monthly and annual?",
    a: [
      "Yes. Switch right from your My Membership page — the change happens immediately and you're only charged or credited the prorated difference. Annual is $590/year — two months free compared to paying monthly.",
    ],
  },
  {
    q: "What if my payment fails?",
    a: [
      "If a renewal payment does not go through, Stripe will email you and automatically retry. Update your card through the link in that email and your access continues uninterrupted.",
    ],
  },
  {
    q: "Is there a free trial?",
    a: [
      "Better: the demo on the home page lets you use five real tools with no signup at all, and every paid plan is covered by the 30-day money-back guarantee — so you can try the full product risk-free.",
    ],
  },
];

function BillingFaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Straight answers</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Billing FAQ</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Everything about paying for AgentOS, in plain English. For the formal versions, see our{" "}
        <Link to="/terms" className="underline underline-offset-2">Terms &amp; Conditions</Link>,{" "}
        <Link to="/refund" className="underline underline-offset-2">Refund Policy</Link>, and{" "}
        <Link to="/privacy" className="underline underline-offset-2">Privacy Notice</Link>.
      </p>
      <div className="mt-8 space-y-6">
        {FAQS.map((f) => (
          <section key={f.q} className="rounded-lg border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold">{f.q}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {f.a.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        Ready when you are —{" "}
        <Link to="/pricing" className="underline underline-offset-2">
          see the plans
        </Link>
        . Every one is covered by the 30-day money-back guarantee.
      </p>
    </main>
  );
}
