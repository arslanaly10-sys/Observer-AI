/**
 * Demo data for multi-broker selling: registrations, disputes, unit holds and broker reporting.
 * Times are relative to a fixed demo clock so server and browser render the same thing.
 */
import type { Registration, UnitHolds } from "@/lib/brokers/rules";

export const NOW = Date.UTC(2026, 10, 19, 9, 0);
const D = 86_400_000, H = 3_600_000;
const ago = (days: number, hours = 0) => NOW - days * D - hours * H;

/** Registrations across the partner network (a sample of the month's 4,120). */
export const registrations: Registration[] = [
  { id: "r1", broker: "Crescent Gate Realty", client: "Chen Wei", phone: "+86 139 2214 8812", project: "Emaar Beachfront", registeredAt: ago(41), activity: [{ kind: "viewing", at: ago(19) }, { kind: "offer", at: ago(6) }] },
  { id: "r2", broker: "Al Seef Homes", client: "Elena Rossi", phone: "+39 333 410 1290", email: "elena.rossi@studio-rossi.it", project: "Dubai Creek Harbour", registeredAt: ago(22), activity: [{ kind: "call", at: ago(3) }] },
  { id: "r3", broker: "Marina Bay Properties", client: "Hannah Becker", phone: "+49 151 2290 1144", project: "Dubai Creek Harbour", registeredAt: ago(26), activity: [{ kind: "message", at: ago(2) }] },
  { id: "r4", broker: "Desert Rose Real Estate", client: "Omar Farouk", phone: "+971 50 772 3010", project: "Arabian Ranches III", registeredAt: ago(33), activity: [{ kind: "call", at: ago(31) }] },
  { id: "r5", broker: "Najd Horizon Realty (KSA)", client: "Turki Al Otaibi", phone: "+966 55 120 4471", project: "Riyadh Gate", registeredAt: ago(4), activity: [{ kind: "viewing", at: ago(1) }] },
  { id: "r6", broker: "Crescent Gate Realty", client: "Rohan Kapoor", phone: "+971 52 610 9934", project: "Emaar Beachfront", registeredAt: ago(9), activity: [] },
  { id: "r7", broker: "Corniche Key Brokers", client: "Sara Lindqvist", email: "sara.lindqvist@gmail.com", project: "Dubai Creek Harbour", registeredAt: ago(14), activity: [{ kind: "viewing", at: ago(8) }] },
];

/** Incoming registration requests, checked live against the rules on screen. */
export const incoming: Registration[] = [
  { id: "n1", broker: "Marina Bay Properties", client: "Chen Wei", phone: "0086 139 2214 8812", project: "Emaar Beachfront", registeredAt: ago(0, 2), activity: [] },
  { id: "n2", broker: "Al Seef Homes", client: "Sara Lindqvist", email: "Sara.Lindqvist+dubai@gmail.com", project: "Dubai Creek Harbour", registeredAt: ago(0, 5), activity: [{ kind: "viewing", at: ago(16) }] },
  { id: "n3", broker: "Desert Rose Real Estate", client: "Lina Haddad", phone: "+971 56 300 1188", project: "Dubai Creek Harbour", registeredAt: ago(0, 1), activity: [] },
  { id: "n4", broker: "Crescent Gate Realty", client: "Turki Al Otaibi", phone: "055 120 4471", project: "Riyadh Gate", registeredAt: ago(3, 20), activity: [] },
];

/** Evidence the sales team sees when ruling on a dispute (keyed by incoming registration id). */
export const evidence: Record<string, { at: string; who: string; what: string }[]> = {
  n2: [
    { at: "3 Nov, 11:20", who: "Al Seef Homes", what: "Viewing at the sales gallery, signed visitor sheet" },
    { at: "5 Nov, 16:05", who: "Corniche Key Brokers", what: "Registered the client on the portal" },
    { at: "11 Nov, 10:00", who: "Corniche Key Brokers", what: "Viewing at the sales gallery" },
    { at: "19 Nov, 04:00", who: "Al Seef Homes", what: "Registered the client on the portal" },
  ],
  n4: [
    { at: "15 Nov, 09:10", who: "Najd Horizon Realty (KSA)", what: "Registered the client on the portal" },
    { at: "15 Nov, 13:40", who: "Crescent Gate Realty", what: "Registered the client by WhatsApp" },
    { at: "18 Nov, 18:30", who: "Najd Horizon Realty (KSA)", what: "Viewing at the Riyadh sales centre" },
  ],
};

/** Unit holds on the launch tower and a selling project. */
export const holds: (UnitHolds & { project: string; price: string })[] = [
  { unit: "Gate 1 · 2804", project: "Riyadh Gate", price: "SAR 1.86M", active: { broker: "Najd Horizon Realty (KSA)", client: "Turki Al Otaibi", requestedAt: ago(0, 30), expiresAt: ago(0, 30) + 48 * H }, queue: [{ broker: "Crescent Gate Realty", client: "Faris Al Dosari", requestedAt: ago(0, 20) }] },
  { unit: "Gate 2 · 1507", project: "Riyadh Gate", price: "SAR 1.32M", active: { broker: "Al Seef Homes", client: "Nasser Al Harthy", requestedAt: ago(1, 23), expiresAt: ago(1, 23) + 48 * H }, queue: [] },
  { unit: "A-4108", project: "Dubai Creek Harbour", price: "AED 3.9M", active: { broker: "Crescent Gate Realty", client: "Hannah Becker", requestedAt: ago(1, 2), expiresAt: undefined, deposit: true }, queue: [] },
  { unit: "A-3902", project: "Dubai Creek Harbour", price: "AED 3.4M", active: { broker: "Marina Bay Properties", client: "Daniel Okafor", requestedAt: ago(0, 44), expiresAt: ago(0, 44) + 48 * H }, queue: [{ broker: "Desert Rose Real Estate", client: "Lina Haddad", requestedAt: ago(0, 40) }, { broker: "Corniche Key Brokers", client: "Sara Lindqvist", requestedAt: ago(0, 12) }] },
  { unit: "B-2211", project: "Dubai Creek Harbour", price: "AED 2.7M", queue: [] },
  { unit: "G-142", project: "Arabian Ranches III", price: "AED 6.4M", active: { broker: "Desert Rose Real Estate", client: "Omar Farouk", requestedAt: ago(2, 6), expiresAt: ago(2, 6) + 48 * H }, queue: [{ broker: "Al Seef Homes", client: "Priya Raman", requestedAt: ago(1, 3) }] },
];

/** How promptly each agency reports back (late reporting was part of the client's "lag" feedback). */
export const reporting = [
  { broker: "Crescent Gate Realty", lastUpdate: "2 h ago", overdue: 0, median: "4 h" },
  { broker: "Al Seef Homes", lastUpdate: "5 h ago", overdue: 1, median: "7 h" },
  { broker: "Marina Bay Properties", lastUpdate: "1 day ago", overdue: 4, median: "19 h" },
  { broker: "Desert Rose Real Estate", lastUpdate: "3 days ago", overdue: 9, median: "2 days" },
  { broker: "Najd Horizon Realty (KSA)", lastUpdate: "40 min ago", overdue: 0, median: "3 h" },
  { broker: "Corniche Key Brokers", lastUpdate: "6 days ago", overdue: 12, median: "4 days" },
];
