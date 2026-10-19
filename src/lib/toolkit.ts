import raw from "@/data/prompts.json";

export type Prompt = { id: string; section: string; title: string; body: string; note: string };
export const PROMPTS = raw as Prompt[];
export const SECTIONS = Array.from(new Set(PROMPTS.map((p) => p.section)));

export type Profile = {
  name: string;
  brokerage: string;
  phone: string;
  email: string;
  license: string;
  city: string;
  voice: string;
};
export const EMPTY_PROFILE: Profile = {
  name: "",
  brokerage: "",
  phone: "",
  email: "",
  license: "",
  city: "",
  voice: "",
};
const KEY = "reat-profile";
export function loadProfile(): Profile {
  try {
    return { ...EMPTY_PROFILE, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return EMPTY_PROFILE;
  }
}
export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

/** Unique placeholders in order of appearance. */
export function placeholders(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(/\[([^\]]+)\]/g)) if (m[1] && !out.includes(m[1])) out.push(m[1]);
  return out;
}

export function splitHint(ph: string, body = ""): { label: string; hint: string } {
  if (/^(e\.g\.|LIST|verifiable|honest|describe)/i.test(ph) && body) {
    const before = body.slice(0, body.indexOf(`[${ph}]`));
    const m = before.match(/([A-Za-z/&' -]{3,40}):\s*$/);
    if (m?.[1]) return { label: m[1].trim(), hint: ph };
  }
  const i = ph.search(/(^|[\s:,])e\.g\.|:/i);
  if (ph.toLowerCase().startsWith("e.g.")) return { label: "Details", hint: ph };
  if (i > 0) return { label: ph.slice(0, i).replace(/[,:]\s*$/, "").trim(), hint: ph.slice(i).replace(/^[:,\s]+/, "") };
  return { label: ph, hint: "" };
}

/** Auto-fill value from the saved profile, if the placeholder matches. */
export function profileValue(ph: string, p: Profile): string {
  const u = ph.toUpperCase();
  const contact = [p.phone, p.email].filter(Boolean).join(" · ");
  if (/AGENT NAME|YOUR NAME|^NAME$|MY NAME/.test(u)) return p.name;
  if (/PHONE\s*\/\s*EMAIL|CONTACT/.test(u)) return contact;
  if (/BROKERAGE/.test(u)) return p.brokerage;
  if (/LICENSE/.test(u)) return p.license;
  if (/^PHONE$/.test(u)) return p.phone;
  if (/^EMAIL$/.test(u)) return p.email;
  if (/^(CITY|MARKET|CITY\/NEIGHBORHOOD|AREA)$/.test(u)) return p.city;
  return "";
}

export function fill(body: string, values: Record<string, string>): string {
  return body.replace(/\[([^\]]+)\]/g, (m, k) => (values[k]?.trim() ? values[k].trim() : m));
}

export function withVoice(prompt: string, p: Profile) {
  return p.voice.trim() ? `${prompt}\n\nMatch my writing voice: ${p.voice.trim()}` : prompt;
}

/* ---------------- Fair Housing checker ---------------- */
export type Flag = { phrase: string; reason: string; suggest: string; index: number };
const RULES: { re: RegExp; reason: string; suggest: string }[] = [
  { re: /\bperfect for (a |an )?(young |growing )?(famil(y|ies)|couples?|singles?|retirees?|professionals?|students?|newlyweds?|empty[- ]nesters?|bachelors?|kids)\b/gi, reason: "Describes who should live there (familial status / steering).", suggest: "Describe the feature instead, e.g. \"three bedrooms on one level\"." },
  { re: /\b(family[- ]friendly|great for (kids|families)|kid[- ]friendly|adults? only|no (kids|children)|child[- ]free)\b/gi, reason: "Familial status is a protected class.", suggest: "\"Fenced yard\", \"0.2 miles to a public park\"." },
  { re: /\b(safe|safest|low[- ]crime|crime[- ]free|secure) (neighborhood|area|community|street)\b/gi, reason: "\"Safe neighborhood\" is a steering red flag.", suggest: "Name concrete features: \"gated entry\", \"monitored alarm system\"." },
  { re: /\b(exclusive|integrated|ethnic|traditional) (neighborhood|community|area)\b/gi, reason: "Can imply who is welcome (race / national origin).", suggest: "Describe housing stock, lot sizes, amenities." },
  { re: /\b(walking distance|walk to|able[- ]bodied|handicap(ped)?|wheelchair[- ]bound|crippled)\b/gi, reason: "May exclude people with disabilities.", suggest: "\"0.3 miles to\", \"steps from\", \"accessible entry\"." },
  { re: /\b(near|close to|walk to|minutes from) (the )?(church|churches|synagogue|mosque|temple|parish)\b/gi, reason: "Proximity to houses of worship can signal religious preference.", suggest: "Remove, or list neutral landmarks (parks, transit)." },
  { re: /\b(christian|jewish|muslim|catholic|hindu|buddhist) (neighborhood|community|home|area|family)\b/gi, reason: "Religion is a protected class.", suggest: "Remove the reference entirely." },
  { re: /\b(bachelor pad|man cave|mother[- ]in[- ]law (suite|unit|apartment)|master (bedroom|suite|bath))\b/gi, reason: "Gendered/legacy terms many MLSs now discourage.", suggest: "\"Primary suite\", \"bonus room\", \"accessory dwelling unit\"." },
  { re: /\b(good|great|best|top[- ]rated) schools?\b/gi, reason: "School-quality claims can proxy for demographics.", suggest: "Name the assigned school and link the district site; let buyers judge." },
  { re: /\b(senior|seniors|elderly|young|mature) (residents|neighbors|community|buyers?)\b/gi, reason: "Age-based description (unless a qualified 55+ community).", suggest: "Describe the property; cite 55+ status only if legally qualified." },
  { re: /\b(english[- ]speaking|no section 8|no vouchers|professionals only|must be employed)\b/gi, reason: "National origin / source-of-income exclusion (illegal in many states).", suggest: "\"All applicants evaluated against the same published criteria.\"" },
  { re: /\b(quiet|tranquil) (community|neighborhood|building) for\b/gi, reason: "Pairs a vibe with a type of person.", suggest: "Keep the feature, drop the \"for…\" clause." },
];
export function checkFairHousing(text: string): Flag[] {
  const flags: Flag[] = [];
  for (const r of RULES) for (const m of text.matchAll(r.re)) flags.push({ phrase: m[0], reason: r.reason, suggest: r.suggest, index: m.index ?? 0 });
  return flags.sort((a, b) => a.index - b.index);
}
