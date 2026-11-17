import "server-only";
/** WhatsApp Cloud API (Meta) adapter. */
import { GRAPH } from "../config";

export type WaPayload =
  | { kind: "text"; body: string }
  | { kind: "template"; name: string; language: string; params: string[] }
  | { kind: "document"; link: string; filename: string; caption?: string };

/** Meta's template language codes for the languages Observer supports. */
export const WA_LANG: Record<string, string> = { en: "en", ar: "ar", hi: "hi", ur: "ur", es: "es", pt: "pt_BR", ru: "ru", fr: "fr", zh: "zh_CN", fa: "fa" };

export async function sendWhatsApp(phoneNumberId: string, to: string, p: WaPayload): Promise<{ id: string }> {
  const body: Record<string, unknown> = { messaging_product: "whatsapp", recipient_type: "individual", to };
  if (p.kind === "text") Object.assign(body, { type: "text", text: { preview_url: false, body: p.body.slice(0, 4096) } });
  if (p.kind === "document") Object.assign(body, { type: "document", document: { link: p.link, filename: p.filename, caption: p.caption } });
  if (p.kind === "template") Object.assign(body, {
    type: "template",
    template: { name: p.name, language: { code: WA_LANG[p.language] ?? "en" }, components: [{ type: "body", parameters: p.params.map((text) => ({ type: "text", text })) }] },
  });
  const res = await fetch(`${GRAPH()}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${json?.error?.message ?? "send failed"}`);
  return { id: json.messages?.[0]?.id ?? "" };
}

/** Lead Ads: fetch the submitted form fields for a leadgen id. */
export async function fetchMetaLead(leadgenId: string) {
  const url = `${GRAPH()}/${encodeURIComponent(leadgenId)}?fields=id,created_time,field_data,campaign_name,ad_name,form_id,platform&access_token=${encodeURIComponent(process.env.META_PAGE_ACCESS_TOKEN ?? "")}`;
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Meta lead ${res.status}: ${json?.error?.message ?? "fetch failed"}`);
  return json as { id: string; field_data: { name: string; values: string[] }[]; campaign_name?: string; ad_name?: string; platform?: string };
}

/** Within 24h of the lead's last message we may send free-form text; otherwise only approved templates. */
export function inServiceWindow(lastInboundAt: string | null | undefined, now = Date.now()) {
  return !!lastInboundAt && now - Date.parse(lastInboundAt) < 24 * 3600 * 1000;
}
