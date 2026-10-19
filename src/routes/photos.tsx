import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { streamImage } from "@/lib/stream-image";

export const Route = createFileRoute("/photos")({
  head: () => ({
    meta: [
      { title: "Listing Photo Enhancer — AgentOS" },
      { name: "description", content: "Brighten, straighten and polish property photos in seconds, with honest MLS disclosure reminders." },
      { property: "og:title", content: "Listing Photo Enhancer — AgentOS" },
      { property: "og:description", content: "Brighten, straighten and polish property photos in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhotosPage,
});

const PRESETS = [
  { id: "bright", label: "Bright & True", disclose: false, p: "Professional real estate photo correction: balance exposure, lift shadows, recover blown windows, correct white balance to neutral daylight, gentle clarity. Keep every object, wall, fixture and room layout exactly as is." },
  { id: "straight", label: "Straighten Lines", disclose: false, p: "Correct lens distortion and make vertical walls and door frames perfectly vertical, as an architectural photographer would. Do not add, remove or change any object." },
  { id: "sky", label: "Blue Sky", disclose: true, p: "Replace only the overcast or blown-out sky with a natural soft blue sky with light clouds, matching lighting on the house. Change nothing else about the property, lawn or surroundings." },
  { id: "twilight", label: "Twilight", disclose: true, p: "Convert this exterior to a natural dusk twilight shot: deep blue sky, warm glow in the windows, soft exterior lights on. Keep the architecture, landscaping and all features exactly as they are." },
  { id: "declutter", label: "Declutter", disclose: true, p: "Remove only small personal clutter (loose papers, toiletries, cords, magnets, toys, trash bins). Do NOT remove or alter furniture, fixtures, walls, flooring, damage, or any permanent feature of the home." },
] as const;

function PhotosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [final, setFinal] = useState(false);
  const [preset, setPreset] = useState<(typeof PRESETS)[number]["id"]>("bright");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const chosen = PRESETS.find((x) => x.id === preset)!;

  function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose a photo (JPG or PNG).");
    if (f.size > 20 * 1024 * 1024) return setErr("That photo is over 20 MB — try a smaller one.");
    setErr(""); setAfter(""); setFile(f); setBefore(URL.createObjectURL(f));
  }

  async function run() {
    if (!file) return;
    setBusy(true); setErr(""); setAfter(""); setFinal(false);
    const form = new FormData();
    form.append("prompt", chosen.p + " Photorealistic. No text, no watermark.");
    form.append("image", file);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "x-payments-env": getStripeEnvironment() };
      if (sess.session) headers["Authorization"] = `Bearer ${sess.session.access_token}`;
      await streamImage("/api/enhance-photo", form, (src, isFinal) => { setAfter(src); setFinal(isFinal); }, undefined, headers);
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setErr(m.includes("403") ? "An active AgentOS membership is required to enhance photos." : m.includes("402") ? "AI credits are used up — add credits to keep enhancing." : m.includes("429") ? "Too many requests right now — wait a minute and try again." : "The photo couldn't be enhanced. Please try again.");
    }
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs not-italic uppercase tracking-[0.25em] text-accent">Listing photos</p>
      <h1 className="mt-2 text-6xl text-foreground">Photo Enhancer</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Upload a property photo, pick a finish, and get an MLS-ready version in seconds. Honest edits only — the home always looks like the home.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="lacquer-panel gold-rule space-y-5 rounded-sm border p-5 shadow-card">
          <label className="block cursor-pointer rounded-sm border border-dashed border-accent/60 p-5 text-center text-sm text-muted-foreground hover:border-accent">
            {file ? file.name : "Tap to choose a photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <div className="grid gap-2">
            {PRESETS.map((x) => (
              <button key={x.id} onClick={() => setPreset(x.id)}
                className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${preset === x.id ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-accent/60"}`}>
                {x.label}{x.disclose && <span className="ml-2 text-xs text-muted-foreground">· disclose</span>}
              </button>
            ))}
          </div>
          <Button onClick={run} disabled={!file || busy} className="w-full bg-gold border border-accent font-semibold text-accent-foreground shadow-gold">
            {busy ? "Enhancing…" : "ENHANCE PHOTO →"}
          </Button>
          {chosen.disclose && (
            <p className="text-xs text-accent">This edit changes what buyers see. Most MLS rules require a note like "Photo digitally enhanced" — label it in your listing.</p>
          )}
          {err && <p role="alert" className="rounded-sm border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[["Before", before], ["After", after]].map(([label, src]) => (
            <figure key={label} className="lacquer-panel rounded-sm border p-3 shadow-card">
              <figcaption className="mb-2 text-xs not-italic uppercase tracking-[0.25em] text-accent">{label}</figcaption>
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-background/60">
                {src ? (
                  <img src={src} alt={`${label} photo`} className={`h-full w-full object-contain transition-[filter] duration-500 ${label === "After" && !final ? "blur-2xl" : "blur-0"}`} />
                ) : (
                  <span className="text-sm text-muted-foreground">{label === "After" && busy ? "Working… about 20–40 seconds" : "—"}</span>
                )}
              </div>
              {label === "After" && after && final && (
                <a href={after} download="agentos-enhanced.png" className="mt-3 inline-block text-sm text-accent underline underline-offset-2">Download</a>
              )}
            </figure>
          ))}
        </div>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Never hide defects, damage or permanent features. You're responsible for photos you publish.</p>
    </main>
  );
}
