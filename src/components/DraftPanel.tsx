import { getStripeEnvironment } from "@/lib/stripe";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { generateDraft } from "@/lib/generate.functions";
import { checkFairHousing } from "@/lib/toolkit";
import { FlagList } from "@/components/FlagList";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copied ✓" : label}
    </Button>
  );
}

export function useDraft() {
  const gen = useServerFn(generateDraft);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function run(prompt: string) {
    setLoading(true);
    setError("");
    try {
      const r = await gen({ data: { prompt, environment: getStripeEnvironment() } });
      if (r.ok) setText(r.text);
      else setError(r.error);
    } catch {
      setError("Couldn't reach the writer. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }
  return { text, setText, error, loading, run };
}

export function DraftOutput({ text, setText }: { text: string; setText: (s: string) => void }) {
  const flags = checkFairHousing(text);
  return (
    <div className="fade-up space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-64 w-full rounded-md border bg-card p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={text} label="Copy draft" />
        <span className="text-xs text-muted-foreground">
          {text.trim().split(/\s+/).length} words · {text.length} characters
        </span>
      </div>
      <FlagList flags={flags} />
      <p className="text-xs text-muted-foreground">
        AI draft — review every fact and edit before publishing. You're responsible for what you
        send or post.{" "}
        <a href="/legal" className="underline underline-offset-2 hover:text-foreground">
          Legal &amp; disclaimers
        </a>
      </p>
    </div>
  );
}
