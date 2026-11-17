import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";
import { makeT } from "@/lib/tr";
import { AuthCard } from "@/components/auth/AuthCard";
import { NotConnected } from "@/components/auth/NotConnected";
import { LocaleBoundary } from "@/components/app/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: makeT(locale)("Sign in"), robots: { index: false } };
}

export default async function Login({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ next?: string; error?: string; mode?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = makeT(locale);
  const next = safeNext(sp.next, `/${locale}/workspace`);
  if (isSupabaseConfigured && (await getUser())) redirect(next);
  return (
    <section className="min-h-[80vh] bg-parchment px-4 pb-24 pt-28 md:pt-32">
      {isSupabaseConfigured ? (
        <LocaleBoundary locale={locale}>
          <AuthCard next={next} initialError={sp.error} initialMode={sp.mode === "signup" ? "signup" : "signin"} />
        </LocaleBoundary>
      ) : (
        <NotConnected locale={locale} t={t} />
      )}
    </section>
  );
}
