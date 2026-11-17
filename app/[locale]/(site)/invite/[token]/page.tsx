import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { makeT } from "@/lib/tr";
import { LocaleBoundary } from "@/components/app/i18n";
import { AcceptInviteButton } from "@/components/workspace/forms";
import { NotConnected } from "@/components/auth/NotConnected";
import { Logo } from "@/components/Logo";

export const metadata = { robots: { index: false } };

export default async function Invite({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  const t = makeT(locale);
  if (!isSupabaseConfigured) return <section className="min-h-[80vh] bg-parchment px-4 pt-32"><NotConnected locale={locale} t={t} /></section>;
  const user = await getUser();
  if (!user) redirect(`/${locale}/login?mode=signup&next=${encodeURIComponent(`/${locale}/invite/${token}`)}`);
  return (
    <section className="min-h-[80vh] bg-parchment px-4 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-[420px] text-center">
        <Logo className="mx-auto size-10" />
        <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.022em]">{t("You’ve been invited to a workspace")}</h1>
        <p className="mt-3 text-ink-2">{t("You’re signed in as")} <b className="text-ink" dir="ltr">{user.email}</b>. {t("The invitation must have been sent to this email.")}</p>
        <div className="mt-8 rounded-[22px] bg-canvas p-6"><LocaleBoundary locale={locale === "ar" ? "ar" : "en"}><AcceptInviteButton token={token} /></LocaleBoundary></div>
      </div>
    </section>
  );
}
