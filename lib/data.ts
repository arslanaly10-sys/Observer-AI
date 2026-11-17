/**
 * Demo workspace data, ported from the v10 prototype.
 * Tenant and user are fictional (Meridian Developments / Layla Haddad).
 * GCC developer directory figures are illustrative and must be verified before any public use.
 */
import type { PhotoKey } from "./img";

export const workspace = {
  tenant: "Meridian Developments",
  city: "Dubai",
  user: { name: "Layla Haddad", first: "Layla", role: "Senior agent · Admin", initials: "LH" },
};

export type Temp = "hot" | "warm" | "cold";

export interface Lead {
  id: number; name: string; phone: string; score: number; temp: Temp; type: "Buyer" | "Seller";
  source: string; budget: string; timeframe: string; financing: string; agent: string; status: string;
  urgency: "serious" | "researching"; area: string; lastContact: string;
}

export const leads: Lead[] = [
  { id: 1, name: "Ahmed Al Khalidi", phone: "+971 50 ••• 5678", score: 87, temp: "hot", type: "Buyer", source: "Bayut", budget: "AED 4M", timeframe: "1-2 mo", financing: "Cash", agent: "Layla H.", status: "Qualifying", urgency: "serious", area: "Dubai Hills", lastContact: "12m" },
  { id: 2, name: "Fatima Al Zaabi", phone: "+971 55 ••• 5432", score: 81, temp: "hot", type: "Buyer", source: "Property Finder", budget: "AED 2.8M", timeframe: "3 mo", financing: "Mortgage", agent: "Khalid M.", status: "Meeting Set", urgency: "serious", area: "Downtown", lastContact: "3h" },
  { id: 3, name: "Mohammad Siddiqui", phone: "+971 52 ••• 6789", score: 73, temp: "warm", type: "Seller", source: "Facebook", budget: "AED 1.5M", timeframe: "6 mo", financing: "N/A", agent: "Leila R.", status: "New", urgency: "researching", area: "JVC", lastContact: "6h" },
  { id: 4, name: "Rania Hassan", phone: "+971 50 ••• 8901", score: 69, temp: "warm", type: "Buyer", source: "Referral", budget: "AED 3.2M", timeframe: "2 mo", financing: "Cash", agent: "Ahmed T.", status: "Qualified", urgency: "serious", area: "Palm Jumeirah", lastContact: "5h" },
  { id: 5, name: "Omar Al Farouq", phone: "+971 56 ••• 0123", score: 44, temp: "cold", type: "Buyer", source: "Bayut", budget: "AED 900K", timeframe: "12 mo", financing: "Mortgage", agent: "Unassigned", status: "New", urgency: "researching", area: "Sharjah", lastContact: "1d" },
  { id: 6, name: "Nour Al Mansouri", phone: "+971 55 ••• 5678", score: 91, temp: "hot", type: "Buyer", source: "WhatsApp", budget: "AED 6M", timeframe: "<1 mo", financing: "Cash", agent: "Layla H.", status: "Offer Stage", urgency: "serious", area: "Emirates Hills", lastContact: "2h" },
  { id: 7, name: "Tariq Mahmoud", phone: "+971 50 ••• 1234", score: 55, temp: "warm", type: "Seller", source: "Property Finder", budget: "AED 2.1M", timeframe: "4 mo", financing: "N/A", agent: "Khalid M.", status: "Qualified", urgency: "researching", area: "Business Bay", lastContact: "1d" },
  { id: 8, name: "Sara Al Blooshi", phone: "+971 52 ••• 3456", score: 38, temp: "cold", type: "Buyer", source: "Facebook", budget: "AED 750K", timeframe: "18 mo", financing: "Mortgage", agent: "Unassigned", status: "New", urgency: "researching", area: "Ajman", lastContact: "2d" },
  { id: 9, name: "Hamdan Al Suwaidi", phone: "+971 50 ••• 7781", score: 84, temp: "hot", type: "Buyer", source: "Instagram", budget: "AED 5.4M", timeframe: "1-2 mo", financing: "Cash", agent: "Ahmed T.", status: "Qualifying", urgency: "serious", area: "Palm Jumeirah", lastContact: "25m" },
  { id: 10, name: "Maryam Al Hashimi", phone: "+971 55 ••• 9020", score: 62, temp: "warm", type: "Buyer", source: "Website", budget: "AED 1.9M", timeframe: "3 mo", financing: "Mortgage", agent: "Leila R.", status: "Qualified", urgency: "serious", area: "MBR City", lastContact: "8h" },
];

