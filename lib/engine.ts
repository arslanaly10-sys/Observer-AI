/**
 * Observer scoring, intent and next-best-action engine.
 * Ported from v10's AIEngine: explainable, deterministic, no network calls.
 */
import { weights, type Lead } from "./data";
import { purchaseCosts, monthlyPayment } from "./market/calc";

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

/** Each signal has an English and an Arabic pattern. Arabic has no \b word boundaries, so its patterns are plain. */
const SIGNALS: Record<string, { rx: RegExp[]; label: string }> = {
  buyer: { label: "Buyer", rx: [/\b(buy|buying|purchase|looking for|interested in|want a|need a|want to buy)\b/i, /(أبحث عن|أريد شراء|أرغب في شراء|مهتم|شراء|أشتري)/] },
  seller: { label: "Seller", rx: [/\b(sell|selling|my (villa|apartment|unit|property)|valuation|what.*price.*get|i have a \dbr)\b/i, /(أبيع|بيع شقتي|بيع فيلتي|تقييم|لدي شقة|عندي شقة|عندي فيلا)/] },
  urgent: { label: "Urgent", rx: [/\b(immediately|asap|urgent|this week|right away|ready to (proceed|sign|buy)|within \d+ (weeks?|days?))\b/i, /(فوراً|فورا|هذا الأسبوع|بسرعة|عاجل|خلال \d+ (أسابيع|أيام|أسبوع)|مستعد للتوقيع)/] },
  cash: { label: "High budget", rx: [/\b(cash|full payment|no mortgage|million|above aed)\b/i, /(نقداً|نقدا|كاش|مليون|ملايين|دفعة كاملة)/] },
  serious: { label: "Serious", rx: [/\b(LOI|sign|proceed|paperwork|offer|deposit|viewing|show me|when can)\b/i, /(معاينة|توقيع|أوقع|عرض|عربون|متى يمكن|أريد أن أرى)/] },
  researching: { label: "Researching", rx: [/\b(just (looking|browsing|researching|curious)|no rush|not urgent|maybe later|next year|planning)\b/i, /(أتصفح فقط|فقط أتصفح|لا عجلة|غير مستعجل|ليس مستعجلاً|السنة القادمة|أفكر|ربما لاحقاً)/] },
  investor: { label: "Investor", rx: [/\b(investment|ROI|rental yield|return|portfolio|rent it out)\b/i, /(استثمار|عائد|إيجار|تأجير|محفظة)/] },
};

export function extractIntent(msgs: { dir: "in" | "out"; text: string }[]) {
  const text = msgs.filter((m) => m.dir === "in").map((m) => m.text).join(" ");
  const hits: { key: string; label: string; evidence: string }[] = [];
  for (const [key, s] of Object.entries(SIGNALS)) {
    for (const rx of s.rx) {
      const m = text.match(rx);
      if (m) { hits.push({ key, label: s.label, evidence: m[0] }); break; }
    }
  }
  const has = (k: string) => hits.some((h) => h.key === k);
  const primary = has("seller") ? "Seller" : has("buyer") || has("serious") ? "Buyer" : has("investor") ? "Buyer" : "Unknown";
  const urgency = has("researching") ? "Low" : has("urgent") ? "High" : "Medium";
  const confidence = Math.min(98, 45 + hits.length * 13);
  const budget =
    text.match(/\b(\d+(?:\.\d+)?)\s*(million|m|k|thousand)\b/i)?.[0] ??
    text.match(/AED\s*[\d,.]+M?/i)?.[0] ??
    text.match(/(\d+(?:\.\d+)?)\s*(مليون|ملايين|ألف)/)?.[0] ??
    (/(مليونين|مليونان)/.test(text) ? "مليونان" : null);
  return { primary, urgency, confidence, hits, budget };
}

/** Known areas, English and Arabic spellings. */
export const AREAS: [string, RegExp][] = [
  ["Dubai Hills", /dubai hills|دبي هيلز/i], ["Downtown", /downtown|وسط (المدينة|مدينة دبي|دبي)|داون ?تاون/i],
  ["Palm Jumeirah", /palm|النخلة|نخلة جميرا/i], ["Emirates Hills", /emirates hills|تلال الإمارات/i],
  ["Business Bay", /business bay|الخليج التجاري|بزنس باي/i], ["MBR City", /mbr|محمد بن راشد/i],
  ["JVC", /jvc|jumeirah village|قرية جميرا/i], ["Sharjah", /sharjah|الشارقة/i], ["Ajman", /ajman|عجمان/i],
  ["Dubai Marina", /marina|المارينا|مرسى دبي/i], ["Abu Dhabi", /abu dhabi|أبوظبي|أبو ظبي/i],
];

