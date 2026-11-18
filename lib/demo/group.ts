/**
 * Nawafir Holdings: the fictional group the demo runs as (checked: no UAE real-estate company by this name).
 * It develops its own towers (all prefixed "Nawafir") and its brokerage arm sells projects by other
 * developers, named as market data only: no logos, no claim those developers use Observer, prices indicative.
 * Every number on every demo screen comes from here so the story stays consistent.
 */
import type { PhotoKey } from "@/lib/img";

export const group = {
  name: "Nawafir Holdings",
  nameAr: "نوافير القابضة",
  monogram: "N",
  hq: "Dubai",
  markets: [
    { city: "Dubai", share: 64 },
    { city: "Abu Dhabi", share: 21 },
    { city: "Riyadh", share: 15 },
  ],
};

/** One month of the group's business (this month, sample figures). */
export const kpi = {
  enquiries: 41280,
  qualified: 9870,
  viewings: 6420,
  bookings: 1140,
  spas: 486,
  avgDeal: 2.1, // AED millions
  salesMonth: 1.02, // AED billions
  salesYTD: 10.4, // AED billions, Jan to Nov
  pipeline: 14.2, // AED billions open
  agents: 652,
  agentsOnline: 418,
  agencies: 184,
  projects: 12,
  aiFirstReplies: 71, // % of first replies sent by the AI
  medianReply: 38, // seconds
  aiConversations: 18420,
  hoursSaved: 3960,
  revivedLeads: 1214,
  revivedBookings: 96,
};

export type RoleId = "chairman" | "director" | "agent" | "broker";

export const roles: Record<RoleId, { label: string; person: string; title: string; home: string; photo: PhotoKey; blurb: string }> = {
  chairman: { label: "Chairman", person: "Rashid Al Mansoori", title: "Group Chairman", home: "board", photo: "execPortrait", blurb: "The whole group on one page: sales, launches, inventory and what the AI did overnight." },
  director: { label: "Sales director", person: "Layla Haddad", title: "Sales Director, UAE", home: "dashboard", photo: "agentPortrait", blurb: "Your 652 consultants, their pipeline and every AI action waiting for approval." },
  agent: { label: "Consultant", person: "Mariam Al Hashimi", title: "Property Consultant, Dubai", home: "next-best-action", photo: "agentWoman", blurb: "Today's viewings, the clients to call first, and WhatsApp drafted for you." },
  broker: { label: "Broker partner", person: "Priya Nair", title: "Director, Crescent Gate Realty · ORN 41827", home: "partner", photo: "handshake", blurb: "Register clients, check live availability and track your commission." },
};

export type UnitStatus = "available" | "held" | "booked" | "sold";
export interface Project {
  id: string; name: string; developer: string; own: boolean; city: string; area: string; photo: PhotoKey;
  type: string; units: number; sold: number; fromPrice: string; plan: string; handover: string; status: "Selling" | "Launching tonight" | "Sold out soon";
  towers?: { name: string; floors: number; perFloor: number }[];
}

