/**
 * The marketplace between buyers, brokers and developers, without developer APIs.
 *
 * - Availability confidence: how sure Observer is that a unit is still available, from every signal it has.
 * - Night policy: the AI quotes only at 80% confidence or higher; below that it confirms first and offers
 *   the closest units it is sure of.
 * - Reply desk: a developer's sales admin updates units in plain words ("A-1204 sold") in English or Arabic.
 * - Deal pack: what the AI collected overnight, and what is still missing before the booking form.
 * - Demand radar: anonymised buyer demand for developers, from consenting clients, small groups hidden.
 */

export type SignalKind = "developer-desk" | "portal" | "price-list" | "aggregator" | "whatsapp-group" | "form-a";
export type UnitState = "available" | "held" | "booked" | "sold";
export type Signal = { kind: SignalKind; at: number; state: UnitState; price?: number };

/** How much each source is trusted at the moment it reports (before ageing). */
export const TRUST: Record<SignalKind, number> = {
  "developer-desk": 0.98, portal: 0.95, "form-a": 0.93, "price-list": 0.9, aggregator: 0.85, "whatsapp-group": 0.8,
};
export const NIGHT_MIN = 80;
const HOUR = 3_600_000;

export type ProjectPace = {
  /** Units of this project registered as sold per day lately (from DLD open data and developer reports). */
  soldPerDay: number;
  /** Units still believed available in the project. */
  remaining: number;
  /** Sales the Land Department registered for this project after the unit's latest signal. */
  registeredSince?: number;
};

export type Confidence = { state: UnitState; confidence: number; basis: SignalKind; at: number; price?: number };

/**
 * Confidence that a unit is in the state its freshest signal says. A newer "sold/held/booked" always wins over
 * an older "available". An "available" reading decays with age and with how fast the project is selling, and
 * drops further for each sale the Land Department registered since.
 */
export function confidence(signals: Signal[], pace: ProjectPace, now: number): Confidence | null {
  if (!signals.length) return null;
  const latest = [...signals].sort((a, b) => b.at - a.at)[0];
  const price = [...signals].filter((s) => s.price !== undefined).sort((a, b) => b.at - a.at)[0]?.price;
  const hours = Math.max(0, (now - latest.at) / HOUR);
  if (latest.state !== "available") {
    return { state: latest.state, confidence: Math.round(TRUST[latest.kind] * 100), basis: latest.kind, at: latest.at, price };
  }
  // chance this unit was sold since: the project's hourly sales spread over what's left
  const hazard = pace.remaining > 0 ? pace.soldPerDay / 24 / pace.remaining : 1;
  let p = TRUST[latest.kind] * Math.exp(-hazard * hours);
  if (pace.registeredSince && pace.remaining > 0) p *= Math.max(0, 1 - pace.registeredSince / pace.remaining);
  // agreement: another independent source saying "available" in the last day raises it a little
  const agreeing = signals.filter((s) => s !== latest && s.state === "available" && now - s.at < 24 * HOUR && s.kind !== latest.kind).length;
  p = Math.min(0.99, p + agreeing * 0.03);
  return { state: "available", confidence: Math.round(p * 100), basis: latest.kind, at: latest.at, price };
}

export type Listing = { code: string; project: string; area: string; developer: string; beds: number; price: number; conf: Confidence | null };

/**
 * What the AI may say at night about the unit a client asked for: quote it, or say it is confirming and offer
 * the two closest units it is at least 80% sure of (same area first, then nearest price and bedroom count).
 */
export function nightAnswer(wanted: Listing, all: Listing[]) {
  const c = wanted.conf;
  if (c && c.state === "available" && c.confidence >= NIGHT_MIN) return { action: "quote" as const, alternatives: [] as Listing[] };
  const alternatives = all
    .filter((l) => l.code !== wanted.code && l.conf?.state === "available" && l.conf.confidence >= NIGHT_MIN)
    .sort((a, b) => (Number(b.area === wanted.area) - Number(a.area === wanted.area)) || Math.abs(a.beds - wanted.beds) - Math.abs(b.beds - wanted.beds) || Math.abs(a.price - wanted.price) - Math.abs(b.price - wanted.price))
    .slice(0, 2);
  return { action: (c?.state === "sold" ? "sold" : "confirm-first") as "sold" | "confirm-first", alternatives };
}

// ------------------------------------------------------------------ reply desk

export type DeskUpdate = { code: string; state?: UnitState; price?: number };
const CODE = /\b([A-Z]{1,4}\d?-?\s?\d{2,5}[A-Z]?)\b/g;
const WORDS: [RegExp, UnitState][] = [
  [/\b(sold|sold out)\b|مباع|مباعة|بيعت/i, "sold"],
  [/\b(booked|reserved|deposit paid)\b|محجوزة بعربون|مدفوعة/i, "booked"],
  [/\b(held|hold|on hold|blocked)\b|محجوز|محجوزة|معلّقة|معلقة/i, "held"],
  [/\b(available|released|back on|open)\b|متاح|متاحة|رجعت/i, "available"],
];

