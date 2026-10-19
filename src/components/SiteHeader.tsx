import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/launch", label: "Listing Launch" },
  { to: "/deals", label: "Deal Timeline" },
  { to: "/clients", label: "Clients" },
  { to: "/followup", label: "Follow-Ups" },
  { to: "/offers", label: "Offers" },
] as const;

export function SiteHeader() {
  return (
    <header className="gold-rule sticky top-0 z-20 border-b bg-background/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-5 px-5 py-4 md:grid-cols-[1fr_2fr_1fr]">
        <Link to="/" className="font-script text-4xl leading-none text-foreground">
          AgentOS
        </Link>
        <nav className="hidden items-center justify-center gap-7 text-sm text-foreground md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap transition-colors hover:text-accent"
              activeProps={{ className: "text-accent" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" className="bg-gold ml-auto rounded-full border border-accent px-5 font-semibold text-accent-foreground shadow-gold">
          <Link to="/demo">Try It Free</Link>
        </Button>
      </div>
    </header>
  );
}
