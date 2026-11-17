import { WhatsappLogo, EnvelopeSimple, Phone, Globe, Note, Robot } from "@phosphor-icons/react/dist/ssr";
import { cx } from "@/components/app/ui";

export interface Msg { id: number; channel: string; direction: "in" | "out"; author: "lead" | "ai" | "agent" | "system"; author_id: string | null; subject: string | null; body: string; status: string; error: string | null; created_at: string; media: { template?: { name: string } } | null }
const ICON = { whatsapp: WhatsappLogo, email: EnvelopeSimple, voice: Phone, sms: Phone, web: Globe, note: Note } as const;

/** A conversation across every channel, oldest first. Server-rendered; strings come pre-translated. */
export function Thread({ messages, names, t, locale, assistant }: { messages: Msg[]; names: Map<string, string>; t: (s: string) => string; locale: string; assistant: string }) {
  if (!messages.length) return <p className="py-10 text-center text-ink-2">{t("No messages yet.")}</p>;
  const fmt = (d: string) => new Date(d).toLocaleString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <ol className="grid gap-3">
      {messages.map((m) => {
        const Icon = ICON[m.channel as keyof typeof ICON] ?? Globe;
        const out = m.direction === "out";
        const who = m.author === "lead" ? null : m.author === "ai" ? `${assistant} · AI` : m.author === "system" ? t("Observer") : names.get(m.author_id ?? "") ?? t("Agent");
        return (
          <li key={m.id} className={cx("flex", out ? "justify-end" : "justify-start")}>
            <div className={cx("max-w-[85%] rounded-[16px] px-4 py-2.5", out ? (m.author === "ai" ? "bg-creek-soft" : "bg-ink text-canvas") : "bg-parchment", m.author === "system" && "bg-transparent text-ink-2 italic")}>
              {who && <p className={cx("t-fine mb-1 flex items-center gap-1 font-medium", m.author === "agent" ? "text-canvas/70" : "text-creek")}>{m.author === "ai" && <Robot size={12} weight="fill" />}{who}</p>}
              {m.subject && <p className="mb-1 text-[14px] font-medium" dir="auto">{m.subject}</p>}
              <p className="whitespace-pre-line text-[15px] leading-relaxed" dir="auto">{m.body}</p>
              <p className={cx("t-fine mt-1.5 flex items-center gap-1.5", m.author === "agent" ? "text-canvas/60" : "text-ink-3")}>
                <Icon size={12} />{fmt(m.created_at)}
                {out && <span>· {t(m.status === "sandbox" ? "Sandbox, not sent" : m.status[0].toUpperCase() + m.status.slice(1))}</span>}
                {m.media?.template && <span>· {t("Template")}</span>}
              </p>
              {m.error && <p className="t-fine mt-1 text-hot">{m.error}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
