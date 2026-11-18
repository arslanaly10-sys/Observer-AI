/**
 * Public contact addresses for the Security, Privacy and Terms pages. Set them in Vercel once the real
 * mailboxes exist; until then the pages point people to the contact form instead of a made-up address.
 * NEXT_PUBLIC_LEGAL_REVIEWED=1 removes the "draft, pending legal review" notice once a lawyer has signed off.
 */
const EMAILS = {
  security: process.env.NEXT_PUBLIC_SECURITY_EMAIL,
  privacy: process.env.NEXT_PUBLIC_PRIVACY_EMAIL,
  legal: process.env.NEXT_PUBLIC_LEGAL_EMAIL,
};
const FALLBACK = { en: "us through the contact page", ar: "عبر صفحة التواصل" };

/** Replace {security}, {privacy} and {legal} with the configured address, or a pointer to the contact page. */
export function withContacts(text: string, locale: string) {
  return text.replace(/\{(security|privacy|legal)\}/g, (_, k: keyof typeof EMAILS) => EMAILS[k] || FALLBACK[locale === "ar" ? "ar" : "en"]);
}
export const legalReviewed = () => process.env.NEXT_PUBLIC_LEGAL_REVIEWED === "1";
