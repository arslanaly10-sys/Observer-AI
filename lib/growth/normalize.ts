/**
 * Turn every lead source into one shape. Field names are matched loosely (case, spaces, dashes, and
 * common synonyms) because forms on Meta, Google, TikTok, Snapchat and the portals all name fields differently.
 */
import { normalizePhone } from "./phone";

export type Channel = "website" | "meta" | "google" | "tiktok" | "snapchat" | "portal" | "whatsapp" | "email" | "phone" | "manual";

export interface NormalizedLead {
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  budget: string | null;
  area: string | null;
  source: string;
  channel: Channel;
  campaign: string | null;
  external_ref: string | null;
  consent_whatsapp: boolean;
  consent_email: boolean;
}

const key = (k: string) => k.toLowerCase().replace(/[^a-z0-9]+/g, "");
const ALIASES: Record<string, string[]> = {
  name: ["name", "fullname", "yourname", "customername", "contactname", "clientname"],
  first: ["firstname", "givenname", "fname"],
  last: ["lastname", "surname", "familyname", "lname"],
  phone: ["phone", "phonenumber", "mobile", "mobilenumber", "whatsapp", "whatsappnumber", "tel", "telephone", "contactnumber", "cell"],
  email: ["email", "emailaddress", "workemail", "mail"],
  message: ["message", "comments", "comment", "enquiry", "inquiry", "notes", "question", "requirements", "details", "whatcanwehelpwith"],
  budget: ["budget", "budgetaed", "pricerange", "maxbudget", "price", "investment"],
  area: ["area", "location", "community", "preferredarea", "neighbourhood", "neighborhood", "city", "project", "projectname", "propertyname"],
  ref: ["ref", "reference", "listingref", "propertyref", "listingid", "propertyid", "leadid", "id"],
  campaign: ["campaign", "campaignname", "utmcampaign", "adname", "formname"],
  consentWa: ["consentwhatsapp", "whatsappconsent", "optinwhatsapp", "contactbywhatsapp"],
  consentEmail: ["consentemail", "emailconsent", "optinemail", "marketingconsent"],
};

function pick(flat: Record<string, string>, field: keyof typeof ALIASES): string | null {
  for (const a of ALIASES[field]) if (flat[a]?.trim()) return flat[a].trim();
  return null;
}

const truthy = (v: string | null) => !!v && /^(1|true|yes|y|on|agree|agreed|checked)$/i.test(v.trim());

/** Build a lead from a flat key→value map plus channel metadata. */
export function fromFields(fields: Record<string, unknown>, meta: { channel: Channel; source: string; external_ref?: string | null; campaign?: string | null; consentDefault?: boolean }): NormalizedLead | null {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined) continue;
    flat[key(k)] = Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v);
  }
  const first = pick(flat, "first"), last = pick(flat, "last");
  const name = (pick(flat, "name") ?? [first, last].filter(Boolean).join(" ")).slice(0, 120);
  const phone = normalizePhone(pick(flat, "phone"));
  const emailRaw = pick(flat, "email");
  const email = emailRaw && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailRaw) ? emailRaw.toLowerCase().slice(0, 254) : null;
  if (!phone && !email) return null; // nothing to contact
  // Enquiry forms default to consent for replies about that enquiry; callers can pass false for cold lists.
  const consentDefault = meta.consentDefault ?? false;
  const cWa = pick(flat, "consentWa"), cEm = pick(flat, "consentEmail");
  return {
    name: name || (email ? email.split("@")[0] : "New lead"),
    phone,
    email,
    message: (pick(flat, "message") ?? "").slice(0, 4000),
    budget: pick(flat, "budget"),
    area: pick(flat, "area"),
    source: meta.source,
    channel: meta.channel,
    campaign: meta.campaign ?? pick(flat, "campaign"),
    external_ref: meta.external_ref ?? pick(flat, "ref"),
    consent_whatsapp: cWa === null ? consentDefault : truthy(cWa),
    consent_email: cEm === null ? consentDefault : truthy(cEm),
  };
}

/** Meta Lead Ads: the lead object fetched from the Graph API (`GET /{leadgen_id}`). */
export function fromMetaLead(lead: { id: string; field_data?: { name: string; values: string[] }[]; campaign_name?: string; ad_name?: string; form_id?: string; platform?: string }) {
  const fields: Record<string, string> = {};
  for (const f of lead.field_data ?? []) fields[f.name] = (f.values ?? []).join(", ");
  const ig = (lead.platform ?? "").toLowerCase() === "ig";
  return fromFields(fields, { channel: "meta", source: ig ? "Instagram" : "Facebook", external_ref: lead.id, campaign: lead.campaign_name ?? lead.ad_name ?? null, consentDefault: true });
}

/** Google Ads lead form webhook (`user_column_data`). */
export function fromGoogleLead(body: { lead_id?: string; user_column_data?: { column_id?: string; column_name?: string; string_value?: string }[]; campaign_id?: string | number }) {
  const fields: Record<string, string> = {};
  for (const c of body.user_column_data ?? []) {
    const id = (c.column_id ?? "").toUpperCase();
    const k = id === "FULL_NAME" ? "name" : id === "FIRST_NAME" ? "first_name" : id === "LAST_NAME" ? "last_name"
      : id === "PHONE_NUMBER" ? "phone" : id === "EMAIL" ? "email" : id === "CITY" ? "city" : (c.column_name ?? id);
    if (c.string_value) fields[k] = c.string_value;
  }
  return fromFields(fields, { channel: "google", source: "Google Ads", external_ref: body.lead_id ?? null, campaign: body.campaign_id ? String(body.campaign_id) : null, consentDefault: true });
}

/** TikTok Lead Generation / Snapchat Lead Ads / portals / website / Zapier: a flat or nested JSON body. */
export function fromGeneric(body: Record<string, unknown>, channel: Channel, source: string) {
  const fields: Record<string, unknown> = { ...body };
  // Common nesting: { lead: {...} }, { data: {...} }, { answers: [{ question/name, answer/value }] }
  for (const nest of ["lead", "data", "fields", "contact", "user"]) {
    const v = body[nest];
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(fields, v as Record<string, unknown>);
  }
  const answers = (body.answers ?? body.field_data ?? body.questions) as unknown;
  if (Array.isArray(answers)) {
    for (const a of answers as Record<string, unknown>[]) {
      const k = String(a.name ?? a.question ?? a.field ?? a.key ?? "");
      const v = a.value ?? a.answer ?? a.values;
      if (k) fields[k] = Array.isArray(v) ? v.join(", ") : v;
    }
  }
  // Someone who sends an enquiry with their number or email has asked to be contacted about it.
  // An explicit "no" in a consent field still wins.
  return fromFields(fields, { channel, source, external_ref: (body.lead_id ?? body.leadId ?? body.id ?? null) as string | null, consentDefault: true });
}

export const CHANNEL_SOURCE: Record<string, { channel: Channel; source: string }> = {
  website: { channel: "website", source: "Website" },
  tiktok: { channel: "tiktok", source: "TikTok" },
  snapchat: { channel: "snapchat", source: "Snapchat" },
  bayut: { channel: "portal", source: "Bayut" },
  propertyfinder: { channel: "portal", source: "Property Finder" },
  dubizzle: { channel: "portal", source: "Dubizzle" },
  portal: { channel: "portal", source: "Portal" },
  zapier: { channel: "website", source: "Zapier" },
};
