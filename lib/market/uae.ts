/**
 * UAE property market reference data: purchase fees by emirate, mortgage rules, rates, Golden Visa,
 * area prices and yields, service charges, and developers with their usual payment plans.
 *
 * Every figure is INDICATIVE, gathered from public sources in November 2026 (listed in SOURCES). Sources
 * often disagree; where they do, the range or the most-cited figure is used and `note` says so. The AI and
 * the calculators always present these as estimates, and quote exact prices only from a workspace's own
 * inventory. Review this file every quarter.
 */
export const AS_OF = "November 2026";

export const SOURCES = {
  stake: { name: "Stake: All costs when buying property in Dubai (2026)", url: "https://getstake.com/content-hub/blog/articles/complete-guide-all-costs-when-buying-property-in-dubai-2026" },
  equityedgeOqood: { name: "EquityEdge: Oqood registration and fees", url: "https://www.equityedge.ae/guides/buying-off-plan-escrow-oqood-fees" },
  dubaiunpackedFees: { name: "Dubai Unpacked: off-plan fees in AED", url: "https://dubaiunpacked.com/articles/costs-on-top-of-the-price" },
  ltvRules: { name: "Real Estate Club Dubai: UAE LTV rules 2026", url: "https://realestateclubdubai.com/blog/buying-guide/uae-ltv-rules-explained-how-much-can-you-borrow-based-on-property-value-2026" },
  offplanLtv: { name: "Dubai Unpacked: off-plan mortgage 50% LTV", url: "https://dubaiunpacked.com/articles/off-plan-mortgage-dubai" },
  mortgageRates: { name: "Mortgease: CBD November 2026 pricing", url: "https://mortgease.ae/market-brief/2026-11-13-cbd-november-pricing/" },
  baseRate: { name: "Metropolitan: UAE base rate 2026", url: "https://metropolitan.realestate/media/news/uae-base-rate-increase-property-mortgages-2026/" },
  bayutH1: { name: "Bayut Dubai sales market report H1 2026", url: "https://www.bayut.com/mybayut/dubai-sales-market-report-h1-2026/" },
  bayutQ3: { name: "Bayut Dubai sales market report Q3 2026", url: "https://www.bayut.com/mybayut/dubai-sales-market-report-q3-2026/" },
  valorisimo: { name: "Valorisimo: apartment prices in Dubai 2026", url: "https://valorisimo.com/apartment-prices-in-dubai/" },
  augusta: { name: "Augusta Properties: Dubai market data", url: "https://www.augusta-properties.com/market" },
  fcre: { name: "FC Real Estate: communities near the Metro", url: "https://fcrealestate.ae/dubai-communities-near-metro-rents-prices-premium/" },
  adPrices: { name: "DubaiHaus: Abu Dhabi prices 2026 (ADREC H1 data)", url: "https://www.dubaihaus.com/en/blog/abu-dhabi-property-prices-2026-price-per-sqm-sqft" },
  adYields: { name: "Invest Gulf: Abu Dhabi rental yields 2026", url: "https://invest-gulf.com/guides/abu-dhabi-rental-yield-guide/" },
  adSaadiyat: { name: "Angel in Dubai: Abu Dhabi Q2 2026 (ValuStrat)", url: "https://www.angelindubai.com/post/abu-dhabi-real-estate-market-report-q2-2026-valustrat" },
  emirateFees: { name: "Matika: registration fees across the emirates", url: "https://www.matikaproperties.ae/article/property-registration-fees-uae-emirates" },
  serviceCharges: { name: "Real Estate Club Dubai: service charges 2026 (broker guides; check Mollak for a building)", url: "https://realestateclubdubai.com/blog/property-management/dubai-service-charges-explained-what-owners-pay-2026" },
  goldenVisa: { name: "Janus Hermes: Golden Visa through property 2026", url: "https://janushermes.com/blog/uae-golden-visa-property-2026" },
  developers: { name: "Engel & Völkers: top Dubai developers 2026", url: "https://www.engelvoelkers.com/ae/en/resources/top-10-real-estate-developers-in-dubai" },
  paymentPlans: { name: "Real Estate Club Dubai: post-handover plans 2026", url: "https://realestateclubdubai.com/blog/buying-guide/post-handover-payment-plans-dubai-2026-benefits-risks-best-developer-deals" },
  commission: { name: "Engel & Völkers: agent commission in Dubai", url: "https://www.engelvoelkers.com/ae/en/resources/how-much-is-the-real-estate-agent-commission-in-dubai" },
  meiDubai: { name: "The Middle East Insider: best areas to buy in Dubai (Mar 2026)", url: "https://themiddleeastinsider.com/2026/03/13/best-areas-buy-property-dubai-2026/" },
  meiAbuDhabi: { name: "The Middle East Insider: Abu Dhabi market (Mar 2026)", url: "https://themiddleeastinsider.com/2026/03/14/abu-dhabi-real-estate-market-march-2026-prices-trends-investment/" },
  kunReem: { name: "Kun: Al Reem Island market update 2026", url: "https://www.kun.ae/blog/al-reem-island-property-market-update-2026" },
  christiesSc: { name: "Christie's Real Estate Dubai: service charges guide", url: "https://www.christiesrealestatedubai.com/the-journal/dubai-service-charges-guide/" },
  drivenSc: { name: "Driven Properties: service charge index", url: "https://www.drivenproperties.com/dubai-real-estate-market-guide/service-charge-index" },
  emaarWiki: { name: "Wikipedia: Emaar Development", url: "https://en.wikipedia.org/wiki/Emaar_Developments" },
  aldarWiki: { name: "Wikipedia: Aldar Properties", url: "https://en.wikipedia.org/wiki/Aldar_Properties" },
} as const;
export type SourceKey = keyof typeof SOURCES;

