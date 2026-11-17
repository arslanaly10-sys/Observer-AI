"use server";
/**
 * Workspace mutations. Every action runs as the signed-in user through the publishable key, so
 * row-level security in Postgres is the real gate; the checks here only give clearer messages.
 */
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { scoreLead } from "@/lib/engine";
import { WS_COOKIE, STAGES, type Stage } from "@/lib/workspace";
import { leads as sampleLeads } from "@/lib/data";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const ws = (locale: string) => `/${locale}/workspace`;

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

function score(input: { financing: string; budget: number | null; timeframe: string; source: string; serious: boolean; area: string }) {
  const b = input.budget ?? 0;
  const s = scoreLead({
    financing: input.financing, budget: b >= 1e6 ? `AED ${b / 1e6}M` : `AED ${Math.round(b / 1e3)}K`,
    timeframe: input.timeframe, source: input.source, urgency: input.serious ? "serious" : "researching",
    temp: input.serious ? "warm" : "cold", area: input.area,
  });
  return { score: s.score, temp: s.temp };
}

/** Parse budgets like "4.2M", "750K", "AED 3,500,000" into dirhams. */
function parseBudget(raw: string): number | null {
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (!n) return null;
  if (/m/i.test(raw)) return Math.round(n * 1e6);
  if (/k/i.test(raw)) return Math.round(n * 1e3);
  return Math.round(n);
}

// ── Workspace ───────────────────────────────────────────────────────────
export async function createWorkspace(locale: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase, id: uid } = await requireUser();
  const name = str(f, "name", 120);
  if (name.length < 2) return { ok: false, error: "Give your workspace a name of at least 2 characters." };
  const { data, error } = await supabase.from("workspaces").insert({ name, city: str(f, "city", 80) || null }).select("id").single();
  if (error || !data) return { ok: false, error: friendly(error) };
  if (f.get("samples") === "on") {
    const rows = sampleLeads.slice(0, 8).map((l) => ({
      workspace_id: data.id, name: l.name, phone: null, type: l.type === "Seller" ? "seller" : "buyer", source: l.source,
      budget_aed: parseBudget(l.budget), area: l.area, timeframe: l.timeframe, financing: l.financing, serious: l.urgency === "serious",
      stage: ({ New: "new", Qualifying: "new", Qualified: "qualified", "Meeting Set": "meeting", "Offer Stage": "offer" } as Record<string, Stage>)[l.status] ?? "new",
      score: l.score, temp: l.temp, assigned_to: l.agent.startsWith("Layla") ? uid : null,
      notes: "Sample lead. Delete it whenever you like.",
    }));
    await supabase.from("leads").insert(rows);
  }
  (await cookies()).set(WS_COOKIE, data.id, { path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 31536000 });
  redirect(ws(locale));
}

export async function switchWorkspace(locale: string, id: string) {
  await requireUser();
  (await cookies()).set(WS_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 31536000 });
  revalidatePath(ws(locale), "layout");
}

export async function updateWorkspace(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const name = str(f, "name", 120);
  if (name.length < 2) return { ok: false, error: "Give your workspace a name of at least 2 characters." };
  const { data, error } = await supabase.from("workspaces").update({ name, city: str(f, "city", 80) || null }).eq("id", workspaceId).select("id");
  if (error || !data?.length) return { ok: false, error: friendly(error ?? { code: "42501" }) };
  revalidatePath(ws(locale), "layout");
  return { ok: true, message: "Workspace saved" };
}

export async function deleteWorkspace(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { data: w } = await supabase.from("workspaces").select("name").eq("id", workspaceId).maybeSingle();
  if (!w || str(f, "confirm", 120) !== w.name) return { ok: false, error: "Type the workspace name exactly to confirm." };
  const { data, error } = await supabase.from("workspaces").delete().eq("id", workspaceId).select("id");
  if (error || !data?.length) return { ok: false, error: friendly(error ?? { code: "42501" }) };
  (await cookies()).delete(WS_COOKIE);
  redirect(ws(locale));
}

// ── Profile & session ───────────────────────────────────────────────────
export async function updateProfile(locale: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase, id } = await requireUser();
  const loc = str(f, "locale", 2) === "ar" ? "ar" : "en";
  const { error } = await supabase.from("profiles").update({ full_name: str(f, "full_name", 120) || null, locale: loc }).eq("id", id);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(ws(locale), "layout");
  return { ok: true, message: "Profile saved" };
}

export async function signOut(locale: string) {
  const u = await getUser();
  if (u) await u.supabase.auth.signOut();
  (await cookies()).delete(WS_COOKIE);
  redirect(`/${locale}/login`);
}

// ── Leads ───────────────────────────────────────────────────────────────
function leadFields(f: FormData) {
  const financing = ["Cash", "Mortgage", "N/A", "Unknown"].includes(str(f, "financing")) ? str(f, "financing") : "Unknown";
  const budget = parseBudget(str(f, "budget", 40));
  const fields = {
    name: str(f, "name", 120), phone: str(f, "phone", 40) || null, email: str(f, "email", 254) || null,
    type: str(f, "type") === "seller" ? "seller" : "buyer", source: str(f, "source", 40) || "Website",
    budget_aed: budget, area: str(f, "area", 80) || null, timeframe: str(f, "timeframe", 20) || null,
    financing, serious: f.get("serious") !== "off", notes: str(f, "notes", 4000) || null,
  };
  return { ...fields, ...score({ financing, budget, timeframe: fields.timeframe ?? "", source: fields.source, serious: fields.serious, area: fields.area ?? "" }) };
}

