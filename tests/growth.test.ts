import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { isOfficeOpen, isQuietTime, nextSendTime, localParts } from "@/lib/growth/hours";
import { normalizePhone, timezoneFromPhone } from "@/lib/growth/phone";
import { detectLanguage } from "@/lib/growth/language";
import { pickAgent, type Candidate } from "@/lib/growth/routing";
import { fromMetaLead, fromGoogleLead, fromGeneric } from "@/lib/growth/normalize";
import { verifyMeta, verifyTwilio, verifySvix, signToken, checkToken } from "@/lib/growth/verify";

const WEEK = { mon: [["09:00", "18:00"]], tue: [["09:00", "18:00"]], wed: [["09:00", "18:00"]], thu: [["09:00", "18:00"]], fri: [["09:00", "18:00"]], sat: [], sun: [] } as const;

describe("office and quiet hours", () => {
  // 2026-11-17 is a Tuesday. 06:30 UTC = 10:30 in Dubai.
  const tueMorningDubai = new Date("2026-11-17T06:30:00Z");
  it("is open on a weekday morning in Dubai", () => {
    expect(isOfficeOpen(tueMorningDubai, "Asia/Dubai", WEEK as never)).toBe(true);
  });
  it("is closed after 18:00 Dubai", () => {
    expect(isOfficeOpen(new Date("2026-11-17T15:00:00Z"), "Asia/Dubai", WEEK as never)).toBe(false);
  });
  it("is closed on a weekend and on a holiday", () => {
    expect(isOfficeOpen(new Date("2026-11-21T07:00:00Z"), "Asia/Dubai", WEEK as never)).toBe(false);
    expect(isOfficeOpen(tueMorningDubai, "Asia/Dubai", WEEK as never, ["2026-11-17"])).toBe(false);
  });
  it("handles quiet hours that wrap midnight, in the lead's own zone", () => {
    expect(isQuietTime(new Date("2026-11-17T19:00:00Z"), "Asia/Dubai")).toBe(true); // 23:00 Dubai
    expect(isQuietTime(new Date("2026-11-17T19:00:00Z"), "America/Sao_Paulo")).toBe(false); // 16:00 São Paulo
    expect(isQuietTime(new Date("2026-11-17T06:30:00Z"), "Asia/Dubai")).toBe(false);
  });
  it("pushes a follow-up to the end of quiet hours", () => {
    const t = nextSendTime(new Date("2026-11-17T19:00:00Z"), "Asia/Dubai");
    expect(localParts(t, "Asia/Dubai").minutes).toBe(9 * 60);
  });
  it("survives an unknown time zone", () => {
    expect(() => isQuietTime(new Date(), "Mars/Base")).not.toThrow();
  });
});

describe("phones", () => {
  it("normalises UAE local, international and 00 formats", () => {
    expect(normalizePhone("050 123 4567")).toBe("971501234567");
    expect(normalizePhone("+971 50 123 4567")).toBe("971501234567");
    expect(normalizePhone("00966 55 123 4567")).toBe("966551234567");
    expect(normalizePhone("12")).toBeNull();
  });
  it("guesses the time zone from the country code, longest prefix first", () => {
    expect(timezoneFromPhone("971501234567")).toBe("Asia/Dubai");
    expect(timezoneFromPhone("919812345678")).toBe("Asia/Kolkata");
    expect(timezoneFromPhone("5511912345678")).toBe("America/Sao_Paulo");
    expect(timezoneFromPhone("97455512345")).toBe("Asia/Qatar");
  });
});

describe("language detection", () => {
  const cases: [string, string][] = [
    ["Hi, I'm looking for a villa in Dubai Hills", "en"],
    ["مرحباً، أبحث عن فيلا في دبي هيلز", "ar"],
    ["मुझे दुबई में एक अपार्टमेंट चाहिए", "hi"],
    ["مجھے دبئی میں ایک اپارٹمنٹ چاہیے", "ur"],
    ["Hola, busco un apartamento en Dubái, ¿cuál es el precio?", "es"],
    ["Olá, procuro um apartamento em Dubai, qual é o preço?", "pt"],
    ["Здравствуйте, ищу квартиру в Дубае", "ru"],
    ["Bonjour, je cherche un appartement à Dubaï", "fr"],
    ["你好，我想在迪拜买一套公寓", "zh"],
    ["سلام، دنبال یک آپارتمان در دبی هستم", "fa"],
  ];
  for (const [text, lang] of cases) it(`detects ${lang}`, () => expect(detectLanguage(text)).toBe(lang));
});

