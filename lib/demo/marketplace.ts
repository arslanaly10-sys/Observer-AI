/**
 * Marketplace demo data. Emaar is the permitted workspace; Sobha, DAMAC, Binghatti, Aldar, ROSHN and
 * Dar Al Arkan appear by name as MARKET DATA ONLY: sample units, illustrative prices, no partnership.
 * Clock: 00:30 in Dubai (20:30 UTC), so the overnight desk is live.
 */
import type { Signal, ProjectPace, Ask } from "@/lib/market/marketplace";

export const NIGHT = Date.UTC(2026, 10, 19, 20, 30);
const H = 3_600_000;
const ago = (h: number) => NIGHT - h * H;

export type DemoUnit = { code: string; project: string; area: string; developer: string; partner: boolean; city: "Dubai" | "Abu Dhabi" | "Riyadh"; beds: number; price: number; currency: "AED" | "SAR"; signals: Signal[] };

export const PACE: Record<string, ProjectPace> = {
  "Dubai Creek Harbour": { soldPerDay: 6, remaining: 140, registeredSince: 8 },
  "Emaar Beachfront": { soldPerDay: 3, remaining: 90 },
  "Dubai Hills Estate": { soldPerDay: 2, remaining: 40 },
  "Sobha Hartland II": { soldPerDay: 4, remaining: 70, registeredSince: 6 },
  "DAMAC Lagoons": { soldPerDay: 5, remaining: 110 },
  "Binghatti Skyrise": { soldPerDay: 9, remaining: 60, registeredSince: 7 },
  "Saadiyat Lagoons": { soldPerDay: 1, remaining: 30 },
  "Riyadh Gate": { soldPerDay: 14, remaining: 420 },
  "SEDRA": { soldPerDay: 3, remaining: 80 },
};

export const units: DemoUnit[] = [
  { code: "A-2207", project: "Dubai Creek Harbour", area: "Dubai Creek Harbour", developer: "Emaar Properties", partner: true, city: "Dubai", beds: 2, price: 2_480_000, currency: "AED", signals: [{ kind: "price-list", at: ago(46), state: "available", price: 2_480_000 }] },
  { code: "A-2309", project: "Dubai Creek Harbour", area: "Dubai Creek Harbour", developer: "Emaar Properties", partner: true, city: "Dubai", beds: 2, price: 2_550_000, currency: "AED", signals: [{ kind: "developer-desk", at: ago(5), state: "available", price: 2_550_000 }, { kind: "aggregator", at: ago(9), state: "available" }] },
  { code: "B-1904", project: "Dubai Creek Harbour", area: "Dubai Creek Harbour", developer: "Emaar Properties", partner: true, city: "Dubai", beds: 3, price: 3_420_000, currency: "AED", signals: [{ kind: "developer-desk", at: ago(4), state: "available", price: 3_420_000 }] },
  { code: "A-1803", project: "Dubai Creek Harbour", area: "Dubai Creek Harbour", developer: "Emaar Properties", partner: true, city: "Dubai", beds: 2, price: 2_390_000, currency: "AED", signals: [{ kind: "price-list", at: ago(30), state: "available" }, { kind: "developer-desk", at: ago(6), state: "sold" }] },
  { code: "BF-1102", project: "Emaar Beachfront", area: "Dubai Harbour", developer: "Emaar Properties", partner: true, city: "Dubai", beds: 2, price: 3_150_000, currency: "AED", signals: [{ kind: "developer-desk", at: ago(3), state: "available", price: 3_150_000 }] },
  { code: "H2-1408", project: "Sobha Hartland II", area: "MBR City", developer: "Sobha Realty", partner: false, city: "Dubai", beds: 2, price: 2_290_000, currency: "AED", signals: [{ kind: "whatsapp-group", at: ago(20), state: "available", price: 2_290_000 }] },
  { code: "L-V214", project: "DAMAC Lagoons", area: "Dubailand", developer: "DAMAC Properties", partner: false, city: "Dubai", beds: 4, price: 3_100_000, currency: "AED", signals: [{ kind: "portal", at: ago(2), state: "available", price: 3_100_000 }] },
  { code: "SK-3105", project: "Binghatti Skyrise", area: "Business Bay", developer: "Binghatti", partner: false, city: "Dubai", beds: 2, price: 2_350_000, currency: "AED", signals: [{ kind: "aggregator", at: ago(26), state: "available", price: 2_350_000 }] },
  { code: "R-0712", project: "Dubai Hills Estate", area: "Dubai Hills", developer: "Form A resale", partner: true, city: "Dubai", beds: 2, price: 2_600_000, currency: "AED", signals: [{ kind: "form-a", at: ago(8), state: "available", price: 2_600_000 }] },
  { code: "SL-061", project: "Saadiyat Lagoons", area: "Saadiyat Island", developer: "Aldar Properties", partner: false, city: "Abu Dhabi", beds: 4, price: 5_200_000, currency: "AED", signals: [{ kind: "aggregator", at: ago(14), state: "available", price: 5_200_000 }] },
  { code: "G1-2804", project: "Riyadh Gate", area: "North Riyadh", developer: "Emaar Properties", partner: true, city: "Riyadh", beds: 3, price: 1_860_000, currency: "SAR", signals: [{ kind: "developer-desk", at: ago(1), state: "held" }] },
  { code: "SD-V88", project: "SEDRA", area: "North Riyadh", developer: "ROSHN", partner: false, city: "Riyadh", beds: 4, price: 2_400_000, currency: "SAR", signals: [{ kind: "price-list", at: ago(40), state: "available", price: 2_400_000 }] },
];

