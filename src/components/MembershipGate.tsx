import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

// Tool pages that need a membership. The home page, demo, pricing, legal and
// account pages stay open. Server-side checks on AI drafting and photo
// enhancement are the real lock; this screen is the friendly face of it.
const MEMBER_PATHS = [
  "/launch", "/deals", "/clients", "/followup", "/offers", "/social",
  "/pricing-talk", "/openhouse", "/library", "/photos", "/reminders", "/compliance",
];

export function MembershipGate({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const gated = MEMBER_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  const { user, loading: authLoading } = useAuth();
  const sub = useSubscription();

  if (!gated) return <>{children}</>;
  if (authLoading || (user && sub.loading)) {
    return <main className="mx-auto max-w-xl px-4 py-24 text-center text-muted-foreground">Checking your membership…</main>;
  }
  if (user && sub.isActive) return <>{children}</>;

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-foreground">Members only</h1>
      <p className="mt-4 text-muted-foreground">
        This tool is part of the AgentOS membership. Try five tools free in the demo — no signup — or join to unlock everything.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/demo" className="rounded-md border border-accent/50 px-5 py-2.5 text-sm text-accent hover:bg-accent/10">
          Try the free demo
        </Link>
        <Link to={user ? "/pricing" : "/auth"} className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {user ? "See plans" : "Sign in to join"}
        </Link>
      </div>
    </main>
  );
}
