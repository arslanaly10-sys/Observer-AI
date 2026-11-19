/**
 * Multi-broker sales rules for a developer selling one project through many agencies.
 *
 * - Client protection: the first broker to register a client keeps them for 30 days,
 *   renewed by any logged call, viewing or offer. No activity for 30 days releases them.
 * - Duplicates: phone numbers and emails are normalised before matching, so the same
 *   buyer arriving through several portals or brokers is recognised.
 * - Unit holds: one active hold per unit, timed (default 48 hours), released
 *   automatically unless a deposit arrives; other brokers queue behind it in order.
 */

export const PROTECTION_DAYS = 30;
export const HOLD_HOURS = 48;
const DAY = 86_400_000;
const HOUR = 3_600_000;

export type ActivityKind = "call" | "viewing" | "offer" | "message";
/** Activities that renew protection. A message alone does not: anyone can send one. */
export const RENEWING: ActivityKind[] = ["call", "viewing", "offer"];

export type Registration = {
  id: string;
  broker: string;
  client: string;
  phone?: string;
  email?: string;
  project: string;
  registeredAt: number;
  activity: { kind: ActivityKind; at: number }[];
};

/** Digits only, with UAE/KSA local forms mapped to international (05x… → 9715x… / 9665x…). */
export function normalisePhone(raw: string, country: "AE" | "SA" = "AE"): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = (country === "SA" ? "966" : "971") + d.slice(1);
  return d;
}

/** Lower-case, trimmed; dots and +tags removed for Gmail-style addresses. */
export function normaliseEmail(raw: string): string {
  const e = raw.trim().toLowerCase();
  const [user, domain] = e.split("@");
  if (!domain) return e;
  const gmail = domain === "gmail.com" || domain === "googlemail.com";
  const u = user.split("+")[0];
  return `${gmail ? u.replace(/\./g, "") : u}@${gmail ? "gmail.com" : domain}`;
}

export function sameClient(a: Pick<Registration, "phone" | "email">, b: Pick<Registration, "phone" | "email">): boolean {
  if (a.phone && b.phone && normalisePhone(a.phone) === normalisePhone(b.phone)) return true;
  if (a.email && b.email && normaliseEmail(a.email) === normaliseEmail(b.email)) return true;
  return false;
}

/** When protection ends: 30 days after the latest of registration or a renewing activity. */
export function protectedUntil(r: Registration): number {
  const last = r.activity.filter((a) => RENEWING.includes(a.kind)).reduce((m, a) => Math.max(m, a.at), r.registeredAt);
  return last + PROTECTION_DAYS * DAY;
}

export type Protection = { status: "protected" | "expiring" | "released"; daysLeft: number; until: number };

export function protection(r: Registration, now: number): Protection {
  const until = protectedUntil(r);
  const daysLeft = Math.ceil((until - now) / DAY);
  if (until <= now) return { status: "released", daysLeft: 0, until };
  return { status: daysLeft <= 7 ? "expiring" : "protected", daysLeft, until };
}

export type Verdict =
  | { kind: "clear" }
  | { kind: "owned"; owner: Registration; daysLeft: number }
  | { kind: "dispute"; owner: Registration; reason: string };

/**
 * Check a new registration against existing ones for the same project.
 * - Nobody holds the client, or the earlier registration has lapsed: clear.
 * - Someone holds them: owned, the new broker is told who and for how long.
 * - Someone holds them but the new broker shows a renewing activity logged before
 *   the owner's last one, or within a day of the owner's registration: a dispute
 *   for the developer's sales team to rule on.
 */
export function check(incoming: Registration, existing: Registration[], now: number): Verdict {
  const owner = existing
    .filter((r) => r.project === incoming.project && r.broker !== incoming.broker && sameClient(r, incoming))
    .filter((r) => protection(r, now).status !== "released")
    .sort((a, b) => a.registeredAt - b.registeredAt)[0];
  if (!owner) return { kind: "clear" };
  const firstIncoming = incoming.activity.filter((a) => RENEWING.includes(a.kind)).sort((a, b) => a.at - b.at)[0];
  if (firstIncoming && firstIncoming.at < owner.registeredAt) {
    return { kind: "dispute", owner, reason: "The new broker logged contact before the first registration." };
  }
  if (Math.abs(incoming.registeredAt - owner.registeredAt) < DAY) {
    return { kind: "dispute", owner, reason: "Both brokers registered the client within 24 hours." };
  }
  return { kind: "owned", owner, daysLeft: protection(owner, now).daysLeft };
}

// ------------------------------------------------------------------ unit holds

export type Hold = { broker: string; client: string; requestedAt: number; expiresAt?: number; deposit?: boolean };
export type UnitHolds = { unit: string; active?: Hold; queue: Hold[] };

/** Expire a lapsed hold and promote the next broker in the queue. Deposited holds never lapse. */
export function settle(u: UnitHolds, now: number, hours = HOLD_HOURS): UnitHolds {
  let { active, queue } = u;
  queue = [...queue];
  while (active && !active.deposit && active.expiresAt !== undefined && active.expiresAt <= now) {
    const next = queue.shift();
    active = next ? { ...next, expiresAt: active.expiresAt + hours * HOUR } : undefined; // the next hold starts when the last one lapsed
  }
  return { unit: u.unit, active, queue };
}

export type HoldResult = { state: UnitHolds; outcome: "held" | "queued" | "already-yours" | "sold"; position?: number };

/** Request a hold. Only one active hold per unit; everyone else queues in order. */
export function requestHold(u: UnitHolds, req: Omit<Hold, "expiresAt">, now: number, hours = HOLD_HOURS): HoldResult {
  const s = settle(u, now, hours);
  if (s.active?.deposit) return s.active.broker === req.broker ? { state: s, outcome: "already-yours" } : { state: s, outcome: "sold" };
  if (!s.active) return { state: { ...s, active: { ...req, expiresAt: now + hours * HOUR } }, outcome: "held" };
  if (s.active.broker === req.broker && s.active.client === req.client) return { state: s, outcome: "already-yours" };
  const existing = s.queue.findIndex((q) => q.broker === req.broker && q.client === req.client);
  if (existing >= 0) return { state: s, outcome: "queued", position: existing + 1 };
  const queue = [...s.queue, req];
  return { state: { ...s, queue }, outcome: "queued", position: queue.length };
}

/** A deposit on the active hold turns it into a reservation; the queue is released. */
export function deposit(u: UnitHolds, broker: string, now: number): UnitHolds {
  const s = settle(u, now);
  if (!s.active || s.active.broker !== broker) return s;
  return { unit: s.unit, active: { ...s.active, deposit: true, expiresAt: undefined }, queue: [] };
}
