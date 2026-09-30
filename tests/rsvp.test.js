import { expect, it, vi } from "vitest";
import { createRsvp } from "../src/lib/rsvp.js";
import { serializable } from "../src/lib/transaction.js";
import { csvCell } from "../src/lib/csv.js";

const input = { eventId: "cjld2cjxh0000qzrmn831i7rn", firstName: "Maya", lastName: "Rivera", email: "maya@example.test", guestCount: 2, consent: true };
function fakeDatabase({ capacity = 5, count = 0, duplicate = false } = {}) {
  const database = {
    event: { findUnique: async () => ({ id: input.eventId, status: "PUBLISHED", startsAt: new Date("2099-01-01"), rsvpEnabled: true, capacity, maxGuestsPerRsvp: 3, collectPhone: false }) },
    rsvp: { findUnique: async () => duplicate ? { id: "existing" } : null, aggregate: async () => ({ _count: { id: count }, _sum: { guestCount: 0 } }), create: vi.fn() },
  };
  database.$transaction = async callback => callback(database);
  return database;
}

it("enforces group headcount and returns no attendee details", async () => {
  await expect(createRsvp(input, { database: fakeDatabase({ count: 3 }) })).rejects.toMatchObject({ code: "FULL" });
  const database = fakeDatabase();
  const result = await createRsvp(input, { database });
  expect(result).toEqual({ ok: true, message: "You're on the list!" });
  expect(database.rsvp.create.mock.calls[0][0].data.publicName).toBe("Maya R.");
});

it("returns a friendly duplicate instead of creating again", async () => {
  await expect(createRsvp(input, { database: fakeDatabase({ duplicate: true }) })).rejects.toMatchObject({ code: "DUPLICATE" });
  const database = fakeDatabase();
  database.rsvp.create.mockRejectedValue({ code: "P2002" });
  await expect(createRsvp(input, { database })).rejects.toMatchObject({ code: "DUPLICATE" });
});

it("retries serialization failures at most three times", async () => {
  const transaction = vi.fn().mockRejectedValue({ code: "P2034" });
  await expect(serializable({ $transaction: transaction }, async () => {})).rejects.toMatchObject({ code: "P2034" });
  expect(transaction).toHaveBeenCalledTimes(4);
});

it("escapes CSV formulas and quoted multiline values", () => {
  for (const value of ["=1+1", "+SUM(A1)", "-1", "@cmd", "\tcmd", "\rcmd", "  =cmd"]) expect(csvCell(value)).toBe(`"'${value}"`);
  expect(csvCell('Hello, "friend"\nthere')).toBe('"Hello, ""friend""\nthere"');
});