export const PROPERTY: Record<string, { photo: PhotoKey; type: string; beds: number; label: string }> = {
  "Dubai Hills": { photo: "villaPool", type: "5BR Villa", beds: 5, label: "Dubai Hills Estate" },
  Downtown: { photo: "interiorLiving", type: "2BR Apartment", beds: 2, label: "Downtown Dubai" },
  "Palm Jumeirah": { photo: "villaSea", type: "4BR Signature Villa", beds: 4, label: "Palm Jumeirah" },
  "Emirates Hills": { photo: "villaClassic", type: "7BR Mansion", beds: 7, label: "Emirates Hills" },
  "Business Bay": { photo: "interiorLounge", type: "2BR Apartment", beds: 2, label: "Business Bay" },
  JVC: { photo: "villaWhite", type: "3BR Townhouse", beds: 3, label: "Jumeirah Village Circle" },
  "MBR City": { photo: "villaDusk", type: "4BR Villa", beds: 4, label: "MBR City" },
  Sharjah: { photo: "interiorDining", type: "2BR Apartment", beds: 2, label: "Al Majaz, Sharjah" },
  Ajman: { photo: "interiorDark", type: "1BR Apartment", beds: 1, label: "Ajman Corniche" },
};

export const agents = [
  { initials: "LH", name: "Layla Haddad", status: "online", hot: 12, booked: 8, conv: 32, resp: "3m", score: 94, sla: "OK" },
  { initials: "KM", name: "Khalid Mansouri", status: "online", hot: 9, booked: 5, conv: 27, resp: "5m", score: 87, sla: "OK" },
  { initials: "AT", name: "Ahmed Tariq", status: "online", hot: 6, booked: 4, conv: 25, resp: "4m", score: 82, sla: "OK" },
  { initials: "LR", name: "Leila Rashid", status: "busy", hot: 7, booked: 3, conv: 21, resp: "9m", score: 71, sla: "WARN" },
  { initials: "YK", name: "Youssef Kareem", status: "online", hot: 5, booked: 3, conv: 19, resp: "6m", score: 68, sla: "OK" },
  { initials: "DS", name: "Dana Saleh", status: "busy", hot: 4, booked: 2, conv: 18, resp: "7m", score: 64, sla: "OK" },
  { initials: "NS", name: "Nadia Al Sayed", status: "offline", hot: 3, booked: 1, conv: 17, resp: "18m", score: 58, sla: "BREACH" },
  { initials: "RB", name: "Rashid Bakr", status: "offline", hot: 2, booked: 1, conv: 14, resp: "11m", score: 55, sla: "WARN" },
] as const;

export const kanban: Record<string, { name: string; type: string; time: string; temp: Temp; score: number; value: string }[]> = {
  New: [
    { name: "Omar Al Farouq", type: "Buyer", time: "2m ago", temp: "cold", score: 44, value: "AED 900K" },
    { name: "Sara Al Blooshi", type: "Buyer", time: "14m ago", temp: "cold", score: 38, value: "AED 750K" },
    { name: "Mohammad Siddiqui", type: "Seller", time: "6h ago", temp: "warm", score: 73, value: "AED 1.5M" },
  ],
  Qualified: [
    { name: "Rania Hassan", type: "Buyer", time: "1h ago", temp: "warm", score: 69, value: "AED 3.2M" },
    { name: "Tariq Mahmoud", type: "Seller", time: "2h ago", temp: "warm", score: 55, value: "AED 2.1M" },
    { name: "Maryam Al Hashimi", type: "Buyer", time: "8h ago", temp: "warm", score: 62, value: "AED 1.9M" },
  ],
  "Meeting Set": [
    { name: "Fatima Al Zaabi", type: "Buyer", time: "3h ago", temp: "hot", score: 81, value: "AED 2.8M" },
    { name: "Hamdan Al Suwaidi", type: "Buyer", time: "25m ago", temp: "hot", score: 84, value: "AED 5.4M" },
  ],
  "Offer Stage": [{ name: "Nour Al Mansouri", type: "Buyer", time: "Yesterday", temp: "hot", score: 91, value: "AED 6M" }],
  "Closed Won": [{ name: "Jaber Al Nuaimi", type: "Buyer", time: "2d ago", temp: "hot", score: 88, value: "AED 3.8M" }],
};

