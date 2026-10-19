import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductTour } from "@/components/ProductTour";
import { HeroListingWriter } from "@/components/HeroListingWriter";
import { useState as useHeroState } from "react";
import { Button } from "@/components/ui/button";
import estateImage from "@/assets/luxury-estate.jpg";
import interiorImage from "@/assets/luxury-interior.jpg";
import notebookImage from "@/assets/luxury-notebook.jpg";
import contractImage from "@/assets/luxury-contract.jpg";
import cityImage from "@/assets/luxury-city.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgentOS — One app for every part of a real estate agent's day" },
      { name: "description", content: "Listings, deadlines, follow-ups, open houses, offers and social posts in one place, with a Fair Housing check on every draft. $59/month." },
      { property: "og:title", content: "AgentOS — Replace your stack of agent tools with one" },
      { property: "og:description", content: "Write, track and follow up in one app. Founding agents lock in $39/month or $390/year for life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const TOOLS = [
  { to: "/launch", t: "Listing Launch Kit", d: "One property in. Description, MLS remarks, social post, flyer and email out.", image: estateImage },
  { to: "/photos", t: "Photo Enhancer", d: "Brighten, straighten, blue skies and twilight — honest edits, ready for MLS.", image: interiorImage },
  { to: "/deals", t: "Deal Timeline", d: "Every deadline from contract to close. Overdue? One click writes the chase email.", image: contractImage },
  { to: "/clients", t: "Client Cards", d: "Remember the details that win referrals, with check-in texts in your voice.", image: interiorImage },
  { to: "/followup", t: "Follow-Up Sequences", d: "A full multi-touch plan for any lead, every message written.", image: cityImage },
  { to: "/openhouse", t: "Open House Sign-In", d: "Digital sign-in sheet plus a personal thank-you for every visitor.", image: interiorImage },
  { to: "/offers", t: "Offers & Negotiation", d: "Counteroffers, repairs, low appraisals — exactly what to say.", image: notebookImage },
  { to: "/pricing-talk", t: "Price Talk Prep", d: "Comps summary, price range talk track and objection answers.", image: estateImage },
  { to: "/social", t: "Weekly Social Calendar", d: "A week of captions, hashtags and photo ideas in one click.", image: cityImage },
  { to: "/library", t: "60 Ready Prompts", d: "Fill-in-the-blank forms that auto-fill your name and brokerage.", image: notebookImage },
  { to: "/compliance", t: "Fair Housing Check", d: "Paste anything. Risky phrases flagged with safer wording.", image: contractImage },
] as const;

const SAMPLE_TOOLS = [
  { label: "Listing Launch", image: interiorImage },
  { label: "Open House", image: estateImage },
  { label: "Offers", image: notebookImage },
  { label: "Price Talk", image: cityImage },
  { label: "Follow-Ups", image: contractImage },
] as const;

const TIMELINE = [
  ["MAY 12", "Pre-Launch Review", "Completed"],
  ["MAY 19", "Photography & Media", "Completed"],
  ["MAY 26", "Listing Approval", "Completed"],
  ["JUNE 02", "Launch", "Live at 9:00 AM"],
  ["JUNE 09", "First Open House", "Scheduled"],
] as const;

const REPLACES = [
  ["Listing description writer", "~$25/mo"],
  ["CRM & follow-up tool", "$69–$400+/mo"],
  ["Transaction checklist tool", "extra"],
  ["Social content planner", "extra"],
  ["Open house sign-in app", "extra"],
];

const FAQ = [
  ["Do I need to be tech-savvy?", "No. Every tool is a short form. Fill it in, press one button, copy the result."],
  ["Is the writing Fair Housing safe?", "Every draft is automatically checked for risky wording and shows safer alternatives. You still review before publishing — you're the licensed professional."],
  ["Can I cancel anytime?", "Yes. Cancel and you keep access until the end of the period you paid for."],
  ["What's the founding deal?", "The first 100 agents pay $39/month or $390/year for life. When the 100 spots are gone, the deal is gone for good."],
  ["Does it connect to my MLS?", "Not yet. MLS connections require board approval, and we're working toward it."],
];

