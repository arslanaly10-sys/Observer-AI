import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { workspaceContext } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { LocaleBoundary } from "@/components/app/i18n";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { NotConnected } from "@/components/auth/NotConnected";

export const metadata: Metadata = { title: "Workspace", robots: { index: false } };

export default async function WorkspaceLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!isSupabaseConfigured) {
    return <div className="min-h-dvh bg-parchment px-4 pt-32"><NotConnected locale={locale} t={makeT(locale)} /></div>;
  }
  const ctx = await workspaceContext(locale, { allowNone: true });
  return (
    <LocaleBoundary locale={locale}>
      <WorkspaceShell memberships={ctx.memberships} currentId={ctx.current?.workspace.id ?? null} userName={ctx.profile?.full_name ?? ""} email={ctx.user.email}>
        {children}
      </WorkspaceShell>
    </LocaleBoundary>
  );
}
