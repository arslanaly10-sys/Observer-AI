"use server";
/**
 * Growth engine mutations from the workspace UI. Reads and permission checks run as the signed-in user
 * (RLS decides); only actually sending a message or running the AI uses the server's service client.
 */
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { providers } from "@/lib/growth/config";
import { deliver, type LeadRecord, type OutChannel } from "@/lib/growth/send";
import { ingestLead, loadSettings } from "@/lib/growth/pipeline";
import { runDue } from "@/lib/growth/worker";
import { WEEK } from "@/lib/growth/hours";
import type { ActionResult } from "./actions";

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const ws = (locale: string, p = "") => `/${locale}/workspace${p}`;

async function requireUser() {
  const u = await getUser();
  if (!u) throw new Error("Your session has ended. Sign in again.");
  return u;
}
function friendly(e: { message?: string; code?: string } | null | undefined): string {
  if (!e) return "Something went wrong. Try again.";
  if (e.code === "42501" || /row-level security|permission denied/i.test(e.message ?? "")) return "You don’t have permission to do that in this workspace.";
  return e.message ?? "Something went wrong. Try again.";
}
async function isManager(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], workspaceId: string, uid: string) {
  const { data } = await supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", uid).maybeSingle();
  return data?.role === "owner" || data?.role === "manager";
}

// ── AI settings ─────────────────────────────────────────────────────────
export async function saveAiSettings(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const office_hours: Record<string, [string, string][]> = {};
  for (const d of WEEK) {
    const open = str(f, `${d}_open`, 5), close = str(f, `${d}_close`, 5);
    office_hours[d] = f.get(`${d}_on`) === "on" && HHMM.test(open) && HHMM.test(close) && open < close ? [[open, close]] : [];
  }
  const holidays = str(f, "holidays", 2000).split(/[\s,]+/).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  const followup_days = str(f, "followup_days", 40).split(/[\s,]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0 && n <= 60).slice(0, 6);
  const tz = str(f, "timezone", 64);
  try { new Intl.DateTimeFormat("en", { timeZone: tz }); } catch { return { ok: false, error: "That time zone isn’t recognised. Use a name like Asia/Dubai." }; }
  const qs = str(f, "quiet_start", 5), qe = str(f, "quiet_end", 5);
  if (!HHMM.test(qs) || !HHMM.test(qe)) return { ok: false, error: "Quiet hours need times like 21:00." };
  const opt = (k: string, max: number) => str(f, k, max) || null;
  const { error } = await supabase.from("workspace_settings").update({
    assistant_name: str(f, "assistant_name", 40) || "Noor", timezone: tz, office_hours, holidays,
    ai_enabled: f.get("ai_enabled") === "on", sandbox_mode: f.get("sandbox_mode") === "on",
    quiet_start: qs, quiet_end: qe, followup_days: followup_days.length ? followup_days : [1, 3, 7],
    escalate_score: Math.min(100, Math.max(50, Number(str(f, "escalate_score", 3)) || 85)),
    first_contact_delay_s: Math.min(180, Math.max(0, Number(str(f, "first_contact_delay_s", 3)) || 75)),
    whatsapp_phone_number_id: opt("whatsapp_phone_number_id", 40), whatsapp_template: str(f, "whatsapp_template", 80) || "observer_first_contact",
    email_from: opt("email_from", 254), voice_from: opt("voice_from", 40), meta_page_id: opt("meta_page_id", 40),
    updated_at: new Date().toISOString(),
  }).eq("workspace_id", workspaceId);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/ai"));
  return { ok: true, message: "Saved." };
}