// ── Fees ──────────────────────────────────────────────────────────────────
export type Emirate = "dubai" | "abu_dhabi" | "sharjah" | "rak";
export const EMIRATES: Record<Emirate, string> = { dubai: "Dubai", abu_dhabi: "Abu Dhabi", sharjah: "Sharjah", rak: "Ras Al Khaimah" };

export interface FeeRules {
  transferPct: number; transferNote: string;
  adminFixed: number; offplanAdminFixed: number;
  trustee: { underAed500k: number; overAed500k: number } | null;
  mortgageRegPct: number | null; mortgageRegFixed: number;
  sources: SourceKey[];
}
export const FEES: Record<Emirate, FeeRules> = {
  dubai: {
    transferPct: 4, transferNote: "DLD transfer fee (Oqood registration for off-plan). Legally split with the seller, but buyers usually pay all of it.",
    adminFixed: 580, offplanAdminFixed: 1000,
    trustee: { underAed500k: 2000, overAed500k: 4000 }, // plus 5% VAT
    mortgageRegPct: 0.25, mortgageRegFixed: 290,
    sources: ["stake", "equityedgeOqood", "dubaiunpackedFees"],
  },
  abu_dhabi: { transferPct: 2, transferNote: "Abu Dhabi registration fee, about 2%; confirm with ADREC/DMT.", adminFixed: 0, offplanAdminFixed: 0, trustee: null, mortgageRegPct: null, mortgageRegFixed: 0, sources: ["emirateFees"] },
  sharjah: { transferPct: 4, transferNote: "Sources range from 2% to 4%; confirm with the Sharjah Real Estate Registration Department.", adminFixed: 0, offplanAdminFixed: 0, trustee: null, mortgageRegPct: null, mortgageRegFixed: 0, sources: ["emirateFees"] },
  rak: { transferPct: 4, transferNote: "Most sources say about 4% plus an admin charge; confirm with RAK Lands and Properties.", adminFixed: 580, offplanAdminFixed: 0, trustee: null, mortgageRegPct: null, mortgageRegFixed: 0, sources: ["emirateFees"] },
};

export const COMMON = {
  vatPct: 5,
  agencyPct: 2, // resale, buyer side, plus VAT; usually none on off-plan bought from the developer
  bankArrangementPct: 1, // up to, plus VAT; many banks waive or cap it
  valuationFee: 3000, // typical AED 2,500–3,500
  nocRange: [500, 5000] as [number, number], // developer NOC on resale
  developerAdminRange: [1000, 6000] as [number, number], // off-plan, varies by developer
  ejari: 220, // tenancy registration, approx. incl. VAT
  rentalAgencyPct: 5, // of annual rent, market convention
  sources: ["stake", "dubaiunpackedFees", "commission"] as SourceKey[],
};

// ── Mortgages ─────────────────────────────────────────────────────────────
export const MORTGAGE = {
  ltv: {
    expatFirstUnder5m: 80, expatFirstOver5m: 70,
    nationalFirstUnder5m: 85, nationalFirstOver5m: 75,
    expatSecondHome: 60, nationalSecondHome: 65,
    offPlan: 50,
  },
  dbrMaxPct: 50, // total monthly debt ≤ 50% of monthly income
  maxYears: 25,
  maxAgeAtEnd: { expat: 65, national: 70 },
  feesFromOwnFunds: true, // fees and down payment are not financed
  /** Rules in common use that our sources did not confirm. Shown as "not confirmed" wherever they're used. */
  unconfirmed: ["nationalFirstUnder5m", "nationalFirstOver5m", "expatSecondHome", "nationalSecondHome", "maxAgeNational"] as const,
  note: "Central Bank of the UAE caps, as most lenders apply them. Some sources give 75% or 65% for expats; banks may lend less. Figures for UAE nationals and second homes, and the age limit for nationals, are in common use but not confirmed by our sources.",
  sources: ["ltvRules", "offplanLtv"] as SourceKey[],
};

