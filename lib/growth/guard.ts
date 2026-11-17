import "server-only";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/** The signing secret for call and audio links. Voice features refuse to run without a real one. */
export function linkSecret() {
  const s = process.env.WORKER_SECRET ?? "";
  return s.length >= 24 ? s : null;
}

/** Client address, hashed so raw IPs are never stored. */
export function ipHash(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(`${ip}|${process.env.WORKER_SECRET ?? "observer"}`).digest("hex").slice(0, 32);
}

/** Cloudflare Turnstile. Required for browser forms when TURNSTILE_SECRET_KEY is set. */
export async function verifyCaptcha(token: string | null, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
  }).catch(() => null);
  const json = await res?.json().catch(() => null);
  return Boolean(json?.success);
}

/** Records the attempt; returns a reason when it must be refused. */
export async function intakeLimit(db: SupabaseClient, workspaceId: string, ip: string, phone: string | null, isPublic: boolean) {
  const { data, error } = await db.rpc("intake_allowed", { ws: workspaceId, ip, phone_number: phone, is_public: isPublic });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/** Find a workspace by either key. */
export async function workspaceForKey(db: SupabaseClient, key: string) {
  const { data: byIngest } = await db.from("workspace_settings").select("workspace_id").eq("ingest_token", key).maybeSingle();
  if (byIngest) return { workspaceId: byIngest.workspace_id as string, isPublic: false };
  const { data: byForm } = await db.from("workspace_settings").select("workspace_id").eq("form_key", key).maybeSingle();
  if (byForm) return { workspaceId: byForm.workspace_id as string, isPublic: true };
  return null;
}
