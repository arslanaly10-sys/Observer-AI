"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogo, EnvelopeSimple, CheckCircle, Eye, EyeSlash } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/components/app/i18n";
import { Logo } from "@/components/Logo";

type Mode = "signin" | "signup" | "magic" | "forgot";

const errorText: Record<string, string> = {
  "Invalid login credentials": "That email and password don’t match. Try again, or reset your password.",
  "Email not confirmed": "Confirm your email first. We sent you a link when you signed up.",
  "User already registered": "There’s already an account with this email. Sign in instead.",
  link_expired: "That link has expired or was already used. Request a new one.",
  missing_code: "That sign-in link is incomplete. Request a new one.",
  provider_error: "Google sign-in was cancelled or failed. Try again.",
  not_configured: "Sign-in isn’t connected yet.",
};

export function AuthCard({ next, initialError, initialMode = "signin" }: { next: string; initialError?: string; initialMode?: Mode }) {
  const { t, locale } = useT();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ? errorText[initialError] ?? initialError : null);
  const [sent, setSent] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const callback = (to: string) => `${location.origin}/auth/callback?next=${encodeURIComponent(to)}`;
  const fail = (msg: string) => { setError(errorText[msg] ?? msg); setBusy(false); };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return fail(error.message);
      router.replace(next);
      router.refresh();
      return;
    }
    if (mode === "signup") {
      if (password.length < 8) return fail(t("Use at least 8 characters for your password."));
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: callback(next), data: { full_name: String(f.get("name") ?? "").trim() } },
      });
      if (error) return fail(error.message);
      if (data.session) { router.replace(next); router.refresh(); return; }
      setSent(t("Check your email to confirm your account. The link signs you straight in."));
      setBusy(false);
      return;
    }
    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callback(next) } });
      if (error) return fail(error.message);
      setSent(t("We’ve emailed you a sign-in link. It works once and expires in an hour."));
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback(`/${locale}/account/password`) });
    if (error) return fail(error.message);
    setSent(t("If that email has an account, a reset link is on its way."));
    setBusy(false);
  }

  async function google() {
    setError(null);
    setBusy(true);
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) fail(error.message);
  }

  const title = { signin: "Welcome back", signup: "Create your account", magic: "Sign in with a link", forgot: "Reset your password" }[mode];
  const sub = { signin: "Sign in to see who replied overnight and what’s booked today.", signup: "Set up your workspace in a few minutes. Sandbox mode is on until you connect your channels.", magic: "We’ll email you a link that signs you in. No password needed.", forgot: "Enter your work email and we’ll send you a reset link." }[mode];
  const cta = { signin: "Sign in", signup: "Create account", magic: "Email me a link", forgot: "Send reset link" }[mode];
  const field = "mt-1.5 h-12 w-full rounded-[12px] border border-hairline bg-canvas px-4 text-[17px] outline-none focus:border-creek";

  return (
    <div className="w-full max-w-[400px]">
      <Logo className="size-9" />
      <h1 className="mt-7 text-[34px] font-semibold leading-[1.1] tracking-[-0.025em]">{t(title)}</h1>
      <p className="mt-2 text-[17px] text-ink-2">{t(sub)}</p>

      {sent ? (
        <div role="status" className="mt-8 rounded-[18px] bg-parchment p-6 text-center">
          <CheckCircle size={40} weight="fill" className="mx-auto text-ok" />
          <p className="mt-4 text-[17px]">{sent}</p>
          <button className="btn btn-ghost mt-4" onClick={() => { setSent(null); setMode("signin"); }}><span>{t("Back to sign in")}</span></button>
        </div>
      ) : (
        <div className="mt-8">
          {(mode === "signin" || mode === "signup") && (
            <>
              <button type="button" onClick={google} disabled={busy} className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-hairline text-[16px] font-medium transition hover:bg-parchment active:scale-[.98] disabled:opacity-60">
                <GoogleLogo size={20} weight="bold" /> {t("Continue with Google")}
              </button>
              <div className="my-6 flex items-center gap-3 text-[13px] text-ink-3"><span className="h-px flex-1 bg-hairline" />{t("or with email")}<span className="h-px flex-1 bg-hairline" /></div>
            </>
          )}
          <form onSubmit={submit} className="grid gap-4" noValidate={false}>
            {mode === "signup" && (
              <label className="t-caption text-ink-2">{t("Full name")}<input name="name" required autoComplete="name" className={field} /></label>
            )}
            <label className="t-caption text-ink-2">{t("Work email")}<input name="email" type="email" required autoComplete="email" dir="ltr" className={field} /></label>
            {(mode === "signin" || mode === "signup") && (
              <div className="t-caption text-ink-2">
                <div className="flex justify-between">
                  <label htmlFor="auth-password">{t("Password")}</label>
                  {mode === "signin" && <button type="button" onClick={() => { setMode("forgot"); setError(null); }} className="text-creek hover:underline">{t("Forgot password?")}</button>}
                </div>
                <div className="relative">
                  <input id="auth-password" name="password" type={show ? "text" : "password"} required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "signup" ? "new-password" : "current-password"} dir="ltr" className={`${field} pe-12`} />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={t(show ? "Hide password" : "Show password")} className="absolute end-1 top-1/2 mt-[3px] flex size-10 -translate-y-1/2 items-center justify-center text-ink-3 hover:text-ink">
                    {show ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            {error && <p role="alert" className="t-caption rounded-[10px] bg-hot-soft px-3 py-2 text-hot">{t(error)}</p>}
            <button disabled={busy} className="btn btn-primary mt-1 w-full disabled:opacity-60">{busy ? t("One moment…") : t(cta)}</button>
          </form>
          <div className="mt-6 grid justify-items-start gap-2 text-[15px]">
            {mode !== "magic" && <button type="button" onClick={() => { setMode("magic"); setError(null); }} className="inline-flex items-center gap-1.5 text-creek hover:underline"><EnvelopeSimple size={16} />{t("Email me a sign-in link instead")}</button>}
            {mode === "signin" && <p className="text-ink-2">{t("New to Observer?")} <button type="button" onClick={() => { setMode("signup"); setError(null); }} className="text-creek hover:underline">{t("Create an account")}</button></p>}
            {mode !== "signin" && <button type="button" onClick={() => { setMode("signin"); setError(null); }} className="text-ink-2 hover:text-ink">{t("I already have an account")}</button>}
          </div>
        </div>
      )}
      <p className="t-caption mt-8 border-t border-hairline-soft pt-5 text-ink-3">
        {t("By continuing you agree to our")} <Link className="underline" href={`/${locale}/terms`}>{t("Terms")}</Link> {t("and")} <Link className="underline" href={`/${locale}/privacy`}>{t("Privacy notice")}</Link>.
      </p>
    </div>
  );
}
