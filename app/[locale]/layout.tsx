import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Instrument_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { locales, isLocale, dirOf } from "@/lib/i18n";
import "../globals.css";

const latin = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-latin", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-arabic", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  return {
    title: { default: ar ? "أوبزرفر AI · مكتب المبيعات الذكي لعقارات الخليج" : "Observer AI · The AI sales desk for Gulf real estate", template: "%s · Observer AI" },
    description: ar
      ? "يرد أوبزرفر على كل استفسار عقاري عبر واتساب خلال أربع دقائق، ويقيّم جدية المشتري، ويخبر وكلاءك بمن يتصلون أولاً."
      : "Observer answers every property enquiry on WhatsApp within four minutes, scores how serious each buyer is, and tells your agents who to call next.",
    metadataBase: new URL("https://observer-ai.example"),
    openGraph: { type: "website", siteName: "Observer AI", images: ["/og.jpg"] },
    icons: { icon: "/icon.svg" },
    alternates: { languages: { en: "/en", ar: "/ar" } },
  };
}

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${latin.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
