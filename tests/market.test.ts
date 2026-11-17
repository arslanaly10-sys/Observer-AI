import { describe, it, expect } from "vitest";
import { purchaseCosts, mortgageEligibility, offplanSchedule, parsePlan, rentalYield, commissionSplit, goldenVisaCheck, monthlyPayment } from "@/lib/market/calc";
import { AREAS, DEVELOPERS, SOURCES, findArea, findDeveloper } from "@/lib/market/uae";

describe("purchase costs", () => {
  it("itemises a Dubai resale bought in cash", () => {
    const c = purchaseCosts({ price: 2_000_000, status: "ready", financing: "cash" });
    const by = Object.fromEntries(c.lines.map((l) => [l.label, l.amount]));
    expect(by["Transfer fee (4%)"]).toBe(80_000);
    expect(by["Land department admin fee"]).toBe(580);
    expect(by["Registration trustee fee (incl. VAT)"]).toBe(4200);
    expect(by["Agency commission (2% + VAT)"]).toBe(42_000);
    expect(c.cashNeeded).toBe(2_000_000 + c.fees);
  });
  it("adds mortgage fees and keeps the down payment separate", () => {
    const c = purchaseCosts({ price: 2_000_000, status: "ready", financing: "mortgage", loan: 1_600_000 });
    expect(c.lines.find((l) => l.label.startsWith("Mortgage registration"))!.amount).toBe(4290);
    expect(c.downPayment).toBe(400_000);
  });
  it("uses Oqood and skips agency on off-plan from the developer", () => {
    const c = purchaseCosts({ price: 1_500_000, status: "offplan", financing: "cash" });
    expect(c.lines[0].label).toMatch(/Oqood/);
    expect(c.lines.some((l) => l.label.startsWith("Agency"))).toBe(false);
  });
  it("uses Abu Dhabi's 2% transfer fee", () => {
    expect(purchaseCosts({ price: 1_000_000, emirate: "abu_dhabi", status: "ready", financing: "cash", resale: false }).lines[0].amount).toBe(20_000);
  });
});

describe("mortgage eligibility", () => {
  it("caps an expat's first home under AED 5M at 80% loan-to-value", () => {
    const m = mortgageEligibility({ price: 2_000_000, residency: "expat", monthlyIncome: 100_000, age: 35, ratePct: 4.5 });
    expect(m.ltvPct).toBe(80);
    expect(m.loan).toBe(1_600_000);
    expect(m.limitedBy).toBe("ltv");
    expect(m.years).toBe(25);
  });
  it("caps off-plan at 50% and above AED 5M at 70% for expats", () => {
    expect(mortgageEligibility({ price: 2e6, residency: "expat", offplan: true, monthlyIncome: 1e5, age: 30, ratePct: 4.5 }).ltvPct).toBe(50);
    expect(mortgageEligibility({ price: 6e6, residency: "expat", monthlyIncome: 3e5, age: 30, ratePct: 4.5 }).ltvPct).toBe(70);
    expect(mortgageEligibility({ price: 2e6, residency: "national", monthlyIncome: 1e5, age: 30, ratePct: 4.5 }).ltvPct).toBe(85);
  });
  it("limits the loan by the 50% debt-burden rule and by age", () => {
    const m = mortgageEligibility({ price: 3_000_000, residency: "expat", monthlyIncome: 20_000, monthlyDebts: 2_000, age: 50, ratePct: 4.5 });
    expect(m.years).toBe(15); // ends at 65
    expect(m.limitedBy).toBe("income");
    expect(m.payment).toBeLessThanOrEqual(8_000.01);
  });
  it("computes a standard amortising payment", () => {
    expect(Math.round(monthlyPayment(1_000_000, 4.5, 25))).toBe(5558);
  });
});

describe("off-plan schedules", () => {
  it("builds a 10/50/40 schedule that adds up to the price", () => {
    const s = offplanSchedule({ price: 1_000_000, bookingPct: 10, constructionPct: 50, handoverPct: 40, monthsToHandover: 30, constructionInstalments: 5, start: new Date("2026-12-01") });
    expect(s.rows.reduce((a, r) => a + r.amount, 0)).toBeCloseTo(1_000_000, 0);
    expect(s.rows[0]).toMatchObject({ label: "Booking", amount: 100_000, date: "2026-12-01" });
    expect(s.rows.at(-1)).toMatchObject({ label: "Handover", amount: 400_000 });
  });
  it("handles post-handover plans and rejects plans that don't add to 100%", () => {
    const s = offplanSchedule({ price: 1_200_000, bookingPct: 20, constructionPct: 20, handoverPct: 20, postHandoverPct: 40, postHandoverMonths: 36, monthsToHandover: 24 });
    expect(s.monthlyPostHandover).toBe(13_333.33);
    expect(() => offplanSchedule({ price: 1, bookingPct: 10, constructionPct: 10, handoverPct: 10, monthsToHandover: 12 })).toThrow(/100%/);
  });
  it("reads plan shorthand", () => {
    expect(parsePlan("60/40")).toEqual({ bookingPct: 10, constructionPct: 50, handoverPct: 40, postHandoverPct: 0 });
    expect(parsePlan("20/40/40 post-handover")).toEqual({ bookingPct: 20, constructionPct: 40, handoverPct: 0, postHandoverPct: 40 });
  });
});

describe("yield, commission, Golden Visa", () => {
  it("separates gross and net yield", () => {
    const y = rentalYield({ price: 1_000_000, annualRent: 80_000, sizeSqft: 800, serviceChargePsf: 15, managementPct: 5 });
    expect(y.grossPct).toBe(8);
    expect(y.netPct).toBe(6.4);
  });
  it("splits a co-broked commission", () => {
    expect(commissionSplit({ price: 3_000_000, coBroke: true, ourSharePct: 50, agentSharePct: 60 })).toMatchObject({ gross: 60_000, ourShare: 30_000, agent: 18_000, brokerage: 12_000 });
  });
  it("checks the AED 2M Golden Visa line", () => {
    expect(goldenVisaCheck({ value: 2_100_000 }).likelyEligible).toBe(true);
    expect(goldenVisaCheck({ value: 1_500_000 }).notes[0]).toMatch(/500,000 more/);
  });
});

describe("market data", () => {
  it("cites a real source for every area and developer", () => {
    for (const x of [...AREAS, ...DEVELOPERS]) for (const s of x.sources) expect(SOURCES[s].url).toMatch(/^https:\/\//);
  });
  it("finds areas and developers by everyday names", () => {
    expect(findArea("JVC")?.id).toBe("jvc");
    expect(findArea("dubai marina")?.id).toBe("marina");
    expect(findArea("دبي مارينا")?.id).toBe("marina");
    expect(findDeveloper("Emaar Properties")?.id).toBe("emaar");
    expect(findArea("Atlantis Moon")).toBeNull();
  });
});

describe("area matching", () => {
  it("never confuses areas that share a word", () => {
    expect(findArea("Dubai Hills")?.id).toBe("dubai-hills");
    expect(findArea("villa in Dubai Hills Estate")?.id).toBe("dubai-hills");
    expect(findArea("Dubai Marina")?.id).toBe("marina");
    expect(findArea("DAMAC Lagoons")?.id).toBe("damac-lagoons");
    expect(findArea("Dubai")).toBeNull();
  });
});
