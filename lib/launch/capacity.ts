/**
 * Launch-night capacity: when enquiries outrun the team, who gets a person, who the AI keeps warm,
 * who goes to a broker, and who waits for a promised callback. Also checks a launch broadcast against
 * the WhatsApp Business limit on business-started conversations.
 */

export type LaunchInput = {
  enquiriesPerHour: number;
  /** Share of enquiries at or above the human threshold (0–1). */
  qualifiedShare: number;
  consultants: number;
  /** Qualified conversations one consultant can handle in an hour. */
  perConsultantHour: number;
  /** Qualified leads registered brokers can take in an hour. */
  brokerCapacityHour: number;
  overflowToBrokers: boolean;
};

export type LaunchPlan = { toPeople: number; toBrokers: number; waitlist: number; aiOnly: number; coverage: number };

/** One hour of the launch. Everyone gets an instant AI reply; this splits who gets a person next. */
export function planHour(i: LaunchInput): LaunchPlan {
  const qualified = Math.round(i.enquiriesPerHour * i.qualifiedShare);
  const aiOnly = i.enquiriesPerHour - qualified;
  const toPeople = Math.min(qualified, i.consultants * i.perConsultantHour);
  const left = qualified - toPeople;
  const toBrokers = i.overflowToBrokers ? Math.min(left, i.brokerCapacityHour) : 0;
  const waitlist = left - toBrokers;
  const coverage = qualified ? (toPeople + toBrokers) / qualified : 1;
  return { toPeople, toBrokers, waitlist, aiOnly, coverage };
}

/**
 * Promised callback times for a waitlist, in order: each consultant takes one callback per slot.
 * Returns the start minute (from the end of the launch hour) of each waiting client's callback.
 */
export function callbackSlots(waiting: number, consultants: number, slotMinutes = 10): number[] {
  if (consultants <= 0) return [];
  return Array.from({ length: waiting }, (_, n) => Math.floor(n / consultants) * slotMinutes);
}

/**
 * WhatsApp limits how many people a business can start conversations with in 24 hours (its messaging
 * tier, shown in WhatsApp Manager). Replies inside a conversation the client started don't count.
 */
export function broadcastCheck(recipients: number, dailyLimit: number) {
  const days = Math.ceil(recipients / dailyLimit);
  return { fits: recipients <= dailyLimit, days, firstDay: Math.min(recipients, dailyLimit), overBy: Math.max(0, recipients - dailyLimit) };
}

/** Refundable booking deposits collected before units open, ordered by time paid: who picks first. */
export function pickOrder<T extends { paidAt: number; score: number }>(eois: T[]): T[] {
  return [...eois].sort((a, b) => a.paidAt - b.paidAt || b.score - a.score);
}
