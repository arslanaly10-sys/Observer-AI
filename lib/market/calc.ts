/**
 * Broker calculators for UAE property: purchase costs, mortgage eligibility, off-plan payment schedules,
 * rental yield, commission split and Golden Visa. Pure functions, unit-tested; figures come from
 * lib/market/uae.ts and are estimates.
 */
import { FEES, COMMON, MORTGAGE, GOLDEN_VISA, type Emirate } from "./uae";

const r2 = (n: number) => Math.round(n * 100) / 100;
const vat = (n: number) => n * (COMMON.vatPct / 100);

export interface CostLine { label: string; amount: number; note?: string }

/** Everything a buyer pays on top of the price, itemised. */
export function purchaseCosts(o: { price: number; emirate?: Emirate; status: "ready" | "offplan" | "offplan_resale"; financing: "cash" | "mortgage"; loan?: number; resale?: boolean; agencyPct?: number }) {
  // An off-plan resale (buying a unit still under construction from an investor) pays the Oqood transfer like
  // off-plan, plus agency and the developer's transfer charge like a resale.
  if (o.status === "offplan_resale") return purchaseCosts({ ...o, status: "offplan", resale: true, offplanResale: true } as Parameters<typeof purchaseCosts>[0]);
  const offplanResale = (o as { offplanResale?: boolean }).offplanResale === true;
  const em = o.emirate ?? "dubai";
  const f = FEES[em];
  const lines: CostLine[] = [];
  lines.push({ label: o.status === "offplan" && em === "dubai" ? "DLD Oqood registration (4%)" : `Transfer fee (${f.transferPct}%)`, amount: o.price * f.transferPct / 100, note: f.transferNote });
  if (o.status === "ready" && f.adminFixed) lines.push({ label: "Land department admin fee", amount: f.adminFixed });
  if (o.status === "offplan" && f.offplanAdminFixed) lines.push({ label: "Oqood admin fee", amount: f.offplanAdminFixed, note: "Developers may add their own admin fee (about AED 1,000 to 6,000)." });
  if (o.status === "ready" && f.trustee) {
    const t = o.price < 500_000 ? f.trustee.underAed500k : f.trustee.overAed500k;
    lines.push({ label: "Registration trustee fee (incl. VAT)", amount: t + vat(t) });
  }
  const resale = o.resale ?? o.status === "ready";
  if (resale) {
    const pct = o.agencyPct ?? COMMON.agencyPct;
    const fee = o.price * pct / 100;
    lines.push({ label: `Agency commission (${pct}% + VAT)`, amount: fee + vat(fee) });
    lines.push(offplanResale
      ? { label: "Developer transfer fee (ask the developer)", amount: 1500, note: "Developers set their own charge for transferring an off-plan unit, and it can be much higher than a resale NOC; some only allow transfers after a share of the price is paid." }
      : { label: "Developer NOC (typical)", amount: 1500, note: `Usually AED ${COMMON.nocRange[0].toLocaleString("en-US")} to ${COMMON.nocRange[1].toLocaleString("en-US")}, often paid by the seller.` });
  }
  if (o.financing === "mortgage") {
    const loan = o.loan ?? 0;
    const offplanNote = o.status === "offplan" ? "Most banks lend on off-plan homes only at handover, so these fees usually fall due then." : undefined;
    if (f.mortgageRegPct !== null) lines.push({ label: `Mortgage registration (${f.mortgageRegPct}% + AED ${f.mortgageRegFixed})`, amount: loan * f.mortgageRegPct / 100 + f.mortgageRegFixed, note: offplanNote });
    const arr = loan * COMMON.bankArrangementPct / 100;
    lines.push({ label: "Bank arrangement fee (up to 1% + VAT)", amount: arr + vat(arr), note: "Many banks waive or cap it." });
    lines.push({ label: "Property valuation", amount: COMMON.valuationFee });
  }
  const fees = lines.reduce((a, l) => a + l.amount, 0);
  const downPayment = o.financing === "mortgage" ? o.price - (o.loan ?? 0) : o.price;
  return { lines: lines.map((l) => ({ ...l, amount: r2(l.amount) })), fees: r2(fees), feesPct: r2(fees / o.price * 100), cashNeeded: r2(downPayment + fees), downPayment: r2(downPayment) };
}

