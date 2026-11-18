import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { DemoSignIn } from "@/components/demo/SignIn";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DemoSignIn locale={locale as Locale} />;
}