export const RATES = {
  baseRatePct: 3.9, baseRateSince: "17 September 2026",
  eibor3mPct: 4.32, eiborDate: "9 November 2026",
  fixedRangePct: [3.99, 5.25] as [number, number],
  note: "Typical fixed rates for 1 to 5 years; salary-transfer offers are lowest. Rates move often, so treat as a guide.",
  sources: ["mortgageRates", "baseRate"] as SourceKey[],
};

export const GOLDEN_VISA = {
  thresholdAed: 2_000_000,
  rules: [
    "The property must be worth at least AED 2 million at the Dubai Land Department's valuation, alone or across several properties.",
    "Mortgaged property can qualify with a no-objection letter from the bank.",
    "Off-plan property from an approved developer can qualify.",
    "Abu Dhabi applies stricter rules on financed property.",
  ],
  note: "Rules changed several times in 2026; confirm with ICP/GDRFA or DLD before advising.",
  sources: ["goldenVisa"] as SourceKey[],
};

// ── Areas ─────────────────────────────────────────────────────────────────
export interface Area {
  id: string; name: string; nameAr: string; emirate: Emirate;
  pricePsf: [number, number] | null; // AED per sq ft, indicative range
  yieldPct: [number, number] | null; // gross
  serviceChargePsf?: [number, number];
  type: "apartments" | "villas" | "mixed";
  note?: string; sources: SourceKey[];
}
export const AREAS: Area[] = [
  // Each range spans only figures printed in its sources (single figures appear as one number).
  { id: "jvc", name: "Jumeirah Village Circle (JVC)", nameAr: "قرية جميرا الدائرية", emirate: "dubai", pricePsf: [900, 1470], yieldPct: [7.15, 8], serviceChargePsf: [6, 14], type: "apartments", note: "Middle East Insider gives AED 900–1,300; Valorisimo's median is AED 1,470.", sources: ["meiDubai", "valorisimo", "bayutH1", "serviceCharges"] },
  { id: "marina", name: "Dubai Marina", nameAr: "دبي مارينا", emirate: "dubai", pricePsf: [1990, 1990], yieldPct: [5.88, 7], serviceChargePsf: [14, 16.1], type: "apartments", sources: ["valorisimo", "bayutH1", "serviceCharges", "drivenSc"] },
  { id: "downtown", name: "Downtown Dubai", nameAr: "وسط مدينة دبي", emirate: "dubai", pricePsf: [2800, 3500], yieldPct: [5.46, 6], serviceChargePsf: [17, 40], type: "apartments", note: "Valorisimo's median is AED 2,960. Branded towers charge far more in service fees.", sources: ["meiDubai", "valorisimo", "bayutH1", "christiesSc"] },
  { id: "palm", name: "Palm Jumeirah", nameAr: "نخلة جميرا", emirate: "dubai", pricePsf: [3400, 3400], yieldPct: [4.48, 6], type: "mixed", note: "Median apartments. Bayut's Q3 average of AED 6,182 is pulled up by signature villas.", sources: ["valorisimo", "bayutH1", "bayutQ3"] },
  { id: "dubai-hills", name: "Dubai Hills Estate", nameAr: "دبي هيلز إستيت", emirate: "dubai", pricePsf: [2330, 3057], yieldPct: [4.2, 7], type: "mixed", note: "Apartments AED 2,330 (Valorisimo median); villas AED 3,057 (Bayut Q3 asking).", sources: ["valorisimo", "bayutH1", "bayutQ3"] },
  { id: "business-bay", name: "Business Bay", nameAr: "الخليج التجاري", emirate: "dubai", pricePsf: [2921, 2921], yieldPct: [6, 6.29], serviceChargePsf: [14.75, 14.75], type: "apartments", sources: ["augusta", "bayutH1", "bayutQ3", "serviceCharges"] },
  { id: "creek-harbour", name: "Dubai Creek Harbour", nameAr: "خور دبي", emirate: "dubai", pricePsf: [1765, 2300], yieldPct: [5.6, 5.6], type: "apartments", sources: ["augusta", "fcre"] },
  { id: "al-furjan", name: "Al Furjan", nameAr: "الفرجان", emirate: "dubai", pricePsf: [1247, 1247], yieldPct: [6.5, 7.69], type: "mixed", note: "Price is for apartments.", sources: ["fcre", "bayutH1"] },
  { id: "town-square", name: "Town Square", nameAr: "تاون سكوير", emirate: "dubai", pricePsf: null, yieldPct: [7.45, 7.45], type: "mixed", sources: ["bayutH1"] },
  { id: "arabian-ranches", name: "Arabian Ranches", nameAr: "المرابع العربية", emirate: "dubai", pricePsf: [2417, 2417], yieldPct: [3.8, 3.87], serviceChargePsf: [2, 6], type: "villas", sources: ["augusta", "bayutH1", "bayutQ3", "serviceCharges"] },
  { id: "damac-hills", name: "DAMAC Hills", nameAr: "داماك هيلز", emirate: "dubai", pricePsf: [1908, 1908], yieldPct: [4.95, 4.95], type: "villas", sources: ["augusta", "bayutH1"] },
  { id: "damac-lagoons", name: "DAMAC Lagoons", nameAr: "داماك لاجونز", emirate: "dubai", pricePsf: null, yieldPct: [5.7, 6.09], type: "villas", sources: ["bayutH1", "bayutQ3"] },
  { id: "mbr-city", name: "Mohammed Bin Rashid City", nameAr: "مدينة محمد بن راشد", emirate: "dubai", pricePsf: [2357, 2357], yieldPct: [5.3, 5.3], type: "villas", note: "Villa asking price.", sources: ["bayutQ3"] },
  { id: "dubai-south", name: "Dubai South", nameAr: "دبي الجنوب", emirate: "dubai", pricePsf: null, yieldPct: [4.92, 4.92], serviceChargePsf: [6, 14], type: "mixed", sources: ["bayutH1", "serviceCharges"] },
  { id: "al-reem", name: "Al Reem Island", nameAr: "جزيرة الريم", emirate: "abu_dhabi", pricePsf: [1180, 1697], yieldPct: [6, 8], type: "apartments", note: "ADREC H1 2026 average about AED 1,670.", sources: ["adPrices", "kunReem", "adSaadiyat", "adYields"] },
  { id: "yas", name: "Yas Island", nameAr: "جزيرة ياس", emirate: "abu_dhabi", pricePsf: [1520, 2320], yieldPct: [6, 8], type: "mixed", sources: ["adSaadiyat", "adPrices", "adYields"] },
  { id: "saadiyat", name: "Saadiyat Island", nameAr: "جزيرة السعديات", emirate: "abu_dhabi", pricePsf: [1800, 3500], yieldPct: [4.5, 6], type: "mixed", note: "Apartments AED 1,800–2,800; villas AED 2,200–3,500.", sources: ["meiAbuDhabi", "adSaadiyat", "adYields"] },
  { id: "al-reef", name: "Al Reef", nameAr: "الريف", emirate: "abu_dhabi", pricePsf: null, yieldPct: [9, 9.5], type: "mixed", sources: ["adYields"] },
];

