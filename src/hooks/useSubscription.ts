import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";

export interface SubscriptionState {
  loading: boolean;
  isActive: boolean;
  status: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    isActive: false,
    status: null,
    priceId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  useEffect(() => {
    if (!user) {
      setState({ loading: false, isActive: false, status: null, priceId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false });
      return;
    }

    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (!data) {
        setState({ loading: false, isActive: false, status: null, priceId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false });
        return;
      }

      const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
      const inPeriod = !periodEnd || periodEnd > new Date();
      const isActive =
        (["active", "trialing", "past_due"].includes(data.status) && inPeriod) ||
        (data.status === "canceled" && inPeriod);

      setState({
        loading: false,
        isActive,
        status: data.status,
        priceId: data.price_id,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
      });
    }

    load();

    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return state;
}
