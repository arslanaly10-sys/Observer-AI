/**
 * Custom illustrations for the marketing site (DESIGN.md › Imagery).
 * Each one draws a real mechanism of the product, not decoration.
 */
import Image from "next/image";
import { WhatsappLogo, Handshake, Article, ArrowBendUpRight, BellSimple } from "@phosphor-icons/react/dist/ssr";

/** Seven signals flowing into one explainable score. */
export function ScoreDiagram({ labels }: { labels: string[] }) {
  const pts = [28, 24, 22, 20, 18, 16, 12];
  const vals = [0.95, 0.85, 0.85, 0.9, 0.9, 0.78, 1];
  const rowH = 46, top = 30;
  return (
    <svg viewBox="0 0 640 400" className="h-auto w-full" role="img" aria-label="Seven signals combine into a lead score of 87">
      <defs>
        <linearGradient id="flow" x1="0" x2="1">
          <stop offset="0" stopColor="var(--creek)" stopOpacity=".15" />
          <stop offset="1" stopColor="var(--creek)" stopOpacity=".9" />
        </linearGradient>
      </defs>
      {pts.map((p, i) => {
        const y = top + i * rowH;
        const w = 150 * vals[i];
        return (
          <g key={i}>
            <text x="160" y={y + 5} fontSize="15" fill="var(--ink-2)" textAnchor="end" direction="ltr">{labels[i]}</text>
            <rect x="170" y={y - 4} width="150" height="8" rx="4" fill="var(--hairline-soft)" />
            <rect x="170" y={y - 4} width={w} height="8" rx="4" fill="var(--creek)" opacity={0.35 + vals[i] * 0.55} />
            <path d={`M ${330} ${y} C 420 ${y}, 420 200, 470 200`} fill="none" stroke="url(#flow)" strokeWidth={1 + p / 10} strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx="545" cy="200" r="76" fill="var(--canvas)" stroke="var(--hairline)" />
      <circle cx="545" cy="200" r="64" fill="none" stroke="var(--hairline-soft)" strokeWidth="10" />
      <circle cx="545" cy="200" r="64" fill="none" stroke="var(--hot)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 64 * 0.87} 999`} transform="rotate(-90 545 200)" />
      <text x="545" y="212" textAnchor="middle" fontSize="40" fontWeight="600" fill="var(--ink)" letterSpacing="-1">87</text>
    </svg>
  );
}

// Enquiry, first contact, three follow-ups, hand-over
const stepIcons = [Article, WhatsappLogo, ArrowBendUpRight, ArrowBendUpRight, BellSimple, Handshake];

/** The speed-to-lead cascade: six steps, each waiting for the last to go quiet. HTML so it reads in both directions. */
export function CascadeDiagram({ steps, waits }: { steps: string[]; waits: string[] }) {
  return (
    <ol className="relative grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0">
      <span aria-hidden className="absolute inset-x-[8%] top-[27px] hidden h-px bg-gradient-to-r from-creek/20 via-creek/60 to-ok/70 lg:block rtl:bg-gradient-to-l" />
      {steps.map((s, i) => {
        const Icon = stepIcons[i];
        const last = i === steps.length - 1;
        return (
          <li key={i} className="relative flex flex-col items-center text-center">
            <span className={`relative z-10 flex size-14 items-center justify-center rounded-full border ${last ? "border-ok/40 bg-ok-soft text-ok" : "border-hairline bg-canvas text-creek"}`}>
              <Icon size={24} />
            </span>
            <span className="mt-4 text-[17px] font-semibold">{s}</span>
            <span className="t-caption tnum mt-0.5 text-ink-2">{waits[i]}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Phone frame for screenshots. */
export function Phone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-[260px] rounded-[44px] bg-[#1d1d1f] p-[10px] shadow-[var(--shadow-frame)]">
      <div className="overflow-hidden rounded-[34px] bg-canvas pt-[34px]">
        {/* Status bar strip so the camera island never covers the screen's own header */}
        <div className="absolute left-1/2 top-[20px] z-10 h-[20px] w-[80px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
        <Image src={src} alt={alt} width={1170} height={2532} sizes="260px" className="block h-auto w-full" />
      </div>
    </div>
  );
}

/** Browser-style frame around a product screenshot. */
export function AppFrame({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <div className="frame border border-black/5">
      <div className="flex h-8 items-center gap-1.5 border-b border-hairline-soft bg-pearl px-3.5" aria-hidden>
        <span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto h-4 w-48 rounded-full bg-hairline-soft" />
      </div>
      <Image src={src} alt={alt} width={2880} height={1800} priority={priority} sizes="(min-width: 1180px) 1080px, 100vw" className="block h-auto w-full" />
    </div>
  );
}

/** Locale-specific product screenshot path (captured by `npm run shots`). */
export function shot(name: string, locale: string) {
  return `/shots/${name}${locale === "ar" ? "-ar" : ""}.jpg`;
}
