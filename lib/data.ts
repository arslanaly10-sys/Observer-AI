/**
 * Demo workspace data, ported from the v10 prototype.
 * Tenant and user are fictional (Emaar Properties / Layla Haddad).
 * GCC developer directory figures are illustrative and must be verified before any public use.
 */
import type { PhotoKey } from "./img";

export const workspace = {
  tenant: "Emaar Properties",
  city: "Dubai",
  user: { name: "Layla Haddad", first: "Layla", role: "Sales Director, UAE", initials: "LH" },
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
    { name: "James Whitaker", type: "Buyer", time: "2m ago", temp: "warm", score: 63, value: "AED 1.8M" },
    { name: "Arjun Mehta", type: "Buyer", time: "14m ago", temp: "warm", score: 58, value: "AED 1.4M" },
    { name: "Hannah Becker", type: "Buyer", time: "1h ago", temp: "cold", score: 41, value: "AED 1.6M" },
  ],
  Qualified: [
    { name: "Viktor Sokolov", type: "Buyer", time: "38m ago", temp: "hot", score: 82, value: "AED 2.2M" },
    { name: "Rania Hassan", type: "Buyer", time: "6h ago", temp: "warm", score: 69, value: "AED 3.2M" },
    { name: "Fatima Al Zaabi", type: "Buyer", time: "5h ago", temp: "warm", score: 74, value: "AED 2.8M" },
  ],
  "Meeting Set": [
    { name: "Hamdan Al Suwaidi", type: "Investor", time: "25m ago", temp: "hot", score: 89, value: "AED 9.4M" },
    { name: "Abdullah Al Qahtani", type: "Buyer", time: "8m ago", temp: "hot", score: 91, value: "SAR 7.6M" },
  ],
  "Offer Stage": [
    { name: "Nour Al Mansouri", type: "Buyer", time: "12m ago", temp: "hot", score: 94, value: "AED 19.8M" },
    { name: "Elena Rossi", type: "Buyer", time: "4h ago", temp: "hot", score: 80, value: "AED 2.2M" },
  ],
  "Closed Won": [
    { name: "Mohammed Al Shamsi", type: "Buyer", time: "Today", temp: "hot", score: 88, value: "AED 12.1M" },
    { name: "Sultan Al Ketbi", type: "Buyer", time: "2d ago", temp: "hot", score: 86, value: "AED 6.9M" },
  ],
};

export type Tone = "hot" | "ok" | "creek" | "warm" | "cold" | "wa";

export const activity: { tone: Tone; who?: string; text: string; time: string }[] = [
  { tone: "hot", who: "Abdullah Al Qahtani", text: "asked for a whole floor in Riyadh Gate, Gate 1. Escalated to Faisal Al Harbi.", time: "2m" },
  { tone: "wa", who: "Nour Al Mansouri", text: "replied on WhatsApp: “Send me the villa plan, I want to see it with my family.”", time: "12m" },
  { tone: "ok", who: "Mariam Al Hashimi", text: "booked a Saturday viewing at Dubai Creek Harbour with Viktor Sokolov.", time: "38m" },
  { tone: "creek", text: "The AI held A-4601 to A-4603 at Creek Harbour for Hamdan Al Suwaidi, pending your approval.", time: "41m" },
  { tone: "ok", who: "Mohammed Al Shamsi", text: "Oqood issued: AED 12.1M villa at Dubai Hills Estate.", time: "1h" },
  { tone: "cold", text: "1,386 enquiries answered overnight. 214 quiet clients replied again.", time: "6h" },
];

export const nba = [
  { p: 1, lead: "Ahmed Al Khalidi", action: "Send a WhatsApp now", reason: "Score 87 · cash buyer · viewed 8 listings · not yet contacted", channel: "WhatsApp", btn: "Send" },
  { p: 1, lead: "Nour Al Mansouri", action: "Call now", reason: "Score 91 · offer pending · replied 2h ago. This deal is at risk.", channel: "Call", btn: "Call" },
  { p: 2, lead: "Fatima Al Zaabi", action: "Confirm tomorrow’s viewing", reason: "Viewing in 18 hours, not yet confirmed", channel: "WhatsApp", btn: "Confirm" },
  { p: 2, lead: "Rania Hassan", action: "Send a shortlist", reason: "Score 69 · opened your last message · interested in Palm Jumeirah", channel: "SMS", btn: "Send list" },
  { p: 3, lead: "Mohammad Siddiqui", action: "Assign an agent", reason: "Score 73 · no agent · waiting 6 hours", channel: "Assign", btn: "Assign" },
];

