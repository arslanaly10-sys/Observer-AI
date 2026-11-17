"use client";
import { useState, type FormEvent } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import type { SiteDict } from "@/dictionaries/site";

type Errors = Partial<Record<"name" | "company" | "phone" | "email" | "consent", string>>;

export function DemoForm({ t, locale }: { t: SiteDict["contact"]; locale: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;
    const errs: Errors = {};
    for (const k of ["name", "company", "phone", "email"] as const) if (!data[k]?.trim()) errs[k] = t.required;
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t.emailInvalid;
    if (!data.consent) errs.consent = t.required;
    setErrors(errs);
    if (Object.keys(errs).length) {
      setState("error");
      (e.currentTarget.querySelector(`[name="${Object.keys(errs)[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, locale }) });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done")
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
        <CheckCircle size={48} weight="fill" className="text-ok" />
        <p className="t-tagline mt-5 max-w-[30ch]">{t.done}</p>
      </div>
    );

  const field = "mt-1.5 h-12 w-full rounded-[12px] border bg-canvas px-4 text-[17px] outline-none transition-colors focus:border-creek";
  const err = (k: keyof Errors) => errors[k] && <p id={`${k}-err`} className="t-caption mt-1.5 text-hot">{errors[k]}</p>;
  const cls = (k: keyof Errors) => `${field} ${errors[k] ? "border-hot" : "border-hairline"}`;
  const aria = (k: keyof Errors) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <form noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <label className="t-caption text-ink-2 sm:col-span-2">{t.fields.name}<input name="name" autoComplete="name" className={cls("name")} {...aria("name")} />{err("name")}</label>
      <label className="t-caption text-ink-2">{t.fields.company}<input name="company" autoComplete="organization" className={cls("company")} {...aria("company")} />{err("company")}</label>
      <label className="t-caption text-ink-2">{t.fields.role}
        <select name="role" className={`${field} border-hairline`}>{t.roles.map((r) => <option key={r}>{r}</option>)}</select>
      </label>
      <label className="t-caption text-ink-2">{t.fields.phone}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+971" dir="ltr" className={cls("phone")} {...aria("phone")} />{err("phone")}</label>
      <label className="t-caption text-ink-2">{t.fields.email}<input name="email" type="email" autoComplete="email" dir="ltr" className={cls("email")} {...aria("email")} />{err("email")}</label>
      <label className="t-caption text-ink-2 sm:col-span-2">{t.fields.size}
        <select name="size" className={`${field} border-hairline`}>{t.sizes.map((r) => <option key={r}>{r}</option>)}</select>
      </label>
      <label className="t-caption text-ink-2 sm:col-span-2">{t.fields.message}<textarea name="message" rows={4} className={`${field} h-auto border-hairline py-3`} /></label>
      <div className="sm:col-span-2">
        <label className="flex min-h-11 items-start gap-3 text-[15px] text-ink-2">
          <input type="checkbox" name="consent" value="yes" className="mt-1 size-5 accent-[var(--creek)]" {...aria("consent")} />
          {t.fields.consent}
        </label>
        {err("consent")}
      </div>
      {state === "error" && <p role="alert" className="t-caption text-hot sm:col-span-2">{t.error}</p>}
      <button disabled={state === "sending"} className="btn btn-primary w-full disabled:opacity-60 sm:col-span-2">{state === "sending" ? t.sending : t.submit}</button>
    </form>
  );
}
