import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal & Disclaimers — AgentOS" },
      {
        name: "description",
        content:
          "Terms of use, AI content disclaimer, Fair Housing notice, and privacy policy for AgentOS, the AI workspace for real estate agents.",
      },
      { property: "og:title", content: "Legal & Disclaimers — AgentOS" },
      {
        property: "og:description",
        content:
          "Terms of use, AI content disclaimer, Fair Housing notice, and privacy policy for AgentOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalPage,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. What this tool is (and isn't)",
    body: [
      "AgentOS is a writing and organization assistant for licensed real estate professionals. It drafts marketing copy, follow-up messages, emails, and checklists using artificial intelligence, and it flags language that may raise Fair Housing concerns.",
      "AgentOS is not a lawyer, broker, compliance officer, or transaction coordinator. Nothing it produces is legal, tax, financial, or professional advice. It does not replace your broker's review, your MLS rules, or your state licensing requirements.",
    ],
  },
  {
    title: "2. You are responsible for what you publish",
    body: [
      "AI can make mistakes. It can invent property features, misstate facts, or produce wording that violates a rule in your market. Before you publish, send, or post anything AgentOS drafts, you must review it, verify every fact against the actual property and your records, and edit it as needed.",
      "By using this tool you agree that you — the licensed professional — are solely responsible for the accuracy and legality of anything you publish or send. This is the same standard regulators and courts apply: the agent owns the outcome, not the software.",
    ],
  },
  {
    title: "3. Fair Housing",
    body: [
      "The Fair Housing Act prohibits discrimination in housing advertising based on race, color, religion, sex (including sexual orientation and gender identity), national origin, familial status, and disability. Many states and cities protect additional classes.",
      "AgentOS builds Fair Housing guardrails into every draft and includes a checking tool that flags risky phrases. These checks are a safety net, not a guarantee — automated screening cannot catch everything, and it does not certify any text as compliant. Final compliance responsibility stays with you and your broker.",
      "Never use this tool to target or exclude buyers or renters by any protected characteristic, and never describe a neighborhood by the people who live there.",
    ],
  },
  {
    title: "4. MLS, state, and brokerage rules",
    body: [
      "MLS boards, state real estate commissions, and brokerages have their own rules for listing remarks, advertising, AI disclosure, and record-keeping. These vary by market and change over time. It is your job to know and follow the rules that apply to you.",
      "Some MLSs and states require disclosure when content is AI-generated or images are digitally altered. When in doubt, disclose.",
    ],
  },
  {
    title: "5. Client communications and outreach laws",
    body: [
      "Follow-up texts, emails, and call scripts you send are subject to laws like the TCPA (texts and calls), CAN-SPAM (email), and state Do-Not-Call rules. Only contact people who have given you permission, honor opt-outs immediately, and identify yourself honestly.",
      "Do not use AgentOS to send messages that pretend to be personally hand-written when they are automated, where such disclosure is required.",
    ],
  },
  {
    title: "6. Your data and privacy",
    body: [
      "AgentOS stores your profile, deals, and client cards in your own browser on your own device (localStorage). We do not run accounts, sync, or a customer database — your client details never leave your device except that the text you submit for drafting is sent to the AI provider to generate a result.",
      "Do not paste sensitive client information (Social Security numbers, financial account details, confidential contract terms) into any AI prompt. Only enter what you would be comfortable sending to a third-party writing service.",
      "Clearing your browser data erases everything stored by this app. Export or copy anything you want to keep.",
    ],
  },
  {
    title: "7. No warranty; limitation of liability",
    body: [
      "AgentOS is provided \"as is\" without warranties of any kind, express or implied, including accuracy, merchantability, or fitness for a particular purpose.",
      "To the maximum extent permitted by law, AgentOS and its creators are not liable for any damages arising from your use of the tool or reliance on its output, including lost deals, fines, license actions, or claims by clients or third parties.",
    ],
  },
  {
    title: "8. Deadlines and checklists",
    body: [
      "Deal timelines and milestone dates are estimates generated from the dates you enter. Real contract deadlines depend on your actual contract language, local custom, and business-day rules. Always confirm every deadline against the signed contract and with your broker or transaction coordinator. A missed contingency date can be costly — the checklist is a backup, not the source of truth.",
    ],
  },
];

function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">The fine print, in plain English</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Legal &amp; Disclaimers</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Last updated October 2026. This page is a plain-language summary designed to be read, not
        buried. It is not itself legal advice — have an attorney review your final terms before
        charging customers.
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
      <p className="mt-10 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
        <strong>The one-sentence version:</strong> AgentOS drafts, you decide. Review everything,
        verify every fact, follow Fair Housing law and your local rules, and only contact people
        who asked to hear from you.
      </p>
    </main>
  );
}
