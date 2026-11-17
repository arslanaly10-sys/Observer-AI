/**
 * Office hours and quiet hours, computed in a given IANA time zone without extra dependencies.
 */
export type WeekHours = Partial<Record<Day, [string, string][]>>;
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAYS: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Local calendar parts of `at` in time zone `tz` (falls back to UTC on an unknown zone). */
export function localParts(at: Date, tz: string) {
  let f: Intl.DateTimeFormat;
  try {
    f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  } catch {
    f = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  }
  const p = Object.fromEntries(f.formatToParts(at).map((x) => [x.type, x.value]));
  const day = p.weekday.toLowerCase().slice(0, 3) as Day;
  return { day, date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Is the office open at `at`? Holidays are local dates (YYYY-MM-DD). */
export function isOfficeOpen(at: Date, tz: string, hours: WeekHours, holidays: string[] = []) {
  const { day, date, minutes } = localParts(at, tz);
  if (holidays.includes(date)) return false;
  return (hours[day] ?? []).some(([a, b]) => minutes >= toMin(a) && minutes < toMin(b));
}

/** Quiet hours may wrap midnight (e.g. 21:00–09:00). */
export function isQuietTime(at: Date, tz: string, quietStart = "21:00", quietEnd = "09:00") {
  const { minutes } = localParts(at, tz);
  const s = toMin(quietStart), e = toMin(quietEnd);
  return s <= e ? minutes >= s && minutes < e : minutes >= s || minutes < e;
}

/** The next moment (on a 5-minute grid) that is outside quiet hours. Returns `at` if already allowed. */
export function nextSendTime(at: Date, tz: string, quietStart = "21:00", quietEnd = "09:00") {
  let t = new Date(at);
  for (let i = 0; i < 24 * 12 + 1 && isQuietTime(t, tz, quietStart, quietEnd); i++) t = new Date(t.getTime() + 5 * 60_000);
  return t;
}

export function dayName(d: Day) {
  return { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" }[d];
}
export const WEEK: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export { DAYS };

/** Offset (minutes) of `tz` from UTC at instant `at`. */
function offsetMinutes(at: Date, tz: string) {
  try {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    const p = Object.fromEntries(f.formatToParts(at).map((x) => [x.type, x.value]));
    const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return Math.round((asUtc - at.getTime()) / 60_000);
  } catch { return 0; }
}

/** The UTC instant for local wall-clock `date` (YYYY-MM-DD) + `hhmm` in `tz`. */
export function zonedToUtc(date: string, hhmm: string, tz: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, h, mi));
  const first = new Date(guess.getTime() - offsetMinutes(guess, tz) * 60_000);
  return new Date(guess.getTime() - offsetMinutes(first, tz) * 60_000);
}

/** "Thu 20 Nov, 10:00" in the given zone and locale. */
export function formatLocal(at: Date, tz: string, locale = "en-GB") {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  } catch {
    return at.toISOString().slice(0, 16).replace("T", " ") + " UTC";
  }
}

/**
 * Bookable start times: `slotMin`-minute slots inside the weekly `availability` (in `tz`), over `days` days,
 * starting at least `leadMin` minutes from `now`, skipping anything that overlaps `busy`.
 */
export function freeSlots(o: { now: Date; tz: string; availability: WeekHours; busy: { start: Date; end: Date }[]; days: number; slotMin?: number; leadMin?: number; holidays?: string[] }) {
  const slot = (o.slotMin ?? 60) * 60_000, earliest = o.now.getTime() + (o.leadMin ?? 120) * 60_000;
  const out: Date[] = [];
  for (let i = 0; i <= o.days; i++) {
    const { day, date } = localParts(new Date(o.now.getTime() + i * 86_400_000), o.tz);
    if (o.holidays?.includes(date)) continue;
    for (const [a, b] of o.availability[day] ?? []) {
      const end = zonedToUtc(date, b, o.tz).getTime();
      for (let t = zonedToUtc(date, a, o.tz).getTime(); t + slot <= end; t += slot) {
        if (t < earliest) continue;
        if (o.busy.some((x) => t < x.end.getTime() && t + slot > x.start.getTime())) continue;
        out.push(new Date(t));
      }
    }
  }
  return out;
}
