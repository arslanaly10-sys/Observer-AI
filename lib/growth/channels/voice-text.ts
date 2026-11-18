/** Pure helpers for voice (no I/O), shared by the Twilio routes and unit tests. */

/** BCP-47 codes for Twilio speech recognition per language. */
export const STT_LANG: Record<string, string> = { en: "en-US", ar: "ar-AE", hi: "hi-IN", ur: "ur-PK", es: "es-ES", pt: "pt-BR", ru: "ru-RU", fr: "fr-FR", zh: "cmn-Hans-CN", fa: "fa-IR" };

/**
 * Twilio's own voice (<Say>, used when ElevenLabs isn't set up). A wrong language code can fail the call, and
 * Twilio's code list couldn't be confirmed from here, so English is the only default. After a test call,
 * enable more with TWILIO_SAY_LANGUAGES, e.g. {"ar":"ar-XA","hi":"hi-IN"}. With ElevenLabs every language is spoken.
 */
export function sayLang(lang: string, env: string | undefined = process.env.TWILIO_SAY_LANGUAGES) {
  if (lang === "en") return "en-US";
  try {
    const map = env ? (JSON.parse(env) as Record<string, string>) : {};
    return /^[a-z]{2,3}-[A-Z]{2,4}$/.test(map[lang] ?? "") ? map[lang] : "en-US";
  } catch {
    return "en-US";
  }
}

/** ElevenLabs only accepts language_code on its v2.5 Turbo/Flash models; multilingual_v2 detects the language itself. */
export function ttsBody(text: string, lang: string, model = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2") {
  const enforce = /(turbo|flash)_v2_5/.test(model);
  return { text: text.slice(0, 1200), model_id: model, ...(enforce ? { language_code: lang } : {}) };
}

