"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Refreshes the page when a message or notification arrives (Supabase Realtime, which only delivers rows
 * the user may read). A slow poll stays on as a safety net if the socket drops.
 */
export function Live({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 500);
    };
    const supabase = createClient();
    const channel = supabase
      .channel(`ws-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `workspace_id=eq.${workspaceId}` }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, refresh)
      .subscribe();
    const poll = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, 30_000);
    return () => { clearInterval(poll); if (timer.current) clearTimeout(timer.current); supabase.removeChannel(channel); };
  }, [router, workspaceId, userId]);
  return null;
}
