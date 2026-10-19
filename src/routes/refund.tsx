import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — AgentOS" },
      {
        name: "description",
        content:
          "AgentOS refund policy: a 30-day money-back guarantee on every plan, processed by Stripe.",
      },
      { property: "og:title", content: "Refund Policy — AgentOS" },
      {
        property: "og:description",
        content: "AgentOS refund policy: a 30-day money-back guarantee on every plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Our promise</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Refund Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated October 2026.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Published by <strong className="text-foreground">Scotty Heflin</strong>, sole proprietor,
        operator of AgentOS.
      </p>

      <div className="mt-8 space-y-8">
        <section className="rounded-lg border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">30-day money-back guarantee</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              We offer a 30-day money-back guarantee. If you are not satisfied with your purchase,
              you can request a full refund within 30 days of your order date — no questions, no
              forms, no hoops.
            </p>
            <p>
              This applies to every plan: monthly, annual, and founding-member subscriptions alike.
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">How to request a refund</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Refunds are processed by our payment provider, Stripe. To request a refund, reply to
              your receipt email, use the billing portal link on your My Membership page, or email
              us directly at{" "}
              <a
                href="mailto:heflinscotty14@gmail.com"
                className="underline underline-offset-2"
              >
                heflinscotty14@gmail.com
              </a>
              {" "}and we will help you through it.
            </p>
            <p>
              Approved refunds return to your original payment method, usually within 5–10 business
              days depending on your bank.
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold">What happens to your access</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">If you cancel without a refund:</strong> you keep
              full access until the end of the period you already paid for. Nothing is cut off
              early.
            </p>
            <p>
              <strong className="text-foreground">If you receive a refund:</strong> your access ends
              the same day the refund is issued, and any locked-in pricing (such as the
              founding-member rate) ends with it.
            </p>
          </div>
        </section>

        <p className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
          Questions about a charge? Check the receipt email Stripe sent you — it has everything
          about your order. See also our{" "}
          <Link to="/terms" className="underline underline-offset-2">Terms &amp; Conditions</Link>.
        </p>
      </div>
    </main>
  );
}