/** Monthly payment on an amortising loan. */
export function monthlyPayment(loan: number, ratePct: number, years: number) {
  const r = ratePct / 1200, n = years * 12;
  if (n <= 0) return 0;
  return r === 0 ? loan / n : (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

/** What a buyer can borrow under UAE Central Bank rules, and whether their income supports it. */
export function mortgageEligibility(o: { price: number; residency: "expat" | "national"; firstHome?: boolean; offplan?: boolean; monthlyIncome: number; monthlyDebts?: number; age: number; ratePct: number; years?: number }) {
  const L = MORTGAGE.ltv;
  const first = o.firstHome ?? true;
  const ltv = o.offplan ? L.offPlan
    : o.residency === "national" ? (first ? (o.price <= 5_000_000 ? L.nationalFirstUnder5m : L.nationalFirstOver5m) : L.nationalSecondHome)
    : (first ? (o.price <= 5_000_000 ? L.expatFirstUnder5m : L.expatFirstOver5m) : L.expatSecondHome);
  const ageCap = o.residency === "national" ? MORTGAGE.maxAgeAtEnd.national : MORTGAGE.maxAgeAtEnd.expat;
  const years = Math.max(0, Math.min(o.years ?? MORTGAGE.maxYears, MORTGAGE.maxYears, ageCap - o.age));
  const maxLoanByLtv = o.price * ltv / 100;
  const room = Math.max(0, o.monthlyIncome * MORTGAGE.dbrMaxPct / 100 - (o.monthlyDebts ?? 0));
  const pay1 = years ? monthlyPayment(1, o.ratePct, years) : Infinity;
  const maxLoanByIncome = years ? room / pay1 : 0;
  const loan = Math.max(0, Math.min(maxLoanByLtv, maxLoanByIncome));
  const payment = years ? monthlyPayment(loan, o.ratePct, years) : 0;
  const limitedBy = !years ? "age" : maxLoanByIncome < maxLoanByLtv ? "income" : "ltv";
  return {
    ltvPct: ltv, years, maxLoanByLtv: r2(maxLoanByLtv), maxLoanByIncome: r2(maxLoanByIncome), loan: r2(loan), payment: r2(payment),
    downPayment: r2(o.price - loan), dbrPct: o.monthlyIncome ? r2(((o.monthlyDebts ?? 0) + payment) / o.monthlyIncome * 100) : 0,
    limitedBy: limitedBy as "ltv" | "income" | "age",
    // UAE-national and second-home caps (and the national age limit) are common practice but unconfirmed by our sources.
    unconfirmed: !o.offplan && (o.residency === "national" || !first),
  };
}

/**
 * An off-plan payment schedule from a plan written like "10/50/40" (booking/construction/handover), "60/40",
 * or with a post-handover share paid monthly. Dates are months from booking.
 */
export function offplanSchedule(o: { price: number; bookingPct: number; constructionPct: number; handoverPct: number; postHandoverPct?: number; monthsToHandover: number; constructionInstalments?: number; postHandoverMonths?: number; start?: Date }) {
  const post = o.postHandoverPct ?? 0;
  const total = o.bookingPct + o.constructionPct + o.handoverPct + post;
  if (Math.round(total) !== 100) throw new Error(`The plan adds up to ${total}%, not 100%.`);
  const start = o.start ?? new Date();
  const at = (m: number) => addMonths(start, m);
  const rows: { month: number; date: string; label: string; pct: number; amount: number }[] = [];
  rows.push({ month: 0, date: at(0), label: "Booking", pct: o.bookingPct, amount: o.price * o.bookingPct / 100 });
  const n = Math.max(1, o.constructionInstalments ?? Math.max(1, Math.round(o.monthsToHandover / 6)));
  if (o.constructionPct > 0) for (let i = 1; i <= n; i++) {
    const m = Math.round(i * o.monthsToHandover / (n + 1));
    rows.push({ month: m, date: at(m), label: `Construction ${i} of ${n}`, pct: o.constructionPct / n, amount: o.price * o.constructionPct / 100 / n });
  }
  if (o.handoverPct > 0) rows.push({ month: o.monthsToHandover, date: at(o.monthsToHandover), label: "Handover", pct: o.handoverPct, amount: o.price * o.handoverPct / 100 });
  if (post > 0) {
    const pm = Math.max(1, o.postHandoverMonths ?? 24);
    rows.push({ month: o.monthsToHandover + 1, date: at(o.monthsToHandover + 1), label: `Post-handover: ${pm} monthly payments`, pct: post, amount: o.price * post / 100 });
  }
  return {
    rows: rows.map((r) => ({ ...r, pct: r2(r.pct), amount: r2(r.amount) })),
    monthlyPostHandover: post ? r2(o.price * post / 100 / Math.max(1, o.postHandoverMonths ?? 24)) : 0,
    beforeHandover: r2(o.price * (o.bookingPct + o.constructionPct) / 100),
  };
}

/** Calendar date `m` months after `start`, clamped to the month's last day (31 Jan + 1 = 28/29 Feb), as YYYY-MM-DD. */
export function addMonths(start: Date, m: number) {
  const y = start.getFullYear(), mo = start.getMonth() + m, d = start.getDate();
  const last = new Date(y, mo + 1, 0).getDate();
  const out = new Date(y, mo, Math.min(d, last));
  return `${out.getFullYear()}-${String(out.getMonth() + 1).padStart(2, "0")}-${String(out.getDate()).padStart(2, "0")}`;
}

/**
 * "1% monthly" plans (Danube, Samana and others): a booking payment, then a fixed share every month until
 * the price is paid, often running past handover.
 */
export function monthlySchedule(o: { price: number; bookingPct: number; monthlyPct: number; monthsToHandover: number; handoverPct?: number; start?: Date }) {
  const handover = o.handoverPct ?? 0;
  const rest = 100 - o.bookingPct - handover;
  if (rest <= 0 || o.monthlyPct <= 0) throw new Error("The booking and handover payments already cover the whole price.");
  const months = Math.ceil(rest / o.monthlyPct - 1e-9);
  const start = o.start ?? new Date();
  const before = Math.min(months, o.monthsToHandover), after = months - before;
  const per = o.price * o.monthlyPct / 100;
  const lastPct = rest - o.monthlyPct * (months - 1);
  const rows = [{ month: 0, date: addMonths(start, 0), label: "Booking", pct: o.bookingPct, amount: r2(o.price * o.bookingPct / 100) }];
  if (before) rows.push({ month: 1, date: addMonths(start, 1), label: `Monthly ${o.monthlyPct}%: ${before} payments before handover`, pct: r2(o.monthlyPct * before - (after ? 0 : o.monthlyPct - lastPct)), amount: r2(per * before - (after ? 0 : (o.monthlyPct - lastPct) * o.price / 100)) });
  if (handover) rows.push({ month: o.monthsToHandover, date: addMonths(start, o.monthsToHandover), label: "Handover", pct: handover, amount: r2(o.price * handover / 100) });
  if (after) rows.push({ month: o.monthsToHandover + 1, date: addMonths(start, o.monthsToHandover + 1), label: `Monthly ${o.monthlyPct}%: ${after} payments after handover`, pct: r2(o.monthlyPct * (after - 1) + lastPct), amount: r2(per * (after - 1) + lastPct * o.price / 100) });
  // Paid before handover = booking + the monthly rows that fall before it (the last of them may be a part payment).
  const beforeHandover = rows.filter((r) => r.label === "Booking" || r.label.endsWith("before handover")).reduce((a, r) => a + r.amount, 0);
  return { rows, months, monthlyAmount: r2(per), endsOn: addMonths(start, months), beforeHandover: r2(beforeHandover) };
}

/** Parse "1% monthly", "20% + 1% monthly", "10 / 1% monthly / 10 handover" into a monthly plan. */
export function parseMonthlyPlan(s: string) {
  const m = s.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:a|per|\/)?\s*(?:monthly|month|mo\b|شهري)/i);
  if (!m) return null;
  const nums = (s.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  const monthlyPct = Number(m[1]);
  const idx = nums.indexOf(monthlyPct);
  const bookingPct = idx > 0 ? nums[0] : 10;
  const handoverMatch = s.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:on\s*)?handover/i);
  return { bookingPct, monthlyPct, handoverPct: handoverMatch ? Number(handoverMatch[1]) : 0 };
}