function Home() {
  return (
    <div className="marble-surface">
      <section className="border-b border-accent/30">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_560px]">
            <div className="max-w-5xl">
              <h1 className="rise font-display text-5xl font-medium not-italic leading-[0.92] text-foreground sm:text-6xl md:text-7xl">
                The private desk of
                <span className="mt-2 block text-primary">agents who close.</span>
              </h1>
              <p className="rise mt-7 max-w-3xl text-lg italic leading-relaxed text-foreground/80 md:text-xl">
                Five instruments. Preloaded. No signup. Built for the way top producers actually work.
              </p>
              <div className="rise mt-8 flex flex-wrap items-center gap-5">
                <Button asChild size="lg" className="bg-gold border border-accent px-8 font-semibold text-accent-foreground shadow-gold transition-transform hover:-translate-y-0.5">
                  <Link to="/demo">TRY IT FREE →</Link>
                </Button>
                <span className="text-sm italic text-muted-foreground">Founding agents lock in $39/month or $390/year for life.</span>
              </div>
            </div>
            <div className="rise w-full">
              <HeroDemo />
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
            {SAMPLE_TOOLS.map((tool) => (
              <Link key={tool.label} to="/demo" className="group lacquer-panel gold-rule overflow-hidden rounded-sm border transition-transform duration-300 hover:-translate-y-1">
                <div className="aspect-[4/3] overflow-hidden border-b border-accent/40">
                  <img src={tool.image} alt="" width={1024} height={1280} className="h-full w-full object-cover grayscale-[18%] transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="px-4 py-4 text-center">
                  <h2 className="font-display text-xl not-italic text-foreground">{tool.label}</h2>
                  <span className="mx-auto mt-2 block h-px w-8 bg-accent/80" />
                  <span className="mt-1 block text-xs text-accent">◆</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <div className="gold-rule grid overflow-hidden rounded-sm border bg-background/90 md:grid-cols-[1.35fr_0.65fr]">
          <div className="border-b border-accent/40 p-6 md:border-b-0 md:border-r md:p-10">
            <p className="text-xs font-semibold not-italic uppercase tracking-[0.28em] text-accent">Featured</p>
            <h2 className="mt-3 font-display text-5xl not-italic text-foreground md:text-7xl">Listing Launch</h2>
            <span className="mt-5 block h-px w-20 bg-accent" />
            <p className="mt-6 max-w-2xl text-lg italic leading-relaxed text-foreground/80">
              A rare stone estate with sweeping terraces and unrivaled views — live in the market tomorrow.
            </p>
            <img src={estateImage} alt="Limestone mansion at dusk with cypress trees" width={1024} height={1280} className="mt-8 aspect-[16/8] w-full object-cover" />
            <Button asChild className="bg-gold mt-7 rounded-sm border border-accent px-7 font-semibold not-italic text-accent-foreground shadow-gold">
              <Link to="/demo">TRY THE SAMPLE →</Link>
            </Button>
          </div>
          <div className="p-6 md:p-10">
            <h3 className="font-display text-sm font-semibold not-italic uppercase tracking-[0.24em] text-accent">Deal Timeline</h3>
            <div className="relative mt-8 space-y-8 before:absolute before:bottom-4 before:left-[5.5rem] before:top-4 before:w-px before:bg-accent/60">
              {TIMELINE.map(([date, title, status], index) => (
                <div key={date} className="relative grid grid-cols-[4.5rem_1fr] gap-8">
                  <p className="text-xs font-semibold not-italic tracking-[0.12em] text-accent">{date}</p>
                  <span className={`absolute left-[5.18rem] top-1.5 h-2.5 w-2.5 rounded-full border border-accent ${index === 3 ? "bg-primary" : "bg-background"}`} />
                  <div>
                    <p className="font-display text-lg not-italic text-foreground">{title}</p>
                    <p className="mt-1 text-sm italic text-muted-foreground">{status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gold-foil numbers */}
      <section className="border-y border-accent/30 bg-background/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-3">
          {[
            ["13 hrs", "a week the average agent spends on admin that earns nothing"],
            ["10–15 hrs", "of paperwork per transaction"],
            ["$262–$431", "a month agents pay stitching separate tools together"],
          ].map(([a, b]) => (
            <div key={a} className="border-l border-accent/40 pl-6">
               <p className="text-silver-metallic font-display text-5xl font-semibold">{a}</p>
              <p className="mt-3 leading-relaxed text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Act III — one subscription instead of five */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 md:grid-cols-2">
        <div>
          <h2 className="text-silver-metallic text-6xl leading-none md:text-7xl">
            One subscription <span className="text-foreground">instead</span> of five
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">AgentOS covers the writing, tracking and follow-up jobs agents usually pay separate companies for.</p>
          <Button asChild size="lg" className="bg-gold mt-8 border border-accent px-8 font-semibold text-accent-foreground shadow-gold transition-transform hover:-translate-y-0.5">
            <Link to="/pricing">Get AgentOS for $59/month</Link>
          </Button>
        </div>
        <div className="lacquer-panel gold-rule rounded-lg border p-6">
          {REPLACES.map(([a, b]) => (
            <div key={a} className="flex justify-between border-b border-border/60 py-3.5 last:border-0">
              <span className="text-foreground"><span className="mr-2 text-success">✓</span>{a}</span>
              <span className="text-muted-foreground line-through">{b}</span>
            </div>
          ))}
          <div className="mt-4 flex items-baseline justify-between pt-2 text-lg font-semibold text-foreground">
             <span>AgentOS — all of it</span><span className="text-silver-metallic font-display text-3xl">$59/mo</span>
          </div>
        </div>
      </section>

      {/* Act III½ — how AgentOS compares */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="text-silver-metallic text-6xl leading-none md:text-7xl">
          How AgentOS <span className="text-foreground">compares</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          A direct look at four verified real-estate platforms — including where they lead and where AgentOS feels different.
        </p>
        <div className="lacquer-panel gold-rule mt-10 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="border-b border-accent/40">
                <th scope="col" className="w-44 px-5 py-4 font-medium not-italic uppercase tracking-[0.18em] text-muted-foreground">What matters</th>
                <th scope="col" className="w-52 bg-accent/5 px-5 py-4 font-display text-lg not-italic text-silver-metallic">AgentOS</th>
                <th scope="col" className="w-52 px-5 py-4 text-foreground"><a className="border-b border-accent/50 hover:text-accent" href="https://hihale.com/" target="_blank" rel="noreferrer">HaleAI ↗</a></th>
                <th scope="col" className="w-52 px-5 py-4 text-foreground"><a className="border-b border-accent/50 hover:text-accent" href="https://listingagent.io/" target="_blank" rel="noreferrer">ListingAgent.io ↗</a></th>
                <th scope="col" className="w-52 px-5 py-4 text-foreground"><a className="border-b border-accent/50 hover:text-accent" href="https://rehl.us/" target="_blank" rel="noreferrer">REHL ↗</a></th>
                <th scope="col" className="w-52 px-5 py-4 text-foreground"><a className="border-b border-accent/50 hover:text-accent" href="https://listingos.app/" target="_blank" rel="noreferrer">ListingOS ↗</a></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <th scope="row" className="px-5 py-4 font-medium text-foreground">Website feel</th>
                <td className="bg-accent/5 px-5 py-4 text-foreground">Private-estate look with a real writer in the opening screen</td>
                <td className="px-5 py-4 text-muted-foreground">AI-team story built around eight named specialists</td>
                <td className="px-5 py-4 text-muted-foreground">Utility-led SaaS page with feature lists and a demo video</td>
                <td className="px-5 py-4 text-muted-foreground">Operations dashboard focused on one end-to-end workflow</td>
                <td className="px-5 py-4 text-muted-foreground">Mobile-first showcase for its iOS app</td>
              </tr>
              <tr>
                <th scope="row" className="px-5 py-4 font-medium text-foreground">Compliance shown publicly</th>
                <td className="bg-accent/5 px-5 py-4 text-foreground"><span className="mr-2 text-success">✓</span>Every AI draft gets a Fair Housing check with safer wording</td>
                <td className="px-5 py-4 text-muted-foreground">Pono reviews outbound messages for Fair Housing, TCPA, MLS and more</td>
                <td className="px-5 py-4 text-muted-foreground">Generated copy is screened against Fair Housing language rules</td>
                <td className="px-5 py-4 text-muted-foreground">Consent, quiet hours, TCPA and CAN-SPAM checks before sending</td>
                <td className="px-5 py-4 text-muted-foreground">No specific Fair Housing checker found on the public product page</td>
              </tr>
              <tr>
                <th scope="row" className="px-5 py-4 font-medium text-foreground">Published price</th>
                <td className="bg-accent/5 px-5 py-4 text-foreground"><span className="mr-2 text-success">✓</span>$59/mo or $590/yr</td>
                <td className="px-5 py-4 text-muted-foreground">Base price not posted; subscription plus usage charges</td>
                <td className="px-5 py-4 text-muted-foreground">$9–$249/mo, depending on plan</td>
                <td className="px-5 py-4 text-muted-foreground">$99–$399/mo for individual agents</td>
                <td className="px-5 py-4 text-muted-foreground">$490–$1,990/yr in its public guide</td>
              </tr>
              <tr>
                <th scope="row" className="px-5 py-4 font-medium text-foreground">Try before signup</th>
                <td className="bg-accent/5 px-5 py-4 text-foreground"><span className="mr-2 text-success">✓</span>Use the real listing writer here, no account</td>
                <td className="px-5 py-4 text-muted-foreground">Closed beta; contact or sign-in required</td>
                <td className="px-5 py-4 text-muted-foreground">Public video and free tools; full product needs a 3-day trial account</td>
                <td className="px-5 py-4 text-muted-foreground">30-day agent trial after creating a workspace</td>
                <td className="px-5 py-4 text-muted-foreground">Download the iOS app and create an account</td>
              </tr>
              <tr>
                <th scope="row" className="px-5 py-4 font-medium text-foreground">Where it leads today</th>
                <td className="bg-accent/5 px-5 py-4 text-muted-foreground">The clearest hands-on demo; e-sign and MLS remain on the roadmap</td>
                <td className="px-5 py-4 text-foreground">Broader compliance and connected CRM/MLS intelligence</td>
                <td className="px-5 py-4 text-foreground">Lower entry price, virtual staging and mature listing marketing</td>
                <td className="px-5 py-4 text-foreground">Native e-sign, CRM and branded IDX at higher tiers</td>
                <td className="px-5 py-4 text-foreground">iOS listing workflow, floor plans and lead tracking</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-accent/40">
                <th scope="row" className="px-5 py-4 text-xs not-italic uppercase tracking-[0.18em] text-muted-foreground">Source · last verified</th>
                <td className="bg-accent/5 px-5 py-4 text-xs text-muted-foreground">AgentOS — this page<br /><span className="text-accent">Verified Oct 6, 2026</span></td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  <a className="border-b border-accent/50 hover:text-accent" href="https://hihale.com/" target="_blank" rel="noreferrer">hihale.com ↗</a>
                  <br /><span className="text-accent">Verified Oct 6, 2026</span>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  <a className="border-b border-accent/50 hover:text-accent" href="https://listingagent.io/" target="_blank" rel="noreferrer">listingagent.io ↗</a>
                  <br /><span className="text-accent">Verified Oct 6, 2026</span>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  <a className="border-b border-accent/50 hover:text-accent" href="https://rehl.us/" target="_blank" rel="noreferrer">rehl.us ↗</a>
                  <br /><span className="text-accent">Verified Oct 6, 2026</span>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  <a className="border-b border-accent/50 hover:text-accent" href="https://listingos.app/" target="_blank" rel="noreferrer">listingos.app ↗</a>
                  <br /><span className="text-accent">Verified Oct 6, 2026</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-4 text-xs not-italic text-accent sm:hidden">Swipe the table sideways to see everything →</p>
        <p className="mt-4 text-xs italic text-muted-foreground">
          Verified October 6, 2026 from each company’s public website. “Where it leads” compares visible product claims, not performance. Prices and access can change; follow the linked names for current details.
        </p>
      </section>
      <section className="border-y border-accent/30 bg-background/70">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="text-silver-metallic text-6xl leading-none md:text-7xl">
            Everything <span className="text-foreground">inside</span>
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <Link key={t.to} to={t.to} className="group lacquer-panel gold-rule overflow-hidden rounded-lg border transition-all hover:-translate-y-1 hover:border-accent">
                <div className="aspect-[16/10] overflow-hidden border-b border-border/70">
                  <img src={t.image} alt="" loading="lazy" width={1024} height={1280} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="text-2xl text-silver-metallic">{t.t}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t.d}</p>
                  <span className="mt-4 inline-block border-b border-accent/60 pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80 group-hover:text-foreground">Open →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Act V — questions */}
      <section className="mx-auto max-w-3xl px-4 py-24">
        <h2 className="text-silver-metallic text-6xl leading-none">Questions</h2>
        <div className="lacquer-panel gold-rule mt-8 divide-y divide-border/60 rounded-lg border">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group p-6">
              <summary className="cursor-pointer list-none font-medium text-foreground">{q}<span className="float-right text-accent transition-transform group-open:rotate-45">+</span></summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Finale — back to the velvet stage */}
      <section className="relative overflow-hidden border-t border-accent/30">
        <img src={interiorImage} alt="Private luxury salon" loading="lazy" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-hero" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
          <h2 className="text-silver-metallic text-6xl leading-none md:text-8xl">
            Get your <span className="text-foreground">evenings</span> back.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg font-light text-muted-foreground">Try five tools free right now. Join as a founding agent and lock in $39/month or $390/year for life.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-gold border border-accent px-8 font-semibold text-accent-foreground shadow-gold transition-transform hover:-translate-y-0.5"><Link to="/demo">Try it free</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-foreground/35 bg-transparent px-8 text-foreground hover:bg-foreground/10 hover:text-foreground"><Link to="/pricing">Claim a founding spot</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroDemo() {
  const [live, setLive] = useHeroState(true);
  return (
    <div>
      <div className="mb-3 flex gap-2 text-sm">
        <button onClick={() => setLive(true)} className={`rounded-full border px-4 py-1 ${live ? "border-accent text-accent" : "border-border/60 text-muted-foreground"}`}>Try it yourself</button>
        <button onClick={() => setLive(false)} className={`rounded-full border px-4 py-1 ${!live ? "border-accent text-accent" : "border-border/60 text-muted-foreground"}`}>Watch the tour</button>
      </div>
      {live ? <HeroListingWriter /> : <ProductTour />}
    </div>
  );
}
