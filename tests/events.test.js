import { expect, it } from "vitest";
import { easternToUtc, utcToEasternInput } from "../src/lib/dates.js";
import { headcount, spotsLeft, isRsvpOpen, uniqueSlug, formatPublicName } from "../src/lib/event-rules.js";
import { eventSchema, rsvpSchema } from "../src/lib/validation.js";

it("converts Eastern times across the 2026 DST transition", () => {
  expect(easternToUtc("2026-10-31T12:00").toISOString()).toBe("2026-10-31T16:00:00.000Z");
  expect(easternToUtc("2026-11-02T12:00").toISOString()).toBe("2026-11-02T17:00:00.000Z");
  expect(() => easternToUtc("2026-11-01T01:30")).toThrow();
  expect(easternToUtc("2026-11-01T01:30", "earlier").toISOString()).toBe("2026-11-01T05:30:00.000Z");
  expect(easternToUtc("2026-11-01T01:30", "later").toISOString()).toBe("2026-11-01T06:30:00.000Z");
  expect(utcToEasternInput("2026-11-01T06:30:00Z")).toBe("2026-11-01T01:30");
  expect(() => easternToUtc("2026-03-08T02:30", "later")).toThrow();
});

it("allocates collision suffixes", async () => {
  expect(await uniqueSlug("Community Supper!", async slug => ["community-supper", "community-supper-2"].includes(slug))).toBe("community-supper-3");
});

it("counts guests and tests all RSVP closing conditions", () => {
  expect(headcount([{ status: "GOING", guestCount: 2 }, { status: "CANCELLED", guestCount: 8 }])).toBe(3);
  const event = { status: "PUBLISHED", rsvpEnabled: true, startsAt: new Date("2026-11-02T12:00Z"), capacity: 5 };
  const now = new Date("2026-10-31T12:00Z");
  expect(isRsvpOpen(event, 4, now)).toBe(true);
  for (const patch of [{ status: "DRAFT" }, { status: "CANCELLED" }, { rsvpEnabled: false }, { startsAt: now }, { rsvpDeadline: now }, { capacity: 4 }]) expect(isRsvpOpen({ ...event, ...patch }, 4, now)).toBe(false);
  expect(spotsLeft(event, 7)).toBe(0);
  expect(spotsLeft({ capacity: null }, 10)).toBeNull();
});

const form = { title: "Supper", description: "Shared meal", startsAt: "2026-11-02T19:00", endsAt: "2026-11-02T21:00", locationName: "Hall", address: "123 Main St", capacity: "5", rsvpEnabled: "on", maxGuestsPerRsvp: "2" };
it("validates event order, URLs and occupied capacity", () => {
  expect(eventSchema(5).safeParse(form).success).toBe(true);
  expect(eventSchema(6).safeParse(form).success).toBe(false);
  expect(eventSchema().safeParse({ ...form, endsAt: form.startsAt }).success).toBe(false);
  expect(eventSchema().safeParse({ ...form, mapUrl: "javascript:alert(1)" }).success).toBe(false);
});

it("requires consent, bounds guests, strips disabled phone, and formats safe public names", () => {
  const value = { eventId: "cjld2cjxh0000qzrmn831i7rn", firstName: "Maya Rose", lastName: "Rivera", email: "MAYA@example.test", guestCount: 0, phone: "5551234567", consent: true };
  const schema = rsvpSchema({ collectPhone: false, maxGuestsPerRsvp: 1 });
  expect(schema.parse(value)).toMatchObject({ email: "maya@example.test", phone: "", publicNameConsent: false });
  for (const patch of [{ consent: false }, { guestCount: 2 }, { note: "x".repeat(501) }, { website: "spam" }]) expect(schema.safeParse({ ...value, ...patch }).success).toBe(false);
  expect(formatPublicName(value.firstName, value.lastName)).toBe("Maya R.");
});