export type Msg = { dir: "in" | "out"; text?: string; time: string; listing?: boolean };
export interface WaContact {
  initials: string; name: string; preview: string; time: string; unread: number; score: number; temp: Temp;
  listing: { photo: PhotoKey; title: string; detail: string; price: string };
  profile: [string, string][]; suggestion: string; thread: Msg[];
}

export const waContacts: WaContact[] = [
  { initials: "HS", name: "Hamdan Al Suwaidi", preview: "Can you hold all three until Thursday?", time: "2m", unread: 3, score: 89, temp: "hot",
    listing: { photo: "skylineNight", title: "Dubai Creek Harbour · Tower A", detail: "Sky floor 46 · three 3-bed units", price: "AED 9,400,000" },
    profile: [["Looking to", "Invest, three units"], ["Budget", "AED 8–10M"], ["Project", "Dubai Creek Harbour"], ["Timing", "This month"], ["Came from", "Instagram"], ["Financing", "Cash"]],
    suggestion: "Hamdan, I have asked sales admin to hold A-4601 to A-4603 for 48 hours against the EOI. Shall I send the reservation form now?",
    thread: [
      { dir: "in", text: "Good evening. I saw Creek Harbour on Instagram. Do you have three units together on a high floor?", time: "20:41" },
      { dir: "out", text: "Good evening Hamdan, this is the Emaar AI assistant. Yes: floor 46 in Tower A has three adjoining 3-bed units, A-4601 to A-4603, all with a Creek view.", time: "20:41" },
      { dir: "out", time: "20:41", listing: true },
      { dir: "in", text: "Price for the three, and the payment plan?", time: "20:44" },
      { dir: "out", text: "AED 9.4M together. The plan is 60/40: 60% during construction, 40% on handover in Q4 2029. Expected gross yield in the area is about 6–7%.", time: "20:45" },
      { dir: "in", text: "Can you hold all three until Thursday?", time: "20:52" },
    ] },
  { initials: "NM", name: "Nour Al Mansouri", preview: "أرسل لي مخطط السعفة", time: "12m", unread: 1, score: 94, temp: "hot",
    listing: { photo: "palmAerial", title: "Dubai Hills Estate · Fairway villas", detail: "Beach villa 14 · 6 bedrooms", price: "AED 19,800,000" },
    profile: [["Looking to", "Buy, family home"], ["Budget", "AED 18–22M"], ["Project", "Dubai Hills Estate"], ["Timing", "Before summer"], ["Came from", "Private referral"], ["Financing", "Cash"]],
    suggestion: "تفضّل أستاذة نور، هذا مخطط السعفة K مع موقع الفيلا 14. هل يناسبكم الخميس الساعة 5 مساءً لزيارة الموقع مع العائلة؟",
    thread: [
      { dir: "in", text: "مساء الخير، أبحث عن فيلا على البحر في دبي هيلز إستيت للعائلة.", time: "19:02" },
      { dir: "out", text: "مساء النور أستاذة نور، معك عمر صديقي من إعمار. لدينا فيلا 14 في السعفة K، ست غرف وواجهة بحرية مباشرة.", time: "19:05" },
      { dir: "out", time: "19:05", listing: true },
      { dir: "in", text: "ممتاز. أرسل لي مخطط السعفة، أبي أشوفه مع أهلي.", time: "21:30" },
    ] },
  { initials: "VS", name: "Viktor Sokolov", preview: "Saturday morning works.", time: "38m", unread: 0, score: 82, temp: "hot",
    listing: { photo: "villaSea", title: "Dubai Creek Harbour · H2-1408", detail: "2-bed apartment · park view", price: "AED 2,150,000" },
    profile: [["Looking to", "Buy, Golden Visa"], ["Budget", "AED 2–2.5M"], ["Project", "Dubai Creek Harbour"], ["Timing", "2 months"], ["Came from", "Property Finder"], ["Financing", "Cash"]],
    suggestion: "Viktor, Saturday at 11:00 is confirmed with Mariam. I have also attached the Golden Visa checklist for a property of AED 2 million or more.",
    thread: [
      { dir: "in", text: "Добрый день. Квартира за 2 миллиона даёт визу на 10 лет?", time: "18:10" },
      { dir: "out", text: "Здравствуйте, Виктор! Да: недвижимость от 2 млн дирхамов даёт право на 10-летнюю визу. Эта квартира стоит 2,15 млн.", time: "18:10" },
      { dir: "out", time: "18:10", listing: true },
      { dir: "in", text: "Saturday morning works.", time: "18:31" },
    ] },
  { initials: "AQ", name: "Abdullah Al Qahtani", preview: "أبي الدور كامل في البرج الأول", time: "8m", unread: 2, score: 91, temp: "hot",
    listing: { photo: "towerAbstract", title: "Riyadh Gate · Gate 1", detail: "Floor 28 · 8 units, whole floor", price: "SAR 7,600,000" },
    profile: [["Looking to", "Buy, extended family"], ["Budget", "SAR 6–8M"], ["Project", "Riyadh Gate"], ["Timing", "Tonight's launch"], ["Came from", "Launch event"], ["Financing", "Cash"]],
    suggestion: "أستاذ عبدالله، فيصل الحربي يتواصل معك الآن لتأكيد تخصيص الطابق 28 كاملاً قبل فتح البيع الساعة 9.",
    thread: [
      { dir: "in", text: "السلام عليكم، أبي الدور كامل في البرج الأول للعائلة.", time: "20:12" },
      { dir: "out", text: "وعليكم السلام أستاذ عبدالله، معك المساعد الذكي من إعمار. الطابق 28 في البوابة 1 متاح كاملاً، ثماني وحدات.", time: "20:12" },
      { dir: "out", time: "20:12", listing: true },
      { dir: "in", text: "تمام، كيف نحجز قبل الإطلاق؟", time: "20:15" },
    ] },
  { initials: "RH", name: "Rania Hassan", preview: "Send me the payment plan in Arabic please", time: "6h", unread: 1, score: 69, temp: "warm",
    listing: { photo: "beach", title: "The Valley · Phase 2", detail: "4-bed townhouse", price: "AED 3,150,000" },
    profile: [["Looking to", "Buy, to live in"], ["Budget", "AED 3.2M"], ["Project", "The Valley"], ["Timing", "3 months"], ["Came from", "Referral"], ["Financing", "Mortgage"]],
    suggestion: "رانيا، أرسلت لك خطة الدفع 75/25 بالعربية، مع حساب رسوم دائرة الأراضي والقسط الشهري التقريبي.",
    thread: [
      { dir: "in", text: "Hi, I liked the Lagoons townhouses at the weekend.", time: "13:20" },
      { dir: "out", text: "Hi Rania, Ahmed Tariq from Emaar. The 4-bed in the Phase 2 cluster is AED 3.15M with a 75/25 plan.", time: "13:26" },
      { dir: "out", time: "13:26", listing: true },
      { dir: "in", text: "Send me the payment plan in Arabic please", time: "14:02" },
    ] },
];

