/** Phone normalisation and a best-guess time zone from the country calling code. */
const ZONES: [string, string][] = [
  ["971", "Asia/Dubai"], ["966", "Asia/Riyadh"], ["974", "Asia/Qatar"], ["965", "Asia/Kuwait"], ["973", "Asia/Bahrain"],
  ["968", "Asia/Muscat"], ["962", "Asia/Amman"], ["961", "Asia/Beirut"], ["20", "Africa/Cairo"], ["212", "Africa/Casablanca"],
  ["91", "Asia/Kolkata"], ["92", "Asia/Karachi"], ["880", "Asia/Dhaka"], ["94", "Asia/Colombo"], ["977", "Asia/Kathmandu"],
  ["98", "Asia/Tehran"], ["90", "Europe/Istanbul"], ["7", "Europe/Moscow"], ["380", "Europe/Kyiv"], ["86", "Asia/Shanghai"],
  ["852", "Asia/Hong_Kong"], ["65", "Asia/Singapore"], ["60", "Asia/Kuala_Lumpur"], ["63", "Asia/Manila"], ["62", "Asia/Jakarta"],
  ["44", "Europe/London"], ["33", "Europe/Paris"], ["49", "Europe/Berlin"], ["39", "Europe/Rome"], ["34", "Europe/Madrid"],
  ["351", "Europe/Lisbon"], ["31", "Europe/Amsterdam"], ["41", "Europe/Zurich"], ["55", "America/Sao_Paulo"], ["52", "America/Mexico_City"],
  ["54", "America/Argentina/Buenos_Aires"], ["57", "America/Bogota"], ["1", "America/New_York"], ["61", "Australia/Sydney"],
  ["27", "Africa/Johannesburg"], ["234", "Africa/Lagos"], ["254", "Africa/Nairobi"],
];

/** Digits-only E.164 without "+", e.g. "971501234567". UAE local numbers (05x…) become 9715x…. */
export function normalizePhone(raw: string | null | undefined, defaultCountry = "971"): string | null {
  if (!raw) return null;
  let d = String(raw).replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = defaultCountry + d.slice(1);
  d = d.replace(/\D/g, "");
  return d.length >= 8 && d.length <= 15 ? d : null;
}

export function timezoneFromPhone(e164: string | null | undefined, fallback = "Asia/Dubai") {
  if (!e164) return fallback;
  const match = ZONES.filter(([cc]) => e164.startsWith(cc)).sort((a, b) => b[0].length - a[0].length)[0];
  return match?.[1] ?? fallback;
}