export type Tone = "hot" | "ok" | "creek" | "warm" | "cold" | "wa";

export const activity: { tone: Tone; who?: string; text: string; time: string }[] = [
  { tone: "hot", who: "Ahmed Al Khalidi", text: "scored 87. Cash buyer, moving within two months.", time: "2m" },
  { tone: "wa", who: "Nour Al Mansouri", text: "replied on WhatsApp: “Yes, I want to proceed with the offer.”", time: "9m" },
  { tone: "ok", who: "Layla Haddad", text: "booked a viewing with Fatima Al Zaabi for tomorrow, 10am.", time: "21m" },
  { tone: "creek", text: "Five leads have gone two hours without contact. They’re at risk of breaching SLA.", time: "34m" },
  { tone: "ok", who: "Jaber Al Nuaimi", text: "closed: AED 3.8M villa in Dubai Hills.", time: "1h" },
  { tone: "cold", text: "184 leads re-scored overnight. 47 moved up, 12 moved down.", time: "4h" },
];

export const nba = [
  { p: 1, lead: "Ahmed Al Khalidi", action: "Send a WhatsApp now", reason: "Score 87 · cash buyer · viewed 8 listings · not yet contacted", channel: "WhatsApp", btn: "Send" },
  { p: 1, lead: "Nour Al Mansouri", action: "Call now", reason: "Score 91 · offer pending · replied 2h ago. This deal is at risk.", channel: "Call", btn: "Call" },
  { p: 2, lead: "Fatima Al Zaabi", action: "Confirm tomorrow’s viewing", reason: "Viewing in 18 hours, not yet confirmed", channel: "WhatsApp", btn: "Confirm" },
  { p: 2, lead: "Rania Hassan", action: "Send a shortlist", reason: "Score 69 · opened your last message · interested in Palm Jumeirah", channel: "SMS", btn: "Send list" },
  { p: 3, lead: "Mohammad Siddiqui", action: "Assign an agent", reason: "Score 73 · no agent · waiting 6 hours", channel: "Assign", btn: "Assign" },
];

export const waContacts = [
  { initials: "AK", name: "Ahmed Al Khalidi", preview: "Yes, I’m interested in the villas…", time: "2m", unread: 3, score: 87, temp: "hot" as Temp },
  { initials: "NM", name: "Nour Al Mansouri", preview: "When can we sign?", time: "2h", unread: 1, score: 91, temp: "hot" as Temp },
  { initials: "FZ", name: "Fatima Al Zaabi", preview: "Can we meet tomorrow?", time: "3h", unread: 0, score: 81, temp: "hot" as Temp },
  { initials: "RH", name: "Rania Hassan", preview: "Send me the listings please", time: "5h", unread: 1, score: 69, temp: "warm" as Temp },
  { initials: "TM", name: "Tariq Mahmoud", preview: "What’s your commission?", time: "1d", unread: 0, score: 55, temp: "warm" as Temp },
];

export type Msg = { dir: "in" | "out"; text?: string; time: string; listing?: boolean };
export const waThread: Msg[] = [
  { dir: "in", text: "Hello, I saw your listing on Bayut for the villa in Dubai Hills. Very interested.", time: "10:24" },
  { dir: "out", text: "Hi Ahmed, I’m Layla from Meridian. The Dubai Hills villa is five bedrooms with a private pool, at AED 4.2M. Is this for your family, or an investment?", time: "10:25" },
  { dir: "out", time: "10:25", listing: true },
  { dir: "in", text: "Primary residence. Family of 5. What is the handover date?", time: "10:28" },
  { dir: "out", text: "It’s finished and ready to move into. I have three similar homes between AED 3.5M and 4.5M. Would you like to see them this week?", time: "10:29" },
  { dir: "in", text: "Yes please! I need to see at least 3 options. Are you free Thursday?", time: "10:31" },
  { dir: "out", text: "Thursday works. I’ll put the three side by side for you. Shall we meet at our office at 11am?", time: "10:32" },
  { dir: "in", text: "Yes I am interested. Please send me the details and price comparison.", time: "10:45" },
];

