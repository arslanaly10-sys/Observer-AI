import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export type Role = "owner" | "manager" | "agent";
export type Stage = "new" | "qualified" | "meeting" | "offer" | "won" | "lost";
export type Temp = "hot" | "warm" | "cold";

export interface Workspace { id: string; name: string; city: string | null }
export interface Membership { role: Role; workspace: Workspace }
export interface LeadRow {
  id: string; workspace_id: string; assigned_to: string | null; name: string; phone: string | null; email: string | null;
  type: "buyer" | "seller"; source: string; budget_aed: number | null; area: string | null; timeframe: string | null;
  financing: string | null; serious: boolean; stage: Stage; score: number; temp: Temp; notes: string | null;
  created_by: string; created_at: string; updated_at: string;
}
export interface Member { user_id: string; role: Role; created_at: string; full_name: string | null }

export const STAGES: Stage[] = ["new", "qualified", "meeting", "offer", "won", "lost"];
export const STAGE_LABEL: Record<Stage, string> = { new: "New", qualified: "Qualified", meeting: "Meeting set", offer: "Offer", won: "Won", lost: "Lost" };
export const STAGE_PROB: Record<Stage, number> = { new: 10, qualified: 30, meeting: 60, offer: 85, won: 100, lost: 0 };
export const WS_COOKIE = "obs-ws";

/**
 * Everything a workspace page needs: the verified user, their memberships, and the current workspace.
 * Redirects to sign-in (no session) or onboarding (no workspace yet).
 */
export async function workspaceContext(locale: string, opts: { allowNone?: boolean } = {}) {
  const user = await getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/workspace`);
  const { supabase } = user;
  const { data } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(id, name, city)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const memberships = ((data ?? []) as unknown as Membership[]).filter((m) => m.workspace);
  if (!memberships.length && !opts.allowNone) redirect(`/${locale}/workspace/onboarding`);
  const wanted = (await cookies()).get(WS_COOKIE)?.value;
  const current = memberships.find((m) => m.workspace.id === wanted) ?? memberships[0] ?? null;
  const { data: profile } = await supabase.from("profiles").select("full_name, locale").eq("id", user.id).maybeSingle();
  return { user, supabase, memberships, current, profile: profile as { full_name: string | null; locale: string } | null };
}

export function canManage(role: Role | undefined) {
  return role === "owner" || role === "manager";
}

type DB = Awaited<ReturnType<typeof workspaceContext>>["supabase"];

/** Members of a workspace with their display names (profiles are readable for teammates under RLS). */
export async function getMembers(supabase: DB, workspaceId: string): Promise<Member[]> {
  const { data: rows } = await supabase.from("workspace_members").select("user_id, role, created_at").eq("workspace_id", workspaceId).order("created_at");
  const ids = (rows ?? []).map((r) => r.user_id as string);
  const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] };
  const name = new Map((profs ?? []).map((p) => [p.id as string, p.full_name as string | null]));
  return (rows ?? []).map((r) => ({ user_id: r.user_id as string, role: r.role as Role, created_at: r.created_at as string, full_name: name.get(r.user_id as string) ?? null }));
}
