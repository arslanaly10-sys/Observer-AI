"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";
import { appAr } from "@/dictionaries/app-ar";

const Ctx = createContext<Locale>("en");
export const LocaleProvider = Ctx.Provider;

/** Translate an English UI string. Keys are the English strings themselves; missing Arabic falls back to English. */
export function useT() {
  const locale = useContext(Ctx);
  const t = (en: string) => (locale === "ar" ? appAr[en] ?? en : en);
  return { t, locale, rtl: locale === "ar" };
}
