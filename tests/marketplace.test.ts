import { describe, it, expect } from "vitest";
import { confidence, nightAnswer, parseDesk, dealPack, demandRadar, type Listing } from "@/lib/market/marketplace";

const H = 3_600_000, now = Date.UTC(2026, 10, 19, 20, 30);

describe("availability confidence", () => {
  const pace = { soldPerDay: 2, remaining: 60 };
  it("is high for a fresh developer-desk reading on a slow project", () => {
    const c = confidence([{ kind: "developer-desk", at: now - 2 * H, state: "available" }], pace, now)!;
    expect(c.state).toBe("available");
    expect(c.confidence).toBeGreaterThanOrEqual(95);
  });
  it("decays with age and with how fast the project sells", () => {
    const old = confidence([{ kind: "price-list", at: now - 48 * H, state: "available" }], pace, now)!;
    const hot = confidence([{ kind: "price-list", at: now - 48 * H, state: "available" }], { soldPerDay: 20, remaining: 60 }, now)!;
    expect(old.confidence).toBeLessThan(90);
    expect(hot.confidence).toBeLessThan(old.confidence);
    expect(hot.confidence).toBeLessThan(80);
  });
  it("drops for each sale the Land Department registered since", () => {
    const base = confidence([{ kind: "aggregator", at: now - 6 * H, state: "available" }], pace, now)!;
    const after = confidence([{ kind: "aggregator", at: now - 6 * H, state: "available" }], { ...pace, registeredSince: 12 }, now)!;
    expect(after.confidence).toBeLessThan(base.confidence * 0.85);
  });
  it("lets a newer sold signal win over an older available one", () => {
    const c = confidence([{ kind: "price-list", at: now - 30 * H, state: "available" }, { kind: "whatsapp-group", at: now - 3 * H, state: "sold" }], pace, now)!;
    expect(c.state).toBe("sold");
  });
  it("rises a little when an independent source agrees", () => {
    const one = confidence([{ kind: "price-list", at: now - 10 * H, state: "available" }], pace, now)!;
    const two = confidence([{ kind: "price-list", at: now - 10 * H, state: "available" }, { kind: "aggregator", at: now - 12 * H, state: "available" }], pace, now)!;
    expect(two.confidence).toBe(one.confidence + 3);
  });
});

describe("night answer", () => {
  const mk = (code: string, area: string, beds: number, price: number, conf: number, state: "available" | "sold" = "available"): Listing =>
    ({ code, project: "p", area, developer: "d", beds, price, conf: { state, confidence: conf, basis: "price-list", at: now } });
  const all = [mk("A", "Creek", 2, 2.4e6, 64), mk("B", "Creek", 2, 2.5e6, 91), mk("C", "Creek", 3, 2.45e6, 88), mk("D", "Marina", 2, 2.4e6, 95), mk("E", "Creek", 2, 2.3e6, 70)];
  it("quotes at 80% or higher", () => expect(nightAnswer(all[1], all).action).toBe("quote"));
  it("confirms first below 80% and offers the two closest sure units, same area first", () => {
    const r = nightAnswer(all[0], all);
    expect(r.action).toBe("confirm-first");
    expect(r.alternatives.map((x) => x.code)).toEqual(["B", "C"]);
  });
  it("says sold when it is sold", () => expect(nightAnswer(mk("Z", "Creek", 2, 2e6, 95, "sold"), all).action).toBe("sold"));
});

describe("reply desk", () => {
  it("reads plain English updates", () => {
    expect(parseDesk("A-1204 sold\nB-2211 now 2.85M\nA-3902, A-3903 on hold")).toEqual([
      { code: "A-1204", state: "sold" }, { code: "B-2211", price: 2_850_000 }, { code: "A-3902", state: "held" }, { code: "A-3903", state: "held" },
    ]);
  });
  it("reads Arabic updates", () => {
    expect(parseDesk("G1-2804 مباعة\nB-2211 السعر 2.9 مليون")).toEqual([{ code: "G1-2804", state: "sold" }, { code: "B-2211", price: 2_900_000 }]);
  });
  it("reads a release with a new price", () => {
    expect(parseDesk("A-4108 released, AED 3,950,000")).toEqual([{ code: "A-4108", state: "available", price: 3_950_000 }]);
  });
  it("ignores chat that isn't an update", () => {
    expect(parseDesk("Good morning team, launch at 9")).toEqual([]);
  });
});

describe("deal pack", () => {
  const today = new Date("2026-11-19");
  it("is ready when everything is in", () => {
    const r = dealPack({ unitRequested: "A-1204", passport: { name: "x", number: "1", expires: "2030-01-01", nationality: "GB" }, proofOfFunds: { kind: "bank statement", amount: 600_000 }, eoiPaid: { amount: 50_000, to: "developer" }, holdQueued: { position: 1, opensAt: "09:00" } }, today, 2_500_000);
    expect(r.ready).toBe(true);
  });
  it("flags a passport expiring soon and short funds", () => {
    const r = dealPack({ unitRequested: "A-1204", passport: { name: "x", number: "1", expires: "2027-02-01", nationality: "GB" }, proofOfFunds: { kind: "bank statement", amount: 300_000 } }, today, 2_500_000);
    expect(r.missing).toEqual(["Passport", "Proof of funds", "Refundable deposit to the developer", "Hold request queued"]);
  });
});

describe("demand radar", () => {
  it("groups consenting qualified asks and hides small groups", () => {
    const asks = [
      ...Array.from({ length: 6 }, (_, i) => ({ area: "Creek", beds: 2, budget: 2.2e6 + i * 1e4, consent: true, qualified: true })),
      ...Array.from({ length: 3 }, () => ({ area: "Hills", beds: 4, budget: 6e6, consent: true, qualified: true })),
      { area: "Creek", beds: 2, budget: 2.3e6, consent: false, qualified: true },
      { area: "Creek", beds: 2, budget: 2.3e6, consent: true, qualified: false },
    ];
    const r = demandRadar(asks);
    expect(r.rows).toEqual([{ area: "Creek", beds: 2, under: 2_500_000, count: 6, median: 2_230_000 }]);
    expect(r.hidden).toBe(3);
  });
});