/** Parse "60/40", "10/50/40", "20/40/40 post" style plans into percentages. */
export function parsePlan(s: string) {
  const parts = s.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  const post = /post/i.test(s);
  if (parts.length === 2) return { bookingPct: 10, constructionPct: parts[0] - 10, handoverPct: post ? 0 : parts[1], postHandoverPct: post ? parts[1] : 0 };
  if (parts.length === 3) return { bookingPct: parts[0], constructionPct: parts[1], handoverPct: post ? 0 : parts[2], postHandoverPct: post ? parts[2] : 0 };
  return null;
}

/** Gross and net rental yield. */
export function rentalYield(o: { price: number; annualRent: number; sizeSqft?: number; serviceChargePsf?: number; managementPct?: number; vacancyWeeks?: number; otherCosts?: number }) {
  const service = (o.sizeSqft ?? 0) * (o.serviceChargePsf ?? 0);
  const effectiveRent = o.annualRent * (52 - (o.vacancyWeeks ?? 0)) / 52;
  const mgmt = effectiveRent * (o.managementPct ?? 0) / 100;
  const net = effectiveRent - service - mgmt - (o.otherCosts ?? 0);
  return { grossPct: r2(o.annualRent / o.price * 100), netPct: r2(net / o.price * 100), netIncome: r2(net), serviceCharges: r2(service), management: r2(mgmt) };
}