export const projects: Project[] = [
  { id: "harbour-one", name: "Nawafir Harbour One", developer: "Nawafir Holdings", own: true, city: "Dubai", area: "Dubai Creek Harbour", photo: "skylineNight", type: "1–4 bed apartments, sky villas", units: 612, sold: 71, fromPrice: "AED 1.45M", plan: "60/40", handover: "Q4 2029", status: "Selling", towers: [{ name: "Tower A", floors: 48, perFloor: 7 }, { name: "Tower B", floors: 40, perFloor: 7 }] },
  { id: "grove", name: "Nawafir Grove Villas", developer: "Nawafir Holdings", own: true, city: "Dubai", area: "Mohammed Bin Rashid City", photo: "villaDusk", type: "4–6 bed villas", units: 214, sold: 58, fromPrice: "AED 5.9M", plan: "70/30", handover: "Q2 2028", status: "Selling" },
  { id: "pearl", name: "Nawafir Pearl", developer: "Nawafir Holdings", own: true, city: "Abu Dhabi", area: "Al Reem Island", photo: "interiorLiving", type: "Studios to 3 bed", units: 386, sold: 64, fromPrice: "AED 1.2M", plan: "50/50", handover: "Q1 2028", status: "Selling", towers: [{ name: "Pearl Tower", floors: 40, perFloor: 10 }] },
  { id: "riyadh-gate", name: "Nawafir Riyadh Gate", developer: "Nawafir Holdings", own: true, city: "Riyadh", area: "North Riyadh", photo: "towerAbstract", type: "2–4 bed apartments", units: 720, sold: 0, fromPrice: "SAR 1.1M", plan: "10/60/30", handover: "Q3 2030", status: "Launching tonight", towers: [{ name: "Gate 1", floors: 30, perFloor: 8 }, { name: "Gate 2", floors: 30, perFloor: 8 }, { name: "Gate 3", floors: 30, perFloor: 8 }] },
  { id: "dhe", name: "Dubai Hills Estate", developer: "Emaar", own: false, city: "Dubai", area: "Dubai Hills", photo: "villaPool", type: "Apartments and villas", units: 140, sold: 81, fromPrice: "AED 1.9M", plan: "80/20", handover: "2027–2028", status: "Sold out soon" },
  { id: "valley", name: "The Valley", developer: "Emaar", own: false, city: "Dubai", area: "Al Ain Road", photo: "interiorDining", type: "Townhouses", units: 96, sold: 67, fromPrice: "AED 2.6M", plan: "80/20", handover: "2027", status: "Selling" },
  { id: "hartland", name: "Sobha Hartland II", developer: "Sobha Realty", own: false, city: "Dubai", area: "MBR City", photo: "villaSea", type: "Apartments and villas", units: 118, sold: 62, fromPrice: "AED 1.6M", plan: "60/40", handover: "2027–2029", status: "Selling" },
  { id: "diamondz", name: "Diamondz", developer: "Danube Properties", own: false, city: "Dubai", area: "JLT", photo: "marinaCamels", type: "Studios to 3 bed", units: 160, sold: 54, fromPrice: "AED 1.1M", plan: "1% monthly", handover: "2028", status: "Selling" },
  { id: "lagoons", name: "DAMAC Lagoons", developer: "DAMAC", own: false, city: "Dubai", area: "Dubailand", photo: "beach", type: "Townhouses and villas", units: 132, sold: 59, fromPrice: "AED 2.2M", plan: "75/25", handover: "2027", status: "Selling" },
  { id: "pja", name: "Palm Jebel Ali", developer: "Nakheel", own: false, city: "Dubai", area: "Palm Jebel Ali", photo: "palmAerial", type: "Beach villas", units: 48, sold: 77, fromPrice: "AED 18M", plan: "80/20", handover: "2029", status: "Sold out soon" },
  { id: "saadiyat", name: "Saadiyat Lagoons", developer: "Aldar", own: false, city: "Abu Dhabi", area: "Saadiyat Island", photo: "villaClassic", type: "Villas", units: 88, sold: 69, fromPrice: "AED 4.7M", plan: "60/40", handover: "2027", status: "Selling" },
  { id: "sedra", name: "SEDRA", developer: "ROSHN", own: false, city: "Riyadh", area: "North Riyadh", photo: "villaWhite", type: "Villas and townhouses", units: 110, sold: 48, fromPrice: "SAR 1.4M", plan: "Bank mortgage", handover: "2027–2028", status: "Selling" },
];

