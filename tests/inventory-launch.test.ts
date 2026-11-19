import { describe, it, expect } from "vitest";
import { freshness, quotePolicy, parsePriceList, diffLists, parseMoney } from "@/lib/inventory/freshness";
import { planHour, callbackSlots, broadcastCheck, pickOrder } from "@/lib/launch/capacity";

const H = 3_600_000, now = Date.UTC(2026, 10, 19, 9);

describe("freshness", () => {
  it("grades data age and sets the quote policy", () => {
    expect(freshness(now - 2 * H, now).level).toBe("fresh");
    expect(freshness(now - 10 * H, now).level).toBe("aging");
    expect(freshness(now - 30 * H, now).level).toBe("stale");
    expect(quotePolicy(now - 2 * H, now)).toBe("quote");
    expect(quotePolicy(now - 10 * H, now)).toBe("quote-with-date");
    expect(quotePolicy(now - 25 * H, now)).toBe("confirm-first");
  });
});

describe("price lists", () => {
  it("reads money in the forms developers use", () => {
    expect(parseMoney("3.4M")).toBe(3_400_000);
    expect(parseMoney("AED 3,400,000")).toBe(3_400_000);
    expect(parseMoney("850k")).toBe(850_000);
  });
  it("reads an English CSV with extra columns", () => {
    const r = parsePriceList("Unit No,Floor,Bedrooms,Price (AED),Status\nA-1201,12,2BR,\"2,450,000\",Available\nA-1202,12,Studio,1.1M,Sold\n,12,1BR,1.4M,Available");
    expect(r.units).toEqual([
      { code: "A-1201", beds: 2, price: 2_450_000, status: "available" },
      { code: "A-1202", beds: 0, price: 1_100_000, status: "sold" },
    ]);
    expect(r.skipped).toBe(1);
  });
  it("reads an Arabic, semicolon-separated sheet", () => {
    const r = parsePriceList("رقم الوحدة;غرف النوم;السعر;الحالة\nG1-2804;3;1860000;محجوز");
    expect(r.units[0]).toEqual({ code: "G1-2804", beds: 3, price: 1_860_000, status: "held" });
  });
  it("lists only what changed", () => {
    const a = [{ code: "1", price: 100, status: "available" as const }, { code: "2", price: 200, status: "available" as const }];
    const b = [{ code: "1", price: 110, status: "available" as const }, { code: "3", price: 300, status: "available" as const }];
    expect(diffLists(a, b)).toEqual([{ code: "1", kind: "price", from: 100, to: 110 }, { code: "3", kind: "new", to: 300 }, { code: "2", kind: "removed" }]);
  });
});

describe("launch capacity", () => {
  it("splits qualified clients between people, brokers and the waitlist", () => {
    const p = planHour({ enquiriesPerHour: 2900, qualifiedShare: 0.2, consultants: 40, perConsultantHour: 6, brokerCapacityHour: 200, overflowToBrokers: true });
    expect(p).toMatchObject({ toPeople: 240, toBrokers: 200, waitlist: 140, aiOnly: 2320 });
    expect(p.coverage).toBeCloseTo(440 / 580);
    expect(planHour({ enquiriesPerHour: 100, qualifiedShare: 0.2, consultants: 10, perConsultantHour: 6, brokerCapacityHour: 0, overflowToBrokers: false }).waitlist).toBe(0);
  });
  it("promises callbacks in order across consultants", () => {
    expect(callbackSlots(5, 2, 10)).toEqual([0, 0, 10, 10, 20]);
  });
  it("checks a broadcast against the daily WhatsApp limit", () => {
    expect(broadcastCheck(25_000, 10_000)).toEqual({ fits: false, days: 3, firstDay: 10_000, overBy: 15_000 });
  });
  it("orders paid deposits by time, then score", () => {
    expect(pickOrder([{ id: "b", paidAt: 2, score: 50 }, { id: "a", paidAt: 1, score: 10 }, { id: "c", paidAt: 2, score: 90 }]).map((x) => x.id)).toEqual(["a", "c", "b"]);
  });
});

import { gccCosts, MARKETS_2025, COUNTRIES } from "@/lib/market/gcc";
describe("GCC buying costs", () => {
  it("applies the Saudi tax and the first-home relief", () => {
    expect(gccCosts("ksa", 1_500_000).fees).toBe(75_000);
    expect(gccCosts("ksa", 1_500_000, { firstHomeCitizen: true }).fees).toBe(25_000);
  });
  it("applies Qatar and Bahrain fees", () => {
    expect(gccCosts("qatar", 2_000_000).fees).toBe(5_100);
    expect(gccCosts("bahrain", 100_000).fees).toBe(2_001);
    expect(gccCosts("bahrain", 100_000, { within60Days: true }).fees).toBe(1_701);
  });
  it("refuses to guess for countries we could not confirm", () => {
    expect(gccCosts("kuwait", 500_000)).toEqual({ lines: [], fees: 0, confirmed: false });
  });
  it("has a sourced 2025 figure for every country", () => {
    for (const c of COUNTRIES) {
      const rows = MARKETS_2025.filter((m) => m.country === c.id);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r.sources.length).toBeGreaterThan(0);
    }
  });
});
