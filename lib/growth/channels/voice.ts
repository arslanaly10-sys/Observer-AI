import "server-only";
/** Twilio Voice + ElevenLabs. Calls run as speech turns: Twilio transcribes, Claude answers, ElevenLabs speaks. */

/** BCP-47 codes for Twilio speech recognition per language. */
export const STT_LANG: Record<string, string> = { en: "en-US", ar: "ar-AE", hi: "hi-IN", ur: "ur-PK", es: "es-ES", pt: "pt-BR", ru: "ru-RU", fr: "fr-FR", zh: "cmn-Hans-CN", fa: "fa-IR" };

export async function placeCall(o: { to: string; from: string; twimlUrl: string; statusUrl: string }) {
  const sid = process.env.TWILIO_ACCOUNT_SID!, token = process.env.TWILIO_AUTH_TOKEN!;
  const form = new URLSearchParams({ To: "+" + o.to.replace(/^\+/, ""), From: o.from, Url: o.twimlUrl, StatusCallback: o.statusUrl, Record: "true" });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${json?.message ?? "call failed"}`);
  return { sid: String(json.sid) };
}

const x = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** One conversational turn: speak (ElevenLabs audio, or Twilio's voice as a fallback), then listen. */
export function twimlTurn(o: { audioUrl?: string; text: string; lang: string; actionUrl: string; hangup?: boolean }) {
  const speak = o.audioUrl ? `<Play>${x(o.audioUrl)}</Play>` : `<Say language="${STT_LANG[o.lang] ?? "en-US"}">${x(o.text)}</Say>`;
  if (o.hangup) return `<?xml version="1.0" encoding="UTF-8"?><Response>${speak}<Hangup/></Response>`;
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Gather input="speech" language="${STT_LANG[o.lang] ?? "en-US"}" speechTimeout="auto" action="${x(o.actionUrl)}" method="POST">${speak}</Gather><Redirect method="POST">${x(o.actionUrl)}</Redirect></Response>`;
}

export async function synthesize(text: string, lang: string) {
  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_22050_32`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: text.slice(0, 1200), model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2", language_code: lang }),
  });
  if (!res.ok || !res.body) throw new Error(`ElevenLabs ${res.status}`);
  return res;
}