/** Deterministic unit grid for a tower, so the heat map is stable between renders. */
export function towerUnits(projectId: string, tower: { name: string; floors: number; perFloor: number }, soldPct: number) {
  let seed = [...(projectId + tower.name)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const rows: { floor: number; units: { code: string; status: UnitStatus; beds: number; price: number }[] }[] = [];
  for (let f = tower.floors; f >= 1; f--) {
    const units = [];
    for (let u = 1; u <= tower.perFloor; u++) {
      const r = rnd();
      // higher floors sell first; a band of holds and bookings sits on top of the sold stock
      const pull = soldPct / 100 + (f / tower.floors - 0.5) * 0.35;
      const status: UnitStatus = r < pull - 0.08 ? "sold" : r < pull ? "booked" : r < pull + 0.05 ? "held" : "available";
      const beds = u === 1 || u === tower.perFloor ? 3 : u % 3 === 0 ? 2 : 1;
      const price = Math.round((0.95 + beds * 0.62 + f * 0.018) * 10) / 10;
      units.push({ code: `${tower.name.replace(/[^A-Z0-9]/g, "").slice(0, 2) || "T"}-${f}${String(u).padStart(2, "0")}`, status, beds, price });
    }
    rows.push({ floor: f, units });
  }
  return rows;
}

export type Segment = "VIP" | "Investor" | "End user" | "Golden Visa";
export type Stage = "Enquiry" | "Viewing" | "EOI" | "Booking" | "SPA" | "Oqood" | "Handover";
export interface Client {
  id: string; name: string; nationality: string; lang: string; segment: Segment; budget: string; project: string; stage: Stage;
  agent: string; source: string; score: number; temp: "hot" | "warm" | "cold"; phone: string; lastActivity: string; household: string; note: string;
}

export const clients: Client[] = [
  { id: "c1", name: "Nour Al Mansouri", nationality: "Emirati", lang: "Arabic", segment: "VIP", budget: "AED 18–22M", project: "Palm Jebel Ali", stage: "Booking", agent: "Omar Siddiqui", source: "Private referral", score: 94, temp: "hot", phone: "+971 50 ••• 1186", lastActivity: "12 min ago", household: "Family of six", note: "Wants a beachfront villa before the summer. Prefers Arabic, voice notes over calls." },
  { id: "c2", name: "Hamdan Al Suwaidi", nationality: "Emirati", lang: "Arabic", segment: "Investor", budget: "AED 8–10M", project: "Nawafir Harbour One", stage: "EOI", agent: "Omar Siddiqui", source: "Instagram", score: 89, temp: "hot", phone: "+971 55 ••• 7781", lastActivity: "25 min ago", household: "Portfolio of 6 units", note: "Buying three sky-floor units together. Asks about rental yield and resale timing." },
  { id: "c3", name: "Viktor Sokolov", nationality: "Russian", lang: "Russian", segment: "Golden Visa", budget: "AED 2–2.5M", project: "Sobha Hartland II", stage: "Viewing", agent: "Mariam Al Hashimi", source: "Property Finder", score: 82, temp: "hot", phone: "+7 916 ••• 4402", lastActivity: "1 h ago", household: "Couple", note: "Needs the purchase to qualify for the 10-year visa. Cash, wants handover within two years." },
  { id: "c4", name: "Aisha Khan", nationality: "British-Pakistani", lang: "English", segment: "End user", budget: "AED 4–5M", project: "Nawafir Grove Villas", stage: "SPA", agent: "Leila Rashid", source: "Website", score: 86, temp: "hot", phone: "+971 52 ••• 3019", lastActivity: "2 h ago", household: "Family of four", note: "Schools within 10 minutes matter most. Mortgage pre-approved with a local bank." },
  { id: "c5", name: "Abdullah Al Qahtani", nationality: "Saudi", lang: "Arabic", segment: "VIP", budget: "SAR 6–8M", project: "Nawafir Riyadh Gate", stage: "EOI", agent: "Faisal Al Harbi", source: "Launch event", score: 91, temp: "hot", phone: "+966 50 ••• 2290", lastActivity: "8 min ago", household: "Extended family", note: "Wants a whole floor in Gate 1 for the family. Attending the launch tonight." },
  { id: "c6", name: "Chen Wei", nationality: "Chinese", lang: "Chinese", segment: "Investor", budget: "AED 3–4M", project: "Diamondz", stage: "Booking", agent: "Mariam Al Hashimi", source: "Partner broker", score: 78, temp: "warm", phone: "+86 139 ••• 8812", lastActivity: "3 h ago", household: "Buying for two children", note: "Registered by Crescent Gate Realty. Prefers the 1% monthly plan." },
  { id: "c7", name: "Fatima Al Zaabi", nationality: "Emirati", lang: "Arabic", segment: "End user", budget: "AED 2.8M", project: "The Valley", stage: "Viewing", agent: "Khalid Mansour", source: "Bayut", score: 74, temp: "warm", phone: "+971 55 ••• 5432", lastActivity: "5 h ago", household: "Young family", note: "Viewing on Saturday with her husband. Comparing with Dubai Hills townhouses." },
  { id: "c8", name: "James Whitaker", nationality: "British", lang: "English", segment: "Investor", budget: "AED 1.5–2M", project: "Nawafir Pearl", stage: "Enquiry", agent: "AI concierge", source: "Google Ads", score: 63, temp: "warm", phone: "+44 7700 ••• 214", lastActivity: "Yesterday", household: "Single", note: "Asking about Abu Dhabi yields versus Dubai. Being nurtured by the AI concierge." },
  { id: "c9", name: "Rania Hassan", nationality: "Lebanese", lang: "Arabic", segment: "End user", budget: "AED 3.2M", project: "DAMAC Lagoons", stage: "Viewing", agent: "Ahmed Tariq", source: "Referral", score: 69, temp: "warm", phone: "+971 50 ••• 8901", lastActivity: "6 h ago", household: "Couple", note: "Likes the Lagoons community. Asked for the payment plan in Arabic." },
  { id: "c10", name: "Arjun Mehta", nationality: "Indian", lang: "Hindi", segment: "Investor", budget: "AED 1.2–1.6M", project: "Diamondz", stage: "Enquiry", agent: "AI concierge", source: "Facebook", score: 58, temp: "warm", phone: "+91 98 ••• 4410", lastActivity: "Yesterday", household: "Family abroad", note: "Prefers Hindi. Wants a studio with a guaranteed rental programme." },
  { id: "c11", name: "Mohammed Al Shamsi", nationality: "Emirati", lang: "Arabic", segment: "VIP", budget: "AED 12M", project: "Saadiyat Lagoons", stage: "Oqood", agent: "Leila Rashid", source: "Private referral", score: 88, temp: "hot", phone: "+971 50 ••• 6677", lastActivity: "Today", household: "Family of five", note: "Oqood issued. Wants interior upgrades quoted before handover." },
  { id: "c12", name: "Elena Rossi", nationality: "Italian", lang: "English", segment: "Golden Visa", budget: "AED 2.2M", project: "Sobha Hartland II", stage: "Booking", agent: "Khalid Mansour", source: "Property Finder", score: 80, temp: "hot", phone: "+39 333 ••• 1290", lastActivity: "4 h ago", household: "Couple", note: "Relocating her design studio. Visa application to start after SPA." },
];

export const deals = [
  { client: "Nour Al Mansouri", project: "Palm Jebel Ali", unit: "Frond K · Villa 14", value: 19.8, stage: "Booking" as Stage, docs: { reservation: true, passport: true, spa: false, oqood: false }, agent: "Omar Siddiqui", broker: "", commission: 0.396 },
  { client: "Hamdan Al Suwaidi", project: "Nawafir Harbour One", unit: "A-4601, A-4602, A-4603", value: 9.4, stage: "EOI" as Stage, docs: { reservation: true, passport: true, spa: false, oqood: false }, agent: "Omar Siddiqui", broker: "", commission: 0.188 },
  { client: "Aisha Khan", project: "Nawafir Grove Villas", unit: "Villa G-118", value: 4.6, stage: "SPA" as Stage, docs: { reservation: true, passport: true, spa: true, oqood: false }, agent: "Leila Rashid", broker: "", commission: 0.092 },
  { client: "Chen Wei", project: "Diamondz", unit: "DZ-2207", value: 3.4, stage: "Booking" as Stage, docs: { reservation: true, passport: true, spa: false, oqood: false }, agent: "Mariam Al Hashimi", broker: "Crescent Gate Realty", commission: 0.136 },
  { client: "Mohammed Al Shamsi", project: "Saadiyat Lagoons", unit: "Villa SL-061", value: 12.1, stage: "Oqood" as Stage, docs: { reservation: true, passport: true, spa: true, oqood: true }, agent: "Leila Rashid", broker: "", commission: 0.242 },
  { client: "Elena Rossi", project: "Sobha Hartland II", unit: "H2-1408", value: 2.2, stage: "Booking" as Stage, docs: { reservation: true, passport: true, spa: false, oqood: false }, agent: "Khalid Mansour", broker: "Al Seef Homes", commission: 0.066 },
  { client: "Abdullah Al Qahtani", project: "Nawafir Riyadh Gate", unit: "Gate 1 · Floor 28 (whole floor)", value: 7.6, stage: "EOI" as Stage, docs: { reservation: false, passport: true, spa: false, oqood: false }, agent: "Faisal Al Harbi", broker: "", commission: 0.152 },
  { client: "Sultan Al Ketbi", project: "Dubai Hills Estate", unit: "DHE Villa 3-22", value: 6.9, stage: "Handover" as Stage, docs: { reservation: true, passport: true, spa: true, oqood: true }, agent: "Ahmed Tariq", broker: "", commission: 0.138 },
];
export const stages: Stage[] = ["Enquiry", "Viewing", "EOI", "Booking", "SPA", "Oqood", "Handover"];

export const brokers = [
  { name: "Crescent Gate Realty", orn: "41827", tier: "Platinum", clients: 214, deals: 61, salesM: 182, commissionM: 7.3, protectedDays: 90 },
  { name: "Al Seef Homes", orn: "38214", tier: "Platinum", clients: 188, deals: 54, salesM: 151, commissionM: 6.0, protectedDays: 90 },
  { name: "Marina Bay Properties", orn: "29531", tier: "Gold", clients: 142, deals: 37, salesM: 96, commissionM: 3.4, protectedDays: 60 },
  { name: "Desert Rose Real Estate", orn: "44190", tier: "Gold", clients: 121, deals: 31, salesM: 84, commissionM: 2.9, protectedDays: 60 },
  { name: "Najd Horizon Realty (KSA)", orn: "FAL 1200044", tier: "Gold", clients: 97, deals: 22, salesM: 71, commissionM: 2.5, protectedDays: 60 },
  { name: "Corniche Key Brokers", orn: "33762", tier: "Silver", clients: 64, deals: 14, salesM: 33, commissionM: 1.0, protectedDays: 30 },
];

export const team = [
  { name: "Omar Siddiqui", role: "Senior consultant", city: "Dubai", sales: 61.2, deals: 18, reply: "2m", score: 96 },
  { name: "Leila Rashid", role: "Senior consultant", city: "Dubai", sales: 54.8, deals: 15, reply: "3m", score: 92 },
  { name: "Mariam Al Hashimi", role: "Consultant", city: "Dubai", sales: 38.1, deals: 14, reply: "4m", score: 88 },
  { name: "Faisal Al Harbi", role: "Senior consultant", city: "Riyadh", sales: 33.9, deals: 9, reply: "5m", score: 85 },
  { name: "Khalid Mansour", role: "Consultant", city: "Dubai", sales: 29.4, deals: 11, reply: "6m", score: 81 },
  { name: "Ahmed Tariq", role: "Consultant", city: "Abu Dhabi", sales: 24.7, deals: 8, reply: "9m", score: 74 },
];

export const tasks = [
  { title: "Send Palm Jebel Ali frond plan to Nour Al Mansouri", due: "Today 18:00", owner: "Omar Siddiqui", client: "Nour Al Mansouri", done: false },
  { title: "Collect Emirates ID copy for the SPA", due: "Today 20:00", owner: "Leila Rashid", client: "Aisha Khan", done: false },
  { title: "Confirm whole-floor allocation with sales admin, Gate 1", due: "Tonight 21:30", owner: "Faisal Al Harbi", client: "Abdullah Al Qahtani", done: false },
  { title: "Golden Visa checklist to Viktor Sokolov", due: "Tomorrow 10:00", owner: "Mariam Al Hashimi", client: "Viktor Sokolov", done: false },
  { title: "Interior upgrade quote, Saadiyat villa", due: "Thu 12:00", owner: "Leila Rashid", client: "Mohammed Al Shamsi", done: true },
];

export type AiKind = "reply" | "hold" | "route" | "call" | "price" | "followup";
export const aiEvents: { id: string; kind: AiKind; text: string; client: string; time: string; approval: boolean; risk: "low" | "medium" | "high" }[] = [
  { id: "a1", kind: "hold", text: "Wants to hold A-4601 to A-4603 for 48 hours against the EOI deposit", client: "Hamdan Al Suwaidi", time: "2 min ago", approval: true, risk: "medium" },
  { id: "a2", kind: "price", text: "Drafted a 2% early-booking concession on Villa G-118, within the policy you set", client: "Aisha Khan", time: "6 min ago", approval: true, risk: "high" },
  { id: "a3", kind: "reply", text: "Answered in Arabic with the Palm Jebel Ali frond plan and two viewing times", client: "Nour Al Mansouri", time: "12 min ago", approval: false, risk: "low" },
  { id: "a4", kind: "route", text: "Routed a Riyadh Gate VIP to Faisal Al Harbi (Arabic, Riyadh, 2 open leads)", client: "Abdullah Al Qahtani", time: "14 min ago", approval: false, risk: "low" },
  { id: "a5", kind: "call", text: "Called back in Russian after a missed call; booked a Saturday viewing", client: "Viktor Sokolov", time: "38 min ago", approval: false, risk: "low" },
  { id: "a6", kind: "followup", text: "Paused follow-ups for 14 quiet leads until 9:00 am in their time zone", client: "14 leads", time: "1 h ago", approval: false, risk: "low" },
  { id: "a7", kind: "reply", text: "Wants to send the Diamondz 1% plan in Chinese with a guaranteed-rent note", client: "Chen Wei", time: "1 h ago", approval: true, risk: "medium" },
];

export const automations = [
  { name: "Portal enquiry to first reply", trigger: "New lead from Bayut, Property Finder or Dubizzle", steps: ["Detect language", "Score with 7 signals", "Reply on WhatsApp with matching units", "Route to the right consultant", "Follow up on day 1, 3 and 7"], runs: 18420, success: 99.2, active: true },
  { name: "Launch-night surge", trigger: "Enquiries exceed 300 an hour on a launch", steps: ["Answer every enquiry in under 60 seconds", "Offer EOI with live availability", "Hold the requested unit for 30 minutes", "Escalate VIPs to the launch desk"], runs: 2 , success: 100, active: true },
  { name: "VIP concierge", trigger: "Budget above AED 15M or a private referral", steps: ["Notify the Chairman's office", "Assign a senior consultant within 5 minutes", "Prepare a private preview pack", "Never send automated prices"], runs: 312, success: 100, active: true },
  { name: "Broker registration protection", trigger: "A partner broker registers a client", steps: ["Check for duplicates across 41,280 enquiries", "Lock the client to the broker for 90 days", "Confirm to the broker on WhatsApp"], runs: 4120, success: 98.7, active: true },
  { name: "SPA document chase", trigger: "Booking paid, documents missing after 48 hours", steps: ["Ask the client for the missing document", "Remind the consultant", "Flag to sales admin after 5 days"], runs: 1980, success: 94.1, active: false },
];

export const calls = [
  { client: "Viktor Sokolov", lang: "Russian", duration: "4:12", outcome: "Viewing booked, Saturday 11:00", time: "38 min ago", lines: [
    ["AI", "Good evening, Mr Sokolov. This is the Nawafir AI assistant returning your call about Sobha Hartland II."],
    ["Client", "Yes. I need to know if a two-million unit gets me the ten-year visa."],
    ["AI", "A property worth at least AED 2 million qualifies. The unit you saw is AED 2.15 million, so it does. Shall I book a viewing with Mariam?"],
    ["Client", "Saturday morning."],
    ["AI", "Saturday at 11:00 is booked. Mariam will confirm on WhatsApp in Russian."],
  ] },
  { client: "Abdullah Al Qahtani", lang: "Arabic", duration: "2:48", outcome: "Escalated to Faisal Al Harbi (VIP)", time: "1 h ago", lines: [
    ["AI", "مساء الخير أستاذ عبدالله، معك المساعد الذكي من نوافير بخصوص إطلاق بوابة الرياض الليلة."],
    ["Client", "أبي الدور كامل في البرج الأول للعائلة."],
    ["AI", "طلب مميز. سأحوّلك الآن إلى فيصل الحربي، مستشارك في الرياض، ليحجز لك قبل فتح البيع."],
  ] },
];

export const ledger = { conversations: kpi.aiConversations, hoursSaved: kpi.hoursSaved, revived: kpi.revivedLeads, revivedBookings: kpi.revivedBookings, attributedM: 201.6, approvals: 1240, overrides: 37 };
