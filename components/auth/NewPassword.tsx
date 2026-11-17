"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/app/i18n";
import { Logo } from "@/components/Logo";

/** Reached from the password-reset email (the callback has already signed the user in). */
export function NewPassword() {
  const { t, locale } = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const a = String(f.get("password")), b = String(f.get("confirm"));
    if (a.length < 8) return setError(t("Use at least 8 characters for your password."));
    if (a !== b) return setError(t("The two passwords don’t match."));
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: a });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace(`/${locale}/workspace`);
    router.refresh();
  }
  const field = "mt-1.5 h-12 w-full rounded-[12px] border border-hairline bg-canvas px-4 text-[17px] outline-none focus:border-creek";
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <Logo className="mx-auto size-10" />
      <h1 className="mt-6 text-center text-[28px] font-semibold tracking-[-0.022em]">{t("Choose a new password")}</h1>
      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-[22px] bg-canvas p-6 sm:p-8">
        <label className="t-caption text-ink-2">{t("New password")}<input name="password" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={field} /></label>
        <label className="t-caption text-ink-2">{t("Confirm password")}<input name="confirm" type="password" required minLength={8} autoComplete="new-password" dir="ltr" className={field} /></label>
        {error && <p role="alert" className="t-caption rounded-[10px] bg-hot-soft px-3 py-2 text-hot">{error}</p>}
        <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? t("One moment…") : t("Save password")}</button>
      </form>
    </div>
  );
}
