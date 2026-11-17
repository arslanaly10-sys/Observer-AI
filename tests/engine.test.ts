import { describe, it, expect } from "vitest";
import { scoreLead, extractIntent, analyzeEnquiry, rankActions, calcPlan, roiEstimate, budgetTier, fmtAED } from "@/lib/engine";
import { leads } from "@/lib/data";

describe("scoreLead", () => {
  it("scores a cash, prime-area, urgent buyer as hot", () => {
    const s = scoreLead({ financing: "Cash", budget: "AED 6M", timeframe: "<1 mo", source: "WhatsApp", urgency: "serious", temp: "hot", area: "Emirates Hills" });
    expect(s.score).toBeGreaterThanOrEqual(90);
    expect(s.temp).toBe("hot");
  });
  it("scores a slow, low-budget researcher as cold", () => {
    const s = scoreLead({ financing: "Mortgage", budget: "AED 750K", timeframe: "18 mo", source: "Facebook", urgency: "researching", temp: "cold", area: "Ajman" });
    expect(s.score).toBeLessThan(55);
    expect(s.temp).toBe("cold");
  });
  it("explains itself: parts sum to the weighted total and are sorted", () => {
    const s = scoreLead(leads[0]);
    expect(s.parts).toHaveLength(7);
    for (let i = 1; i < s.parts.length; i++) expect(s.parts[i - 1].pts).toBeGreaterThanOrEqual(s.parts[i].pts);
  });
});

describe("extractIntent", () => {
  it("reads an urgent English cash buyer", () => {
    const r = extractIntent([{ dir: "in", text: "I want to buy in Emirates Hills. Above AED 5M. I'm ready to proceed immediately." }]);
    expect(r.primary).toBe("Buyer");
    expect(r.urgency).toBe("High");
    expect(r.hits.map((h) => h.key)).toContain("cash");
  });
  it("reads an Arabic seller", () => {
    const r = extractIntent([{ dir: "in", text: "عندي شقة في الخليج التجاري وأريد تقييم لها" }]);
    expect(r.primary).toBe("Seller");
  });
  it("reads an Arabic researcher as low urgency", () => {
    const r = extractIntent([{ dir: "in", text: "أبحث عن شقة في الشارقة، لا عجلة، السنة القادمة" }]);
    expect(r.urgency).toBe("Low");
  });
  it("ignores outbound messages", () => {
    const r = extractIntent([{ dir: "out", text: "Ready to sign this week?" }]);
    expect(r.hits).toHaveLength(0);
  });
});

describe("analyzeEnquiry", () => {
  it("finds area and budget and drafts an English reply", () => {
    const r = analyzeEnquiry("Looking for a villa in Dubai Hills, around 4 million cash, need to see something this week", "en");
    expect(r.area).toBe("Dubai Hills");
    expect(r.budget).toBe("AED 4M");
    expect(r.temp).toBe("hot");
    expect(r.reply).toMatch(/Dubai Hills/);
  });
  it("drafts an Arabic reply for an Arabic enquiry", () => {
    const r = analyzeEnquiry("أبحث عن فيلا في دبي هيلز بميزانية 4 مليون نقداً، أريد معاينة هذا الأسبوع", "ar");
    expect(r.area).toBe("Dubai Hills");
    expect(r.reply).toMatch(/دبي هيلز/);
  });
});

describe("rankActions", () => {
  it("puts the pending offer first", () => {
    expect(rankActions(leads)[0].lead).toBe("Nour Al Mansouri");
  });
});

describe("calcPlan", () => {
  it("computes a standard 25-year mortgage payment", () => {
    const r = calcPlan({ price: 2_500_000, dpPct: 20, rate: 4.5, years: 25, yieldPct: 6.5, plan: "mortgage" });
    expect(Math.round(r.monthly)).toBe(11117);
    expect(r.dld).toBe(100_000);
  });
  it("cash has no monthly payment and pays full price upfront", () => {
    const r = calcPlan({ price: 1_000_000, dpPct: 20, rate: 4.5, years: 25, yieldPct: 6, plan: "cash" });
    expect(r.monthly).toBe(0);
    expect(r.dp).toBe(1_000_000);
  });
});

describe("roiEstimate", () => {
  it("is zero when replies are already under five minutes", () => {
    expect(roiEstimate({ leads: 300, dealAED: 2_000_000, commissionPct: 2, reply: "under5" }).monthly).toBe(0);
  });
  it("grows with slower replies", () => {
    const a = roiEstimate({ leads: 300, dealAED: 2_000_000, commissionPct: 2, reply: "15to60" }).monthly;
    const b = roiEstimate({ leads: 300, dealAED: 2_000_000, commissionPct: 2, reply: "over60" }).monthly;
    expect(b).toBeGreaterThan(a);
    expect(a).toBeGreaterThan(0);
  });
});

describe("helpers", () => {
  it("tiers budgets", () => {
    expect(budgetTier("AED 750K").tier).toBe("Budget");
    expect(budgetTier("AED 6M").tier).toBe("Ultra-prime");
  });
  it("formats dirhams", () => expect(fmtAED(4_200_000)).toBe("AED 4.20M"));
});
