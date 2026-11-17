import "server-only";
/** Resend adapter. Replies thread back to the lead via a plus-addressed reply-to when inbound is set up. */
export async function sendEmail(o: { from: string; to: string; subject: string; text: string; html?: string; replyTo?: string; tags?: Record<string, string>; headers?: Record<string, string> }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: o.from, to: [o.to], subject: o.subject.slice(0, 300), text: o.text, html: o.html ?? textToHtml(o.text),
      reply_to: o.replyTo, headers: o.headers, tags: o.tags ? Object.entries(o.tags).map(([name, value]) => ({ name, value })) : undefined,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${json?.message ?? "send failed"}`);
  return { id: String(json.id ?? "") };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Plain, readable HTML version of a text email (direction follows the text so Arabic, Urdu and Farsi render RTL). */
export function textToHtml(text: string) {
  const rtl = /[؀-ۿ]/.test(text);
  const paras = esc(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, "<br>")}</p>`).join("");
  return `<div dir="${rtl ? "rtl" : "ltr"}" style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1d1d1f;max-width:560px">${paras}</div>`;
}

/** reply+<leadId>@<inbound domain> lets inbound replies find their lead without parsing threads. */
export function replyAddress(leadId: string) {
  const d = process.env.RESEND_INBOUND_DOMAIN;
  return d ? `reply+${leadId}@${d}` : undefined;
}
export function leadIdFromAddress(addr: string) {
  return addr.match(/reply\+([0-9a-f-]{36})@/i)?.[1] ?? null;
}
