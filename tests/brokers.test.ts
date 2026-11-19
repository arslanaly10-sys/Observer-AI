import { describe, it, expect } from "vitest";
import { normalisePhone, normaliseEmail, sameClient, protection, check, requestHold, settle, deposit, PROTECTION_DAYS, type Registration, type UnitHolds } from "@/lib/brokers/rules";

const DAY = 86_400_000, HOUR = 3_600_000;
const t0 = Date.UTC(2026, 10, 1);
const reg = (o: Partial<Registration>): Registration => ({ id: "r", broker: "A", client: "Lina", phone: "+971 50 123 4567", project: "p1", registeredAt: t0, activity: [], ...o });

describe("matching", () => {
  it("normalises UAE and KSA phone forms", () => {
    expect(normalisePhone("050 123 4567")).toBe("971501234567");
    expect(normalisePhone("+971-50-123-4567")).toBe("971501234567");
    expect(normalisePhone("00971501234567")).toBe("971501234567");
    expect(normalisePhone("055 123 4567", "SA")).toBe("966551234567");
  });
  it("normalises Gmail addresses", () => {
    expect(normaliseEmail(" Lina.Haddad+launch@GMail.com ")).toBe("linahaddad@gmail.com");
    expect(normaliseEmail("lina.haddad@company.ae")).toBe("lina.haddad@company.ae");
  });
  it("matches on phone or email", () => {
    expect(sameClient({ phone: "0501234567" }, { phone: "+971501234567" })).toBe(true);
    expect(sameClient({ email: "a.b@gmail.com" }, { email: "ab@gmail.com" })).toBe(true);
    expect(sameClient({ phone: "0501234567" }, { phone: "0509999999" })).toBe(false);
  });
});

describe("protection", () => {
  it("lasts 30 days from registration", () => {
    expect(protection(reg({}), t0 + 10 * DAY)).toMatchObject({ status: "protected", daysLeft: 20 });
    expect(protection(reg({}), t0 + 25 * DAY).status).toBe("expiring");
    expect(protection(reg({}), t0 + PROTECTION_DAYS * DAY).status).toBe("released");
  });
  it("renews on a call, viewing or offer but not on a message", () => {
    const r = reg({ activity: [{ kind: "viewing", at: t0 + 20 * DAY }, { kind: "message", at: t0 + 40 * DAY }] });
    expect(protection(r, t0 + 45 * DAY)).toMatchObject({ status: "expiring", daysLeft: 5 });
    expect(protection(r, t0 + 50 * DAY).status).toBe("released");
  });
});

describe("registration check", () => {
  const owner = reg({ id: "o", broker: "A" });
  it("is clear for a new client", () => {
    expect(check(reg({ broker: "B", phone: "0509999999" }), [owner], t0 + 5 * DAY).kind).toBe("clear");
  });
  it("tells the second broker who owns the client", () => {
    const v = check(reg({ broker: "B", registeredAt: t0 + 5 * DAY }), [owner], t0 + 5 * DAY);
    expect(v).toMatchObject({ kind: "owned", daysLeft: 25 });
  });
  it("is clear once the owner's protection has lapsed", () => {
    expect(check(reg({ broker: "B", registeredAt: t0 + 31 * DAY }), [owner], t0 + 31 * DAY).kind).toBe("clear");
  });
  it("is a dispute when both registered within a day", () => {
    expect(check(reg({ broker: "B", registeredAt: t0 + 3 * HOUR }), [owner], t0 + 4 * HOUR).kind).toBe("dispute");
  });
  it("is a dispute when the newcomer logged contact first", () => {
    const v = check(reg({ broker: "B", registeredAt: t0 + 3 * DAY, activity: [{ kind: "viewing", at: t0 - DAY }] }), [owner], t0 + 3 * DAY);
    expect(v.kind).toBe("dispute");
  });
  it("ignores other projects", () => {
    expect(check(reg({ broker: "B", project: "p2", registeredAt: t0 + 2 * DAY }), [owner], t0 + 2 * DAY).kind).toBe("clear");
  });
});

describe("unit holds", () => {
  const empty: UnitHolds = { unit: "A-1204", queue: [] };
  it("gives one active hold and queues the rest in order", () => {
    const a = requestHold(empty, { broker: "A", client: "Lina", requestedAt: t0 }, t0);
    expect(a.outcome).toBe("held");
    const b = requestHold(a.state, { broker: "B", client: "Omar", requestedAt: t0 + HOUR }, t0 + HOUR);
    expect(b).toMatchObject({ outcome: "queued", position: 1 });
    const c = requestHold(b.state, { broker: "C", client: "Sara", requestedAt: t0 + 2 * HOUR }, t0 + 2 * HOUR);
    expect(c.position).toBe(2);
    expect(c.state.active?.broker).toBe("A");
  });
  it("releases a lapsed hold to the next in queue", () => {
    let s = requestHold(empty, { broker: "A", client: "Lina", requestedAt: t0 }, t0).state;
    s = requestHold(s, { broker: "B", client: "Omar", requestedAt: t0 + HOUR }, t0 + HOUR).state;
    const later = settle(s, t0 + 49 * HOUR);
    expect(later.active?.broker).toBe("B");
    expect(later.active?.expiresAt).toBe(t0 + 96 * HOUR);
    expect(later.queue).toHaveLength(0);
  });
  it("frees the unit when nobody is queued", () => {
    const s = requestHold(empty, { broker: "A", client: "Lina", requestedAt: t0 }, t0).state;
    expect(settle(s, t0 + 49 * HOUR).active).toBeUndefined();
  });
  it("a deposit reserves the unit and clears the queue", () => {
    let s = requestHold(empty, { broker: "A", client: "Lina", requestedAt: t0 }, t0).state;
    s = requestHold(s, { broker: "B", client: "Omar", requestedAt: t0 + HOUR }, t0 + HOUR).state;
    s = deposit(s, "A", t0 + 2 * HOUR);
    expect(s.active?.deposit).toBe(true);
    expect(settle(s, t0 + 100 * HOUR).active?.broker).toBe("A");
    expect(requestHold(s, { broker: "C", client: "Sara", requestedAt: t0 + 3 * HOUR }, t0 + 3 * HOUR).outcome).toBe("sold");
  });
});