export const sequences = [
  { name: "Bayut hot lead", channel: "whatsapp", trigger: "Score above 70 from Bayut", enrolled: 142, sent: 892, openRate: 91, steps: [
    { delay: "Immediately", msg: "Hi {name}, I saw you were looking at homes on Bayut. I’m your consultant at Meridian. What budget and area do you have in mind?" },
    { delay: "+2 hours", msg: "Hi {name}, I have five homes that match your search and aren’t on the portals yet. Would you like a private preview?" },
    { delay: "+1 day", msg: "Good morning {name}. New homes came up in {area} this week. When suits you for a ten-minute call?" },
  ] },
  { name: "Re-engage after 48 hours", channel: "whatsapp", trigger: "No reply in 48h", enrolled: 89, sent: 312, openRate: 78, steps: [
    { delay: "48h after last message", msg: "Hi {name}, {area} is moving quickly. A home much like the one you liked sold yesterday. Shall I send you what’s left?" },
    { delay: "+3 days", msg: "Hi {name}, one last note from me. I have something that matches exactly what you described. Five minutes this week?" },
  ] },
  { name: "After the viewing", channel: "whatsapp", trigger: "Viewing completed", enrolled: 34, sent: 68, openRate: 97, steps: [
    { delay: "2h after viewing", msg: "Hi {name}, it was lovely to meet you today. Which of the three stayed with you? I can arrange a second visit or start the paperwork." },
    { delay: "+1 day", msg: "{name}, any questions I can answer? I can prepare the letter of intent whenever you’re ready." },
  ] },
  { name: "Cold lead reactivation", channel: "sms", trigger: "Cold, 7+ days without contact", enrolled: 211, sent: 634, openRate: 68, steps: [
    { delay: "Day 7", msg: "Hi {name}, it’s {agent} from Meridian. Prices in Dubai rose 8% last quarter. Worth a quick chat about your search? Reply YES." },
    { delay: "+5 days", msg: "{name}, a new home in {area} within {budget} just came in. Reply YES for details." },
  ] },
  { name: "First touch for every new lead", channel: "sms", trigger: "Any new lead, any source", enrolled: 247, sent: 247, openRate: 72, steps: [
    { delay: "Within 3 minutes", msg: "Hi {name}, I’m {agent}, your property consultant. Are you looking to buy, sell or rent? Reply 1, 2 or 3." },
  ] },
  { name: "Monthly market letter", channel: "email", trigger: "All leads, 1st of each month", enrolled: 1840, sent: 1840, openRate: 31, steps: [
    { delay: "1st of the month, 9am", msg: "Subject: {area} this month\n\nHi {name}, here’s what moved in {area}: prices, new homes, and where the value is right now." },
  ] },
  { name: "AI call for unclosed hot leads", channel: "ai_call", trigger: "Hot lead, no close in 72h", enrolled: 38, sent: 38, openRate: 84, steps: [
    { delay: "72h after scoring hot", msg: "Observer calls: “Hi {name}, I’m calling for your consultant at Meridian. Two new homes in {area} just became available. Do you have three minutes?”" },
    { delay: "+2 days if unanswered", msg: "Second call, with a short voicemail if there’s no answer." },
  ] },
];

export const cascade = [
  { step: 1, channel: "WhatsApp", wait: "0 sec", condition: "Lead arrives", action: "A personal opener and one qualifying question" },
  { step: 2, channel: "WhatsApp", wait: "30 min", condition: "Not read", action: "A second note with something worth opening: an off-market home" },
  { step: 3, channel: "SMS", wait: "2 hrs", condition: "Still no reply", action: "A short SMS with a one-word reply" },
  { step: 4, channel: "AI call", wait: "24 hrs", condition: "No written reply", action: "Observer calls, qualifies, and books a viewing on the spot" },
  { step: 5, channel: "Email", wait: "48 hrs", condition: "Direct channels quiet", action: "A considered market letter with hand-picked homes, weekly" },
  { step: 6, channel: "Your agent", wait: "On any reply", condition: "The lead answers anywhere", action: "Handed to an agent with the full conversation. Observer steps back." },
];

export const journeys = [
  { name: "Ahmed Al Khalidi", step: 6, detail: "Replied on WhatsApp. With Layla H. now." },
  { name: "Rania Hassan", step: 3, detail: "WhatsApp unread. SMS sent 12 minutes ago." },
  { name: "Omar Al Farouq", step: 4, detail: "No written reply. AI call in 40 minutes." },
  { name: "Sara Al Blooshi", step: 5, detail: "On the weekly market letter." },
  { name: "Mohammad Siddiqui", step: 2, detail: "Second WhatsApp sent. Waiting to be read." },
];

