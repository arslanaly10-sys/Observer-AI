/**
 * The growth engine end to end, in sandbox mode, against a real Postgres behind PostgREST (the same API
 * Supabase serves). Needs POSTGREST_URL and PGRST_JWT_SECRET; CI starts both. Without ANTHROPIC_API_KEY the
 * rules engine scores and writes replies, which is exactly what sandbox demos do before Claude is connected.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, request, type Server } from "node:http";
import { createHmac } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ingestLead, handleInbound, loadLead, loadSettings, createInboundLead } from "@/lib/growth/pipeline";
import { runDue } from "@/lib/growth/worker";
import { runTool } from "@/lib/ai/tools";
import { fromGeneric } from "@/lib/growth/normalize";

const PGRST = process.env.POSTGREST_URL;
const SECRET = process.env.PGRST_JWT_SECRET ?? "";
const WS = "00000000-0000-0000-0000-00000000e2e0";
const ALI = "00000000-0000-0000-0000-0000000000a2";
const PRIYA = "00000000-0000-0000-0000-0000000000a3";
const run = PGRST ? describe : describe.skip;

function jwt(payload: object) {
  const b = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = `${b({ alg: "HS256", typ: "JWT" })}.${b(payload)}`;
  return `${head}.${createHmac("sha256", SECRET).update(head).digest("base64url")}`;
}

let proxy: Server;
let db: SupabaseClient;
const drain = async () => { for (let i = 0; i < 6; i++) { const r = await runDue(db, { max: 20, budgetMs: 60_000 }); if (!r.length) break; } };
const forceDue = (leadId: string, kind?: string) => {
  let q = db.from("jobs").update({ run_at: new Date(Date.now() - 1000).toISOString() }).eq("lead_id", leadId).eq("status", "pending");
  if (kind) q = q.eq("kind", kind);
  return q;
};

run("growth engine, end to end (sandbox)", () => {
  beforeAll(async () => {
    // supabase-js talks to <url>/rest/v1; PostgREST serves at its root. A tiny proxy bridges the two.
    const target = new URL(PGRST!);
    proxy = createServer((req, res) => {
      const up = request({ host: target.hostname, port: target.port, path: (req.url ?? "/").replace(/^\/rest\/v1/, ""), method: req.method, headers: { ...req.headers, host: target.host } },
        (r) => { res.writeHead(r.statusCode ?? 502, r.headers); r.pipe(res); });
      req.pipe(up);
    });
    await new Promise<void>((ok) => proxy.listen(0, ok));
    const port = (proxy.address() as { port: number }).port;
    const key = jwt({ role: "service_role", iss: "e2e", exp: Math.floor(Date.now() / 1000) + 3600 });
    db = createClient(`http://127.0.0.1:${port}`, key, { auth: { persistSession: false, autoRefreshToken: false } });
  });
  afterAll(() => new Promise<void>((ok) => proxy?.close(() => ok())));

  let leadId = "";

  it("takes in a website lead, scores it, and routes it to the Arabic-speaking Dubai Hills agent", async () => {
    const n = fromGeneric({ name: "Hessa Al Marri", phone: "+971 50 123 4567", email: "hessa@example.ae", message: "مرحباً، أبحث عن فيلا في دبي هيلز بميزانية 5 مليون نقداً وأريد المعاينة هذا الأسبوع" }, "website", "Website")!;
    const r = await ingestLead(db, WS, n);
    leadId = r.id;
    const lead = (await loadLead(db, leadId))!;
    expect(lead.language).toBe("ar");
    expect(lead.assigned_to).toBe(ALI);
    expect(lead.score).toBeGreaterThan(0);
    expect(["hot", "warm", "cold"]).toContain(lead.temp);
    expect(lead.score_reason).toBeTruthy();
    const { data: jobs } = await db.from("jobs").select("kind").eq("lead_id", leadId).eq("status", "pending");
    expect(jobs!.map((j) => j.kind)).toContain("first_contact");
  });

  it("is idempotent: the same person enquiring again joins the existing conversation", async () => {
    const again = fromGeneric({ name: "Hessa", phone: "0501234567", message: "Any update?" }, "website", "Website")!;
    const r = await ingestLead(db, WS, again);
    expect(r).toMatchObject({ id: leadId, duplicate: true });
  });

  it("makes first contact on WhatsApp (template) and email, in sandbox, and schedules three follow-ups", async () => {
    await drain();
    const { data: out } = await db.from("messages").select("channel, author, status, media, body").eq("lead_id", leadId).eq("direction", "out");
    const wa = out!.find((m) => m.channel === "whatsapp")!;
    const em = out!.find((m) => m.channel === "email")!;
    expect(wa).toMatchObject({ author: "ai", status: "sandbox" });
    expect((wa.media as { template: { name: string } }).template.name).toBe("observer_first_contact");
    expect(wa.body).toMatch(/الذكي/); // says it's an AI, in Arabic
    expect(em).toMatchObject({ author: "ai", status: "sandbox" });
    const { data: f } = await db.from("jobs").select("payload").eq("lead_id", leadId).eq("kind", "followup").eq("status", "pending");
    expect(f).toHaveLength(3);
  });

  it("answers a WhatsApp reply and cancels the follow-ups", async () => {
    const lead = (await loadLead(db, leadId))!;
    await handleInbound(db, lead, { channel: "whatsapp", text: "كم سعر الفيلا وما هي خطة السداد؟", providerId: "wamid.e2e.1" });
    const { data: f } = await db.from("jobs").select("id").eq("lead_id", leadId).eq("kind", "followup").eq("status", "pending");
    expect(f).toHaveLength(0);
    await forceDue(leadId);
    await drain();
    const { data: replies } = await db.from("messages").select("status, author").eq("lead_id", leadId).eq("channel", "whatsapp").eq("direction", "out").order("id");
    expect(replies!.at(-1)).toMatchObject({ author: "ai", status: "sandbox" });
  });

  it("ignores a provider retry of the same WhatsApp message", async () => {
    const lead = (await loadLead(db, leadId))!;
    const r = await handleInbound(db, lead, { channel: "whatsapp", text: "duplicate", providerId: "wamid.e2e.1" });
    expect(r).toEqual({ duplicate: true });
  });

  it("gives the AI real inventory, payment maths and calendar slots, and books a viewing", async () => {
    const lead = (await loadLead(db, leadId))!;
    const settings = await loadSettings(db, WS);
    const ctx = { db, settings, lead, channel: "whatsapp" as const, actions: [] as string[] };
    const inv = JSON.parse((await runTool("search_inventory", { area: "Dubai Hills", max_price_aed: 6_000_000 }, ctx)).text);
    expect(inv.results[0].name).toBe("Hills Grove");
    const none = JSON.parse((await runTool("search_inventory", { area: "Jumeirah Golf" }, ctx)).text);
    expect(none.results).toHaveLength(0); // nothing invented
    const plan = JSON.parse((await runTool("calculate_payment_plan", { price_aed: 4_800_000, plan: "mortgage" }, ctx)).text);
    expect(plan.fees[0]).toEqual({ label: "Transfer fee (4%)", amount: "AED 192K" });
    const slots = JSON.parse((await runTool("check_availability", { kind: "viewing", days_ahead: 7 }, ctx)).text);
    expect(slots.slots.length).toBeGreaterThan(0);
    const booked = JSON.parse((await runTool("book_appointment", { kind: "viewing", starts_at: slots.slots[0].starts_at, project_id: "00000000-0000-0000-0000-00000000f001" }, ctx)).text);
    expect(booked.booked).toBe(true);
    const again = JSON.parse((await runTool("book_appointment", { kind: "viewing", starts_at: slots.slots[0].starts_at }, ctx)).text);
    expect(again.error).toBeTruthy(); // the slot is taken now
    const { data: appt } = await db.from("appointments").select("agent_id, created_by_ai").eq("lead_id", leadId).single();
    expect(appt).toMatchObject({ agent_id: ALI, created_by_ai: true });
    expect((await loadLead(db, leadId))!.stage).toBe("meeting");
  });

  it("hands over to the agent with an alert, and the AI then stays quiet in office hours", async () => {
    const lead = (await loadLead(db, leadId))!;
    const settings = await loadSettings(db, WS);
    await runTool("handover_to_human", { reason: "offer", summary: "Wants to offer on a Hills Grove villa." }, { db, settings, lead, channel: "whatsapp", actions: [] });
    expect((await loadLead(db, leadId))!.ai_mode).toBe("human");
    const { data: n } = await db.from("notifications").select("kind").eq("lead_id", leadId).eq("user_id", ALI);
    expect(n!.map((x) => x.kind)).toContain("handover");
    await handleInbound(db, (await loadLead(db, leadId))!, { channel: "whatsapp", text: "Hello?", providerId: "wamid.e2e.2" });
    const { data: pending } = await db.from("jobs").select("kind").eq("lead_id", leadId).eq("kind", "ai_reply").eq("status", "pending");
    expect(pending).toHaveLength(0);
  });

  it("routes a Hindi enquiry to the Hindi-speaking agent and honours STOP", async () => {
    const r = await ingestLead(db, WS, fromGeneric({ name: "Rahul", phone: "+91 98123 45678", message: "मुझे दुबई में एक अपार्टमेंट चाहिए, बजट 2 मिलियन" }, "website", "Website")!);
    const lead = (await loadLead(db, r.id))!;
    expect(lead.assigned_to).toBe(PRIYA);
    expect(lead.timezone).toBe("Asia/Kolkata");
    await handleInbound(db, lead, { channel: "whatsapp", text: "STOP", providerId: "wamid.e2e.3" });
    expect((await loadLead(db, r.id))!.opted_out).toBe(true);
    const { data: left } = await db.from("jobs").select("id").eq("lead_id", r.id).eq("status", "pending");
    expect(left).toHaveLength(0);
  });

  it("answers a repeat web enquiry by email when WhatsApp's window is closed", async () => {
    const r = await ingestLead(db, WS, fromGeneric({ name: "Maya Repeat", phone: "+971 55 700 0001", email: "maya@example.ae", message: "Interested in Dubai Hills" }, "website", "Website")!);
    await forceDue(r.id); await drain();
    await ingestLead(db, WS, fromGeneric({ name: "Maya", email: "maya@example.ae", message: "Any 4 bedroom villas under 6M?" }, "website", "Website")!);
    await forceDue(r.id, "ai_reply"); await drain();
    const { data: out } = await db.from("messages").select("channel, status, author").eq("lead_id", r.id).eq("direction", "out").order("id");
    expect(out!.filter((m) => m.channel === "email" && m.author === "ai").length).toBeGreaterThanOrEqual(2);
    expect(out!.some((m) => m.status === "failed")).toBe(false);
  });

  it("routes and announces a lead who starts on WhatsApp", async () => {
    const lead = await createInboundLead(db, WS, { name: "Omar WA", phone: "971559990001", text: "مرحبا، أبحث عن شقة في دبي هيلز", source: "WhatsApp", channel: "whatsapp" });
    expect(lead.assigned_to).toBe(ALI);
    expect(lead.language).toBe("ar");
    const { data: n } = await db.from("notifications").select("kind").eq("lead_id", lead.id);
    expect(n!.length).toBeGreaterThan(0);
  });

  it("gives the AI market data and calculators", async () => {
    const lead = (await loadLead(db, leadId))!;
    const ctx = { db, settings: await loadSettings(db, WS), lead, channel: "whatsapp" as const, actions: [] as string[] };
    const costs = JSON.parse((await runTool("calculate_purchase_costs", { price_aed: 3_000_000, status: "ready", financing: "mortgage", loan_aed: 2_400_000 }, ctx)).text);
    expect(costs.lines[0].amount).toBe("AED 120K");
    const elig = JSON.parse((await runTool("check_mortgage_eligibility", { price_aed: 3_000_000, residency: "expat", monthly_income_aed: 60_000, age: 40 }, ctx)).text);
    expect(elig.ltvPct).toBe(80);
    const sched = JSON.parse((await runTool("build_payment_schedule", { price_aed: 1_000_000, plan: "60/40", months_to_handover: 24 }, ctx)).text);
    expect(sched.rows.at(-1).label).toBe("Handover");
    const market = JSON.parse((await runTool("get_market_overview", { area: "Dubai Hills", developer: "Emaar" }, ctx)).text);
    expect(market.area.name).toBe("Dubai Hills Estate");
    expect(market.developer.name).toBe("Emaar");
    expect(market.indicative).toBe(true);
    const unknown = JSON.parse((await runTool("get_market_overview", { area: "Atlantis Moon" }, ctx)).text);
    expect(unknown.area.note).toMatch(/Don't guess/);
    const visa = JSON.parse((await runTool("check_golden_visa", { value_aed: 2_500_000 }, ctx)).text);
    expect(visa.likelyEligible).toBe(true);
  });

  it("leaves a hand-set score alone when rescoring", async () => {
    await db.from("leads").update({ score: 97, score_locked: true }).eq("id", leadId);
    await db.from("jobs").insert({ workspace_id: WS, lead_id: leadId, kind: "rescore", run_at: new Date(Date.now() - 1000).toISOString() });
    await drain();
    const { data: done } = await db.from("jobs").select("status").eq("lead_id", leadId).eq("kind", "rescore").order("id", { ascending: false }).limit(1);
    expect(done![0].status).toBe("done");
    expect((await loadLead(db, leadId))!.score).toBe(97);
  });

  it("limits a flood of public form submissions from one address", async () => {
    const results: (string | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const { data } = await db.rpc("intake_allowed", { ws: WS, ip: "flood-ip", phone_number: `97155000000${i}`, is_public: true });
      results.push(data as string | null);
    }
    expect(results.slice(0, 5).every((x) => x === null)).toBe(true);
    expect(results[5]).toMatch(/too many/);
  });
});
