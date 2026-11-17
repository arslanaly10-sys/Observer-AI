import { Plugs } from "@phosphor-icons/react/dist/ssr";
import type { ExtraDict } from "@/dictionaries/site-extra";

/** Plain text chips, deliberately not logos: no partner logo is used without permission. */
export function Integrations({ t }: { t: ExtraDict["integrations"] }) {
  return (
    <div className="mx-auto max-w-[900px] text-center">
      <Plugs size={30} className="mx-auto text-creek" />
      <h2 className="t-display mt-5">{t.h2}</h2>
      <p className="t-lead mt-5 text-ink-2">{t.body}</p>
      <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
        {t.items.map((x) => (
          <li key={x} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-[15px]">{x}</li>
        ))}
      </ul>
    </div>
  );
}
