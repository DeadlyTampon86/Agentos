import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

const FOUNDING_PRICES = new Set(["agentos_founding_monthly", "agentos_founding_yearly"]);

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string | undefined; userId?: string | undefined },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    const hit = found.data[0];
    if (hit) return hit.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (options.userId && customer.metadata?.['userId'] !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: {
    priceId: string;
    quantity?: number;
    customerEmail?: string;
    userId?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Invalid priceId");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment.");
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      // Founding pricing is capped at the first 100 agents.
      if (FOUNDING_PRICES.has(data.priceId)) {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
          auth: { persistSession: false },
        });
        const { data: left } = await sb.rpc("founding_spots_left", { check_env: data.environment });
        if (typeof left !== "number" || left <= 0) {
          return { error: "The Founding Member deal is sold out." };
        }
      }

      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) return { error: "Price not found" };
      const isRecurring = stripePrice.type === "recurring";

      const customerId = (data.customerEmail || data.userId)
        ? await resolveOrCreateCustomer(stripe, {
            ...(data.customerEmail && { email: data.customerEmail }),
            ...(data.userId && { userId: data.userId }),
          })
        : undefined;

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: data.quantity || 1 }],
        mode: isRecurring ? "subscription" : "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        ...(customerId && { customer: customerId }),
        // Full compliance handling: Stripe handles tax, fraud, disputes,
        // and transaction support end-to-end (US seller, digital product).
        managed_payments: { enabled: true },
        ...(data.userId && {
          metadata: { userId: data.userId, managed_payments: "true" },
          ...(isRecurring && { subscription_data: { metadata: { userId: data.userId } } }),
        }),
      } as Parameters<typeof stripe.checkout.sessions.create>[0]);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type PortalSessionResult = { url: string } | { error: string };

async function latestSubscription(
  supabase: any,
  userId: string,
  environment: StripeEnv,
) {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id, price_id, status")
    .eq("user_id", userId)
    .eq("environment", environment)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return sub;
}

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { returnUrl?: string; environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment.");
    return data;
  })
  .handler(async ({ data, context }): Promise<PortalSessionResult> => {
    const sub = await latestSubscription(context.supabase, context.userId, data.environment);
    if (!sub?.stripe_customer_id) return { error: "No subscription found for this account." };

    try {
      const stripe = createStripeClient(data.environment);
      const portal = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        ...(data.returnUrl && { return_url: data.returnUrl }),
      });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

const SWITCH_TARGETS = ["agentos_monthly", "agentos_yearly"] as const;

/** Changes the member's current plan in place, charging/crediting only the prorated difference now. */
export const changePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; environment: StripeEnv }) => {
    if (!(SWITCH_TARGETS as readonly string[]).includes(data.priceId)) throw new Error("That plan isn't available to switch to.");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment.");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true } | { error: string }> => {
    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_subscription_id, price_id, status")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_subscription_id) return { error: "You need an active membership to switch plans." };
    if (sub.status === "past_due") return { error: "Please update your payment method before switching plans." };
    if (sub.price_id === data.priceId) return { error: "You're already on that plan." };

    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) return { error: "Plan not found." };

      const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
      const itemId = subscription.items?.data?.[0]?.id;
      if (!itemId) return { error: "The plan couldn't be changed. Please try again." };

      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: [{ id: itemId, price: stripePrice.id, quantity: 1 }],
        proration_behavior: "always_invoice",
      });
      return { ok: true };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

// ---- Billing history / invoices ----

type Plan = string | null;

function planFromPrice(price: any): Plan {
  return price?.lookup_key ?? price?.metadata?.lovable_external_id ?? null;
}

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
  "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);
const THREE_DECIMAL_CURRENCIES = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

function toMajorUnit(amount: number | null | undefined, currency: string): number {
  const value = amount ?? 0;
  const c = (currency ?? "").toLowerCase();
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return value;
  if (THREE_DECIMAL_CURRENCIES.has(c)) return value / 1000;
  return value / 100;
}

function isoFromUnix(seconds: number | null | undefined): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function findCustomerIds(
  stripe: ReturnType<typeof createStripeClient>,
  options: { userId: string; email?: string },
): Promise<string[]> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const ids = new Set<string>();

  const subs = await stripe.subscriptions.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 100,
  });
  for (const sub of subs.data) {
    const customer = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
    if (customer) ids.add(customer);
  }

  const customers = await stripe.customers.search({
    query: `metadata['userId']:'${options.userId}'`,
    limit: 100,
  });
  for (const c of customers.data) ids.add(c.id);

  if (ids.size === 0 && options.email) {
    const byEmail = await stripe.customers.list({ email: options.email, limit: 100 });
    for (const c of byEmail.data) ids.add(c.id);
  }

  return [...ids];
}

export interface InvoiceRow {
  id: string;
  status: string | null;
  amount_paid: number;
  currency: string;
  created: string | null;
  hosted_invoice_url: string | null;
  pdf_url: string | null;
  plan: Plan;
  customer_id: string;
}

export interface SubscriptionRow {
  id: string;
  status: string;
  plan: Plan;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  customer_id: string;
}

type StripeDataResult =
  | { subscriptions: SubscriptionRow[]; invoices: InvoiceRow[] }
  | { error: string };

export const getStripeData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => {
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment.");
    return data;
  })
  .handler(async ({ data, context }): Promise<StripeDataResult> => {
    try {
      const { userId, supabase } = context;
      const { data: { user } } = await supabase.auth.getUser();
      const stripe = createStripeClient(data.environment);
      const customerIds = await findCustomerIds(stripe, {
        userId,
        ...(user?.email && { email: user.email }),
      });

      if (customerIds.length === 0) {
        return { subscriptions: [], invoices: [] };
      }

      const subscriptions: SubscriptionRow[] = [];
      for (const customerId of customerIds) {
        const list = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
        for (const sub of list.data) {
          const item = sub.items?.data?.[0];
          const periodEnd = item?.current_period_end ?? (sub as any).current_period_end;
          subscriptions.push({
            id: sub.id,
            status: sub.status,
            plan: planFromPrice(item?.price),
            current_period_end: isoFromUnix(periodEnd),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            customer_id: customerId,
          });
        }
      }

      const invoices: InvoiceRow[] = [];
      for (const customerId of customerIds) {
        const list = await stripe.invoices.list({ customer: customerId, limit: 100 });
        for (const inv of list.data) {
          const line = inv.lines?.data?.[0];
          invoices.push({
            id: inv.id ?? "",
            status: inv.status ?? null,
            amount_paid: toMajorUnit(inv.amount_paid, inv.currency),
            currency: inv.currency,
            created: isoFromUnix(inv.created),
            hosted_invoice_url: inv.hosted_invoice_url ?? null,
            pdf_url: inv.invoice_pdf ?? null,
            plan: planFromPrice((line as any)?.price),
            customer_id: customerId,
          });
        }
      }

      return { subscriptions, invoices };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
