import { createFileRoute } from "@tanstack/react-router";
import { AiTool, agentLine, meta } from "@/components/AiTool";

export const Route = createFileRoute("/social")({
  head: () => meta("Weekly Social Calendar", "A full week of ready-to-post social content for real estate agents in one click."),
  component: () => (
    <AiTool
      title="Weekly Social Calendar"
      intro="A full week of posts — captions, hashtags and photo ideas — so you never stare at a blank screen again."
      button="Build my week"
      fields={[
        { key: "platforms", label: "Platforms", type: "select", options: ["Instagram + Facebook", "Instagram only", "Facebook only", "LinkedIn", "TikTok / Reels scripts", "All of them"] },
        { key: "days", label: "Posts this week", placeholder: "5" },
        { key: "market", label: "Your market", placeholder: "North Austin" },
        { key: "listings", label: "Active listings or recent sales to feature", type: "area", placeholder: "3 bed in Cedar Park, just sold condo downtown…" },
        { key: "themes", label: "Anything else to include", type: "area", placeholder: "Rates update, a local event, a client win…" },
      ]}
      build={(v, p) => `Create a weekly social media content calendar for a real estate agent.
Platforms: ${v.platforms}
Number of posts: ${v.days || "5"}
Market: ${v.market || p.city || "[MARKET]"}
Listings/sales to feature: ${v.listings || "none — use evergreen topics"}
Extra themes: ${v.themes || "none"}
Mix: market insight, listing/sold feature, homeowner tip, behind-the-scenes/personal, and one engagement question. For each post give: Day, post type, caption ready to paste, 5-8 hashtags, and a photo/video idea. For video platforms give a short hook + script. Describe properties and places, never the people who live there. Don't invent market statistics — leave [STAT] placeholders.
Agent: ${agentLine(p)}`}
    />
  ),
});
