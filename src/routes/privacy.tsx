import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — AgentOS" },
      {
        name: "description",
        content:
          "How AgentOS, operated by Scotty Heflin, collects, uses, shares, and protects your personal data.",
      },
      { property: "og:title", content: "Privacy Notice — AgentOS" },
      {
        property: "og:description",
        content: "How AgentOS collects, uses, shares, and protects your personal data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Who is responsible for your data",
    body: [
      "AgentOS is operated by Scotty Heflin, who is the data controller for the personal data described in this notice. That means Scotty Heflin decides why and how your personal data is processed when you use AgentOS.",
    ],
  },
  {
    title: "2. What we collect",
    body: [
      "Account data: your name, email address, and login credentials when you register.",
      "Usage data: how you use the tools, which features you open, and basic telemetry such as device type, browser, and IP address, used to keep the service secure and improve it.",
      "Content you enter: property details, client names and contact details you type into tools, reminders, and deals. This content is used only to provide the service to you.",
      "Support messages: anything you send us when you ask for help.",
      "Payment data is collected and processed by Stripe, our payment provider — we never see or store your full card number.",
    ],
  },
  {
    title: "3. Why we use it (and our legal basis)",
    body: [
      "To create and manage your account and provide the service you subscribed to (performance of our contract with you).",
      "To keep the service secure, prevent fraud and abuse, and enforce our terms (legitimate interests).",
      "To improve the product — understanding which tools are used and where people get stuck (legitimate interests).",
      "To provide customer support (performance of contract and legitimate interests).",
      "To send marketing about AgentOS, where you have opted in (consent — you can withdraw it anytime).",
      "To meet legal obligations, such as tax and accounting records (legal obligation).",
    ],
  },
  {
    title: "4. Who we share it with",
    body: [
      "Service providers and subprocessors who help us run AgentOS: hosting and database infrastructure, the AI provider that generates drafts from the text you submit, and analytics and support tooling. They may only process your data on our instructions.",
      "Stripe, our payment provider, for the sale of subscriptions, payment processing, tax compliance, invoicing, and subscription management.",
      "Professional advisers (such as lawyers and accountants) where needed.",
      "Authorities, where the law requires it.",
      "We do not sell your personal data, and we do not share it with advertisers.",
    ],
  },
  {
    title: "5. International transfers",
    body: [
      "Some of our service providers process data outside your country, including in the United States. Where data leaves the UK or EEA, we rely on appropriate safeguards such as adequacy decisions or Standard Contractual Clauses.",
    ],
  },
  {
    title: "6. How long we keep it",
    body: [
      "We keep your account data while your account is active. When you cancel, we delete or anonymise personal data within a reasonable period, except records we must keep for legal, tax, or accounting reasons. Content stored only in your own browser is erased when you clear your browser data.",
    ],
  },
  {
    title: "7. Your rights",
    body: [
      "Depending on where you live, you have rights over your personal data, including: access, rectification, erasure, restriction of processing, data portability, objection to processing, and withdrawal of consent at any time.",
      "If you are in the UK or EEA, you also have the right to complain to your data protection supervisory authority. We respond to verified requests within one month.",
      "To exercise any right, email us at heflinscotty14@gmail.com.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "We use appropriate technical and organisational measures to protect your data, including encryption in transit, access controls, and row-level isolation so each account can only see its own data.",
    ],
  },
  {
    title: "9. Cookies",
    body: [
      "AgentOS uses essential cookies and local storage to keep you signed in and remember your settings. If we add analytics or marketing cookies, we will ask for your consent first and you can change your preferences at any time.",
    ],
  },
  {
    title: "10. Changes",
    body: [
      "We may update this notice as the product evolves. The \u201clast updated\u201d date at the top shows the current version, and continued use after an update means you accept it.",
    ],
  },
];

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Your data, respected</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Privacy Notice</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated October 2026. This notice explains how Scotty Heflin (\u201cAgentOS\u201d)
        handles your personal data. See also our{" "}
        <Link to="/terms" className="underline underline-offset-2">Terms &amp; Conditions</Link> and{" "}
        <Link to="/refund" className="underline underline-offset-2">Refund Policy</Link>.
      </p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-lg border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold">{s.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