/** Run the whole pipeline on a sample enquiry, right now, in sandbox: score, route, first contact. */
export async function sendTestLead(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase, id } = await requireUser();
  if (!(await isManager(supabase, workspaceId, id))) return { ok: false, error: "Only owners and managers can send test leads." };
  if (!providers.supabaseAdmin()) return { ok: false, error: "Add SUPABASE_SECRET_KEY to the server environment to run the engine." };
  const db = adminClient();
  const s = await loadSettings(db, workspaceId);
  if (!s.sandbox_mode) return { ok: false, error: "Turn sandbox mode on before sending a test lead, so nothing reaches a real person." };
  const r = await ingestLead(db, workspaceId, {
    name: str(f, "name", 120) || "Test lead", phone: "971500000000", email: "test-lead@example.com",
    message: str(f, "message", 2000) || "Hi, I'm looking for a 3 bedroom villa in Dubai Hills, around 5M, cash buyer. Can I view this week?",
    budget: null, area: null, source: "Website", channel: "website", campaign: "Sandbox test", external_ref: `test-${Date.now()}`,
    consent_whatsapp: true, consent_email: true,
  });
  await db.from("jobs").update({ run_at: new Date().toISOString() }).eq("lead_id", r.id).eq("kind", "first_contact").eq("status", "pending");
  await runDue(db, { max: 5, budgetMs: 45_000 });
  revalidatePath(ws(locale), "layout");
  return { ok: true, id: r.id, message: "Test lead created and contacted in sandbox." };
}

export async function rotateKey(locale: string, workspaceId: string, which: "form" | "ingest"): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("rotate_workspace_key", { ws: workspaceId, which });
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/ai"));
  return { ok: true, message: "New key created. Update every place that used the old one." };
}

// ── Conversations ───────────────────────────────────────────────────────
export async function sendAgentMessage(locale: string, leadId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase, id } = await requireUser();
  const body = str(f, "body", 4000);
  const channel = (str(f, "channel", 10) === "email" ? "email" : "whatsapp") as OutChannel;
  if (!body) return { ok: false, error: "Write a message first." };
  // RLS: an agent can only see (and so only message) leads they are allowed to.
  const { data: lead } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!lead) return { ok: false, error: "You don’t have permission to do that in this workspace." };
  if (lead.opted_out) return { ok: false, error: "This person asked not to be contacted." };
  if (providers.supabaseAdmin()) {
    const db = adminClient();
    const settings = await loadSettings(db, lead.workspace_id);
    const r = await deliver(db, settings, lead as LeadRecord, { channel, body, subject: str(f, "subject", 300) || undefined, author: "agent", authorId: id });
    if (r.status === "failed") return { ok: false, error: r.error ?? "The message couldn’t be sent." };
  } else {
    const { error } = await supabase.from("messages").insert({ workspace_id: lead.workspace_id, lead_id: leadId, channel, direction: "out", author: "agent", body });
    if (error) return { ok: false, error: friendly(error) };
  }
  // A person replying takes over the conversation from the AI.
  if (lead.ai_mode === "ai") await supabase.from("leads").update({ ai_mode: "human", handover_reason: "agent replied" }).eq("id", leadId);
  revalidatePath(ws(locale, "/inbox"));
  revalidatePath(ws(locale, `/leads/${leadId}`));
  return { ok: true };
}

export async function setAiMode(locale: string, leadId: string, mode: "ai" | "human" | "paused"): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("leads").update({ ai_mode: mode, handover_reason: mode === "ai" ? null : undefined }).eq("id", leadId);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/inbox"));
  revalidatePath(ws(locale, `/leads/${leadId}`));
  return { ok: true };
}

export async function markNotificationsRead(locale: string): Promise<ActionResult> {
  const { supabase, id } = await requireUser();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", id).is("read_at", null);
  revalidatePath(ws(locale), "layout");
  return { ok: true };
}