describe("routing", () => {
  const base: Omit<Candidate, "user_id"> = { languages: ["en"], areas: [], max_open_leads: 10, open_leads: 2, available: true, top_performer: false, last_assigned_at: null };
  const team: Candidate[] = [
    { ...base, user_id: "ali", languages: ["en", "ar"], areas: ["Dubai Hills"] },
    { ...base, user_id: "priya", languages: ["en", "hi", "ur"] },
    { ...base, user_id: "star", top_performer: true },
    { ...base, user_id: "away", languages: ["ru"], available: false },
    { ...base, user_id: "full", languages: ["ru"], open_leads: 10 },
  ];
  it("prefers someone who speaks the lead's language", () => {
    expect(pickAgent({ language: "hi", score: 50, temp: "warm" }, team)?.user_id).toBe("priya");
  });
  it("prefers area specialists when language ties", () => {
    expect(pickAgent({ language: "en", area: "Dubai Hills Estate", score: 50, temp: "warm" }, team)?.user_id).toBe("ali");
  });
  it("sends hot leads to top performers when nothing else decides", () => {
    expect(pickAgent({ language: "fr", score: 90, temp: "hot" }, team)?.user_id).toBe("star");
  });
  it("skips agents who are away or at capacity", () => {
    const r = pickAgent({ language: "ru", score: 50, temp: "warm" }, team);
    expect(r?.user_id).not.toBe("away");
    expect(r?.user_id).not.toBe("full");
  });
  it("rotates fairly between equal agents", () => {
    const two: Candidate[] = [
      { ...base, user_id: "a", last_assigned_at: "2026-11-17T10:00:00Z" },
      { ...base, user_id: "b", last_assigned_at: "2026-11-17T09:00:00Z" },
    ];
    expect(pickAgent({ score: 50, temp: "warm" }, two)?.user_id).toBe("b");
  });
  it("returns null when nobody can take the lead", () => {
    expect(pickAgent({ score: 50, temp: "warm" }, [{ ...base, user_id: "x", available: false }])).toBeNull();
  });
});

describe("lead normalisers", () => {
  it("reads a Meta Lead Ads lead", () => {
    const l = fromMetaLead({ id: "123", platform: "ig", campaign_name: "Hills launch", field_data: [
      { name: "full_name", values: ["Hessa M"] }, { name: "phone_number", values: ["+971 50 111 2222"] },
      { name: "email", values: ["hessa@example.ae"] }, { name: "budget", values: ["4M"] },
    ] })!;
    expect(l).toMatchObject({ name: "Hessa M", phone: "971501112222", email: "hessa@example.ae", source: "Instagram", channel: "meta", external_ref: "123", campaign: "Hills launch", consent_whatsapp: true });
  });
  it("reads a Google Ads lead form", () => {
    const l = fromGoogleLead({ lead_id: "g1", user_column_data: [
      { column_id: "FULL_NAME", string_value: "Khaled R" }, { column_id: "PHONE_NUMBER", string_value: "+966551234567" },
    ] })!;
    expect(l).toMatchObject({ name: "Khaled R", phone: "966551234567", channel: "google", external_ref: "g1" });
  });
  it("reads nested TikTok answers", () => {
    const l = fromGeneric({ lead_id: "t1", answers: [{ name: "Name", value: "Aisha" }, { name: "Phone Number", value: "0501234567" }] }, "tiktok", "TikTok")!;
    expect(l).toMatchObject({ name: "Aisha", phone: "971501234567", channel: "tiktok", consent_whatsapp: true });
  });
  it("reads a portal email-to-JSON lead with synonyms", () => {
    const l = fromGeneric({ "Customer Name": "Omar", Mobile: "+971 52 000 1111", "Listing Ref": "PF-881", Comments: "Is it still available?" }, "portal", "Property Finder")!;
    expect(l).toMatchObject({ name: "Omar", external_ref: "PF-881", message: "Is it still available?", consent_whatsapp: true });
  });
  it("respects explicit website consent checkboxes", () => {
    const l = fromGeneric({ name: "Sara", email: "s@x.co", whatsapp: "0501112222", consent_whatsapp: "yes", consent_email: "false" }, "website", "Website")!;
    expect(l.consent_whatsapp).toBe(true);
    expect(l.consent_email).toBe(false);
  });
  it("rejects a lead with no way to contact them", () => {
    expect(fromGeneric({ name: "Ghost" }, "website", "Website")).toBeNull();
  });
});

describe("webhook signatures", () => {
  it("verifies Meta's X-Hub-Signature-256 and rejects tampering", () => {
    const body = '{"object":"page"}';
    const sig = "sha256=" + createHmac("sha256", "appsecret").update(body).digest("hex");
    expect(verifyMeta(body, sig, "appsecret")).toBe(true);
    expect(verifyMeta(body + " ", sig, "appsecret")).toBe(false);
    expect(verifyMeta(body, sig, undefined)).toBe(false);
  });
  it("verifies Twilio signatures over URL + sorted params", () => {
    const url = "https://x.ae/api/webhooks/twilio/voice";
    const params = { CallSid: "CA1", SpeechResult: "hello" };
    const sig = createHmac("sha1", "tok").update(url + "CallSidCA1SpeechResulthello").digest("base64");
    expect(verifyTwilio(url, params, sig, "tok")).toBe(true);
    expect(verifyTwilio(url, { ...params, SpeechResult: "bye" }, sig, "tok")).toBe(false);
  });
  it("verifies Svix (Resend) signatures with a replay window", () => {
    const secret = "whsec_" + Buffer.from("k3y").toString("base64");
    const now = Date.now(), ts = String(Math.floor(now / 1000)), body = '{"type":"email.received"}';
    const sig = createHmac("sha256", Buffer.from("k3y")).update(`msg1.${ts}.${body}`).digest("base64");
    expect(verifySvix(body, { id: "msg1", timestamp: ts, signature: `v1,${sig}` }, secret, now)).toBe(true);
    expect(verifySvix(body, { id: "msg1", timestamp: ts, signature: `v1,${sig}` }, secret, now + 10 * 60_000)).toBe(false);
  });
  it("issues and checks expiring URL tokens", () => {
    const tok = signToken("msg-42", "s3cret", 60);
    expect(checkToken("msg-42", tok, "s3cret")).toBe(true);
    expect(checkToken("msg-43", tok, "s3cret")).toBe(false);
    expect(checkToken("msg-42", tok, "s3cret", Date.now() + 120_000)).toBe(false);
  });
});

