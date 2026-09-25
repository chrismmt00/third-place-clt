import { Temporal } from "@js-temporal/polyfill";

export const TIME_ZONE = "America/New_York";

/** Convert an Eastern local form value. Repeated times require earlier/later; gaps always fail. */
export function easternToUtc(value, disambiguation = "reject") {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Enter a valid local date and time.");
  if (!["reject", "earlier", "later"].includes(disambiguation)) throw new Error("Choose an Eastern time occurrence.");
  const plain = Temporal.PlainDateTime.from(value);
  const zoned = plain.toZonedDateTime(TIME_ZONE, { disambiguation });
  if (!zoned.toPlainDateTime().equals(plain)) throw new Error("This time does not exist because of daylight saving time.");
  return new Date(zoned.epochMilliseconds);
}

export function utcToEasternInput(value) {
  return Temporal.Instant.from(new Date(value).toISOString()).toZonedDateTimeISO(TIME_ZONE).toPlainDateTime().toString({ smallestUnit: "minute" });
}

export function formatEventDate(value) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short", month: "short", day: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(date);
  return `${day} · ${time}`;
}
