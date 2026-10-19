// Reminders sender — runs on a schedule and sends due reminders automatically.
// All providers are free tiers, keeping the product free of per-message costs:
//   Email: Brevo (free 300/day)      — needs BREVO_API_KEY + BREVO_FROM_EMAIL
//   Texts: textbee (free 300/month)  — needs TEXTBEE_API_KEY + TEXTBEE_DEVICE_ID
//          (the agent's own Android phone is the sender, so replies come to them)
//   Fallback texts: Twilio (direct api.twilio.com, HTTP basic auth) — needs
//          TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER
// If a provider is not configured, those reminders stay scheduled and the
// agent can still send them with one tap from the Reminders page.

import { createFileRoute } from "@tanstack/react-router";

const BATCH = 25;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
        if (!token) return json({ error: "Unauthorized" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin.from("cron_tokens").select("token").eq("name", "reminders").maybeSingle();
        if (!row || row.token !== token) return json({ error: "Unauthorized" }, 401);

        const brevoKey = process.env["BREVO_API_KEY"];
        const brevoFrom = process.env["BREVO_FROM_EMAIL"];
        const brevoName = process.env["BREVO_FROM_NAME"] ?? "AgentOS";
        const textbeeKey = process.env["TEXTBEE_API_KEY"];
        const textbeeDevice = process.env["TEXTBEE_DEVICE_ID"];
        const twilioAccountSid = process.env["TWILIO_ACCOUNT_SID"];
        const twilioAuthToken = process.env["TWILIO_AUTH_TOKEN"];
        const twilioFrom = process.env["TWILIO_FROM_NUMBER"];

        const { data: due } = await supabaseAdmin
          .from("reminders")
          .select("*")
          .eq("status", "scheduled")
          .lte("send_at", new Date().toISOString())
          .order("send_at")
          .limit(BATCH);

        let sent = 0;
        let skippedNoProvider = 0;
        for (const r of due ?? []) {
          // Claim the row so a parallel run cannot double-send.
          const { data: claimed } = await supabaseAdmin
            .from("reminders")
            .update({ status: "sending" } as never)
            .eq("id", r.id)
            .eq("status", "scheduled")
            .select("id");
          if (!claimed?.length) continue;

          // Release the claim if this channel has no provider yet, so the
          // one-tap fallback on the Reminders page still offers it.
          if (r.channel === "email" && (!brevoKey || !brevoFrom)) {
            await supabaseAdmin.from("reminders").update({ status: "scheduled" } as never).eq("id", r.id);
            skippedNoProvider++;
            continue;
          }
          const smsReady = Boolean(textbeeKey && textbeeDevice) || Boolean(twilioAccountSid && twilioAuthToken && twilioFrom);
          if (r.channel === "sms" && !smsReady) {
            await supabaseAdmin.from("reminders").update({ status: "scheduled" } as never).eq("id", r.id);
            skippedNoProvider++;
            continue;
          }

          if (r.channel === "email" && !r.to_email) {
            await supabaseAdmin.from("reminders").update({ status: "failed", last_error: "Missing email address" } as never).eq("id", r.id);
            continue;
          }
          if (r.channel === "sms" && (!r.to_phone || (r.recipient === "client" && !r.client_consent))) {
            await supabaseAdmin.from("reminders").update({ status: "failed", last_error: "Missing phone or consent" } as never).eq("id", r.id);
            continue;
          }

          let ok = false;
          let err = "";

          if (r.channel === "email") {
            try {
              const res = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: { "api-key": brevoKey!, "Content-Type": "application/json", accept: "application/json" },
                body: JSON.stringify({
                  sender: { name: brevoName, email: brevoFrom },
                  to: [{ email: r.to_email }],
                  subject: r.title,
                  textContent: r.message,
                }),
              });
              if (res.ok) {
                ok = true;
              } else {
                err = `[Brevo ${res.status}] ${(await res.text()).slice(0, 300)}`;
                console.error(`Brevo send failed: ${err}`);
                if (res.status === 429) break;
              }
            } catch (e) {
              err = `Brevo request error: ${String(e).slice(0, 200)}`;
            }
          } else if (r.channel === "sms") {
            if (textbeeKey && textbeeDevice) {
              try {
                const res = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${textbeeDevice}/send-sms`, {
                  method: "POST",
                  headers: { "x-api-key": textbeeKey, "Content-Type": "application/json" },
                  body: JSON.stringify({ recipients: [r.to_phone], message: r.message.slice(0, 1500) }),
                });
                if (res.ok) {
                  ok = true;
                } else {
                  err = `[textbee ${res.status}] ${(await res.text()).slice(0, 300)}`;
                  console.error(`textbee send failed: ${err}`);
                  if (res.status === 429) break;
                }
              } catch (e) {
                err = `textbee request error: ${String(e).slice(0, 200)}`;
              }
            } else if (twilioAccountSid && twilioAuthToken && twilioFrom) {
              try {
                const basic = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
                const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
                  method: "POST",
                  headers: {
                    Authorization: `Basic ${basic}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({ To: r.to_phone ?? "", From: twilioFrom, Body: r.message.slice(0, 1500) }),
                });
                if (res.ok) {
                  ok = true;
                } else {
                  err = `[Twilio ${res.status}] ${(await res.text()).slice(0, 300)}`;
                  console.error(`Twilio send failed: ${err}`);
                  if (res.status === 429 || res.status === 402) break;
                }
              } catch (e) {
                err = `Twilio request error: ${String(e).slice(0, 200)}`;
              }
            }
          }

          if (ok) {
            sent++;
            await supabaseAdmin.from("reminders").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null } as never).eq("id", r.id);
          } else {
            await supabaseAdmin.from("reminders").update({ status: "failed", last_error: err.slice(0, 300) || "Send failed" } as never).eq("id", r.id);
          }
        }
        return json({ sent, checked: due?.length ?? 0, waitingForSetup: skippedNoProvider });
      },
    },
  },
});