export const notifs = [
  { tone: "hot" as Tone, text: "Ahmed Al Khalidi just scored 87. Cash buyer, worth calling now.", time: "2m ago", unread: true },
  { tone: "hot" as Tone, text: "SLA breach: Nadia Al Sayed’s lead has waited 22 minutes.", time: "5m ago", unread: true },
  { tone: "wa" as Tone, text: "Nour Al Mansouri on WhatsApp: “When can we sign?”", time: "2h ago", unread: true },
  { tone: "creek" as Tone, text: "Five leads will breach SLA in the next 15 minutes.", time: "2h ago", unread: true },
  { tone: "ok" as Tone, text: "Closed: Jaber Al Nuaimi, AED 3.8M, Dubai Hills villa.", time: "3h ago", unread: false },
  { tone: "cold" as Tone, text: "Overnight scoring done. 184 leads reviewed, 47 moved up.", time: "4h ago", unread: false },
  { tone: "creek" as Tone, text: "Rania Hassan qualified and assigned to Ahmed Tariq.", time: "5h ago", unread: false },
  { tone: "cold" as Tone, text: "New lead from Property Finder: Sara Al Blooshi, AED 750K.", time: "6h ago", unread: false },
  { tone: "warm" as Tone, text: "One PDPL item needs attention before Friday.", time: "1d ago", unread: false },
];

export const weights = [
  { label: "Engagement", pts: 28 },
  { label: "Budget match", pts: 24 },
  { label: "Timeframe", pts: 22 },
  { label: "Response speed", pts: 20 },
  { label: "Area demand", pts: 18 },
  { label: "Source quality", pts: 16 },
  { label: "Financing", pts: 12 },
];

export const intentThreads = [
  { name: "Ahmed Al Khalidi", initials: "AK", msgs: [
    { dir: "in" as const, text: "I’m looking for a villa in Dubai Hills, budget around 4 million. Cash purchase." },
    { dir: "out" as const, text: "Perfect, I have three options. When are you hoping to move in?" },
    { dir: "in" as const, text: "We need to move within 6 weeks. Can you show me something this week?" },
  ] },
  { name: "Nour Al Mansouri", initials: "NM", msgs: [
    { dir: "in" as const, text: "I want to buy in Emirates Hills. Above AED 5M. I’m ready to proceed immediately." },
    { dir: "out" as const, text: "We have a seven-bedroom villa at AED 6.2M, not yet listed. Shall I send it over?" },
    { dir: "in" as const, text: "Yes please. Can we sign the LOI this week if I like it?" },
  ] },
  { name: "Tariq Mahmoud", initials: "TM", msgs: [
    { dir: "in" as const, text: "I have a 2BR in Business Bay. Curious what price I could get. Just researching." },
    { dir: "out" as const, text: "We recently sold a similar home for AED 2.1M. Would a free valuation help?" },
    { dir: "in" as const, text: "Maybe later. What’s the market like right now?" },
  ] },
  { name: "Omar Al Farouq", initials: "OF", msgs: [
    { dir: "in" as const, text: "Hi, I’m looking for apartments in Sharjah, budget 900K. Not urgent, just looking." },
    { dir: "out" as const, text: "I can send you what we have in Sharjah. Any preference on size?" },
    { dir: "in" as const, text: "2BR preferably. No rush, planning for next year." },
  ] },
];

export const sla = [
  { name: "Ahmed Al Khalidi", meta: "Bayut · Score 87 · Hot", timer: "00:12:34", status: "ok", pct: 20, action: "Contact now" },
  { name: "Omar Al Farouq", meta: "Bayut · Score 44 · Cold", timer: "01:48:22", status: "breach", pct: 100, action: "Escalate" },
  { name: "Sara Al Blooshi", meta: "Facebook · Score 38 · Cold", timer: "01:22:10", status: "breach", pct: 100, action: "Escalate" },
  { name: "Mohammad Siddiqui", meta: "Facebook · Score 73 · Warm", timer: "00:48:55", status: "warn", pct: 75, action: "Assign agent" },
  { name: "Rania Hassan", meta: "Referral · Score 69 · Warm", timer: "00:32:10", status: "warn", pct: 62, action: "Follow up" },
] as const;

