export type OutreachEmail = {
  id: string;
  name: string;
  firm: string;
  city: string;
  to: string;
  subject: string;
  body: string;
  when: string;
};

const SITE = "https://agentos.tryplaingold.com";
const SIGN = ["— Scotty Heflin", "AgentOS", "agentos.tryplaingold.com"].join("\n");

function email(to: string, subject: string, body: string): { to: string; subject: string; body: string } {
  return { to, subject, body: `${body}\n\n${SIGN}` };
}

export const OUTREACH: OutreachEmail[] = [
  {
    id: "chris",
    name: "Chris Clark",
    firm: "Real Okla — new construction",
    city: "Oklahoma City metro",
    ...email(
      "chris@realokla.com",
      "A description for one of your spec builds — free, no strings",
      [
        "Hi Chris —",
        "You cover new construction from $500K up across the OKC metro, and you've got 20 years of building behind you. That's a lot of listings that all need to be written up before they can go live.",
        "I built AgentOS for exactly that desk work. Point it at a listing and it writes the description, the follow-up messages, the offer letter, the price-talk script — about a minute each, with Fair Housing checks running automatically.",
        `Free demo, no signup, nothing to install:\n${SITE}`,
        "If you want, reply with any address you're marketing and I'll write the description for you and send it back — free, yours to use or bin.",
      ].join("\n\n"),
    ),
    when: "Send today",
  },
  {
    id: "wyatt",
    name: "Wyatt Poindexter",
    firm: "The Agency",
    city: "Oklahoma — luxury",
    ...email(
      "wyatt@wyattpoindexter.com",
      "A tool that writes like your listings deserve",
      [
        "Hi Wyatt —",
        "You've said it yourself: behind every stunning home is a level of complexity most people never see. I built something for exactly that grind.",
        "AgentOS writes listing descriptions, follow-up sequences, offer letters, price-conversation scripts, and open-house plans — about a minute each, with Fair Housing checks built in. The desk work, done, so the agent can do the part only the agent can do.",
        `Free demo, no signup: ${SITE}`,
        "If it earns a place in your workflow, I'd be glad to set you up personally. If not, no follow-up barrage — I promise.",
      ].join("\n\n"),
    ),
    when: "Send tomorrow",
  },
  {
    id: "krista",
    name: "Krista Martin",
    firm: "EXIT Realty Premier",
    city: "Oklahoma",
    ...email(
      "KristaMartinRealtor@gmail.com",
      "Writing for the Martin team's listings",
      [
        "Hi Krista —",
        "You've been a licensed Realtor since 2009, a Certified Luxury Home Marketing Specialist, and you've made Top 50 in all of North America at EXIT several years running. That means the marketing has to stay sharp while your calendar gets busier — and the writing is the part that eats the most time.",
        "I built AgentOS for that. It writes listing descriptions, follow-up sequences, offer letters, price-conversation scripts, and open-house plans in about a minute, with Fair Housing checks built in. You edit; nothing goes out without your eyes on it.",
        `Free demo, no signup: ${SITE}`,
        "Happy to write up one of your current listings for you, free, so you can judge the output instead of my pitch. Just send me an address.",
      ].join("\n\n"),
    ),
    when: "Send Friday",
  },
  {
    id: "julie",
    name: "Julie Hoff",
    firm: "KG Realty",
    city: "Oklahoma City",
    ...email(
      "juliesellsokc@gmail.com",
      "The marketing part of listing a home",
      [
        "Hi Julie —",
        "You said the thing most agents won't: pricing and marketing a home right is what matters, and you handle the staging, the pictures, and the exposure yourself. That's twenty-five years of knowing exactly what has to happen.",
        "It's also hours per listing that don't pay you back directly.",
        "I built AgentOS to take that writing off your plate — listing descriptions, follow-up messages, offer letters, price-talk scripts, open-house plans. About a minute each, Fair Housing checks automatic, and you make the final calls.",
        `Free demo, no signup: ${SITE}`,
        "Want me to write one up for a home you have out now? Send me the address and it's yours free either way.",
      ].join("\n\n"),
    ),
    when: "Send Monday",
  },
  {
    id: "polly",
    name: "Polly Beasley",
    firm: "Tulsa — Every Day Until It's Sold",
    city: "Tulsa",
    ...email(
      "pbeasleytulsa@gmail.com",
      "\"Every Day Until It's Sold\" needs writing every day",
      [
        "Hi Polly —",
        "Your Every Day Until It's Sold program is a real promise — the home is being marketed daily, not parked on the MLS and hoped over. That kind of program runs on content, and content runs on time nobody has.",
        "I built AgentOS for that desk work. Listing descriptions, follow-up sequences, offer letters, price-conversation scripts, and open-house plans — about a minute each, Fair Housing checks built in, you approve everything before it goes out.",
        `Free demo, no signup: ${SITE}`,
        "If you'd like, send me one of your active listings and I'll write the description for you — free, no strings, use it or don't.",
      ].join("\n\n"),
    ),
    when: "Send Tuesday",
  },
  {
    id: "april",
    name: "April Rager",
    firm: "Coldwell Banker",
    city: "Tulsa / Bixby",
    ...email(
      "arager@cbtulsa.com",
      "19 active listings is 19 descriptions",
      [
        "Hi April —",
        "Your Coldwell Banker profile shows nineteen active listings right now — Bixby, Tulsa, Broken Arrow, Coweta, Glenpool. Every one of those needed a description written, and every price change needs the write-up touched again.",
        "I built AgentOS to do that drafting. Listings, follow-up messages, offer letters, price-talk scripts, open-house plans — about a minute each, with Fair Housing checks running automatically.",
        `Free demo, no signup: ${SITE}`,
        "Here's a free sample written from your own listing facts — 445 W 138th Street S, Bixby: four bedrooms, five baths, 4,220 square feet.",
        "Four bedrooms, five baths, and 4,220 square feet that don't feel like one number. This Bixby home spreads across three floors with room for everyone to disappear into their own corner — and a fifth bath means nobody's queuing. The kind of square footage that only works if the layout backs it up, and this one does.",
        "Yours to use or bin. If you want the same thing in a minute for the other eighteen, the demo's above.",
      ].join("\n\n"),
    ),
    when: "Send Wednesday",
  },
  {
    id: "mona",
    name: "Mona Michelle",
    firm: "Mona Michelle Realtors",
    city: "Oklahoma City",
    ...email(
      "michellesellsokc@gmail.com",
      "The writing behind every OKC listing",
      [
        "Hi Mona —",
        "You cover a lot of ground — OKC, Piedmont, Mustang, Yukon, Moore, Nichols Hills — and every listing across all of it needs a description written before it can go live.",
        "I built AgentOS for that desk work. Listing descriptions, follow-up sequences, offer letters, price-talk scripts, open-house plans — about a minute each, with Fair Housing checks built in. You approve everything before it goes out.",
        `Free demo, no signup: ${SITE}`,
        "Send me any address you're marketing and I'll write the description for you, free — use it or don't.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Thursday",
  },
  {
    id: "christy",
    name: "Christy Kruckeberg",
    firm: "Kruckeberg Realty / Copper Creek",
    city: "Oklahoma City",
    ...email(
      "christykruckeberg@gmail.com",
      "More time for clients, less time writing",
      [
        "Hi Christy —",
        "Your whole approach is built on being on your clients' side and answering questions fast. The hours that get in the way of that are the ones spent writing — descriptions, follow-ups, offer letters.",
        "I built AgentOS to take that writing off your plate. About a minute per draft, Fair Housing checks automatic, and nothing goes out without your eyes on it.",
        `Free demo, no signup: ${SITE}`,
        "Happy to write up one of your current listings free so you can judge the output, not my pitch. Just send an address.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Thursday",
  },
  {
    id: "alisha",
    name: "Alisha Kaighen Morgan",
    firm: "Metro First Executives",
    city: "Nichols Hills / OKC",
    ...email(
      "Alisha@AlishaSellsOKC.com",
      "A boutique tool for a boutique practice",
      [
        "Hi Alisha —",
        "You've built a boutique practice since 2012 on personalized service and referrals — which means every piece of writing that carries your name has to be worth it.",
        "I built AgentOS for agents who work that way. It drafts listing descriptions, follow-up sequences, offer letters, and price-talk scripts in about a minute, with Fair Housing checks built in — then you make it sound like you.",
        `Free demo, no signup: ${SITE}`,
        "Send me a listing and I'll write it up free, so you can judge the work instead of the pitch.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Friday",
  },
  {
    id: "jimmy",
    name: "Jimmy Hughes",
    firm: "JMR Realty",
    city: "OKC Metro / Edmond",
    ...email(
      "jhughes@jmrrealtyok.com",
      "Fifteen years of buyers — and the writing that comes with them",
      [
        "Hi Jimmy —",
        "Fifteen-plus years, $50M in transactions, and a builder's eye for what to look for — your value is in the judgment, not the typing.",
        "I built AgentOS so the writing keeps up with you: offer letters, follow-up sequences, listing descriptions, price-conversation scripts — about a minute each, Fair Housing checks automatic.",
        `Free demo, no signup: ${SITE}`,
        "Want to test it? Send me any listing and I'll write the description free — yours either way.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Friday",
  },
  {
    id: "brack",
    name: "Brack Mosshart",
    firm: "KG Realty",
    city: "Yukon",
    ...email(
      "bmossrealestate@gmail.com",
      "For the agent who trains other agents",
      [
        "Hi Brack —",
        "You've done the rep work, the training, the mentorship, and the team leadership since 2016 — so you know exactly how much of an agent's week disappears into writing.",
        "I built AgentOS to give that time back. Listing descriptions, follow-up sequences, offer letters, price-talk scripts, open-house plans — about a minute each, Fair Housing checks built in.",
        `Free demo, no signup: ${SITE}`,
        "Happy to write up one of your listings free so you can see the output yourself. Just send an address.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Monday",
  },
  {
    id: "brandi",
    name: "Brandi Morgan-Fugate",
    firm: "Private Label Real Estate",
    city: "Tulsa",
    ...email(
      "brandi@privatelabelrealtors.com",
      "Top 100 seven years running takes a lot of writing",
      [
        "Hi Brandi —",
        "Tulsa People Magazine's Top 100 Realtors every year from 2018 to 2024 — that consistency runs on marketing, and marketing runs on writing nobody has time for.",
        "I built AgentOS for that. Listing descriptions, follow-up sequences, offer letters, price-conversation scripts, open-house plans — about a minute each, with Fair Housing checks built in.",
        `Free demo, no signup: ${SITE}`,
        "Send me one of your active listings and I'll write the description free — use it or bin it.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Monday",
  },
  {
    id: "amber",
    name: "Amber Oputa",
    firm: "AOG Real Estate",
    city: "Tulsa — Greenwood",
    ...email(
      "amber@aogrealestate.com",
      "A tool built with the same care you build with",
      [
        "Hi Amber —",
        "A boutique brokerage on Historic Black Wall Street, a decade across luxury, commercial, and development — your standard is precision and care, and everything with your name on it has to meet it.",
        "I built AgentOS with the same idea. It drafts the desk work — listings, follow-ups, offer letters, price-talk scripts — in about a minute, with Fair Housing checks automatic, and you make every final call.",
        `Free demo, no signup: ${SITE}`,
        "Send me a listing and I'll write it up free so you can judge the work, not the pitch.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Tuesday",
  },
  {
    id: "david",
    name: "David Roberts",
    firm: "Coldwell Banker Select — Commercial",
    city: "Tulsa",
    ...email(
      "drobertstulsa@gmail.com",
      "Twenty years of Tulsa deals, less time at the keyboard",
      [
        "Hi David —",
        "Licensed since 2003, broker since 2005, and now managing the commercial division — your week is deals and people, not drafting.",
        "I built AgentOS for the drafting. Listing descriptions, follow-up sequences, offer letters, price-conversation scripts — about a minute each, Fair Housing checks built in.",
        `Free demo, no signup: ${SITE}`,
        "Happy to write up one of your listings free so you can see the output. Just send an address.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Tuesday",
  },
  {
    id: "kevin",
    name: "Kevin Dick",
    firm: "Coldwell Banker Select",
    city: "Tulsa",
    ...email(
      "kdick@cbtulsa.com",
      "\"Aggressively promoting\" takes daily writing",
      [
        "Hi Kevin —",
        "Your own commitment list says it: aggressively promoting and marketing your property, timely feedback, communicating clearly and often. Thirty years of sales tells you that's the job — and that it eats hours.",
        "I built AgentOS to do the writing part. Listings, follow-up sequences, offer letters, price-talk scripts, open-house plans — about a minute each, Fair Housing checks automatic.",
        `Free demo, no signup: ${SITE}`,
        "Send me a listing and I'll write the description free — yours to use either way.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Wednesday",
  },
  {
    id: "janelle",
    name: "Janelle Nicolay",
    firm: "Nico Real Estate Group — Coldwell Banker Select",
    city: "Tulsa",
    ...email(
      "jnicolay@cbtulsa.com",
      "A whole team's worth of writing, done in minutes",
      [
        "Hi Janelle —",
        "Leading a team means the writing multiplies — every listing, every follow-up sequence, every offer letter across every agent's pipeline.",
        "I built AgentOS for exactly that load. It drafts listings, follow-ups, offer letters, price-talk scripts, and open-house plans in about a minute each, with Fair Housing checks built in — your team edits and approves.",
        `Free demo, no signup: ${SITE}`,
        "Send me any listing the team is carrying and I'll write it up free, so you can judge the output yourself.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send Wednesday",
  },
  {
    id: "bryan",
    name: "Bryan Donnelly",
    firm: "Thunder Ridge Realty",
    city: "Oklahoma City",
    ...email(
      "bdonnelly@thunderridgerealty.com",
      "A description for your Meench Drive listing — free, no strings",
      [
        "Hi Bryan,",
        "I saw your listing at 2133 Meench Drive and wrote a fresh description for it — it's below, free to use however you like, no strings attached.",
        "I built a tool called AgentOS that writes listing descriptions, follow-up sequences, and social posts for agents, with Fair Housing rules built in. I'd rather show you than tell you, so I ran your listing through it. If you want to try it on your other listings, the demo is free and needs no sign-up: https://agentos.tryplaingold.com/demo",
        "Either way, the description is yours.",
        "---",
        "Discover a move-in-ready opportunity at 2133 Meench Drive in Oklahoma City. Offered at $140,000, this single-family home features two bedrooms, two bathrooms, and 1,004 square feet—a manageable footprint at an approachable price point.",
        "With its low-maintenance size, this property keeps the focus on the space you need without adding unnecessary square footage to maintain. The two-bedroom, two-bathroom configuration provides flexibility for everyday living, while the overall scale offers a practical alternative to a larger home. It's a straightforward combination of size, functionality, and value.",
        "Move-in-ready condition means you can focus on planning your move and bringing your own style to the space. From choosing furnishings to adding personal touches, the next chapter starts with a home that is ready for you to make your own. At 1,004 square feet, there's an opportunity to take a thoughtful approach to each room without the demands of a substantially larger property.",
        "For a home search centered on an affordable asking price, manageable square footage, and two full bedroom-and-bathroom counts, 2133 Meench Drive deserves a closer look. See the space in person, explore how it fits your priorities, and get answers to your questions about this Oklahoma City property.",
        "Contact Bryan Donnelly with Thunder Ridge Realty to schedule your showing today.",
      ].join("\n\n"),
    ),
    when: "Send today",
  },
  {
    id: "brooke",
    name: "Brooke Bale",
    firm: "CityGates Real Estate LLC",
    city: "Oklahoma City",
    ...email(
      "brookeabale@gmail.com",
      "A fresh description for 1608 NW 33rd — free, no strings",
      [
        "Hi Brooke,",
        "I saw your listing at 1608 NW 33rd Street and wrote a fresh description for it — it's below, free to use however you like, no strings attached.",
        "I built a tool called AgentOS that writes listing descriptions, follow-up sequences, and social posts for agents, with Fair Housing rules built in. I'd rather show you than tell you, so I ran your listing through it. If you want to try it on your other listings, the demo is free and needs no sign-up: https://agentos.tryplaingold.com/demo",
        "Either way, the description is yours.",
        "---",
        "A turn-of-the-century bungalow at 1608 NW 33rd Street in Oklahoma City, offered at $159,900. Built in 1921, the home pairs original character with updates that make everyday life easier — neutral walls, luxury vinyl plank flooring throughout, and a kitchen refreshed for modern use.",
        "The kitchen is the clear centerpiece: white shaker cabinets, a subway tile backsplash, and stainless steel appliances, set up for cooking and for guests who like to stay in the room. The bathroom has been updated with a tub and shower surround and a vanity, so very little is left to do before moving in.",
        "At 1,234 square feet with two bedrooms and one bathroom, the layout keeps things manageable. One bedroom includes a built-in window seat, the kind of small, permanent detail that gives a room a purpose. Outside, a deep, fenced 8,499 square foot lot with mature trees leaves room for a garden or outdoor seating, and a detached one-car garage adds parking and storage without giving up the yard.",
        "Location does a lot of the work here. The home sits minutes from the Plaza District and the Classen and Western corridors, with restaurants, shops, and music within a short drive. A covered front porch with a brick base gives the exterior the kind of presence newer construction rarely has.",
        "For a 1921 bungalow with an updated kitchen and bathroom, a deep fenced lot, and a detached garage inside the city, 1608 NW 33rd Street deserves an in-person look. Contact Brooke Bale with CityGates Real Estate to schedule a showing.",
      ].join("\n\n"),
    ),
    when: "Send today",
  },
  ...([
    ["patricia", "Patricia Renton", "McGraw, REALTORS", "Broken Arrow", "prenton@mcgrawok.com", "507 W Quincy",
      "507 W Quincy St, Broken Arrow, OK 74012 — Single-story ranch living in established Broken Arrow Heights. Offering 1,648 square feet with 3 bedrooms and 2.5 bathrooms, this well-proportioned home sits on a generous 8,875-square-foot lot. Practical design includes an attached two-car garage, defined living spaces, and easy access to downtown Broken Arrow dining and commuter routes. Solid footprint, low-maintenance scale, and straightforward convenience."],
    ["brad", "Brad Borem", "Chinowth & Cohen", "Jenks", "bborem@cctulsa.com", "11220 S Fir Avenue",
      "11220 S Fir Ave W, Jenks, OK 74037 — Single-level new construction in the gated Estates at Ritz Hollow, within Jenks Public Schools. The Capital floor plan delivers 2,844 square feet with 3 bedrooms, 2.5 bathrooms, a dedicated home office, and a flex room. The kitchen features a built-in 66-inch Frigidaire XL refrigerator/freezer, stainless appliances, and soft-close cabinetry, opening to a large great room with fireplace. The primary closet connects directly to the laundry room. Spray foam insulation, a tankless water heater, energy-efficient HVAC, tile showers, and hardwood floors round it out. The community offers walking trails and ponds with easy access to dining, shopping, and highways."],
    ["angela", "Angela Cozort", "McGraw, REALTORS", "Bixby", "acozort@mcgrawrealtors.com", "13648 S 21st Place",
      "13648 S 21st Place E, Bixby, OK 74008 — \"The Elle\" by Cozort Custom Homes in Torrey Lakes. Spanning 2,832 square feet with 4 bedrooms and 3.5 bathrooms, the home features 5-inch hickory plank floors, a vaulted entry with Juliet balcony, and vaulted ceilings showcasing the builder's custom beams. The chef's kitchen offers a walk-through pantry/prep kitchen with room for a second fridge, a commercial-sized refrigerator, and a custom vent hood. A collapsible slider opens to a covered patio with outdoor fireplace. A second bedroom with ensuite bath is on the main level, and the game room includes a built-in bar. Torrey Lakes has a community pool, and the home is served by Bixby Public Schools."],
  ] as const).map(([id, name, firm, city, to, short, desc]) => ({
    id,
    name,
    firm,
    city,
    ...email(
      to,
      `A fresh description for ${short} — free, no strings`,
      [
        `Hi ${name.split(" ")[0]},`,
        `I saw your listing at ${short} and wrote a fresh description for it — it's below, free to use however you like.`,
        "Would this save you time on your next listing?",
        "I built AgentOS, a toolkit that writes listing descriptions and follow-ups for agents with Fair Housing rules built in. Five tools are free to try, no sign-up: https://agentos.tryplaingold.com/demo",
        "---",
        desc,
        "---",
        "— Scotty Heflin, AgentOS",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send today",
  })),
  {
    id: "bryan-launch",
    name: "Bryan Donnelly — launch follow-up",
    firm: "Thunder Ridge Realty",
    city: "Oklahoma City",
    ...email(
      "bdonnelly@thunderridgerealty.com",
      "AgentOS launched on Product Hunt today",
      [
        "Hi Bryan —",
        "Quick follow-up to the Meench Drive description I sent over. AgentOS launched on Product Hunt today, so if you were curious what the tool actually is, this is the easiest way to see it: https://www.producthunt.com/products/agentos-run-agents-like-a-company",
        "No ask attached — just wanted you to see it live. And the description is still yours to use either way.",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send today",
  },
  // Launch-day follow-up for every other agent already emailed
  ...([
    ["chris", "Chris Clark", "Real Okla — new construction", "Oklahoma City metro", "chris@realokla.com"],
    ["wyatt", "Wyatt Poindexter", "The Agency", "Oklahoma — luxury", "wyatt@wyattpoindexter.com"],
    ["krista", "Krista Martin", "EXIT Realty Premier", "Oklahoma", "KristaMartinRealtor@gmail.com"],
    ["julie", "Julie Hoff", "KG Realty", "Oklahoma City", "juliesellsokc@gmail.com"],
    ["polly", "Polly Beasley", "Tulsa — Every Day Until It's Sold", "Tulsa", "pbeasleytulsa@gmail.com"],
    ["april", "April Rager", "Coldwell Banker", "Tulsa / Bixby", "arager@cbtulsa.com"],
    ["mona", "Mona Michelle", "Mona Michelle Realtors", "Oklahoma City", "michellesellsokc@gmail.com"],
    ["christy", "Christy Kruckeberg", "Kruckeberg Realty / Copper Creek", "Oklahoma City", "christykruckeberg@gmail.com"],
    ["alisha", "Alisha Kaighen Morgan", "Metro First Executives", "Nichols Hills / OKC", "Alisha@AlishaSellsOKC.com"],
    ["jimmy", "Jimmy Hughes", "JMR Realty", "OKC Metro / Edmond", "jhughes@jmrrealtyok.com"],
    ["brack", "Brack Mosshart", "KG Realty", "Yukon", "bmossrealestate@gmail.com"],
    ["brandi", "Brandi Morgan-Fugate", "Private Label Real Estate", "Tulsa", "brandi@privatelabelrealtors.com"],
    ["amber", "Amber Oputa", "AOG Real Estate", "Tulsa — Greenwood", "amber@aogrealestate.com"],
    ["david", "David Roberts", "Coldwell Banker Select — Commercial", "Tulsa", "drobertstulsa@gmail.com"],
    ["kevin", "Kevin Dick", "Coldwell Banker Select", "Tulsa", "kdick@cbtulsa.com"],
    ["janelle", "Janelle Nicolay", "Nico Real Estate Group — Coldwell Banker Select", "Tulsa", "jnicolay@cbtulsa.com"],
  ] as [string, string, string, string, string][]).map(([id, name, firm, city, to]): OutreachEmail => ({
    id: `${id}-launch`,
    name: `${name} — launch follow-up`,
    firm,
    city,
    ...email(
      to,
      "AgentOS launched on Product Hunt today",
      [
        `Hi ${name.split(" ")[0]} —`,
        "Quick follow-up to my earlier note. AgentOS launched on Product Hunt today, so if you were curious what the tool actually is, this is the easiest way to see it: https://www.producthunt.com/products/agentos-run-agents-like-a-company",
        "No ask attached — just wanted you to see it live. The free demo is still there too, no signup: https://agentos.tryplaingold.com/demo",
        "If this isn't for you, just reply STOP and I won't email again.",
      ].join("\n\n"),
    ),
    when: "Send today",
  })),
];

export function mailtoLink(e: OutreachEmail): string {
  return `mailto:${e.to}?subject=${encodeURIComponent(e.subject)}&body=${encodeURIComponent(e.body)}`;
}

export function fullText(e: OutreachEmail): string {
  return `To: ${e.to}\nSubject: ${e.subject}\n\n${e.body}`;
}

export const REPLIES: { q: string; a: string }[] = [
  {
    q: "\"How much?\"",
    a: "$59 a month or $590 a year. The first 100 agents lock in $39 a month — or $390 a year — for life. The demo's free either way — no signup needed to look.",
  },
  {
    q: "\"Is this just AI garbage?\"",
    a: "It drafts, you edit. Nothing goes out without your eyes on it, and Fair Housing checks run automatically. Try the demo — two minutes, no signup.",
  },
  {
    q: "\"How is this different from ChatGPT?\"",
    a: "ChatGPT gives you a blank box and hopes you ask the right question. This gives you the field to fill in — beds, baths, the one thing worth mentioning — and hands back something already in the format the MLS, the follow-up sequence, or the offer letter needs.",
  },
  {
    q: "\"Send me more info.\"",
    a: `Happy to — the demo is the info. Pick a card, hit the button, watch it write. ${SITE}`,
  },
  {
    q: "No reply after 3 days",
    a: "Leave it. One follow-up a week later, only one: \"No worries if the timing's off — the demo's there whenever you want it.\"",
  },
];