/** The midnight conversation: the client asks for A-2207, whose data is 31 hours old. */
export const night = {
  client: "Olivia Bennett", lang: "English", from: "London", broker: "Crescent Gate Realty", unit: "A-2207",
  thread: [
    { at: "00:31", who: "client", text: "Hi, is A-2207 at Creek Harbour still available? I'd like to secure it tonight, I fly back to London at 7." },
    { at: "00:31", who: "ai", text: "Good evening Olivia, I'm the Crescent Gate AI assistant. A-2207 was available on the developer's price list two days ago, and the project has sold several units since. I can't confirm it overnight, so I won't promise it. Two very similar units are confirmed today: A-2309 (2 bed, AED 2.55M) and B-1904 (3 bed, AED 3.42M)." },
    { at: "00:33", who: "client", text: "A-2207 is my first choice. A-2309 as backup. What do you need from me?" },
    { at: "00:33", who: "ai", text: "I'll queue a hold request for A-2207 for when Emaar's sales desk opens at 9:00, with A-2309 as your backup. To be first in line, please send a photo of your passport and a recent bank statement, and pay the refundable expression-of-interest deposit through Emaar's own link. The money goes to the developer, not to us." },
    { at: "00:38", who: "client", text: "[Passport photo] [Bank statement PDF]" },
    { at: "00:38", who: "ai", text: "Thank you. Passport read: valid until 2031. Bank statement covers the 20% due at booking. Your booking form is pre-filled for you to check." },
    { at: "00:44", who: "client", text: "Deposit paid." },
    { at: "00:44", who: "ai", text: "Received by Emaar. You are first in line for A-2207 at 9:00, and A-2309 is reserved as your backup. Your broker, Priya Nair, and Emaar's salesperson will be in one chat with you at 9:00. Safe flight." },
  ],
  passport: { name: "Olivia Bennett", number: "•••• 4471", expires: "2031-03-14", nationality: "British" },
  funds: { kind: "bank statement" as const, amount: 780_000 },
  eoi: { amount: 50_000, to: "developer" as const },
};

/** What the developer's sales admin sends the reply desk, and the developer AI's overnight answers. */
export const deskSamples = [
  "A-1803 sold",
  "B-1904 now 3.39M",
  "A-2401 and A-2402 on hold for a VIP",
  "G1-2805 مباعة",
  "BF-1102 released, AED 3,120,000",
];

export const developerAi = [
  { at: "23:12", broker: "Al Seef Homes", q: "Is the 60/40 plan still offered on Creek Harbour 3-beds?", a: "Yes, on every 3-bed in Creek Harbour, as of today's 18:40 price list.", needs: false },
  { at: "00:05", broker: "Marina Bay Properties", q: "Can my client hold B-1904 until Saturday?", a: "Holds are 48 hours and need approval. Queued for the sales desk at 9:00: you are first.", needs: true },
  { at: "00:33", broker: "Crescent Gate Realty", q: "Hold A-2207 for Olivia Bennett, EOI paid, backup A-2309.", a: "Received. First in line for A-2207 at 9:00. Backup noted. A person confirms.", needs: true },
  { at: "01:20", broker: "Desert Rose Real Estate", q: "Any 4-bed townhouses left under AED 3.5M?", a: "None confirmed tonight in Emaar communities. I will not quote unconfirmed units.", needs: false },
];

