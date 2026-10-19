import { createFileRoute } from "@tanstack/react-router";
import { AiTool, agentLine, meta } from "@/components/AiTool";

export const Route = createFileRoute("/offers")({
  head: () => meta("Offers & Negotiation", "Offer cover letters, counteroffer talk tracks and negotiation scripts for any situation."),
  component: () => (
    <AiTool
      title="Offers & Negotiation"
      intro="Pick the situation and get exactly what to say or send — offer summaries, counteroffer replies, repair requests and multiple-offer talks."
      button="Write my script"
      fields={[
        {
          key: "kind",
          label: "Situation",
          type: "select",
          options: [
            "Offer summary email to the listing agent",
            "Multiple-offer situation — talk track for my buyer",
            "Responding to a counteroffer",
            "Presenting a low offer to my seller",
            "Inspection repair request",
            "Asking for seller credits instead of repairs",
            "Appraisal came in low — renegotiation",
            "Explaining an escalation clause to my buyer",
          ],
        },
        { key: "address", label: "Property address", placeholder: "123 Oak St" },
        { key: "price", label: "List price / offer amount", placeholder: "$450,000 / $440,000" },
        { key: "client", label: "Client name", placeholder: "The Riveras" },
        { key: "terms", label: "Key terms", placeholder: "30-day close, 3% down, pre-approved" },
        { key: "context", label: "What's going on", type: "area", placeholder: "Two other offers, seller wants a quick close…" },
      ]}
      build={(v, p) => `Write a real estate negotiation piece.
Situation: ${v.kind}
Property: ${v.address || "[ADDRESS]"}
Price details: ${v.price || "[PRICE]"}
Client: ${v.client || "[CLIENT NAME]"}
Key terms: ${v.terms || "[TERMS]"}
Context: ${v.context || "none"}
Give: (1) the ready-to-send message or word-for-word talk track, (2) 3 likely pushbacks with calm responses, (3) one line on what NOT to say. Professional, factual, never misleading. Remind that contract terms should be confirmed with the broker/attorney.
From: ${agentLine(p)}`}
    />
  ),
});
