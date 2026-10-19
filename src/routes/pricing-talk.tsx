import { createFileRoute } from "@tanstack/react-router";
import { AiTool, agentLine, meta } from "@/components/AiTool";

export const Route = createFileRoute("/pricing-talk")({
  head: () => meta("Price Talk Prep", "Prepare for listing appointments and price conversations with a CMA summary and word-for-word scripts."),
  component: () => (
    <AiTool
      title="Price Talk Prep"
      intro="Paste your comps and get a seller-friendly price summary, a suggested range explanation, and word-for-word answers for the hard questions."
      button="Prep my price talk"
      fields={[
        { key: "kind", label: "Conversation", type: "select", options: ["Listing appointment — pricing presentation", "Seller wants to list too high", "Price reduction conversation", "Buyer asking what to offer"] },
        { key: "address", label: "Subject property", placeholder: "123 Oak St, 3/2, 1,850 sqft" },
        { key: "seller", label: "Client name", placeholder: "Mr. and Mrs. Chen" },
        { key: "comps", label: "Comparable sales (paste them)", type: "area", placeholder: "456 Elm — 3/2, 1,900 sqft, sold $412k, 12 days\n…" },
        { key: "notes", label: "Condition, upgrades, days on market, client's number", type: "area", placeholder: "New roof, dated kitchen. Seller wants $460k." },
      ]}
      build={(v, p) => `Help a real estate agent prepare a pricing conversation.
Conversation type: ${v.kind}
Subject property: ${v.address || "[PROPERTY]"}
Client: ${v.seller || "[CLIENT]"}
Comparable sales provided by the agent: ${v.comps || "[COMPS]"}
Notes: ${v.notes || "none"}
Give: (1) a plain-English comp summary table (address, beds/baths, sqft, price, $/sqft, days on market) using only the data provided, (2) a suggested range with reasoning — clearly labeled as the agent's opinion, not an appraisal, (3) a word-for-word opening script, (4) answers to 4 likely objections, (5) a one-page follow-up email summary. Never invent comps or numbers; use [BRACKETS] for anything missing.
Agent: ${agentLine(p)}`}
    />
  ),
});