/** Who gets what from a sale commission. */
export function commissionSplit(o: { price: number; ratePct?: number; coBroke?: boolean; ourSharePct?: number; agentSharePct: number }) {
  const gross = o.price * (o.ratePct ?? COMMON.agencyPct) / 100;
  const ours = o.coBroke ? gross * (o.ourSharePct ?? 50) / 100 : gross;
  const agent = ours * o.agentSharePct / 100;
  return { gross: r2(gross), vatOnGross: r2(vat(gross)), ourShare: r2(ours), agent: r2(agent), brokerage: r2(ours - agent) };
}

/** A first read on Golden Visa eligibility through property, in English or Arabic. */
export function goldenVisaCheck(o: { value: number; mortgaged?: boolean; offplan?: boolean; emirate?: Emirate; lang?: "en" | "ar" }) {
  const ar = o.lang === "ar";
  const ok = o.value >= GOLDEN_VISA.thresholdAed;
  const short = (GOLDEN_VISA.thresholdAed - o.value).toLocaleString("en-US");
  const notes: string[] = [];
  if (!ok) notes.push(ar ? `يلزم عقار بقيمة مليوني درهم على الأقل حسب التقييم الرسمي (نحو ${short} درهم إضافية).` : `Needs at least AED ${GOLDEN_VISA.thresholdAed.toLocaleString("en-US")} of property at the official valuation (about AED ${short} more).`);
  if (o.mortgaged) notes.push(ar ? "العقار المرهون يحتاج إلى خطاب عدم ممانعة من البنك." : "Mortgaged property needs a no-objection letter from the bank.");
  if (o.offplan) notes.push(ar ? "العقار على الخارطة يتأهل عند شرائه من مطوّر معتمد." : "Off-plan qualifies when bought from an approved developer.");
  if (o.emirate === "abu_dhabi" && o.mortgaged) notes.push(ar ? "تطبّق أبوظبي قواعد أشد على العقار الممول." : "Abu Dhabi applies stricter rules to financed property.");
  const confirm = ar ? "تغيّرت القواعد عدة مرات في 2026، فتحقق مع الهيئة الاتحادية للهوية أو الإقامة أو دائرة الأراضي قبل تقديم المشورة." : GOLDEN_VISA.note;
  return { likelyEligible: ok, notes, confirm };
}