function budgetFromMention(m: string | null) {
  if (!m) return null;
  if (/مليونان|مليونين/.test(m)) return "AED 2M";
  const n = parseFloat(m.replace(/[^0-9.]/g, ""));
  if (!n) return null;
  if (/k|thousand|ألف/i.test(m)) return `AED ${n}K`;
  if (/million|m\b|مليون|ملايين/i.test(m) || n < 100) return `AED ${n}M`;
  return n >= 1e6 ? `AED ${(n / 1e6).toFixed(1)}M` : `AED ${Math.round(n / 1e3)}K`;
}

/** Read one raw enquiry the way Observer would: intent, area, budget, an explainable score, and a first reply. */
export function analyzeEnquiry(text: string, lang: "en" | "ar") {
  const intent = extractIntent([{ dir: "in", text }]);
  const has = (k: string) => intent.hits.some((h) => h.key === k);
  const area = AREAS.find(([, rx]) => rx.test(text))?.[0] ?? null;
  const budget = budgetFromMention(intent.budget);
  const lead = {
    financing: has("cash") ? "Cash" : /mortgage|loan|تمويل|رهن|قرض/i.test(text) ? "Mortgage" : "Unknown",
    budget: budget ?? "AED 1.5M",
    timeframe: has("urgent") ? "<1 mo" : has("researching") ? "12 mo" : "3 mo",
    source: "WhatsApp",
    urgency: (has("serious") || has("urgent") ? "serious" : "researching") as "serious" | "researching",
    temp: (has("urgent") ? "hot" : has("researching") ? "cold" : "warm") as "hot" | "warm" | "cold",
    area: area ?? "",
  };
  const s = scoreLead(lead);
  return { intent, area, budget, score: s.score, temp: s.temp, parts: s.parts, reply: draftReply({ primary: intent.primary, urgent: has("urgent"), researching: has("researching"), investor: has("investor"), area, budget, lang }) };
}

export const AR_AREA: Record<string, string> = {
  "Dubai Hills": "دبي هيلز", Downtown: "وسط مدينة دبي", "Palm Jumeirah": "نخلة جميرا", "Emirates Hills": "تلال الإمارات",
  "Business Bay": "الخليج التجاري", "MBR City": "مدينة محمد بن راشد", JVC: "قرية جميرا الدائرية", Sharjah: "الشارقة",
  Ajman: "عجمان", "Dubai Marina": "دبي مارينا", "Abu Dhabi": "أبوظبي",
};

