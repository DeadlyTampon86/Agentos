import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlagList } from "@/components/FlagList";
import { checkFairHousing } from "@/lib/toolkit";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Fair Housing Check — AgentOS" },
      { name: "description", content: "Paste any listing, ad or email and instantly flag Fair Housing risk phrases with safer wording." },
      { property: "og:title", content: "Fair Housing Check — AgentOS" },
      { property: "og:description", content: "Catch steering and demographic language before you publish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Compliance,
});

function Compliance() {
  const [text, setText] = useState("");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Fair Housing Check</h1>
      <p className="mt-2 text-muted-foreground">
        Paste any listing, social post, ad or email. Risky phrases are flagged as you type. Nothing leaves your device.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Charming 3-bed in a safe neighborhood, perfect for young families, walking distance to church…"
        className="mt-6 min-h-56 w-full rounded-md border bg-card p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {text.trim() && <div className="mt-4"><FlagList flags={checkFairHousing(text)} /></div>}
      <p className="mt-6 text-xs text-muted-foreground">
        This catches common risk phrases; it isn't legal advice. Always follow your brokerage and MLS rules.
      </p>
    </div>
  );
}