// ── Inventory ───────────────────────────────────────────────────────────
const num = (f: FormData, k: string) => { const n = parseFloat(str(f, k, 30).replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : null; };
const money = (f: FormData, k: string) => {
  const raw = str(f, k, 30); const n = num(f, k);
  if (n === null) return null;
  return Math.round(/m/i.test(raw) ? n * 1e6 : /k/i.test(raw) ? n * 1e3 : n);
};

export async function saveProject(locale: string, workspaceId: string, projectId: string | null, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const name = str(f, "name", 160);
  if (!name) return { ok: false, error: "Give the project a name." };
  const row = {
    workspace_id: workspaceId, name, developer: str(f, "developer", 160) || null, area: str(f, "area", 120) || null, city: str(f, "city", 80) || null,
    status: ["off_plan", "ready", "sold_out"].includes(str(f, "status", 10)) ? str(f, "status", 10) : "off_plan",
    handover: str(f, "handover", 60) || null, description: str(f, "description", 4000) || null,
    amenities: str(f, "amenities", 1000).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 30), updated_at: new Date().toISOString(),
  };
  const q = projectId ? supabase.from("projects").update(row).eq("id", projectId).select("id").single() : supabase.from("projects").insert(row).select("id").single();
  const { data, error } = await q;
  if (error || !data) return { ok: false, error: friendly(error) };
  const file = f.get("brochure");
  if (file instanceof File && file.size > 0) {
    if (file.size > 25 * 1024 * 1024) return { ok: false, error: "Brochures must be under 25 MB." };
    const path = `${workspaceId}/${data.id}-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage.from("brochures").upload(path, file, { contentType: file.type || "application/pdf", upsert: true });
    if (upErr) return { ok: false, error: `Project saved, but the brochure didn’t upload: ${upErr.message}` };
    await supabase.from("projects").update({ brochure_path: path }).eq("id", data.id);
  } else if (str(f, "brochure_url", 400).startsWith("https://")) {
    await supabase.from("projects").update({ brochure_path: str(f, "brochure_url", 400) }).eq("id", data.id);
  }
  revalidatePath(ws(locale, "/inventory"));
  return { ok: true, id: data.id, message: "Saved." };
}

export async function deleteProject(locale: string, projectId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/inventory"));
  return { ok: true };
}

export async function addUnit(locale: string, workspaceId: string, projectId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const unit_type = str(f, "unit_type", 80);
  if (!unit_type) return { ok: false, error: "Name the unit type, e.g. 2 BR Apartment." };
  const { error } = await supabase.from("units").insert({
    workspace_id: workspaceId, project_id: projectId, unit_type, beds: num(f, "beds"), size_sqft: num(f, "size_sqft") ? Math.round(num(f, "size_sqft")!) : null,
    price_from: money(f, "price_from"), price_to: money(f, "price_to"), available: num(f, "available") !== null ? Math.round(num(f, "available")!) : null,
  });
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/inventory"));
  return { ok: true, message: "Added." };
}

export async function deleteUnit(locale: string, unitId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("units").delete().eq("id", unitId);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/inventory"));
  return { ok: true };
}

/** Plans are written as lines: "Booking 20", "During construction 40", "On handover 40". */
export async function addPlan(locale: string, workspaceId: string, projectId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const name = str(f, "name", 80);
  if (!name) return { ok: false, error: "Name the plan, e.g. 60/40." };
  const schedule = str(f, "schedule", 2000).split("\n").map((line) => {
    const m = line.trim().match(/^(.*?)[\s:–-]+(\d{1,3}(?:\.\d+)?)\s*%?$/);
    return m ? { milestone: m[1].trim(), percent: Number(m[2]) } : null;
  }).filter(Boolean) as { milestone: string; percent: number }[];
  const total = schedule.reduce((a, s) => a + s.percent, 0);
  if (schedule.length && Math.round(total) !== 100) return { ok: false, error: `The milestones add up to ${total}%, not 100%.` };
  const { error } = await supabase.from("payment_plans").insert({ workspace_id: workspaceId, project_id: projectId, name, summary: str(f, "summary", 1000) || null, schedule, post_handover: f.get("post_handover") === "on" });
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/inventory"));
  return { ok: true, message: "Added." };
}

/** CSV columns: project, developer, area, status, handover, unit_type, beds, size_sqft, price_from, price_to, available */
export async function importCsv(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const file = f.get("file");
  const text = file instanceof File && file.size ? await file.text() : str(f, "csv", 200_000);
  const rows = parseCsv(text);
  if (rows.length < 2) return { ok: false, error: "The CSV needs a header row and at least one unit." };
  const head = rows[0].map((h) => h.toLowerCase().replace(/[^a-z_]/g, ""));
  const col = (r: string[], k: string) => (r[head.indexOf(k)] ?? "").trim();
  const projects = new Map<string, string>();
  const { data: existing } = await supabase.from("projects").select("id, name").eq("workspace_id", workspaceId);
  for (const p of existing ?? []) projects.set((p.name as string).toLowerCase(), p.id as string);
  let units = 0;
  for (const r of rows.slice(1)) {
    const pname = col(r, "project");
    if (!pname) continue;
    let pid = projects.get(pname.toLowerCase());
    if (!pid) {
      const status = col(r, "status").toLowerCase().replace(/[\s-]/g, "_");
      const { data, error } = await supabase.from("projects").insert({ workspace_id: workspaceId, name: pname.slice(0, 160), developer: col(r, "developer") || null, area: col(r, "area") || null,
        status: ["off_plan", "ready", "sold_out"].includes(status) ? status : "off_plan", handover: col(r, "handover") || null, source: "csv" }).select("id").single();
      if (error || !data) return { ok: false, error: friendly(error) };
      pid = data.id as string;
      projects.set(pname.toLowerCase(), pid);
    }
    const n = (k: string) => { const v = parseFloat(col(r, k).replace(/[^0-9.]/g, "")); return Number.isFinite(v) ? v : null; };
    if (col(r, "unit_type")) {
      const { error } = await supabase.from("units").insert({ workspace_id: workspaceId, project_id: pid, unit_type: col(r, "unit_type").slice(0, 80), beds: n("beds"),
        size_sqft: n("size_sqft") ? Math.round(n("size_sqft")!) : null, price_from: n("price_from"), price_to: n("price_to"), available: n("available") });
      if (error) return { ok: false, error: friendly(error) };
      units++;
    }
  }
  revalidatePath(ws(locale, "/inventory"));
  return { ok: true, message: `Imported ${units} units across ${projects.size} projects.` };
}

function parseCsv(text: string) {
  const out: string[][] = []; let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); if (row.some((x) => x.trim())) out.push(row); row = []; cell = ""; }
    else cell += c;
  }
  row.push(cell); if (row.some((x) => x.trim())) out.push(row);
  return out;
}

// ── Calendar ────────────────────────────────────────────────────────────
export async function setAppointmentStatus(locale: string, id: string, status: "booked" | "cancelled" | "done" | "no_show"): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/calendar"));
  return { ok: true };
}

// ── Routing profiles ────────────────────────────────────────────────────
export async function saveMemberProfile(locale: string, workspaceId: string, userId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase, id } = await requireUser();
  const manager = await isManager(supabase, workspaceId, id);
  const list = (k: string, max: number) => str(f, k, 600).split(",").map((s) => s.trim()).filter(Boolean).slice(0, max);
  const availability: Record<string, [string, string][]> = {};
  for (const d of WEEK) {
    const a = str(f, `${d}_from`, 5), b = str(f, `${d}_to`, 5);
    availability[d] = f.get(`${d}_on`) === "on" && HHMM.test(a) && HHMM.test(b) && a < b ? [[a, b]] : [];
  }
  const patch: Record<string, unknown> = {
    languages: list("languages", 10).map((l) => l.toLowerCase().slice(0, 5)), areas: list("areas", 20),
    available: f.get("available") === "on", alert_phone: str(f, "alert_phone", 40).replace(/[^\d]/g, "") || null, availability,
  };
  if (manager) {
    patch.top_performer = f.get("top_performer") === "on";
    patch.max_open_leads = Math.min(1000, Math.max(1, Number(str(f, "max_open_leads", 4)) || 40));
  }
  const { error } = await supabase.from("member_profiles").update(patch).eq("workspace_id", workspaceId).eq("user_id", userId);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale, "/team"));
  return { ok: true, message: "Saved." };
}
