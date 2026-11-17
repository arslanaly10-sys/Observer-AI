import type { Metadata } from "next";
import { AppShell } from "@/components/app/Shell";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "App", robots: { index: false } };

export default async function AppLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AppShell locale={locale}>{children}</AppShell>;
}