function readPrice(s: string): number | undefined {
  const m = s.match(/(\d[\d.,]*)\s*(million|mn|m|k|مليون|ألف)?(?![a-z])/i);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!Number.isFinite(n)) return undefined;
  const u = (m[2] || "").toLowerCase();
  const v = /m|million|مليون/.test(u) ? n * 1e6 : /k|ألف/.test(u) ? n * 1e3 : n;
  return v >= 100_000 ? Math.round(v) : undefined;
}

/**
 * Read a sales admin's message, one update per line or per unit code: "A-1204 sold", "B-2211 now 2.85M",
 * "A-3902, A-3903 on hold", "G1-2804 مباعة", "B-2211 السعر 2.9 مليون".
 */
export function parseDesk(text: string): DeskUpdate[] {
  const out: DeskUpdate[] = [];
  for (const line of text.split(/\n|;|\.(?=\s|$)/)) {
    const codes = [...line.toUpperCase().matchAll(CODE)].map((m) => m[1].replace(/\s/g, ""));
    if (!codes.length) continue;
    const state = WORDS.find(([re]) => re.test(line))?.[1];
    const rest = line.replace(CODE, " ").replace(/[A-Z]{1,4}\d?-\d{2,5}/gi, " ");
    const price = readPrice(rest);
    if (!state && price === undefined) continue;
    for (const code of codes) out.push({ code, ...(state && { state }), ...(price !== undefined && { price }) });
  }
  return out;
}

// ------------------------------------------------------------------ deal pack

export type DealPackInput = {
  passport?: { name: string; number: string; expires: string; nationality: string };
  proofOfFunds?: { kind: "bank statement" | "mortgage pre-approval" | "cash declaration"; amount: number };
  eoiPaid?: { amount: number; to: "developer" | "escrow" };
  unitRequested: string;
  holdQueued?: { position: number; opensAt: string };
};

/** What's ready for the booking form, and what is still missing. Passports must be valid for 6 months. */
export function dealPack(i: DealPackInput, today: Date, price: number) {
  const items: { label: string; ok: boolean; note?: string }[] = [];
  const sixMonths = new Date(today); sixMonths.setMonth(sixMonths.getMonth() + 6);
  if (!i.passport) items.push({ label: "Passport", ok: false, note: "Not received" });
  else {
    const valid = new Date(i.passport.expires) > sixMonths;
    items.push({ label: "Passport", ok: valid, note: valid ? undefined : "Expires within six months" });
  }
  if (!i.proofOfFunds) items.push({ label: "Proof of funds", ok: false, note: "Not received" });
  else items.push({ label: "Proof of funds", ok: i.proofOfFunds.amount >= price * 0.2, note: i.proofOfFunds.amount >= price * 0.2 ? undefined : "Covers less than the 20% due at booking" });
  items.push({ label: "Refundable deposit to the developer", ok: !!i.eoiPaid && i.eoiPaid.to !== undefined, note: i.eoiPaid ? undefined : "Link sent, not paid yet" });
  items.push({ label: "Hold request queued", ok: !!i.holdQueued, note: i.holdQueued ? undefined : "Not queued" });
  const ready = items.every((x) => x.ok);
  return { items, ready, missing: items.filter((x) => !x.ok).map((x) => x.label) };
}

// ------------------------------------------------------------------ demand radar

export type Ask = { area: string; beds: number; budget: number; consent: boolean; qualified: boolean };
export const MIN_GROUP = 5;

const band = (n: number) => {
  const edges = [1e6, 1.5e6, 2e6, 2.5e6, 3.5e6, 5e6, 8e6, 15e6];
  const hi = edges.find((e) => n <= e);
  return hi ? hi : Infinity;
};

/** Anonymised demand by area, bedrooms and budget band. Only consenting, qualified clients; groups under 5 hidden. */
export function demandRadar(asks: Ask[], min = MIN_GROUP) {
  const groups = new Map<string, { area: string; beds: number; under: number; count: number; budgets: number[] }>();
  let hidden = 0;
  for (const a of asks) {
    if (!a.consent || !a.qualified) continue;
    const under = band(a.budget);
    const k = `${a.area}|${a.beds}|${under}`;
    const g = groups.get(k) ?? { area: a.area, beds: a.beds, under, count: 0, budgets: [] };
    g.count++; g.budgets.push(a.budget); groups.set(k, g);
  }
  const rows = [...groups.values()].filter((g) => { if (g.count < min) { hidden += g.count; return false; } return true; })
    .map((g) => ({ area: g.area, beds: g.beds, under: g.under, count: g.count, median: g.budgets.sort((a, b) => a - b)[Math.floor(g.budgets.length / 2)] }))
    .sort((a, b) => b.count - a.count);
  return { rows, hidden };
}