describe("calendar slots", async () => {
  const { zonedToUtc, freeSlots } = await import("@/lib/growth/hours");
  it("converts Dubai wall-clock time to UTC", () => {
    expect(zonedToUtc("2026-11-18", "10:00", "Asia/Dubai").toISOString()).toBe("2026-11-18T06:00:00.000Z");
    expect(zonedToUtc("2026-07-01", "10:00", "Europe/London").toISOString()).toBe("2026-07-01T09:00:00.000Z");
  });
  it("offers free hours inside availability and skips booked ones", () => {
    const now = new Date("2026-11-17T04:00:00Z"); // 08:00 Dubai, Tuesday
    const slots = freeSlots({ now, tz: "Asia/Dubai", days: 0, availability: { tue: [["10:00", "13:00"]] },
      busy: [{ start: new Date("2026-11-17T07:00:00Z"), end: new Date("2026-11-17T08:00:00Z") }] });
    expect(slots.map((s) => s.toISOString())).toEqual(["2026-11-17T06:00:00.000Z", "2026-11-17T08:00:00.000Z"]);
  });
});

describe("when the AI speaks", async () => {
  const { aiShouldReply, STOP } = await import("@/lib/growth/policy");
  const { render, FIRST_CONTACT, FOLLOWUP } = await import("@/lib/growth/templates");
  const s = { ai_enabled: true, timezone: "Asia/Dubai", office_hours: WEEK as never, holidays: [] };
  const inHours = new Date("2026-11-17T06:30:00Z"), afterHours = new Date("2026-11-17T17:00:00Z");
  it("replies to AI-mode leads at any hour", () => {
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "ai" }, inHours)).toBe(true);
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "ai" }, afterHours)).toBe(true);
  });
  it("leaves handed-over leads to the agent in office hours, and covers them after hours", () => {
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "human" }, inHours)).toBe(false);
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "human" }, afterHours)).toBe(true);
  });
  it("never speaks to opted-out or paused leads, or when AI is off", () => {
    expect(aiShouldReply(s, { opted_out: true, ai_mode: "ai" }, afterHours)).toBe(false);
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "paused" }, afterHours)).toBe(false);
    expect(aiShouldReply({ ...s, ai_enabled: false }, { opted_out: false, ai_mode: "ai" }, afterHours)).toBe(false);
  });
  it("recognises STOP in several languages but not inside a sentence", () => {
    for (const w of ["STOP", "stop.", "إلغاء", "parar", "стоп"]) expect(STOP.test(w)).toBe(true);
    expect(STOP.test("Please don't stop sending options")).toBe(false);
  });
  it("has first-contact and follow-up templates in all ten languages, each saying it is AI", () => {
    for (const set of [FIRST_CONTACT]) expect(Object.keys(set).sort()).toEqual(["ar", "en", "es", "fa", "fr", "hi", "pt", "ru", "ur", "zh"]);
    expect(Object.keys(FOLLOWUP)).toHaveLength(10);
    for (const t of Object.values(FIRST_CONTACT)) expect(t).toMatch(/AI|IA|ИИ|الذكي|هوش مصنوعی/);
    expect(render(FIRST_CONTACT.en, ["Sara", "Noor", "Meridian"])).toBe("Hi Sara, this is Noor, the AI assistant at Meridian. Thank you for your enquiry. I can share prices, payment plans and viewing times right here. What would you like to know first?");
  });
});

describe("AI and agent never talk over each other", async () => {
  const { aiShouldReply } = await import("@/lib/growth/policy");
  const s = { ai_enabled: true, timezone: "Asia/Dubai", office_hours: WEEK as never, holidays: [] };
  const evening = new Date("2026-11-17T14:10:00Z"); // 18:10 Dubai, just after closing
  it("stays quiet after hours while an agent was active in the last 30 minutes", () => {
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "human" }, evening, "2026-11-17T14:00:00Z")).toBe(false);
  });
  it("covers the conversation once the agent has gone quiet", () => {
    expect(aiShouldReply(s, { opted_out: false, ai_mode: "human" }, evening, "2026-11-17T13:00:00Z")).toBe(true);
  });
});
