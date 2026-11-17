import type { Metadata } from "next";
import Image from "next/image";
import { getSite } from "@/dictionaries/site";
import type { Locale } from "@/lib/i18n";
import { img } from "@/lib/img";
import { Tile, Heading, Cta } from "@/components/site/Section";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getSite(locale).nav.about, description: getSite(locale).about.sub };
}

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getSite(locale);
  const a = t.about;
  return (
    <>
      <Tile className="pt-14">
        <Heading level={1} h={a.h1} body={a.sub} />
      </Tile>
      <section className="zoom-frame relative h-[64vh] min-h-[380px] overflow-hidden">
        <Image src={img("marinaCamels", 2400)} alt={locale === "ar" ? "أبراج دبي مارينا" : "Dubai Marina towers"} fill priority sizes="100vw" className="object-cover" />
      </section>
      <Tile>
        <div className="mx-auto max-w-[680px] space-y-6 text-[21px] leading-[1.55] tracking-[-0.01em]">
          {a.story.map((p) => <p key={p}>{p}</p>)}
        </div>
      </Tile>
      <Tile ground="parchment">
        <Heading h={a.principlesH} />
        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {a.principles.map((p) => (
            <li key={p.h} className="border-t border-hairline pt-6">
              <h3 className="t-tagline">{p.h}</h3>
              <p className="mt-2 text-ink-2">{p.t}</p>
            </li>
          ))}
        </ul>
      </Tile>
      <Tile>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="zoom-frame relative aspect-[4/3] overflow-hidden rounded-[18px]">
            <Image src={img("downtownDay", 1400)} alt={locale === "ar" ? "برج خليفة ووسط مدينة دبي" : "Burj Khalifa and Downtown Dubai"} fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className="t-display">{a.whereH}</h2>
            <p className="t-lead mt-5 text-ink-2">{a.where}</p>
            <div className="mt-8"><Cta href={`/${locale}/contact`}>{t.common.bookDemo}</Cta></div>
          </div>
        </div>
      </Tile>
    </>
  );
}
