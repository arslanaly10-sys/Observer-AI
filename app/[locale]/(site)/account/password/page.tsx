import type { Locale } from "@/lib/i18n";
import { LocaleBoundary } from "@/components/app/i18n";
import { NewPassword } from "@/components/auth/NewPassword";

export const metadata = { robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <section className="min-h-[80vh] bg-parchment px-4 pb-24 pt-28 md:pt-32">
      <LocaleBoundary locale={locale}><NewPassword /></LocaleBoundary>
    </section>
  );
}