// ── Developers ────────────────────────────────────────────────────────────
export interface Developer {
  id: string; name: string; emirate: Emirate; knownFor: string; areas: string[];
  plans: string; postHandover: "rare" | "sometimes" | "common" | "unknown";
  salesJanAug2026Bn?: number; sources: SourceKey[];
}
export const DEVELOPERS: Developer[] = [
  { id: "emaar", name: "Emaar", emirate: "dubai", knownFor: "Dubai's largest developer by 2026 sales (Downtown, Dubai Hills, Creek Harbour, Arabian Ranches, The Valley).", areas: ["downtown", "dubai-hills", "creek-harbour", "arabian-ranches"], plans: "Mostly 80/20 or 90/10 construction-linked; post-handover only on selected launches.", postHandover: "rare", salesJanAug2026Bn: 32.3, sources: ["developers", "paymentPlans", "emaarWiki"] },
  { id: "damac", name: "DAMAC", emirate: "dubai", knownFor: "Branded towers and large villa communities: DAMAC Hills, DAMAC Lagoons, DAMAC Hills 2.", areas: ["damac-hills", "damac-lagoons", "business-bay"], plans: "Often 70/30, 60/40, 50/50 and some 20/80; post-handover up to about 5 years.", postHandover: "common", salesJanAug2026Bn: 18.2, sources: ["developers", "paymentPlans"] },
  { id: "azizi", name: "Azizi", emirate: "dubai", knownFor: "Most units sold in Dubai in January to August 2026.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", salesJanAug2026Bn: 10.6, sources: ["developers"] },
  { id: "binghatti", name: "Binghatti", emirate: "dubai", knownFor: "High-volume developer of apartment towers.", areas: [], plans: "Commonly 60/40 with 40% on handover; post-handover on some launches.", postHandover: "sometimes", salesJanAug2026Bn: 9.3, sources: ["developers", "paymentPlans"] },
  { id: "ellington", name: "Ellington", emirate: "dubai", knownFor: "Residential developer; fifth by 2026 sales value.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", salesJanAug2026Bn: 8.7, sources: ["developers"] },
  { id: "meraas", name: "Meraas", emirate: "dubai", knownFor: "Dubai developer; sixth by 2026 sales value.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", salesJanAug2026Bn: 7.9, sources: ["developers"] },
  { id: "nakheel", name: "Nakheel", emirate: "dubai", knownFor: "Master developer of Palm Jumeirah.", areas: ["palm"], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", salesJanAug2026Bn: 7.4, sources: ["developers"] },
  { id: "imtiaz", name: "Imtiaz", emirate: "dubai", knownFor: "Dubai developer; AED 4.1bn sold January to August 2026.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", salesJanAug2026Bn: 4.1, sources: ["developers"] },
  { id: "sobha", name: "Sobha", emirate: "dubai", knownFor: "Developer of Sobha Hartland.", areas: [], plans: "Often 60/40; some launches with about 3 years post-handover.", postHandover: "sometimes", sources: ["paymentPlans"] },
  { id: "danube", name: "Danube", emirate: "dubai", knownFor: "Known for 1% monthly payment plans.", areas: [], plans: "1% a month, with long post-handover periods (sources cite roughly 4 to 6 years).", postHandover: "common", sources: ["paymentPlans"] },
  { id: "samana", name: "Samana", emirate: "dubai", knownFor: "Known for some of the longest payment plans.", areas: [], plans: "Long instalment plans, some running about 8 years in total.", postHandover: "common", sources: ["paymentPlans"] },
  { id: "omniyat", name: "Omniyat", emirate: "dubai", knownFor: "Luxury developer.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", sources: ["developers"] },
  { id: "aldar", name: "Aldar", emirate: "abu_dhabi", knownFor: "Abu Dhabi's listed developer; Mubadala is its largest shareholder.", areas: ["yas", "saadiyat", "al-reem"], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", sources: ["aldarWiki", "developers"] },
  { id: "modon", name: "Modon", emirate: "abu_dhabi", knownFor: "Abu Dhabi developer.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", sources: ["developers"] },
  { id: "arada", name: "Arada", emirate: "sharjah", knownFor: "Sharjah developer.", areas: [], plans: "Not covered by our sources; ask the developer.", postHandover: "unknown", sources: ["developers"] },
];

// ── Lookup helpers (used by the AI tools) ─────────────────────────────────
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, " ").trim();
const ALIASES: Record<string, string[]> = {
  jvc: ["jvc", "jumeirah village"], marina: ["marina"], downtown: ["downtown", "burj khalifa", "boulevard"], palm: ["palm", "the palm"],
  "dubai-hills": ["dubai hills", "hills estate"], "business-bay": ["business bay"], "creek-harbour": ["creek harbour", "creek harbor", "dubai creek"],
  "al-furjan": ["furjan"], "town-square": ["town square"], "arabian-ranches": ["arabian ranches", "ranches"],
  "damac-hills": ["damac hills"], "damac-lagoons": ["lagoons"], "mbr-city": ["mbr", "mohammed bin rashid", "meydan", "sobha hartland"],
  "dubai-south": ["dubai south", "expo city"], "al-reem": ["reem"], yas: ["yas"], saadiyat: ["saadiyat"], "al-reef": ["al reef", "reef"],
};
/** Best match for an everyday area name in English or Arabic (longest alias wins, so "Dubai Hills" never matches "Dubai Marina"). */
export function findArea(q: string) {
  const n = norm(q);
  if (!n) return null;
  let best: { a: Area; len: number } | null = null;
  for (const a of AREAS) {
    const keys = [...(ALIASES[a.id] ?? []), norm(a.name), norm(a.nameAr)];
    for (const k of keys) if (k && n.includes(k) && (!best || k.length > best.len)) best = { a, len: k.length };
  }
  return best?.a ?? null;
}
export function findDeveloper(q: string) {
  const n = norm(q);
  return DEVELOPERS.find((d) => norm(d.name) === n || n.includes(norm(d.name)) || d.id === n) ?? null;
}
export function sourceList(keys: SourceKey[]) {
  return [...new Set(keys)].map((k) => SOURCES[k]);
}
