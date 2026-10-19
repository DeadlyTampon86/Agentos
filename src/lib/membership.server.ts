import { createClient } from "@supabase/supabase-js";
import type { StripeEnv } from "@/lib/stripe.server";

/** Returns true when the bearer token belongs to a user with an active membership in `env`. */
export async function isMemberToken(authHeader: string | null | undefined, env: StripeEnv): Promise<boolean> {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return false;
  const sb = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: u } = await sb.auth.getUser(token);
  if (!u.user) return false;
  const { data } = await sb.rpc("has_active_subscription", { user_uuid: u.user.id, check_env: env });
  return data === true;
}
