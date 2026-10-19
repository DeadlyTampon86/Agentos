import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM = `You are an expert residential real estate copywriter and assistant for a licensed agent.
Write polished, ready-to-send output — no preamble, no "Here is", no markdown headings unless the task asks for structure.
Strictly comply with the U.S. Fair Housing Act: describe property features and verifiable amenities only. Never describe neighborhoods by the people who live there, never say who a home is "perfect for", never use "safe", "family-friendly", "exclusive", or proximity to houses of worship. If a placeholder was left blank, write a clear [bracketed] placeholder instead of inventing facts.`;

export const generateDraft = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      prompt: z.string().min(1).max(20000),
      // Free demo/home-page samples stay open; everything else needs a membership.
      demo: z.boolean().optional(),
      environment: z.enum(["sandbox", "live"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "AI is not configured yet." };
    if (data.demo) {
      if (data.prompt.length > 4000) return { ok: false as const, error: "Demo drafts are limited in length." };
    } else {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      const { isMemberToken } = await import("@/lib/membership.server");
      const ok = await isMemberToken(getRequestHeader("authorization"), data.environment ?? "live");
      if (!ok) return { ok: false as const, error: "An active AgentOS membership is required. See Pricing to join." };
    }
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const provider = createOpenAI({
      baseURL: "https://api.openai.com/v1",
      apiKey,
    });
    try {
      const result = streamText({
        model: provider.responses("gpt-4o-mini"),
        instructions: SYSTEM,
        prompt: data.prompt,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = await result.text;
      if (!text.trim()) return { ok: false as const, error: "The AI returned an empty draft." };
      return { ok: true as const, text };
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      const msg =
        status === 429
          ? "Too many requests right now — wait a minute and try again."
          : status === 402
            ? "AI credits are used up. Top up the OpenAI API balance."
            : "Something went wrong writing this draft.";
      console.error("generateDraft failed", e);
      return { ok: false as const, error: msg };
    }
  });
