import { PlugsConnected } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

/** Shown on sign-in and workspace pages until NEXT_PUBLIC_SUPABASE_URL and the publishable key are set. */
export function NotConnected({ locale, t }: { locale: string; t: (s: string) => string }) {
  return (
    <div className="mx-auto max-w-[480px] rounded-[22px] bg-canvas p-8 text-center">
      <PlugsConnected size={40} className="mx-auto text-creek" />
      <h1 className="mt-5 text-[24px] font-semibold tracking-[-0.02em]">{t("Accounts are almost ready")}</h1>
      <p className="mt-3 text-ink-2">{t("Sign-in turns on as soon as the Supabase project is connected. Until then, the full demo is open to everyone.")}</p>
      <Link href={`/${locale}/app/dashboard`} className="btn btn-primary mt-7">{t("Open the demo")}</Link>
    </div>
  );
}
