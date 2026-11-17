/** Pure helpers for voice (no I/O), shared by the Twilio routes and unit tests. */

/** BCP-47 codes for Twilio speech recognition per language. */
export const STT_LANG: Record<string, string> = { en: "en-US", ar: "ar-AE", hi: "hi-IN", ur: "ur-PK", es: "es-ES", pt: "pt-BR", ru: "ru-RU", fr: "fr-FR", zh: "cmn-Hans-CN", fa: "fa-IR" };

/** Languages Twilio's own voice can speak; others fall back to English when ElevenLabs isn't set up. */
const SAY_OK = new Set(["en", "ar", "hi", "es", "pt", "ru", "fr", "zh"]);
export const sayLang = (lang: string) => (SAY_OK.has(lang) ? STT_LANG[lang] : "en-US");

/** ElevenLabs only accepts language_code on its v2.5 Turbo/Flash models; multilingual_v2 detects the language itself. */
export function ttsBody(text: string, lang: string, model = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2") {
  const enforce = /(turbo|flash)_v2_5/.test(model);
  return { text: text.slice(0, 1200), model_id: model, ...(enforce ? { language_code: lang } : {}) };
}