export async function addLead(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase, id: uid } = await requireUser();
  const fields = leadFields(f);
  if (!fields.name) return { ok: false, error: "Add the lead’s name." };
  const assign = str(f, "assigned_to", 40);
  const { data, error } = await supabase.from("leads")
    .insert({ ...fields, workspace_id: workspaceId, assigned_to: assign === "me" ? uid : assign || null })
    .select("id").single();
  if (error || !data) return { ok: false, error: friendly(error) };
  await supabase.from("activities").insert({ workspace_id: workspaceId, lead_id: data.id, kind: "created", body: `Scored ${fields.score}` });
  revalidatePath(ws(locale), "layout");
  return { ok: true, id: data.id, message: `${fields.name} added, scored ${fields.score}` };
}

export async function updateLead(locale: string, leadId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const fields = leadFields(f);
  if (!fields.name) return { ok: false, error: "Add the lead’s name." };
  const { data, error } = await supabase.from("leads").update(fields).eq("id", leadId).select("id, workspace_id");
  if (error || !data?.length) return { ok: false, error: friendly(error ?? { code: "42501" }) };
  revalidatePath(ws(locale), "layout");
  return { ok: true, message: `Saved. New score ${fields.score}` };
}

export async function setStage(locale: string, leadId: string, stage: Stage): Promise<ActionResult> {
  if (!STAGES.includes(stage)) return { ok: false, error: "Unknown stage." };
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("leads").update({ stage }).eq("id", leadId).select("id, workspace_id");
  if (error || !data?.length) return { ok: false, error: friendly(error ?? { code: "42501" }) };
  await supabase.from("activities").insert({ workspace_id: data[0].workspace_id, lead_id: leadId, kind: "stage", body: stage });
  revalidatePath(ws(locale), "layout");
  return { ok: true };
}

export async function assignLead(locale: string, leadId: string, userId: string | null): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("leads").update({ assigned_to: userId }).eq("id", leadId).select("id, workspace_id");
  if (error || !data?.length) return { ok: false, error: friendly(error ?? { code: "42501" }) };
  await supabase.from("activities").insert({ workspace_id: data[0].workspace_id, lead_id: leadId, kind: "assigned", body: userId ?? "unassigned" });
  revalidatePath(ws(locale), "layout");
  return { ok: true, message: "Assignment saved" };
}

export async function addNote(locale: string, leadId: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const body = str(f, "body", 2000);
  const kind = ["note", "call", "message"].includes(str(f, "kind")) ? str(f, "kind") : "note";
  if (!body) return { ok: false, error: "Write something first." };
  const { error } = await supabase.from("activities").insert({ workspace_id: workspaceId, lead_id: leadId, kind, body });
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(`${ws(locale)}/leads/${leadId}`);
  return { ok: true, message: "Added to the timeline" };
}

export async function deleteLead(locale: string, leadId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("leads").delete().eq("id", leadId).select("id");
  if (error || !data?.length) return { ok: false, error: friendly(error ?? { code: "42501" }) };
  revalidatePath(ws(locale), "layout");
  redirect(`${ws(locale)}/leads`);
}

// ── Team ────────────────────────────────────────────────────────────────
export async function invite(locale: string, workspaceId: string, _: ActionResult | null, f: FormData): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const email = str(f, "email", 254).toLowerCase();
  const role = ["manager", "agent"].includes(str(f, "role")) ? str(f, "role") : "agent";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  const { data, error } = await supabase.from("invitations").insert({ workspace_id: workspaceId, email, role }).select("token").single();
  if (error?.code === "23505") return { ok: false, error: "That email already has an invitation." };
  if (error || !data) return { ok: false, error: friendly(error) };
  revalidatePath(`${ws(locale)}/team`);
  return { ok: true, message: "Invitation created. Copy the link and send it.", id: data.token };
}

export async function revokeInvite(locale: string, id: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error) };
  revalidatePath(`${ws(locale)}/team`);
  return { ok: true, message: "Invitation revoked" };
}

export async function setRole(locale: string, workspaceId: string, userId: string, role: string): Promise<ActionResult> {
  if (!["owner", "manager", "agent"].includes(role)) return { ok: false, error: "Unknown role." };
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("workspace_members").update({ role }).eq("workspace_id", workspaceId).eq("user_id", userId).select("user_id");
  if (error || !data?.length) return { ok: false, error: error?.message.includes("at least one owner") ? "A workspace needs at least one owner." : friendly(error ?? { code: "42501" }) };
  revalidatePath(`${ws(locale)}/team`);
  return { ok: true, message: "Role updated" };
}

export async function removeMember(locale: string, workspaceId: string, userId: string): Promise<ActionResult> {
  const { supabase, id } = await requireUser();
  const { data, error } = await supabase.from("workspace_members").delete().eq("workspace_id", workspaceId).eq("user_id", userId).select("user_id");
  if (error || !data?.length) return { ok: false, error: error?.message.includes("at least one owner") ? "A workspace needs at least one owner." : friendly(error ?? { code: "42501" }) };
  if (userId === id) { (await cookies()).delete(WS_COOKIE); redirect(ws(locale)); }
  revalidatePath(`${ws(locale)}/team`);
  return { ok: true, message: "Removed from the workspace" };
}

export async function acceptInvite(locale: string, token: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("accept_invitation", { invite_token: token });
  if (error) return { ok: false, error: error.message };
  (await cookies()).set(WS_COOKIE, String(data), { path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 31536000 });
  redirect(ws(locale));
}