export const compliance = [
  { title: "Encryption", desc: "AES-256 at rest and TLS 1.3 in transit. Every personal field is encrypted.", checks: [{ ok: true, label: "Encrypted at rest" }, { ok: true, label: "TLS 1.3 in transit" }, { ok: true, label: "Key rotation on" }] },
  { title: "Data residency", desc: "All data stays in AWS Middle East (Bahrain).", checks: [{ ok: true, label: "AWS me-south-1" }, { ok: true, label: "No transfer outside the GCC" }, { ok: true, label: "Backups in region" }] },
  { title: "PDPL, Saudi Arabia", desc: "Personal Data Protection Law, for Saudi operations.", checks: [{ ok: true, label: "Consent management" }, { ok: false, label: "Privacy notice update pending" }, { ok: true, label: "Retention policy set" }] },
  { title: "UAE PDPL", desc: "Federal Decree-Law No. 45 of 2021 on personal data protection.", checks: [{ ok: true, label: "Processing records kept" }, { ok: true, label: "Impact assessment done" }, { ok: true, label: "Processor agreements signed" }] },
];

export const auditLog = [
  { time: "14:32", event: "Lead record opened", user: "Layla Haddad", ip: "192.168.1.44", ok: true },
  { time: "14:28", event: "WhatsApp message sent", user: "Observer", ip: "10.0.0.1", ok: true },
  { time: "14:15", event: "Leads exported (CSV)", user: "Khalid Mansouri", ip: "192.168.1.55", ok: true },
  { time: "13:44", event: "Failed sign-in attempt", user: "unknown", ip: "45.12.88.201", ok: false },
  { time: "13:20", event: "Scoring model retrained", user: "Observer", ip: "10.0.0.2", ok: true },
];

export const channelROI = [
  { name: "WhatsApp", leads: 84, cpl: 18, revenue: 1_820_000, roi: 412 },
  { name: "Bayut", leads: 67, cpl: 52, revenue: 1_450_000, roi: 218 },
  { name: "Property Finder", leads: 55, cpl: 61, revenue: 980_000, roi: 174 },
  { name: "Facebook ads", leads: 31, cpl: 38, revenue: 420_000, roi: 156 },
  { name: "Referral", leads: 10, cpl: 0, revenue: 650_000, roi: null as number | null },
];

export const dailyLeads = [11, 14, 9, 17, 15, 19, 13, 16, 21, 18, 14, 22, 19, 24];

export const funnel = [
  { stage: "Leads", n: 247 },
  { stage: "Qualified", n: 158 },
  { stage: "Meeting", n: 94 },
  { stage: "Offer", n: 41 },
  { stage: "Closed", n: 29 },
];

export const dropoff = [
  { from: "Lead → Qualified", pct: -36, why: "Slow first reply (over 15 minutes)" },
  { from: "Qualified → Meeting", pct: -41, why: "No WhatsApp follow-up" },
  { from: "Meeting → Offer", pct: -28, why: "Home didn’t match the brief" },
  { from: "Offer → Closed", pct: -31, why: "Financing delays" },
];

