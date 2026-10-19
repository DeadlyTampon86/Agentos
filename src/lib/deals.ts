/* Deal timeline + client cards, stored on this device (localStorage). */

export type Milestone = { key: string; label: string; offsetDays: number; done: boolean; owner: string };
export type Deal = {
  id: string;
  address: string;
  side: "buyer" | "seller";
  clientName: string;
  contractDate: string; // ISO yyyy-mm-dd
  closingDate: string;
  milestones: Milestone[];
  createdAt: number;
};

const DEAL_KEY = "reat-deals";

export const MILESTONE_TEMPLATE: { key: string; label: string; offsetDays: number; owner: string }[] = [
  { key: "earnest", label: "Earnest money deposited", offsetDays: 3, owner: "Buyer / escrow" },
  { key: "inspection", label: "Home inspection completed", offsetDays: 7, owner: "Buyer / inspector" },
  { key: "inspection-response", label: "Inspection response / repair request sent", offsetDays: 10, owner: "You" },
  { key: "appraisal", label: "Appraisal ordered & completed", offsetDays: 14, owner: "Lender" },
  { key: "loan", label: "Loan commitment deadline", offsetDays: 21, owner: "Lender" },
  { key: "title", label: "Title search clear", offsetDays: 25, owner: "Title company" },
  { key: "insurance", label: "Buyer homeowner's insurance bound", offsetDays: 28, owner: "Buyer" },
  { key: "walkthrough", label: "Final walkthrough", offsetDays: -2, owner: "You + client" },
  { key: "closing", label: "Closing day", offsetDays: 0, owner: "Everyone" },
];

export function buildMilestones(contractDate: string, closingDate: string): Milestone[] {
  // Offsets are from contract date, except negative offsets which count back from closing.
  return MILESTONE_TEMPLATE.map((m) => ({ ...m, done: false }));
}

export function milestoneDate(deal: Deal, m: Milestone): string {
  // Offsets are from contract date; closing day and negative offsets count from closing.
  const base = m.key === "closing" || m.offsetDays < 0 ? deal.closingDate : deal.contractDate;
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + m.offsetDays);
  return d.toISOString().slice(0, 10);
}

export function daysUntil(iso: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t = new Date(iso + "T12:00:00");
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}

export function loadDeals(): Deal[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DEAL_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
export function saveDeals(deals: Deal[]) {
  localStorage.setItem(DEAL_KEY, JSON.stringify(deals));
}

/* ---------------- Client cards ---------------- */
export type ClientCard = {
  id: string;
  name: string;
  type: string; // buyer / seller / past client / lead
  details: string; // family, job, hobbies, budget, timeline — the things agents forget
  lastTouch: string; // ISO date of last contact
  nextTouch: string; // ISO date for next follow-up
  notes: string;
};
const CLIENT_KEY = "reat-clients";
export function loadClients(): ClientCard[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CLIENT_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
export function saveClients(c: ClientCard[]) {
  localStorage.setItem(CLIENT_KEY, JSON.stringify(c));
}
