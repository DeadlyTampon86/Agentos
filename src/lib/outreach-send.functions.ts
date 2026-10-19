import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { OUTREACH } from "@/data/outreach";

const ONE_PAGER: Record<string, string> = {
  chris: "AgentOS-1-Chris-Clark.pdf",
  wyatt: "AgentOS-2-Wyatt-Poindexter.pdf",
  krista: "AgentOS-3-Krista-Martin.pdf",
  julie: "AgentOS-4-Julie-Hoff.pdf",
  polly: "AgentOS-5-Polly-Beasley.pdf",
  april: "AgentOS-6-April-Rager.pdf",
};

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

export type SendRecord = { recipient_id: string; status: string; sent_at: string | null };

export const listOutreachSends = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("outreach_sends")
    .select("recipient_id,status,sent_at");
  if (error) throw new Error("Could not load send history.");
  return (data ?? []) as SendRecord[];
});

export const sendOutreachEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const entry = OUTREACH.find((e) => e.id === data.id);
    const pdfName = ONE_PAGER[data.id] ?? "AgentOS-Overview.pdf";
    if (!entry) throw new Error("Unknown outreach recipient.");

    const brevoKey = process.env["BREVO_API_KEY"];
    const brevoFrom = process.env["BREVO_FROM_EMAIL"];
    const brevoName = process.env["BREVO_FROM_NAME"] ?? "AgentOS";
    if (!brevoKey || !brevoFrom) throw new Error("Email sending is not configured yet.");

    // Claim this recipient first. The primary key makes a second send impossible.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const claim = await supabaseAdmin
      .from("outreach_sends")
      .insert({ recipient_id: entry.id, to_email: entry.to, status: "sending" });
    if (claim.error) {
      const { data: row } = await supabaseAdmin
        .from("outreach_sends")
        .select("status,sent_at")
        .eq("recipient_id", entry.id)
        .maybeSingle();
      if (row?.status === "sent") {
        return { ok: true as const, to: entry.to, already: true, sent_at: row.sent_at };
      }
      if (row?.status === "sending") {
        throw new Error("This one is already being sent. Wait a minute and refresh.");
      }
      // Previously failed — retry is allowed.
      const retry = await supabaseAdmin
        .from("outreach_sends")
        .update({ status: "sending" })
        .eq("recipient_id", entry.id)
        .eq("status", "failed")
        .select("recipient_id");
      if (!retry.data?.length) throw new Error("Could not start this send. Refresh and try again.");
    }
    try {
      const result = await deliver(entry, pdfName, brevoKey, brevoFrom, brevoName);
      const sent_at = new Date().toISOString();
      await supabaseAdmin
        .from("outreach_sends")
        .update({ status: "sent", sent_at, gmail_message_id: result.id ?? null })
        .eq("recipient_id", entry.id);
      return { ok: true as const, to: entry.to, already: false, sent_at };
    } catch (err) {
      await supabaseAdmin.from("outreach_sends").update({ status: "failed" }).eq("recipient_id", entry.id);
      throw err;
    }
  });

async function deliver(
  entry: (typeof OUTREACH)[number],
  pdfName: string,
  brevoKey: string,
  brevoFrom: string,
  brevoFromName: string,
): Promise<{ id?: string }> {
  {

    // Pull the agent's one-pager from this app's own public assets.
    const origin = getRequestUrl().origin;
    const pdfRes = await fetch(`${origin}/one-pagers/${pdfName}`);
    if (!pdfRes.ok) throw new Error(`Could not load the one-pager (${pdfRes.status}).`);
    const pdfB64 = bytesToBase64(new Uint8Array(await pdfRes.arrayBuffer()));

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: brevoFromName, email: brevoFrom },
        to: [{ email: entry.to }],
        subject: entry.subject,
        textContent: entry.body,
        attachment: [{ content: pdfB64, name: pdfName }],
      }),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Brevo send failed [${res.status}]: ${errorBody}`);
      throw new Error(`The email could not be sent (${res.status}). Try the manual buttons below instead.`);
    }
    const data = (await res.json()) as { messageId?: string };
    return data.messageId ? { id: data.messageId } : {};
  }
}