/** Kept for older imports: the first contact's thread. */
export const waThread: Msg[] = waContacts[0].thread;

export const sequences = [
  { name: "Bayut hot lead", channel: "whatsapp", trigger: "Score above 70 from Bayut", enrolled: 6240, sent: 31870, openRate: 91, steps: [
    { delay: "Immediately", msg: "Hello {name}, thank you for your Bayut enquiry. I’m your consultant at Emaar. Which community and budget should I search for you?" },
    { delay: "+2 hours", msg: "{name}, five units that match your search are not yet on the portals. Shall I arrange a private preview?" },
    { delay: "+1 day", msg: "Good morning {name}. New units were released in {area} this week. When would suit you for a ten-minute call?" },
  ] },
  { name: "Re-engage after 48 hours", channel: "whatsapp", trigger: "No reply in 48h", enrolled: 4120, sent: 11380, openRate: 78, steps: [
    { delay: "48h after last message", msg: "{name}, {area} is moving quickly; a unit like the one you liked was reserved yesterday. Shall I send you what remains?" },
    { delay: "+3 days", msg: "{name}, a final note from me. One unit matches exactly what you described. Five minutes this week?" },
  ] },
  { name: "After the viewing", channel: "whatsapp", trigger: "Viewing completed", enrolled: 1960, sent: 3920, openRate: 97, steps: [
    { delay: "2h after viewing", msg: "{name}, thank you for your time today. Which of the three stayed with you? I can arrange a second visit or prepare the reservation." },
    { delay: "+1 day", msg: "{name}, any questions I can answer? I can prepare the reservation form whenever you are ready." },
  ] },
  { name: "Cold lead reactivation", channel: "sms", trigger: "Cold, 7+ days without contact", enrolled: 8860, sent: 24110, openRate: 68, steps: [
    { delay: "Day 7", msg: "{name}, {agent} from Emaar. Dubai prices rose 8% last quarter. Worth a short conversation about your search? Reply YES." },
    { delay: "+5 days", msg: "{name}, a new unit in {area} within {budget} has just been released. Reply YES for details." },
  ] },
  { name: "First touch for every new lead", channel: "sms", trigger: "Any new lead, any source", enrolled: 41280, sent: 41280, openRate: 72, steps: [
    { delay: "Within 3 minutes", msg: "Hello {name}, {agent} from Emaar. Are you looking to buy to live in, to invest, or to sell? Reply 1, 2 or 3." },
  ] },
  { name: "Monthly market letter", channel: "email", trigger: "All leads, 1st of each month", enrolled: 52400, sent: 52400, openRate: 31, steps: [
    { delay: "1st of the month, 9am", msg: "Subject: {area} this month\n\n{name}, what moved in {area}: transactions, new launches, and where the value is now." },
  ] },
  { name: "AI call for unclosed hot leads", channel: "ai_call", trigger: "Hot lead, no close in 72h", enrolled: 1214, sent: 1214, openRate: 84, steps: [
    { delay: "72h after scoring hot", msg: "Observer calls: “Hello {name}, this is the Emaar AI assistant, calling for your consultant. Two units in {area} have just been released. Do you have three minutes?”" },
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
  { name: "Hamdan Al Suwaidi", step: 6, detail: "Replied on WhatsApp. With Omar Siddiqui now." },
  { name: "Fatima Al Zaabi", step: 3, detail: "WhatsApp unread. SMS sent 12 minutes ago." },
  { name: "James Whitaker", step: 4, detail: "No written reply. AI call in 40 minutes." },
  { name: "Hannah Becker", step: 5, detail: "On the weekly market letter." },
  { name: "Arjun Mehta", step: 2, detail: "Second WhatsApp sent in Hindi. Waiting to be read." },
];

export const notifs = [
  { tone: "hot" as Tone, text: "Abdullah Al Qahtani wants a whole floor at Riyadh Gate. Faisal Al Harbi has it.", time: "2m ago", unread: true },
  { tone: "warm" as Tone, text: "The AI asks to hold A-4601 to A-4603 for Hamdan Al Suwaidi. Approval needed.", time: "5m ago", unread: true },
  { tone: "wa" as Tone, text: "Nour Al Mansouri on WhatsApp: “Send me the villa plan.”", time: "12m ago", unread: true },
  { tone: "creek" as Tone, text: "Riyadh Gate opens at 21:00. 1,840 expressions of interest so far.", time: "1h ago", unread: true },
  { tone: "ok" as Tone, text: "Oqood issued: Mohammed Al Shamsi, AED 12.1M, Dubai Hills Estate.", time: "1h ago", unread: false },
  { tone: "cold" as Tone, text: "Overnight: 1,386 enquiries answered, 41 viewings booked.", time: "6h ago", unread: false },
  { tone: "creek" as Tone, text: "Crescent Gate Realty registered Chen Wei for Emaar Beachfront. Protected for 90 days.", time: "7h ago", unread: false },
  { tone: "cold" as Tone, text: "Marina Bay Properties tried to register Viktor Sokolov. Duplicate, explained.", time: "8h ago", unread: false },
  { tone: "warm" as Tone, text: "Two SPAs are waiting for an Emirates ID copy. The AI has asked both clients.", time: "1d ago", unread: false },
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
  { title: "Data residency", desc: "All data is stored in AWS Europe (Frankfurt).", checks: [{ ok: true, label: "AWS eu-central-1" }, { ok: true, label: "Encrypted in transit and at rest" }, { ok: true, label: "Backups in region" }] },
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

export const dailyLeads = [1180, 1320, 1240, 1410, 1365, 1290, 1205, 1360, 1480, 1395, 1310, 1520, 1460, 2210];

export const funnel = [
  { stage: "Leads", n: 41280 },
  { stage: "Qualified", n: 9870 },
  { stage: "Meeting", n: 6420 },
  { stage: "Offer", n: 1140 },
  { stage: "Closed", n: 486 },
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
