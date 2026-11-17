/**
 * Fast script- and word-based language guess, used before Claude has read the message
 * (and as the fallback when the AI is unavailable). Claude's own detection wins when present.
 */
export const LANGUAGES = {
  en: "English", ar: "Arabic", hi: "Hindi", ur: "Urdu", es: "Spanish", pt: "Portuguese",
  ru: "Russian", fr: "French", zh: "Chinese", fa: "Farsi",
} as const;
export type Lang = keyof typeof LANGUAGES;

const LATIN: [Lang, RegExp][] = [
  ["es", /\b(hola|quiero|busco|comprar|precio|gracias|casa|piso|apartamento|vivienda|estoy)\b/gi],
  ["pt", /\b(olá|ola|quero|procuro|comprar|preço|obrigad[oa]|apartamento|imóvel|estou|você)\b/gi],
  ["fr", /\b(bonjour|je|cherche|acheter|prix|merci|appartement|maison|villa|vous|suis)\b/gi],
  ["en", /\b(hi|hello|looking|buy|price|thanks|apartment|villa|the|and|for|want)\b/gi],
];

export function detectLanguage(text: string): Lang {
  const t = text || "";
  if (/[ऀ-ॿ]/.test(t)) return "hi";
  if (/[一-鿿]/.test(t)) return "zh";
  if (/[Ѐ-ӿ]/.test(t)) return "ru";
  if (/[؀-ۿ]/.test(t)) {
    if (/[ٹڈڑںےھ]/.test(t)) return "ur";
    // Persian uses ی/ک and پ چ ژ گ; Arabic uses ي/ك and ة.
    if (/[پچژگیک]/.test(t) && !/[ةي]/.test(t)) return "fa";
    return "ar";
  }
  let best: Lang = "en", hits = 0;
  for (const [lang, rx] of LATIN) {
    const n = (t.match(rx) ?? []).length;
    if (n > hits) { best = lang; hits = n; }
  }
  return best;
}

export function isRtl(lang: string | null | undefined) {
  return lang === "ar" || lang === "ur" || lang === "fa";
}
