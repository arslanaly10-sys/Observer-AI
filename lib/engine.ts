/**
 * Observer scoring, intent and next-best-action engine.
 * Ported from v10's AIEngine: explainable, deterministic, no network calls.
 */
import { weights, type Lead } from "./data";

export const SOURCE_QUALITY: Record<string, number> = {
  WhatsApp: 0.95, Referral: 0.92, Bayut: 0.78, "Property Finder": 0.74,
  Facebook: 0.55, Instagram: 0.52, Dubizzle: 0.6, Website: 0.7,
};
export const TIMEFRAME: Record<string, number> = {
  "<1 mo": 1, "1-2 mo": 0.85, "2 mo": 0.8, "3 mo": 0.6, "4 mo": 0.5, "6 mo": 0.35, "12 mo": 0.2, "18 mo": 0.1,
};
const PRIME = ["Dubai Hills", "Downtown", "Palm Jumeirah", "Emirates Hills", "MBR City", "Business Bay"];

export function budgetMillions(b: string) {
  const n = parseFloat(String(b).replace(/[^0-9.]/g, "")) || 0;
  return /K/i.test(b) ? n / 1000 : n;
}
export function budgetTier(b: string) {
  const m = budgetMillions(b);
  if (m >= 5) return { tier: "Ultra-prime", score: 1 };
  if (m >= 3) return { tier: "Prime", score: 0.85 };
  if (m >= 1.5) return { tier: "Mid-market", score: 0.65 };
  if (m >= 0.8) return { tier: "Entry", score: 0.45 };
  return { tier: "Budget", score: 0.3 };
}

type Input = Pick<Lead, "financing" | "budget" | "timeframe" | "source" | "urgency" | "temp" | "area">;

export function scoreLead(l: Input) {
  const w = Object.fromEntries(weights.map((x) => [x.label, x.pts]));
  const parts: { label: string; pts: number; max: number }[] = [];
  const add = (label: string, raw: number) => parts.push({ label, pts: Math.round(raw * w[label]), max: w[label] });
  add("Financing", l.financing === "Cash" ? 1 : l.financing === "Mortgage" ? 0.55 : 0.3);
  add("Budget match", budgetTier(l.budget).score);
  add("Timeframe", TIMEFRAME[l.timeframe] ?? 0.4);
  add("Source quality", SOURCE_QUALITY[l.source] ?? 0.5);
  add("Engagement", l.urgency === "serious" ? 0.95 : 0.4);
  add("Response speed", l.temp === "hot" ? 0.9 : l.temp === "warm" ? 0.6 : 0.3);
  add("Area demand", PRIME.some((a) => (l.area || "").includes(a)) ? 0.9 : 0.5);
  const max = parts.reduce((a, p) => a + p.max, 0);
  const total = parts.reduce((a, p) => a + p.pts, 0);
  const score = Math.max(0, Math.min(100, Math.round((total / max) * 100)));
  const temp = score >= 78 ? "hot" : score >= 55 ? "warm" : "cold";
  return { score, temp: temp as Lead["temp"], parts: parts.sort((a, b) => b.pts - a.pts) };
}

const SIGNALS: Record<string, { rx: RegExp; label: string }> = {
  buyer: { rx: /\b(buy|buying|purchase|looking for|interested in|want a|need a|want to buy)\b/i, label: "Buyer" },
  seller: { rx: /\b(sell|selling|my (villa|apartment|unit|property)|valuation|what.*price.*get|i have a \dbr)\b/i, label: "Seller" },
  urgent: { rx: /\b(immediately|asap|urgent|this week|right away|ready to (proceed|sign|buy)|within \d+ (weeks?|days?))\b/i, label: "Urgent" },
  cash: { rx: /\b(cash|full payment|no mortgage|million|above aed)\b/i, label: "High budget" },
  serious: { rx: /\b(LOI|sign|proceed|paperwork|offer|deposit|viewing|show me|when can)\b/i, label: "Serious" },
  researching: { rx: /\b(just (looking|browsing|researching|curious)|no rush|not urgent|maybe later|next year|planning)\b/i, label: "Researching" },
  investor: { rx: /\b(investment|ROI|rental yield|return|portfolio|rent it out)\b/i, label: "Investor" },
};

