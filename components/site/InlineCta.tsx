import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * The call to action as a single field: a WhatsApp number and one button.
 * A plain GET form to the contact page, which pre-fills the number, so it works without JavaScript.
 */
export function InlineCta({ locale, label, placeholder, button, reassure, size = "md" }: { locale: string; label: string; placeholder: string; button: string; reassure?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <div>
      <form action={`/${locale}/contact`} method="get" className={`flex w-full max-w-[480px] items-center gap-1.5 rounded-full bg-white p-1.5 shadow-[0_20px_60px_-24px_rgb(0_0_0/0.7)] focus-within:ring-2 focus-within:ring-white/60 ${lg ? "sm:max-w-[560px] sm:p-2" : ""}`}>
        <label className="min-w-0 flex-1">
          <span className="sr-only">{label}</span>
          <input
            name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={placeholder}
            className={`h-11 w-full min-w-0 bg-transparent px-4 text-[16px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] rtl:text-right ${lg ? "sm:h-12 sm:text-[17px]" : ""}`}
          />
        </label>
        <button type="submit" className={`btn shrink-0 bg-[#1d1d1f] px-5 text-white hover:bg-black ${lg ? "sm:min-h-12 sm:px-6" : ""}`}>
          <span>{button}</span>
          <ArrowRight size={16} className="hidden sm:block rtl:-scale-x-100" />
        </button>
      </form>
      {reassure && <p className="mt-3 text-[13.5px] text-white/60">{reassure}</p>}
    </div>
  );
}
