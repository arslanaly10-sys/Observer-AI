import { PlugsConnected } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

/** Shown on sign-in and workspace pages until NEXT_PUBLIC_SUPABASE_URL and the publishable key are set. */
export function NotConnected({ locale, t }: { locale: string; t: (s: string) => string }) {
  return (
    <div className="w-full max-w-[400px]">
      <PlugsConnected size={36} className="text-creek" />
      <h1 className="mt-6 text-[34px] font-semibold leading-[1.1] tracking-[-0.025em]">{t("Accounts are almost ready")}</h1>
      <p className="mt-3 text-[17px] text-ink-2">{t("Sign-in turns on as soon as the Supabase project is connected. Until then, the full demo is open to everyone.")}</p>
      <Link href={`/${locale}/app/dashboard`} className="btn btn-primary mt-8">{t("Open the demo")}</Link>
      <p className="t-caption mt-8 border-t border-hairline-soft pt-5 text-ink-3">{t("Have a workspace on another server? Ask your admin for its sign-in link.")}</p>
    </div>
  );
}
