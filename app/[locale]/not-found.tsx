import Link from "next/link";
import { Logo } from "@/components/Logo";

/** Bilingual 404: not-found pages receive no params, so both languages are shown. */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-parchment px-4 text-center">
      <Logo className="size-10" />
      <p className="tnum mt-8 text-[15px] text-ink-3">404</p>
      <h1 className="t-display mt-2">That page isn’t here.</h1>
      <p className="t-lead mt-3 text-ink-2">It may have moved.</p>
      <p lang="ar" dir="rtl" className="mt-6 text-[21px] font-semibold" style={{ fontFamily: "var(--font-arabic)" }}>هذه الصفحة غير موجودة.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/en" className="btn btn-primary">Go to the home page</Link>
        <Link href="/ar" lang="ar" className="btn btn-ghost" style={{ fontFamily: "var(--font-arabic)" }}><span>الصفحة الرئيسية</span></Link>
      </div>
    </main>
  );
}