/** The first WhatsApp reply, written the way a good agent would: specific, short, one question. */
export function draftReply(o: { primary: string; urgent: boolean; researching: boolean; investor: boolean; area: string | null; budget: string | null; lang: "en" | "ar" }) {
  // Never claims specific homes or prices: a real reply quotes only what the inventory tool returns.
  const { primary, urgent, researching, investor, area, budget, lang } = o;
  if (lang === "ar") {
    const where = area ? ` في ${AR_AREA[area] ?? area}` : "";
    const within = budget ? ` ضمن ميزانية ${budget.replace("AED ", "").replace("M", " مليون").replace("K", " ألف")} درهم` : "";
    if (primary === "Seller") return `أهلاً بك، شكراً لتواصلك. يسعدني ترتيب تقييم لعقارك${where} مبني على صفقات حقيقية قريبة منه. ما مساحة العقار وعدد غرفه؟`;
    if (researching) return `أهلاً بك، لا عجلة إطلاقاً. يمكنني أن أرسل لك ملخصاً قصيراً عن الأسعار${where}، وأبقيك على اطلاع عند ظهور ما يناسبك. هل تفضّل شقة أم فيلا؟`;
    if (investor) return `أهلاً بك. سأتحقق مما هو متاح${where}${within} وأشارك معك الأسعار وخطط السداد والعائد المتوقع هنا. هل تفضّل عقاراً جاهزاً للتأجير أم على الخارطة؟`;
    if (urgent) return `أهلاً بك، شكراً لرسالتك. سأتحقق مما هو متاح${where}${within} وأرتب لك معاينة هذا الأسبوع. هل يناسبك الخميس صباحاً أم السبت؟`;
    return `أهلاً بك، شكراً لتواصلك. يمكنني مشاركة الأسعار وخطط السداد${where}${within} هنا مباشرة. هل هي للسكن أم للاستثمار، ومتى تخطط للانتقال؟`;
  }
  const where = area ? ` in ${area}` : "";
  const within = budget ? ` within ${budget}` : "";
  if (primary === "Seller") return `Thank you for getting in touch. I can arrange a valuation of your home${where}, based on real sales nearby. How many bedrooms is it, and roughly how large?`;
  if (researching) return `No rush at all. I can send you a short note on prices${where} and let you know when something fits. Are you thinking apartment or villa?`;
  if (investor) return `Thanks for reaching out. I’ll check what’s available${where}${within} and share prices, payment plans and expected rent right here. Would you prefer something ready to let, or off-plan?`;
  if (urgent) return `Thank you for your message. I’ll check what’s available${where}${within} and set up a viewing this week. Would Thursday morning or Saturday suit you?`;
  return `Thanks for getting in touch. I can share prices and payment plans${where}${within} right here. Is this for your family or an investment, and when are you hoping to move?`;
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

/**
 * Monthly cost of a plan. Fees come from lib/market/calc purchaseCosts, the same itemised maths as the
 * calculate_purchase_costs tool and the broker calculator, so every screen and the AI quote one number.
 */
export type Plan = "mortgage" | "developer" | "cash" | "posthandover";
export function calcPlan(o: { price: number; dpPct: number; rate: number; years: number; yieldPct: number; plan: Plan; status?: "ready" | "offplan" }) {
  const { price, dpPct, rate, years, yieldPct, plan } = o;
  const dp = plan === "cash" ? price : price * dpPct / 100;
  const loan = price - dp;
  const status = o.status ?? (plan === "developer" || plan === "posthandover" ? "offplan" : "ready");
  const costs = purchaseCosts({ price, status, financing: plan === "mortgage" ? "mortgage" : "cash", loan: plan === "mortgage" ? loan : 0 });
  const line = (prefix: string) => costs.lines.find((l) => l.label.startsWith(prefix))?.amount ?? 0;
  let monthly = 0;
  if (plan === "mortgage") monthly = monthlyPayment(loan, rate, years);
  else if (plan === "developer") monthly = loan / 36; // illustrative 3-year construction-linked instalments
  else if (plan === "posthandover") monthly = (loan * 0.5) / 24 + (loan * 0.5) / 60; // illustrative: half before, half over 5 years after
  const fees = costs.fees;
  const totalPaid = plan === "mortgage" ? dp + monthly * years * 12 + fees : price + fees;
  const annualRent = price * yieldPct / 100;
  return {
    dp, loan, fees, lines: costs.lines, dld: line("Transfer fee") || line("DLD Oqood"), agency: line("Agency commission"), trustee: line("Registration trustee"),
    mortgageReg: line("Mortgage registration"), monthly, totalPaid, interest: Math.max(0, totalPaid - price - fees),
    annualRent, monthlyRent: annualRent / 12, breakEven: annualRent ? price / annualRent : 0,
  };
}

export const fmtAED = (n: number) =>
  n >= 1e6 ? `AED ${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M` : n >= 1e3 ? `AED ${Math.round(n / 1e3).toLocaleString("en-US")}K` : `AED ${Math.round(n)}`;
export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * What slow first replies cost a brokerage each month. A transparent model with ASSUMED inputs, not research:
 * the share of leads that qualify when answered fast, how much that falls with slower replies (factors below),
 * and how many qualified leads close. The pricing page lets visitors change the first and last to their own numbers.
 */
export const REPLY_FACTOR: Record<string, number> = { "under5": 1, "5to15": 0.75, "15to60": 0.55, "over60": 0.4 };
export function roiEstimate(o: { leads: number; dealAED: number; commissionPct: number; reply: keyof typeof REPLY_FACTOR; qualifyPct?: number; closePct?: number }) {
  const best = (o.qualifyPct ?? 64) / 100, closeFromQualified = (o.closePct ?? 18.75) / 100;
  const now = best * (REPLY_FACTOR[o.reply] ?? 1);
  const lostQualified = Math.max(0, o.leads * (best - now));
  const extraDeals = lostQualified * closeFromQualified;
  const monthly = extraDeals * o.dealAED * (o.commissionPct / 100);
  return { lostQualified, extraDeals, monthly, yearly: monthly * 12 };
}
