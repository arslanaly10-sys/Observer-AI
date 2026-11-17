import { appAr } from "@/dictionaries/app-ar";
import { wsAr } from "@/dictionaries/workspace-ar";

/** Server-side translator for app and workspace strings (keys are the English text). */
export function makeT(locale: string) {
  return (en: string) => (locale === "ar" ? wsAr[en] ?? appAr[en] ?? en : en);
}
