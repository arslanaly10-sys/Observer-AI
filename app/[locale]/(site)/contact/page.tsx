import type { Metadata } from "next";
import Image from "next/image";
import { getSite } from "@/dictionaries/site";
import type { Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { img } from "@/lib/img";
import { Heading } from "@/components/site/Section";
import { DemoForm } from "@/components/site/DemoForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMeta(locale, "/contact", getSite(locale).nav.contact, getSite(locale).contact.sub);
}

export default async function Contact({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const c = getSite(locale).contact;
  return (
    <section className="bg-canvas">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-4 pb-20 pt-16 sm:px-6 md:pt-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Heading level={1} h={c.h1} body={c.sub} stack />
          <div className="zoom-frame relative mt-10 aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src={img("interiorLiving", 1200)} alt={locale === "ar" ? "غرفة معيشة مشرقة" : "A bright open-plan living room"} fill sizes="(min-width:1024px) 520px, 100vw" className="object-cover" />
          </div>
          <h2 className="t-tagline mt-10">{c.asideH}</h2>
          <ol className="mt-4 space-y-3">
            {c.aside.map((s, i) => (
              <li key={s} className="flex gap-3 text-ink-2"><span className="tnum flex size-7 shrink-0 items-center justify-center rounded-full border border-hairline text-[13px] font-semibold text-ink">{i + 1}</span><span className="pt-0.5">{s}</span></li>
            ))}
          </ol>
        </div>
        <div className="rounded-[24px] border border-hairline bg-canvas p-6 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.25)] sm:p-10 lg:sticky lg:top-24 lg:self-start">
          <DemoForm t={c} locale={locale} />
        </div>
      </div>
    </section>
  );
}
