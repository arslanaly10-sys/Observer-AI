import Image from "next/image";
import { Browser, PhoneCall, WebhooksLogo } from "@phosphor-icons/react/dist/ssr";
import { brandPaths, type BrandKey } from "@/lib/brands";

/** How each mark sits on its tile, as on a phone's home screen. */
const tile: Partial<Record<BrandKey, { bg: string; fg: string; ring?: boolean }>> = {
  whatsapp: { bg: "#25D366", fg: "#fff" },
  facebook: { bg: "#0866FF", fg: "#fff" },
  instagram: { bg: "linear-gradient(45deg,#FEDA75 0%,#FA7E1E 25%,#D62976 50%,#962FBF 75%,#4F5BD5 100%)", fg: "#fff" },
  googleads: { bg: "#fff", fg: "#4285F4" },
  tiktok: { bg: "#000", fg: "#fff", ring: true },
  snapchat: { bg: "#FFFC00", fg: "#000" },
  resend: { bg: "#000", fg: "#fff", ring: true },
};
const raster: Partial<Record<BrandKey, string>> = { bayut: "/logos/bayut.png", propertyfinder: "/logos/propertyfinder.png", dubizzle: "/logos/dubizzle.png" };
const generic = { forms: Browser, calls: PhoneCall, webhook: WebhooksLogo } as const;

/** A brand mark on a small rounded tile. Decorative: the name always sits next to it. */
export function BrandIcon({ k, size = 22 }: { k: BrandKey; size?: number }) {
  const r = Math.round(size * 0.26);
  const box = { width: size, height: size, borderRadius: r };
  if (k in raster)
    return (
      <span aria-hidden className="inline-grid shrink-0 place-items-center overflow-hidden bg-white" style={box}>
        <Image src={raster[k]!} alt="" width={size * 2} height={size * 2} className="object-contain" style={{ width: size * 0.82, height: size * 0.82 }} />
      </span>
    );
  if (k in generic) {
    const G = generic[k as keyof typeof generic];
    return <span aria-hidden className="inline-grid shrink-0 place-items-center bg-white/12 text-white ring-1 ring-white/15" style={box}><G size={size * 0.62} /></span>;
  }
  const b = brandPaths[k as keyof typeof brandPaths];
  const t = tile[k]!;
  return (
    <span aria-hidden className={`inline-grid shrink-0 place-items-center ${t.ring ? "ring-1 ring-white/20" : ""}`} style={{ ...box, background: t.bg }}>
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill={t.fg}><path d={b.path} /></svg>
    </span>
  );
}
