import "server-only";
/**
 * Server-side implementations of the concierge's tools. Every query is scoped to the lead's workspace with
 * the service client, so the agent can only ever see one company's inventory and calendar.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { calcPlan, fmtAED, type Plan } from "@/lib/engine";
import { freeSlots, formatLocal, type WeekHours } from "@/lib/growth/hours";
import { deliver, type LeadRecord, type Settings, type OutChannel } from "@/lib/growth/send";
import { notify } from "@/lib/growth/notify";

export interface ToolCtx { db: SupabaseClient; settings: Settings; lead: LeadRecord; channel: OutChannel | "voice"; actions: string[] }

type In = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() && !isNaN(+v) ? +v : undefined);
const like = (s: string) => `%${s.replace(/[%_,()]/g, " ").slice(0, 80)}%`;

export async function runTool(name: string, input: In, ctx: ToolCtx): Promise<{ text: string; isError?: boolean }> {
  try {
    const out = await TOOL_IMPL[name]?.(input ?? {}, ctx);
    if (out === undefined) return { text: `Unknown tool ${name}`, isError: true };
    return { text: typeof out === "string" ? out : JSON.stringify(out) };
  } catch (e) {
    console.error(`tool ${name} failed`, e);
    return { text: `The ${name} tool failed: ${(e as Error).message}. Tell the lead a colleague will confirm.`, isError: true };
  }
}

const TOOL_IMPL: Record<string, (i: In, c: ToolCtx) => Promise<unknown>> = {
  async search_inventory(i, { db, lead }) {
    let q = db.from("projects").select("id, name, developer, area, status, handover, units(unit_type, beds, size_sqft, price_from, price_to, available), payment_plans(name, summary)")
      .eq("workspace_id", lead.workspace_id).neq("status", "sold_out").limit(8);
    const area = str(i.area), query = str(i.query), status = str(i.status);
    if (area) q = q.ilike("area", like(area));
    if (query) q = q.or(`name.ilike.${like(query)},developer.ilike.${like(query)},description.ilike.${like(query)}`);
    if (status && status !== "any") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    const max = num(i.max_price_aed), beds = num(i.min_beds);
    const rows = (data ?? []).map((p) => ({
      ...p,
      units: (p.units as { beds: number | null; price_from: number | null }[]).filter((u) =>
        (max === undefined || (u.price_from ?? 0) <= max) && (beds === undefined || (u.beds ?? 0) >= beds)),
    })).filter((p) => p.units.length > 0 || (max === undefined && beds === undefined));
    if (!rows.length) return { results: [], note: "Nothing in the inventory matches. Do not invent options; offer to have a colleague search more widely." };
    return { results: rows };
  },

  async get_project(i, { db, lead }) {
    const { data, error } = await db.from("projects")
      .select("id, name, developer, area, city, status, handover, description, amenities, brochure_path, units(*), payment_plans(name, summary, schedule, post_handover)")
      .eq("workspace_id", lead.workspace_id).eq("id", String(i.project_id)).maybeSingle();
    if (error) throw error;
    return data ?? { error: "No such project in this company's inventory." };
  },

  async calculate_payment_plan(i) {
    const price = num(i.price_aed);
    if (!price || price < 50_000) return { error: "Give a property price in AED." };
    const plan = (["mortgage", "developer", "cash", "posthandover"].includes(String(i.plan)) ? i.plan : "mortgage") as Plan;
    const r = calcPlan({ price, plan, dpPct: num(i.down_payment_pct) ?? 20, years: num(i.years) ?? 25, rate: num(i.rate_pct) ?? 4.5, yieldPct: num(i.rental_yield_pct) ?? 6.5 });
    const f = (n: number) => fmtAED(n);
    return {
      estimate_only: true, plan, price: f(price), down_payment: f(r.dp), monthly: r.monthly ? f(r.monthly) : null,
      dld_fee_4pct: f(r.dld), agency_fee_2pct: f(r.agency), trustee_fee: f(r.trustee), mortgage_registration: r.mortgageReg ? f(r.mortgageReg) : null,
      total_fees: f(r.fees), expected_annual_rent: f(r.annualRent), gross_yield_pct: num(i.rental_yield_pct) ?? 6.5,
    };
  },

  async check_availability(i, ctx) {
    const kind = String(i.kind ?? "viewing");
    const days = Math.min(14, Math.max(1, num(i.days_ahead) ?? 5));
    const slots = await slotsFor(ctx, days, kind === "call" ? 30 : 60);
    const tz = ctx.lead.timezone ?? ctx.settings.timezone;
    if (!slots.length) return { slots: [], note: "No free times in that range. Offer to have the agent propose times." };
    return { timezone: tz, slots: slots.slice(0, 8).map((s) => ({ starts_at: s.toISOString(), local: formatLocal(s, tz) })) };
  },

  async book_appointment(i, ctx) {
    const { db, lead, settings } = ctx;
    const kind = (["viewing", "call", "meeting"].includes(String(i.kind)) ? i.kind : "viewing") as string;
    const start = new Date(String(i.starts_at));
    if (isNaN(start.getTime())) return { error: "starts_at must be a time from check_availability." };
    const mins = kind === "call" ? 30 : 60;
    const open = await slotsFor(ctx, 14, mins);
    if (!open.some((s) => s.getTime() === start.getTime())) return { error: "That time is no longer free. Call check_availability again." };
    const agent = lead.assigned_to;
    const { data, error } = await db.from("appointments").insert({
      workspace_id: lead.workspace_id, lead_id: lead.id, agent_id: agent, kind, starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + mins * 60_000).toISOString(), project_id: str(i.project_id) ?? null,
      notes: str(i.notes)?.slice(0, 1000) ?? null, created_by_ai: true,
    }).select("id").single();
    if (error) throw error;
    if (["new", "qualified"].includes(lead.stage)) await db.from("leads").update({ stage: "meeting" }).eq("id", lead.id);
    const tz = lead.timezone ?? settings.timezone;
    const when = formatLocal(start, settings.timezone);
    if (agent) await notify(db, { workspace_id: lead.workspace_id, user_id: agent, lead_id: lead.id, kind: "booking", body: `${settings.assistant_name} booked a ${kind} with ${lead.name} for ${when}.` });
    ctx.actions.push(`booked ${kind} ${start.toISOString()}`);
    return { booked: true, appointment_id: data.id, local_time_for_lead: formatLocal(start, tz), timezone: tz };
  },

  async send_brochure(i, ctx) {
    const { db, lead, settings, channel } = ctx;
    const { data: p } = await db.from("projects").select("name, brochure_path").eq("workspace_id", lead.workspace_id).eq("id", String(i.project_id)).maybeSingle();
    if (!p?.brochure_path) return { sent: false, note: "No brochure on file for this project. Say a colleague will send it." };
    let link = p.brochure_path as string;
    if (!/^https:\/\//.test(link)) {
      const { data: signed } = await db.storage.from("brochures").createSignedUrl(link, 7 * 86400);
      if (!signed?.signedUrl) return { sent: false, note: "The brochure file is missing. Say a colleague will send it." };
      link = signed.signedUrl;
    }
    const ch: OutChannel = channel === "email" ? "email" : "whatsapp";
    const r = await deliver(db, settings, lead, {
      channel: ch, author: "ai", body: ch === "email" ? `${p.name} brochure: ${link}` : `${p.name} brochure`,
      subject: `${p.name} brochure`, document: ch === "whatsapp" ? { link, filename: `${p.name}.pdf` } : undefined,
    });
    ctx.actions.push(`sent brochure ${p.name}`);
    return { sent: r.status !== "failed", project: p.name };
  },

  async update_lead(i, ctx) {
    const patch: Record<string, unknown> = {};
    const intent = str(i.intent);
    if (intent) { patch.intent = intent; if (intent === "seller" || intent === "buyer") patch.type = intent; }
    if (str(i.area)) patch.area = str(i.area)!.slice(0, 80);
    if (num(i.budget_aed)) patch.budget_aed = Math.round(num(i.budget_aed)!);
    if (str(i.timeframe)) patch.timeframe = str(i.timeframe);
    if (str(i.financing)) patch.financing = str(i.financing);
    const note = str(i.note);
    if (note) patch.notes = [ctx.lead.notes, `AI: ${note}`].filter(Boolean).join("\n").slice(-4000);
    if (i.bedrooms !== undefined && num(i.bedrooms) !== undefined) patch.notes = [patch.notes ?? ctx.lead.notes, `Bedrooms: ${num(i.bedrooms)}`].filter(Boolean).join("\n").slice(-4000);
    if (!Object.keys(patch).length) return { saved: false };
    const { error } = await ctx.db.from("leads").update(patch).eq("id", ctx.lead.id);
    if (error) throw error;
    Object.assign(ctx.lead, patch);
    ctx.actions.push("updated lead");
    return { saved: true };
  },

  async handover_to_human(i, ctx) {
    const reason = String(i.reason ?? "requested"), summary = str(i.summary) ?? "";
    await handover(ctx, reason, summary);
    return { handed_over: true, note: "Tell the lead a colleague will continue shortly. Keep it to one or two sentences." };
  },

  async call_lead(i, { db, lead, settings, actions }) {
    if (!lead.phone) return { error: "No phone number on file. Ask for one." };
    const at = str(i.at) ? new Date(String(i.at)) : new Date(Date.now() + 60_000);
    if (isNaN(at.getTime())) return { error: "Invalid time." };
    await db.from("jobs").insert({ workspace_id: lead.workspace_id, lead_id: lead.id, kind: "alert", run_at: at.toISOString(), payload: { action: "call", topic: str(i.topic) ?? null } });
    actions.push(`call scheduled ${at.toISOString()}`);
    const tz = lead.timezone ?? settings.timezone;
    return { scheduled: true, local_time: formatLocal(at, tz), note: settings.sandbox_mode ? "Sandbox: the call is recorded, not dialled." : undefined };
  },

  async opt_out(_i, { db, lead, actions }) {
    await db.from("leads").update({ opted_out: true, ai_mode: "paused" }).eq("id", lead.id);
    await db.from("jobs").update({ status: "cancelled" }).eq("lead_id", lead.id).eq("status", "pending");
    lead.opted_out = true;
    actions.push("opted out");
    return { opted_out: true };
  },
};

/** Hand the lead to a person: flag it, alert the owner (or managers when unassigned). Also used by the orchestrator. */
export async function handover(ctx: Pick<ToolCtx, "db" | "lead" | "settings" | "actions">, reason: string, summary: string) {
  const { db, lead, settings } = ctx;
  await db.from("leads").update({ ai_mode: "human", handover_reason: `${reason}: ${summary}`.slice(0, 300), stage: lead.stage === "new" ? "qualified" : lead.stage }).eq("id", lead.id);
  lead.ai_mode = "human";
  const label: Record<string, string> = { qualified: "is qualified and ready for you", requested: "asked for a person", upset: "is unhappy and needs you", offer: "wants to make an offer", specialist: "has a legal, visa or finance question", hot: "is hot" };
  const body = `${lead.name} ${label[reason] ?? "needs you"}. ${summary}`.slice(0, 1000);
  let recipients: string[] = lead.assigned_to ? [lead.assigned_to] : [];
  if (!recipients.length) {
    const { data } = await db.from("workspace_members").select("user_id").eq("workspace_id", lead.workspace_id).in("role", ["owner", "manager"]);
    recipients = (data ?? []).map((r) => r.user_id as string);
  }
  for (const user_id of recipients) await notify(db, { workspace_id: lead.workspace_id, user_id, lead_id: lead.id, kind: "handover", body, urgent: true }, settings);
  ctx.actions.push(`handover ${reason}`);
}

async function slotsFor({ db, lead, settings }: ToolCtx, days: number, slotMin: number) {
  let availability: WeekHours = settings.office_hours as WeekHours;
  const busy: { start: Date; end: Date }[] = [];
  const now = new Date();
  if (lead.assigned_to) {
    const { data: prof } = await db.from("member_profiles").select("availability").eq("workspace_id", lead.workspace_id).eq("user_id", lead.assigned_to).maybeSingle();
    if (prof?.availability) availability = prof.availability as WeekHours;
    const { data: appts } = await db.from("appointments").select("starts_at, ends_at").eq("agent_id", lead.assigned_to).eq("status", "booked")
      .gte("ends_at", now.toISOString()).lte("starts_at", new Date(now.getTime() + (days + 1) * 86_400_000).toISOString());
    for (const a of appts ?? []) busy.push({ start: new Date(a.starts_at as string), end: new Date(a.ends_at as string) });
  }
  return freeSlots({ now, tz: settings.timezone, availability, busy, days, slotMin, holidays: settings.holidays });
}
