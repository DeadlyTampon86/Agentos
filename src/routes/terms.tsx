import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — AgentOS" },
      {
        name: "description",
        content:
          "Terms and conditions for AgentOS, the AI workspace for real estate agents, sold by Scotty Heflin with payments processed by Stripe.",
      },
      { property: "og:title", content: "Terms & Conditions — AgentOS" },
      {
        property: "og:description",
        content:
          "Terms and conditions for AgentOS, the AI workspace for real estate agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Who you are contracting with",
    body: [
      "AgentOS is owned and operated by Scotty Heflin (\u201cAgentOS,\u201d \u201cwe,\u201d \u201cus\u201d). By creating an account, subscribing, or continuing to use the service, you agree to these Terms & Conditions and confirm you are contracting with Scotty Heflin.",
      "If you use AgentOS on behalf of a brokerage or team, you confirm you have authority to bind that organization. If you use it as an individual, you confirm you are of legal age in your jurisdiction.",
    ],
  },
  {
    title: "2. What AgentOS is",
    body: [
      "AgentOS is a subscription software service for real estate professionals: AI-assisted drafting of listing descriptions, marketing copy, follow-up messages, and client communications; deal timelines; client and lead organization; open-house sign-in tools; listing photo enhancement; and automated compliance screening of drafted text.",
      "AgentOS is a productivity tool. It is not a lawyer, broker, compliance officer, or transaction coordinator, and nothing it produces is legal, tax, financial, or professional advice.",
    ],
  },
  {
    title: "3. Acceptable use — no misuse",
    body: [
      "You must not misuse the service. Prohibited conduct includes, without limitation:",
      "\u2022 Using AgentOS for any unlawful purpose, or to violate Fair Housing laws, advertising rules, MLS policies, or licensing requirements.",
      "\u2022 Fraud, spam, or deceptive outreach, including contacting people who have not given you permission where consent is legally required (TCPA, CAN-SPAM, Do-Not-Call rules).",
      "\u2022 Infringing anyone\u2019s intellectual property, privacy, or publicity rights.",
      "\u2022 Interfering with the service\u2019s security or operation — including introducing malware, probing or scanning systems, scraping the service, or attempting to bypass technical limits.",
      "\u2022 Reverse engineering, reselling, or redistributing the service or its output as a competing product.",
    ],
  },
  {
    title: "4. AI-generated content",
    body: [
      "AgentOS uses generative AI. AI output may be inaccurate, incomplete, or unsuitable for your market. You are responsible for your prompts and inputs, for having the rights to any content you submit, for reviewing and verifying every draft before you publish or send it, and for how you use the output.",
      "You retain rights to the content you submit. As between you and us, you may use the drafts AgentOS produces for you in your business. We retain ownership of the service itself, including its software, design, documentation, and branding.",
      "If you believe content on the service infringes your rights, contact us at heflinscotty14@gmail.com and we will review and, where appropriate, remove or restrict it. Repeated infringement by a user may result in suspension or termination.",
      "We may moderate content: we can remove or restrict content, refuse or filter outputs, and suspend accounts that violate these terms or applicable law.",
      "AI output is not a substitute for licensed professional advice (legal, financial, tax, or otherwise) and should not be relied on for regulated decisions without qualified human review.",
    ],
  },
  {
    title: "5. Photo enhancement and disclosure",
    body: [
      "AgentOS can digitally enhance listing photos (for example sky replacement, twilight conversion, or decluttering). Many MLSs and states require disclosure when listing images are digitally altered. You are responsible for following those rules and disclosing alterations where required.",
    ],
  },
  {
    title: "6. Accounts and credentials",
    body: [
      "You must provide accurate information when you register and keep it up to date. You are responsible for keeping your login credentials confidential and for all activity under your account.",
    ],
  },
  {
    title: "7. Payments, subscriptions, and Stripe",
    body: [
      "Payments are processed securely by Stripe. For most orders, Stripe also handles sales tax calculation, collection, filing, and remittance on our behalf, along with fraud protection and transaction-level support. On your card statement, the charge may appear as LINK.COM* followed by our name.",
      "Paid plans renew automatically until cancelled. You can cancel, switch plans, or update your payment method anytime from your My Membership page, in addition to the rights in our Refund Policy.",
      "Founding-member pricing, where offered, locks the discounted rate for as long as the subscription remains continuously active. If a founding subscription lapses or is refunded, the locked rate ends.",
    ],
  },
  {
    title: "8. Service level",
    body: [
      "We work hard to keep AgentOS available and improving, but we do not guarantee uninterrupted, timely, or error-free performance. Features may change over time as the product evolves.",
    ],
  },
  {
    title: "9. Suspension and termination",
    body: [
      "We may suspend or terminate your access if you materially breach these terms, fail to pay, create a security or fraud risk, or repeatedly or seriously violate our policies.",
      "When your access ends, your right to use the service ends. Content stored in your account may be deleted after a reasonable period, so export anything you want to keep before cancelling.",
    ],
  },
  {
    title: "10. Disclaimers and limitation of liability",
    body: [
      "AgentOS is provided \u201cas is\u201d and \u201cas available.\u201d To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.",
      "To the maximum extent permitted by law, we are not liable for indirect, consequential, or special damages — including lost profits, lost deals, lost data, fines, or license actions — arising from your use of the service or reliance on its output. Our aggregate liability is capped at the fees you paid in the twelve months before the claim.",
      "Nothing in these terms excludes liability for fraud, death, or personal injury where the law does not allow it.",
    ],
  },
  {
    title: "11. Indemnity",
    body: [
      "You agree to indemnify and hold us harmless from claims arising from content you submit, your unlawful use of the service, or your violation of these terms.",
    ],
  },
  {
    title: "12. General",
    body: [
      "These terms are governed by the laws of the State of Texas, without regard to conflict-of-law rules, and disputes will be resolved in the courts located there unless applicable law requires otherwise.",
      "You may not assign these terms without our consent. We may assign them in connection with a merger, acquisition, or sale of assets.",
      "We are not responsible for delays or failures caused by events beyond our reasonable control.",
      "If any part of these terms is unenforceable, the rest remains in effect. We may update these terms from time to time; continued use after an update means you accept the new terms.",
    ],
  },
];

function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">The agreement</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Terms &amp; Conditions</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated October 2026. These terms govern your use of AgentOS, operated by Scotty
        Heflin. See also our <Link to="/refund" className="underline underline-offset-2">Refund Policy</Link> and{" "}
        <Link to="/privacy" className="underline underline-offset-2">Privacy Notice</Link>.
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
