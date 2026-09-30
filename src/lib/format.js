// Date formatting. Everything renders in Charlotte time, e.g. "Sat, Oct 18 · 7:00 PM".

export const TIME_ZONE = "America/New_York";

const fmt = (options) => new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...options });

const weekdayShort = fmt({ weekday: "short" });
const weekdayLong = fmt({ weekday: "long" });
const monthShort = fmt({ month: "short" });
const dayNum = fmt({ day: "numeric" });
const yearNum = fmt({ year: "numeric" });
const time = fmt({ hour: "numeric", minute: "2-digit" });
const parts = fmt({
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const toDate = (value) => (value instanceof Date ? value : new Date(value));

/** "Sat, Oct 18" */
export function formatDay(value) {
  const d = toDate(value);
  return `${weekdayShort.format(d)}, ${monthShort.format(d)} ${dayNum.format(d)}`;
}

/** "7:00 PM" */
export function formatTime(value) {
  return time.format(toDate(value));
}

/** "Sat, Oct 18 · 7:00 PM" */
export function formatWhen(value) {
  return `${formatDay(value)} · ${formatTime(value)}`;
}

/** "Sat, Oct 18 · 7:00 PM – 9:30 PM" (falls back to two full dates across days). */
export function formatWhenRange(start, end) {
  if (!end) return formatWhen(start);
  if (dateKey(start) === dateKey(end)) return `${formatWhen(start)} – ${formatTime(end)}`;
  return `${formatWhen(start)} – ${formatWhen(end)}`;
}

/** "Sat, Oct 3, 2026 · 6:30 PM" */
export function formatWhenWithYear(value) {
  const d = toDate(value);
  return `${formatDay(d)}, ${yearNum.format(d)} · ${formatTime(d)}`;
}

/** { month: "OCT", day: "15", weekday: "Thursday" } for date blocks. */
export function dateBlock(value) {
  const d = toDate(value);
  return {
    month: monthShort.format(d).toUpperCase(),
    day: dayNum.format(d),
    weekday: weekdayLong.format(d),
  };
}

/** "Saturday" */
export function formatWeekday(value) {
  return weekdayLong.format(toDate(value));
}

/** "Sep 21, 9:14 AM" */
export function formatStamp(value) {
  const d = toDate(value);
  return `${monthShort.format(d)} ${dayNum.format(d)}, ${formatTime(d)}`;
}

/** Message list timestamps: "2h ago", "Yesterday", "Mon", "Sep 18". */
export function formatRelative(value, now = new Date()) {
  const d = toDate(value);
  const mins = Math.round((now - d) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const today = dateKey(now);
  if (dateKey(d) === today) return `${Math.round(mins / 60)}h ago`;
  const yesterday = dateKey(new Date(now.getTime() - 86400000));
  if (dateKey(d) === yesterday) return "Yesterday";
  if (now - d < 6 * 86400000) return weekdayShort.format(d);
  return `${monthShort.format(d)} ${dayNum.format(d)}`;
}

/** Message detail timestamps: "Today, 12:41 PM" or "Wed, Sep 23, 6:15 PM". */
export function formatFull(value, now = new Date()) {
  const d = toDate(value);
  if (dateKey(d) === dateKey(now)) return `Today, ${formatTime(d)}`;
  return `${formatDay(d)}, ${formatTime(d)}`;
}

/** "Sep 14" */
export function formatShortDate(value) {
  const d = toDate(value);
  return `${monthShort.format(d)} ${dayNum.format(d)}`;
}

/** Plain-text teaser from a Markdown description: first paragraph, formatting stripped. */
export function summaryFrom(description, max = 200) {
  const para = (description || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^#{1,3}\s/.test(p) && !/^[-*]\s/.test(p));
  if (!para) return "";
  const text = para
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** "Good afternoon" etc., by the hour in Charlotte. */
export function greeting(now = new Date()) {
  const hour = zonedParts(now).hour;
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Calendar date in Charlotte, "2026-10-03". */
export function dateKey(value) {
  const p = zonedParts(toDate(value));
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

function zonedParts(date) {
  const out = {};
  for (const { type, value } of parts.formatToParts(date)) {
    if (type !== "literal") out[type] = Number(value);
  }
  return out;
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Date -> "2026-10-03T18:30" in Charlotte time, to prefill <input type="datetime-local">.
 * Converting submitted values back to UTC happens on the server (DST-aware).
 */
export function toEasternInput(value) {
  if (!value) return "";
  const p = zonedParts(toDate(value));
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
