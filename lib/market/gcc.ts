/**
 * GCC market intelligence: 2025 transaction totals per market, buying costs and mortgage limits per
 * country, and the leading developers with their flagship projects.
 *
 * Only figures we could trace to a named source are included, each with that source and its scope. Where
 * sources disagree, the official or most specific figure is used and `note` says so. Where we found no
 * reliable figure, the field is left empty and the screen says "not confirmed". No totals across
 * countries are computed: the markets measure different things in different currencies.
 * Checked November 2026; review every quarter.
 */
import { purchaseCosts, type CostLine } from "./calc";

export const GCC_AS_OF = "November 2026";

export const GCC_SOURCES = {
  dld2025: { name: "Zawya press release: Dubai recorded over 270,000 transactions worth AED 917bn in 2025", url: "https://www.tradingview.com/news/reuters.com,2026-02-26:newsml_Zaw4096kd:0-zawya-pressr-dubai-recorded-over-270-000-real-estate-transactions-worth-aed-917bln-in-2025/" },
  bayutOffplan: { name: "Bayut: Dubai off-plan market report 2025", url: "https://www.bayut.com/mybayut/dubai-off-plan-property-market-report-2025/" },
  adrec2025: { name: "Zawya: Abu Dhabi Real Estate Centre 2025 performance", url: "https://www.zawya.com/en/press-release/companies-news/abu-dhabi-real-estate-centre-releases-2025-real-estate-performance-numbers-dkvjde0p" },
  ksaExchange: { name: "Amlak: Real Estate Exchange deals in 2025", url: "https://amlak.net.sa/en/97639/" },
  qatarNov: { name: "Economy Middle East: Qatar real estate transactions, November 2025 (MoJ)", url: "https://economymiddleeast.com/news/qatar-records-620-2-million-real-estate-transactions-in-november-2025/" },
  qatarSteps: { name: "Steps: Qatar real estate market 2025 (third-party analysis)", url: "https://www.steps.com.qa/qatar-real-estate-market-2025-trends-data-insights" },
  kuwaitDallal: { name: "Dallal annual report on Kuwait Ministry of Justice data, 2025", url: "https://www.alibahbahani.com/blogs/kuwait-real-estate-2025-dallal-annual-report" },
  kuwaitKib: { name: "Zawya: Kuwait's real estate transactions in 2025 (KIB)", url: "https://www.zawya.com/en/business/real-estate/kuwaits-real-estate-transactions-surge-to-15bn-in-fy-2025-360493" },
  bahrainSlrb: { name: "ME Construction News: Bahrain real estate 2025 (Survey and Land Registration Bureau)", url: "https://meconstructionnews.com/66803/bahrain-real-estate-records-robust-growth-in-2025" },
  omanNcsi: { name: "AGBI: Oman property market 2025 (NCSI data)", url: "https://www.agbi.com/real-estate/2026/02/lower-mortgage-rates-drive-up-oman-property-market/" },
  ksaRett: { name: "Bayut KSA: real estate taxes in Saudi Arabia", url: "https://www.bayut.sa/blog/en/saudi-market-insights/real-estate-taxes-saudi-arabia/" },
  samaLtv: { name: "SAMA rulebook: Implementing Regulation of the Real Estate Finance Law", url: "https://rulebook.sama.gov.sa/en/implementing-regulation-real-estate-finance-law" },
  ksaExpatLtv: { name: "Mada Properties: mortgages in Saudi Arabia 2026", url: "https://madaproperties.sa/en/blogs/mortgage-in-saudi-arabia-2026-or-requirements-and-eligibility" },
  qatarFees: { name: "Invest Abroad Brief, 20 October 2026 (Qatar fees)", url: "https://investabroad.substack.com/p/invest-abroad-brief-20-oct-2026" },
  bahrainFees: { name: "Sands of Wealth: property taxes and fees in Bahrain 2026", url: "https://sandsofwealth.com/blogs/news/bahrain-property-taxes-fees" },
  bahrainZones: { name: "Janus Hermes: Bahrain property for foreign buyers 2026", url: "https://janushermes.com/blog/buying-property-bahrain-foreign-buyers" },
} as const;
export type GccSource = keyof typeof GCC_SOURCES;