/** The 9:00 deal room: client, broker and developer in one thread, with the AI-to-AI requests. */
export const dealRoom = {
  members: [
    { name: "Olivia Bennett", role: "Client" },
    { name: "Priya Nair", role: "Broker · Crescent Gate Realty" },
    { name: "Omar Siddiqui", role: "Developer sales · Emaar" },
    { name: "Observer AI", role: "Both sides' assistant" },
  ],
  requests: [
    { at: "00:33", from: "Crescent Gate AI", to: "Emaar AI", kind: "Hold request", unit: "A-2207", status: "Queued · position 1", detail: "EOI AED 50,000 paid to Emaar. Passport and funds attached. Backup A-2309." },
    { at: "09:02", from: "Emaar AI", to: "Crescent Gate AI", kind: "Availability check", unit: "A-2207", status: "Confirmed available", detail: "Checked by sales admin against the live system." },
    { at: "09:04", from: "Emaar sales", to: "All", kind: "Hold approved", unit: "A-2207", status: "Held 48 hours", detail: "Booking form sent for signature. Backup A-2309 released to the next agency in its queue." },
  ],
  thread: [
    { at: "09:00", who: "Observer AI", text: "Good morning. Olivia asked for A-2207 at 00:31, paid the EOI to Emaar at 00:44 and is first in line. Documents are attached. Omar, can you confirm availability?" },
    { at: "09:02", who: "Omar Siddiqui", text: "Confirmed available. Approving the hold now." },
    { at: "09:04", who: "Observer AI", text: "Hold approved for 48 hours. Olivia, the booking form is ready for your e-signature; Priya will walk you through it." },
    { at: "09:06", who: "Priya Nair", text: "Morning Olivia! Signing takes two minutes. Call me if anything's unclear." },
  ],
};

/** Buyer asks this week, for the demand radar (sample). */
export function sampleAsks(): Ask[] {
  const out: Ask[] = [];
  const add = (n: number, area: string, beds: number, budget: number, jitter: number) => {
    for (let i = 0; i < n; i++) out.push({ area, beds, budget: budget + ((i * 37) % 11 - 5) * jitter, consent: i % 9 !== 0, qualified: i % 7 !== 0 });
  };
  add(380, "Dubai Creek Harbour", 2, 2_250_000, 20_000);
  add(210, "Dubai Hills", 4, 6_600_000, 90_000);
  add(165, "Emaar Beachfront", 1, 1_850_000, 15_000);
  add(140, "Dubai Creek Harbour", 3, 3_300_000, 30_000);
  add(96, "North Riyadh", 3, 1_750_000, 25_000);
  add(60, "The Valley", 3, 2_700_000, 20_000);
  add(4, "Palm Jumeirah", 5, 18_000_000, 300_000);
  return out;
}

/** The data feeds behind the confidence scores. */
export const feeds = [
  { name: "Land Department open data", detail: "Daily transactions from Dubai Pulse, with the off-plan flag", last: "Today 06:00", signal: "Creek Harbour registered 38 off-plan sales in 7 days", status: "live" },
  { name: "Aggregator feed", detail: "Off-plan inventory from an aggregator partner, by agreement", last: "2 h ago", signal: "1,240 units across 18 projects", status: "live" },
  { name: "Form A resale stock", detail: "Ready units with a signed listing agreement at a partner brokerage", last: "8 h ago", signal: "312 ready units, 41 in Dubai Hills", status: "live" },
  { name: "Developer WhatsApp groups", detail: "Price lists and availability forwarded to the AI from broker groups", last: "20 h ago", signal: "6 price lists read this week", status: "live" },
  { name: "Developer portals", detail: "Checked automatically only where the developer agreed in writing", last: "2 h ago", signal: "1 developer agreed", status: "limited" },
];
