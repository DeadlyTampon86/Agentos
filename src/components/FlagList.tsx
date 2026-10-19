import type { Flag } from "@/lib/toolkit";

export function FlagList({ flags }: { flags: Flag[] }) {
  if (!flags.length)
    return (
      <div className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
        <strong>Fair Housing check passed.</strong> No risky phrases found. Still verify every fact before publishing.
      </div>
    );
  return (
    <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-destructive">
        {flags.length} phrase{flags.length > 1 ? "s" : ""} to review before publishing
      </p>
      {flags.map((f, i) => (
        <div key={i} className="text-sm">
          <span className="rounded bg-destructive/15 px-1.5 py-0.5 font-medium">“{f.phrase}”</span>{" "}
          <span className="text-muted-foreground">{f.reason}</span>
          <div className="mt-0.5 text-foreground">→ {f.suggest}</div>
        </div>
      ))}
    </div>
  );
}