export type Country = "uae" | "ksa" | "qatar" | "kuwait" | "bahrain" | "oman";
export const COUNTRIES: { id: Country; name: string; nameAr: string; currency: string }[] = [
  { id: "uae", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", currency: "AED" },
  { id: "ksa", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية", currency: "SAR" },
  { id: "qatar", name: "Qatar", nameAr: "قطر", currency: "QAR" },
  { id: "kuwait", name: "Kuwait", nameAr: "الكويت", currency: "KWD" },
  { id: "bahrain", name: "Bahrain", nameAr: "البحرين", currency: "BHD" },
  { id: "oman", name: "Oman", nameAr: "عُمان", currency: "OMR" },
];

/** 2025 transaction totals, one row per market as its registry or a named analysis reports it. */
export type MarketYear = {
  country: Country; market: string; marketAr: string; currency: string;
  valueBn?: number; deals?: number; scope: string; scopeAr: string;
  note?: string; noteAr?: string; estimate?: boolean; sources: GccSource[];
};
export const MARKETS_2025: MarketYear[] = [
  { country: "uae", market: "Dubai", marketAr: "دبي", currency: "AED", valueBn: 917, deals: 270_000, scope: "All real estate transactions, 2025", scopeAr: "جميع الصفقات العقارية، 2025", note: "Over 270,000 transactions. Off-plan was 62.6% of transactions (Bayut); other analysts put it between about 62% and 73% depending on scope.", noteAr: "أكثر من 270 ألف صفقة. شكّل البيع على الخارطة 62.6% من الصفقات (بيوت)، وتضعه تحليلات أخرى بين نحو 62% و73% حسب النطاق.", sources: ["dld2025", "bayutOffplan"] },
  { country: "uae", market: "Abu Dhabi", marketAr: "أبوظبي", currency: "AED", valueBn: 142, deals: 42_814, scope: "All transactions incl. mortgages, 2025 (ADREC)", scopeAr: "جميع الصفقات بما فيها الرهون، 2025 (مركز أبوظبي العقاري)", note: "AED 99.4bn of it was sales; AED 42.7bn mortgages.", noteAr: "منها 99.4 مليار درهم مبيعات و42.7 مليار رهون.", sources: ["adrec2025"] },
  { country: "ksa", market: "Saudi Arabia", marketAr: "المملكة العربية السعودية", currency: "SAR", valueBn: 336.6, deals: 265_190, scope: "Real Estate Exchange (Ministry of Justice), 2025", scopeAr: "البورصة العقارية (وزارة العدل)، 2025", note: "Reported by Amlak from Real Estate Exchange data; Riyadh led.", noteAr: "بحسب أملاك من بيانات البورصة العقارية، وتصدّرت الرياض.", sources: ["ksaExchange"] },
  { country: "qatar", market: "Qatar", marketAr: "قطر", currency: "QAR", valueBn: 26.02, deals: 6_970, estimate: true, scope: "Third-party estimate for 2025; no official annual total found", scopeAr: "تقدير من جهة خاصة لعام 2025، ولم نجد إجمالياً رسمياً", note: "Ministry of Justice monthly bulletins: QAR 2.26bn in November (530 deals).", noteAr: "نشرات وزارة العدل الشهرية: 2.26 مليار ريال في نوفمبر (530 صفقة).", sources: ["qatarSteps", "qatarNov"] },
  { country: "kuwait", market: "Kuwait", marketAr: "الكويت", currency: "KWD", valueBn: 4.55, deals: 6_023, scope: "Ministry of Justice data, 2025 (Dallal analysis)", scopeAr: "بيانات وزارة العدل، 2025 (تحليل دلّال)", note: "KIB reports KD 4.58bn over 6,086 transactions.", noteAr: "يذكر بنك الكويت الدولي 4.58 مليار دينار عبر 6,086 صفقة.", sources: ["kuwaitDallal", "kuwaitKib"] },
  { country: "bahrain", market: "Bahrain", marketAr: "البحرين", currency: "BHD", valueBn: 1.6, deals: 29_777, scope: "Survey and Land Registration Bureau, 2025", scopeAr: "جهاز المساحة والتسجيل العقاري، 2025", note: "Highest value in a decade, up 51.6%.", noteAr: "أعلى قيمة منذ عقد، بزيادة 51.6%.", sources: ["bahrainSlrb"] },
  { country: "oman", market: "Oman", marketAr: "عُمان", currency: "OMR", valueBn: 1.27, scope: "Value of real estate transactions, 2025 (NCSI)", scopeAr: "قيمة الصفقات العقارية، 2025 (المركز الوطني للإحصاء)", note: "Another report citing the Ministry of Housing gives a different figure; we use the NCSI number.", noteAr: "يورد تقرير آخر نقلاً عن وزارة الإسكان رقماً مختلفاً، ونعتمد رقم المركز الوطني للإحصاء.", sources: ["omanNcsi"] },
];

/** Buying costs and lending limits, per country. Empty means we could not confirm it. */
export type CountryRules = {
  country: Country;
  transfer?: { pct: number; label: string; labelAr: string; note: string; noteAr: string };
  fixed?: { amount: number; label: string; labelAr: string };
  ltv?: { line: string; lineAr: string; confirmed: boolean }[];
  ownership?: string; ownershipAr?: string;
  sources: GccSource[];
};
export const RULES: Record<Exclude<Country, "uae">, CountryRules> = {
  ksa: {
    country: "ksa",
    transfer: { pct: 5, label: "Real estate transaction tax (5%)", labelAr: "ضريبة التصرفات العقارية (5%)", note: "For a Saudi citizen's first home, the state covers the tax on the first SAR 1M with a certificate from Sakani; confirm the current rules with ZATCA.", noteAr: "في المسكن الأول للمواطن السعودي تتحمّل الدولة الضريبة عن أول مليون ريال بشهادة من سكني، وتُراجع القواعد الحالية مع هيئة الزكاة والضريبة والجمارك." },
    ltv: [
      { line: "Saudi citizens, first home: up to 90% loan-to-value (SAMA)", lineAr: "المواطنون، المسكن الأول: حتى 90% من القيمة (البنك المركزي السعودي)", confirmed: true },
      { line: "Second and later homes: up to 70% with banks, 85% with finance companies (SAMA)", lineAr: "المسكن الثاني وما بعده: حتى 70% لدى البنوك و85% لدى شركات التمويل (البنك المركزي السعودي)", confirmed: true },
      { line: "Residents who aren't citizens: set by each lender; sources cite 70% to 85%", lineAr: "المقيمون غير المواطنين: يحددها كل مموّل، وتذكر المصادر 70% إلى 85%", confirmed: false },
    ],
    sources: ["ksaRett", "samaLtv", "ksaExpatLtv"],
  },
  qatar: {
    country: "qatar",
    transfer: { pct: 0.25, label: "Property registration fee (0.25%)", labelAr: "رسوم تسجيل العقار (0.25%)", note: "From a secondary source; confirm with the Ministry of Justice's Real Estate Registration Department.", noteAr: "من مصدر ثانوي، ويُراجع مع إدارة التسجيل العقاري بوزارة العدل." },
    fixed: { amount: 100, label: "Title deed fee", labelAr: "رسوم سند الملكية" },
    sources: ["qatarFees"],
  },
  bahrain: {
    country: "bahrain",
    transfer: { pct: 2, label: "Registration fee (2%, or 1.7% within 60 days of signing)", labelAr: "رسوم التسجيل (2%، أو 1.7% خلال 60 يوماً من التوقيع)", note: "Sources put total buyer costs at about 2.5% to 4.5% of the price.", noteAr: "تقدّر المصادر إجمالي تكاليف المشتري بنحو 2.5% إلى 4.5% من السعر." },
    fixed: { amount: 1, label: "Land registration charge", labelAr: "رسم تسجيل الأرض" },
    ownership: "Foreign buyers can own freehold in designated investment zones such as Amwaj Islands, Seef, Juffair and Bahrain Bay.",
    ownershipAr: "يمكن للأجانب التملك الحر في مناطق استثمارية محددة مثل جزر أمواج والسيف والجفير وخليج البحرين.",
    sources: ["bahrainFees", "bahrainZones"],
  },
  kuwait: { country: "kuwait", sources: [] },
  oman: { country: "oman", sources: [] },
};

/** Buying costs for one purchase in any GCC country. Unconfirmed countries return no lines. */
export function gccCosts(country: Country, price: number, o: { firstHomeCitizen?: boolean; within60Days?: boolean } = {}): { lines: CostLine[]; fees: number; confirmed: boolean } {
  if (country === "uae") {
    const r = purchaseCosts({ price, emirate: "dubai", status: "ready", financing: "cash" });
    return { lines: r.lines, fees: r.fees, confirmed: true };
  }
  const rules = RULES[country];
  if (!rules.transfer) return { lines: [], fees: 0, confirmed: false };
  const lines: CostLine[] = [];
  let pct = rules.transfer.pct;
  if (country === "bahrain" && o.within60Days) pct = 1.7;
  let base = price;
  if (country === "ksa" && o.firstHomeCitizen) base = Math.max(0, price - 1_000_000);
  lines.push({ label: country === "bahrain" ? `Registration fee (${pct}%)` : rules.transfer.label, amount: Math.round(base * pct) / 100, note: rules.transfer.note });
  if (rules.fixed) lines.push({ label: rules.fixed.label, amount: rules.fixed.amount });
  return { lines, fees: lines.reduce((a, l) => a + l.amount, 0), confirmed: true };
}

/** Leading developers and flagship projects, as each markets them. Names only: no counts or values. */
export const GCC_DEVELOPERS: { country: Country; name: string; nameAr: string; flagship: string[] }[] = [
  { country: "uae", name: "Emaar Properties", nameAr: "إعمار العقارية", flagship: ["Downtown Dubai", "Dubai Creek Harbour", "Dubai Hills Estate", "Arabian Ranches"] },
  { country: "uae", name: "DAMAC Properties", nameAr: "داماك العقارية", flagship: ["DAMAC Hills", "DAMAC Lagoons", "DAMAC Hills 2"] },
  { country: "uae", name: "Nakheel", nameAr: "نخيل", flagship: ["Palm Jumeirah", "Palm Jebel Ali"] },
  { country: "uae", name: "Meraas (Dubai Holding)", nameAr: "مِراس (دبي القابضة)", flagship: ["City Walk", "Bluewaters"] },
  { country: "uae", name: "Aldar Properties", nameAr: "الدار العقارية", flagship: ["Yas Island", "Saadiyat Island", "Al Reem Island"] },
  { country: "uae", name: "Sobha Realty", nameAr: "شوبا العقارية", flagship: ["Sobha Hartland"] },
  { country: "ksa", name: "ROSHN", nameAr: "روشن", flagship: ["SEDRA", "WAREFA", "ALAROUS"] },
  { country: "ksa", name: "Dar Al Arkan", nameAr: "دار الأركان", flagship: ["Shams Ar Riyadh"] },
  { country: "ksa", name: "Red Sea Global", nameAr: "البحر الأحمر الدولية", flagship: ["The Red Sea", "AMAALA"] },
  { country: "ksa", name: "Jabal Omar Development", nameAr: "جبل عمر للتطوير", flagship: ["Jabal Omar, Makkah"] },
  { country: "ksa", name: "Retal Urban Development", nameAr: "ريتال للتطوير العمراني", flagship: ["Eastern Province and Riyadh communities"] },
  { country: "qatar", name: "Qatari Diar", nameAr: "الديار القطرية", flagship: ["Lusail City"] },
  { country: "qatar", name: "United Development Company", nameAr: "المتحدة للتنمية", flagship: ["The Pearl-Qatar"] },
  { country: "kuwait", name: "Mabanee", nameAr: "مباني", flagship: ["The Avenues"] },
  { country: "kuwait", name: "Tamdeen Group", nameAr: "مجموعة تمدين", flagship: ["Al Kout Mall"] },
  { country: "bahrain", name: "Diyar Al Muharraq", nameAr: "ديار المحرق", flagship: ["Diyar Al Muharraq"] },
  { country: "oman", name: "OMRAN Group", nameAr: "مجموعة عمران", flagship: ["Al Mouj Muscat (joint venture)"] },
];