export function extractIntent(msgs: { dir: "in" | "out"; text: string }[]) {
  const text = msgs.filter((m) => m.dir === "in").map((m) => m.text).join(" ");
  const hits: { key: string; label: string; evidence: string }[] = [];
  for (const [key, s] of Object.entries(SIGNALS)) {
    const m = text.match(s.rx);
    if (m) hits.push({ key, label: s.label, evidence: m[0] });
  }
  const has = (k: string) => hits.some((h) => h.key === k);
  const primary = has("seller") ? "Seller" : has("buyer") || has("serious") ? "Buyer" : "Unknown";
  const urgency = has("researching") ? "Low" : has("urgent") ? "High" : "Medium";
  const confidence = Math.min(98, 45 + hits.length * 13);
  const budget = text.match(/\b(\d+(?:\.\d+)?)\s*(million|m|k|thousand)\b/i)?.[0] ?? text.match(/AED\s*[\d,.]+M?/i)?.[0] ?? null;
  return { primary, urgency, confidence, hits, budget };
}

export function rankActions(list: Lead[]) {
  return list
    .map((l) => {
      const s = scoreLead(l);
      const commission = budgetMillions(l.budget) * 0.02;
      const closeProb = (s.score / 100) * (TIMEFRAME[l.timeframe] ?? 0.4);
      const decay = l.temp === "hot" ? 1 : l.temp === "warm" ? 0.75 : 0.45;
      let action = "Assign an agent", channel = "Assign", why = "Needs an owner";
      if (l.status === "Offer Stage") { action = "Call now and close"; channel = "Call"; why = "Offer pending. Revenue at risk."; }
      else if (l.temp === "hot" && (l.status === "New" || l.status === "Qualifying")) { action = "Send a WhatsApp now"; channel = "WhatsApp"; why = "Hot and waiting. Speed decides this one."; }
      else if (l.status === "Meeting Set") { action = "Confirm the viewing"; channel = "WhatsApp"; why = "Cuts no-shows"; }
      else if (l.temp === "warm") { action = "Send a shortlist"; channel = "SMS"; why = "Keep them close"; }
      else if (l.temp === "cold") { action = "Hand to AI re-engagement"; channel = "AI call"; why = "Low touch, let Observer work it"; }
      return {
        lead: l.name, action, channel, why, score: s.score, temp: l.temp,
        commission, closeProb: Math.round(closeProb * 100),
        priority: commission * closeProb * decay,
        confidence: Math.min(97, 60 + Math.round(s.score * 0.35)),
      };
    })
    .sort((a, b) => b.priority - a.priority);
}

/** Mortgage / payment plan maths (UAE fees), ported from v10 calcAll. */
export type Plan = "mortgage" | "developer" | "cash" | "posthandover";
export function calcPlan(o: { price: number; dpPct: number; rate: number; years: number; yieldPct: number; plan: Plan }) {
  const { price, dpPct, rate, years, yieldPct, plan } = o;
  const dp = plan === "cash" ? price : price * dpPct / 100;
  const loan = price - dp;
  const dld = price * 0.04, agency = price * 0.02, trustee = 4200;
  const mortgageReg = plan === "mortgage" ? loan * 0.0025 + 290 : 0;
  const fees = dld + agency + trustee + mortgageReg;
  let monthly = 0;
  if (plan === "mortgage") {
    const r = rate / 1200, n = years * 12;
    monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  } else if (plan === "developer") {
    monthly = loan / 36; // 3-year construction-linked instalments
  } else if (plan === "posthandover") {
    monthly = (loan * 0.5) / 24 + (loan * 0.5) / 60; // blended: 50% pre, 50% over 5y post
  }
  const totalPaid = plan === "cash" ? price + fees : plan === "mortgage" ? dp + monthly * years * 12 + fees : price + fees;
  const annualRent = price * yieldPct / 100;
  const appreciation = price * 0.08;
  const roi = ((annualRent + appreciation) / price) * 100;
  return { dp, loan, fees, dld, agency, trustee, mortgageReg, monthly, totalPaid, interest: Math.max(0, totalPaid - price - fees), annualRent, monthlyRent: annualRent / 12, netYield: yieldPct - 1.5, roi, breakEven: annualRent ? price / annualRent : 0 };
}

export const fmtAED = (n: number) =>
  n >= 1e6 ? `AED ${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M` : n >= 1e3 ? `AED ${Math.round(n / 1e3).toLocaleString("en-US")}K` : `AED ${Math.round(n)}`;
export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");
