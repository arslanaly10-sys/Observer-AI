/**
 * The public HTTP routes against Postgres + PostgREST: intake keys, honeypot, rate limits, Meta webhook
 * signatures and WhatsApp intake, the worker's auth, Twilio signatures, and the plan limit.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { createServer, request, type Server } from "node:http";
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// `after()` needs a live request scope. In tests it runs the work straight away and keeps the promise, so a
// test can wait for the background step and check what it did.
const bg = vi.hoisted(() => [] as Promise<unknown>[]);
vi.mock("next/server", async (orig) => ({ ...(await orig<typeof import("next/server")>()), after: (fn: () => unknown) => { bg.push(Promise.resolve().then(fn)); } }));
const settle = async () => { await Promise.all(bg.splice(0)); };

const PGRST = process.env.POSTGREST_URL;
const JWT_SECRET = process.env.PGRST_JWT_SECRET ?? "";
const WS = "00000000-0000-0000-0000-00000000e2e0";
const FORM = "22222222-2222-2222-2222-222222222222", INGEST = "11111111-1111-1111-1111-111111111111";
const run = PGRST ? describe : describe.skip;

function jwt(payload: object) {
  const b = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = `${b({ alg: "HS256", typ: "JWT" })}.${b(payload)}`;
  return `${head}.${createHmac("sha256", JWT_SECRET).update(head).digest("base64url")}`;
}
const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(url, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "content-type": "application/json", ...headers } });

let proxy: Server, db: SupabaseClient;
let intake: typeof import("@/app/api/intake/[token]/route");
let meta: typeof import("@/app/api/webhooks/meta/route");
let worker: typeof import("@/app/api/worker/route");
let voice: typeof import("@/app/api/webhooks/twilio/voice/route");

run("public routes", () => {
  beforeAll(async () => {
    const target = new URL(PGRST!);
    proxy = createServer((req, res) => {
      const up = request({ host: target.hostname, port: target.port, path: (req.url ?? "/").replace(/^\/rest\/v1/, ""), method: req.method, headers: { ...req.headers, host: target.host } },
        (r) => { res.writeHead(r.statusCode ?? 502, r.headers); r.pipe(res); });
      req.pipe(up);
    });
    await new Promise<void>((ok) => proxy.listen(0, ok));
    const url = `http://127.0.0.1:${(proxy.address() as { port: number }).port}`;
    const key = jwt({ role: "service_role", iss: "e2e", exp: Math.floor(Date.now() / 1000) + 3600 });
    Object.assign(process.env, { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk", SUPABASE_SECRET_KEY: key, META_APP_SECRET: "meta-secret", META_VERIFY_TOKEN: "verify-me", TWILIO_AUTH_TOKEN: "twilio-token", APP_URL: "https://observer.test" });
    db = createClient(url, key, { auth: { persistSession: false } });
    intake = await import("@/app/api/intake/[token]/route");
    meta = await import("@/app/api/webhooks/meta/route");
    worker = await import("@/app/api/worker/route");
    voice = await import("@/app/api/webhooks/twilio/voice/route");
  });
  afterEach(settle); // each test's background work finishes before the next test starts
  afterAll(() => new Promise<void>((ok) => proxy?.close(() => ok())));
  const ctx = (token: string) => ({ params: Promise.resolve({ token }) });

  it("refuses unknown keys and malformed tokens", async () => {
    expect((await intake.POST(post("https://x/api/intake/nope", {}), ctx("nope"))).status).toBe(404);
    expect((await intake.POST(post("https://x/api/intake/x", {}), ctx("33333333-3333-3333-3333-333333333333"))).status).toBe(404);
  });

  it("takes a website form lead with the form key", async () => {
    const r = await intake.POST(post("https://x/api/intake/k", { name: "Route Test", phone: "+971 50 444 0001", message: "2 bed in Marina" }, { "x-real-ip": "10.0.0.1" }), ctx(FORM));
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.ok).toBe(true);
    const { data } = await db.from("leads").select("source, channel").eq("id", j.lead_id).single();
    expect(data).toMatchObject({ source: "Website", channel: "website" });
  });

  it("runs the background step after a form lead: first contact goes out", async () => {
    const r = await intake.POST(post("https://x/api/intake/k", { name: "Background Test", phone: "+971 50 444 0002", email: "bg@example.ae", message: "Hello" }, { "x-real-ip": "10.0.0.11" }), ctx(FORM));
    const j = await r.json();
    await settle();
    const { data } = await db.from("messages").select("channel, status").eq("lead_id", j.lead_id).eq("direction", "out");
    expect(data!.length).toBeGreaterThanOrEqual(1);
    expect(data!.every((m) => m.status === "sandbox")).toBe(true);
  });

  it("asks a new UAE caller to choose English or Arabic, then remembers the choice", async () => {
    const sign = (url: string, params: Record<string, string>) => createHmac("sha1", "twilio-token").update(url + Object.keys(params).sort().map((k) => k + params[k]).join("")).digest("base64");
    const params = { CallSid: "CA-menu", From: "+971509990002", To: "+97140000000", Direction: "inbound" };
    const url = "https://observer.test/api/webhooks/twilio/voice";
    const r = await voice.POST(new NextRequest(url, { method: "POST", body: new URLSearchParams(params), headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": sign(url, params) } }));
    const twiml = await r.text();
    expect(twiml).toContain("For English, press 1.");
    const action = twiml.match(/action="([^"]+)"/)![1].replace(/&amp;/g, "&");
    const lang = await import("@/app/api/webhooks/twilio/voice/lang/route");
    const p2 = { CallSid: "CA-menu", Digits: "2" };
    const r2 = await lang.POST(new NextRequest(action, { method: "POST", body: new URLSearchParams(p2), headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": sign(action, p2) } }));
    expect(r2.status).toBe(200);
    const { data } = await db.from("leads").select("language").eq("phone", "971509990002").single();
    expect(data!.language).toBe("ar");
  });

  it("pretends success for bots that fill the honeypot", async () => {
    const r = await intake.POST(post("https://x/api/intake/k", { name: "Bot", phone: "+971500009999", _hp: "x" }, { "x-real-ip": "10.0.0.2" }), ctx(FORM));
    expect(await r.json()).toEqual({ ok: true });
    const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("phone", "971500009999");
    expect(count).toBe(0);
  });

  it("rate-limits a burst of form submissions from one address", async () => {
    const codes: number[] = [];
    for (let i = 0; i < 6; i++) codes.push((await intake.POST(post("https://x/api/intake/k", { name: `Burst ${i}`, phone: `+97150555000${i}` }, { "x-real-ip": "10.0.0.3" }), ctx(FORM))).status);
    expect(codes.slice(0, 5).every((c) => c === 200)).toBe(true);
    expect(codes[5]).toBe(429);
  });

  it("lets server tools post with the private key, but only as their own source", async () => {
    const r = await intake.POST(post("https://x/api/intake/k?source=tiktok", { lead_id: "tt-1", answers: [{ name: "Name", value: "Tik Lead" }, { name: "Phone Number", value: "0507770001" }] }, { "x-real-ip": "10.0.0.4" }), ctx(INGEST));
    const j = await r.json();
    const { data } = await db.from("leads").select("source").eq("id", j.lead_id).single();
    expect(data!.source).toBe("TikTok");
  });

  it("verifies Meta's webhook handshake and signatures", async () => {
    const ok = await meta.GET(new NextRequest("https://x/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42"));
    expect(await ok.text()).toBe("42");
    expect((await meta.GET(new NextRequest("https://x/api/webhooks/meta?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=42"))).status).toBe(403);
    expect((await meta.POST(post("https://x/api/webhooks/meta", "{}", { "x-hub-signature-256": "sha256=bad" }))).status).toBe(401);
  });

  it("turns a signed WhatsApp message to the business number into a routed lead", async () => {
    const body = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value: {
      metadata: { phone_number_id: "1112223334" }, contacts: [{ wa_id: "971508880001", profile: { name: "Signed Sender" } }],
      messages: [{ id: "wamid.route.1", from: "971508880001", type: "text", text: { body: "Hi, any villas in Dubai Hills?" } }],
    } }] }] });
    const sig = "sha256=" + createHmac("sha256", "meta-secret").update(body).digest("hex");
    expect((await meta.POST(post("https://x/api/webhooks/meta", body, { "x-hub-signature-256": sig }))).status).toBe(200);
    const { data } = await db.from("leads").select("name, channel, assigned_to, consent_whatsapp").eq("phone", "971508880001").single();
    expect(data).toMatchObject({ name: "Signed Sender", channel: "whatsapp", consent_whatsapp: true });
    expect(data!.assigned_to).not.toBeNull();
  });

  it("keeps the worker closed without its secret", async () => {
    expect((await worker.POST(new NextRequest("https://x/api/worker", { method: "POST" }))).status).toBe(401);
    const r = await worker.POST(new NextRequest("https://x/api/worker", { method: "POST", headers: { authorization: `Bearer ${process.env.WORKER_SECRET}` } }));
    expect(r.status).toBe(200);
    const { data } = await db.from("worker_heartbeat").select("last_run_at").eq("id", 1).single();
    expect(Date.now() - Date.parse(data!.last_run_at)).toBeLessThan(60_000);
  });

  it("rejects Twilio requests without a valid signature", async () => {
    const form = new URLSearchParams({ CallSid: "CA1", From: "+971501234567", To: "+97140000000", Direction: "inbound" });
    const r = await voice.POST(new NextRequest("https://observer.test/api/webhooks/twilio/voice", { method: "POST", body: form, headers: { "content-type": "application/x-www-form-urlencoded", "x-twilio-signature": "bad" } }));
    expect(r.status).toBe(401);
  });

  it("stops the AI contacting leads once the plan's monthly allowance is used", async () => {
    await db.from("workspace_settings").update({ monthly_lead_limit: 1 }).eq("workspace_id", WS);
    try {
      const r = await intake.POST(post("https://x/api/intake/k", { name: "Over Limit", phone: "+971506660001", email: "over@example.ae" }, { "x-real-ip": "10.0.0.9" }), ctx(FORM));
      const j = await r.json();
      const { data: lead } = await db.from("leads").select("ai_mode").eq("id", j.lead_id).single();
      expect(lead!.ai_mode).toBe("paused");
      const { count } = await db.from("jobs").select("id", { count: "exact", head: true }).eq("lead_id", j.lead_id).eq("kind", "first_contact");
      expect(count).toBe(0);
      // Upgrading (no limit) brings the lead back: the next worker run resumes it and queues first contact.
      await db.from("workspace_settings").update({ monthly_lead_limit: null }).eq("workspace_id", WS);
      const { resumePlanPaused } = await import("@/lib/growth/pipeline");
      expect(await resumePlanPaused(db)).toBeGreaterThanOrEqual(1);
      const { data: back } = await db.from("leads").select("ai_mode").eq("id", j.lead_id).single();
      expect(back!.ai_mode).toBe("ai");
      const { count: queued } = await db.from("jobs").select("id", { count: "exact", head: true }).eq("lead_id", j.lead_id).eq("kind", "first_contact");
      expect(queued).toBe(1);
    } finally {
      await db.from("workspace_settings").update({ monthly_lead_limit: null }).eq("workspace_id", WS);
    }
  });
});