export interface Developer {
  id: string; name: string; country: "UAE" | "KSA" | "Qatar" | "Kuwait" | "Bahrain" | "Oman";
  founded: number; projects: number; units: string; value: string; photo?: PhotoKey; place: string;
  flagship: string[]; desc: string;
}
/** Public market directory. Figures are illustrative placeholders. */
export const developers: Developer[] = [
  { id: "emaar", name: "Emaar Properties", country: "UAE", founded: 1997, projects: 84, units: "180K+", value: "AED 580B", photo: "downtownDay", place: "Downtown Dubai", flagship: ["Burj Khalifa", "Dubai Creek Harbour", "The Valley"], desc: "The UAE’s largest master developer." },
  { id: "damac", name: "DAMAC Properties", country: "UAE", founded: 2002, projects: 43, units: "46K+", value: "AED 300B", photo: "skylineNight", place: "Dubai", flagship: ["DAMAC Hills", "DAMAC Lagoons", "Safa Two"], desc: "Branded luxury residences." },
  { id: "meraas", name: "Meraas", country: "UAE", founded: 2007, projects: 22, units: "30K+", value: "AED 180B", photo: "marinaCamels", place: "Dubai", flagship: ["City Walk", "Bluewaters", "La Mer"], desc: "Lifestyle-led destinations." },
  { id: "nakheel", name: "Nakheel", country: "UAE", founded: 2000, projects: 31, units: "55K+", value: "AED 250B", photo: "palmAerial", place: "Palm Jumeirah", flagship: ["Palm Jumeirah", "Palm Jebel Ali", "Dubai Islands"], desc: "Waterfront master communities." },
  { id: "aldar", name: "Aldar Properties", country: "UAE", founded: 2004, projects: 38, units: "60K+", value: "AED 200B", photo: "grandMosque", place: "Abu Dhabi", flagship: ["Yas Island", "Saadiyat Island", "Al Raha Beach"], desc: "Abu Dhabi’s leading developer." },
  { id: "sobha", name: "Sobha Realty", country: "UAE", founded: 1976, projects: 14, units: "28K+", value: "AED 120B", photo: "villaDusk", place: "MBR City", flagship: ["Sobha Hartland", "Sobha One", "SeaHaven"], desc: "Builds in-house, end to end." },
  { id: "roshn", name: "ROSHN", country: "KSA", founded: 2019, projects: 7, units: "400K+", value: "SAR 200B", place: "Riyadh", flagship: ["SEDRA", "ALAROUS", "WAREFA"], desc: "National community developer." },
  { id: "dar", name: "Dar Al Arkan", country: "KSA", founded: 1994, projects: 18, units: "65K+", value: "SAR 90B", place: "Riyadh", flagship: ["Shams Ar Riyadh", "Al Qasr"], desc: "Riyadh and Jeddah residential." },
  { id: "rsg", name: "Red Sea Global", country: "KSA", founded: 2018, projects: 4, units: "8K+", value: "SAR 500B", photo: "beach", place: "Red Sea coast", flagship: ["The Red Sea", "AMAALA"], desc: "Regenerative coastal tourism." },
  { id: "neom", name: "NEOM", country: "KSA", founded: 2017, projects: 9, units: "N/A", value: "SAR 1.5T", place: "Tabuk", flagship: ["The Line", "Sindalah", "Trojena"], desc: "Giga-project region." },
  { id: "barwa", name: "Barwa Real Estate", country: "Qatar", founded: 2005, projects: 12, units: "25K+", value: "QAR 80B", place: "Doha", flagship: ["Barwa City", "Madinat Al Mawater"], desc: "Qatar’s largest listed developer." },
  { id: "qd", name: "Qatari Diar", country: "Qatar", founded: 2005, projects: 10, units: "20K+", value: "QAR 120B", place: "Lusail", flagship: ["Lusail City", "Simaisma"], desc: "State-backed master developer." },
  { id: "mabanee", name: "Mabanee", country: "Kuwait", founded: 1964, projects: 8, units: "10K+", value: "KWD 2B", place: "Kuwait City", flagship: ["The Avenues", "Al Khiran"], desc: "Mixed-use and retail destinations." },
  { id: "eskan", name: "Eskan Bank Realty", country: "Bahrain", founded: 1979, projects: 6, units: "7K+", value: "BHD 500M", place: "Manama", flagship: ["Dannat Al Lawzi", "Sakniya"], desc: "Housing finance and development." },
  { id: "omran", name: "OMRAN Group", country: "Oman", founded: 2005, projects: 9, units: "12K+", value: "OMR 3B", place: "Muscat", flagship: ["Jebel Sifah", "Yiti"], desc: "Tourism and Vision 2040 projects." },
];

export const socialFlows = [
  { name: "Lead ad → WhatsApp", desc: "Every Facebook and Instagram lead form gets a WhatsApp reply in under a minute.", runs: 2104 },
  { name: "Comment → DM", desc: "“Price?” under a post becomes a private message with the price and two photos.", runs: 1488 },
  { name: "DM qualifier", desc: "Three questions in the DM: budget, area, timing. Then the lead is scored.", runs: 1150 },
  { name: "No close → AI call", desc: "Hot social leads that haven’t closed in 72 hours get a call from Observer.", runs: 318 },
];

export const socialFeed = [
  { who: "Hessa M.", src: "Instagram DM", text: "Is the Palm villa still available?", reply: "It is. Four bedrooms, AED 5.1M. Would Saturday or Sunday suit for a viewing?", t: "1m" },
  { who: "Khaled R.", src: "Facebook lead ad", text: "Budget 2M, Downtown, ready in 3 months", reply: "Thank you, Khaled. I have two in Downtown at AED 1.9M and 2.05M. Shall I send them?", t: "4m" },
  { who: "Aisha T.", src: "Instagram comment", text: "Price?", reply: "Sent you a DM with the price and floor plan.", t: "7m" },
];
