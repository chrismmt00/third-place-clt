import { afterAll, beforeAll, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "node:crypto";
import { assertNonProductionDatabase } from "../../src/lib/database-safety.js";
import { createRsvp } from "../../src/lib/rsvp.js";

// Never falls back to DATABASE_URL. Reject unknown remote or production-equivalent targets.
const url = assertNonProductionDatabase(process.env.TEST_DATABASE_URL);
const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }), log: [] });
let event;
beforeAll(async () => {
  event = await database.event.create({ data: {
    title: "Concurrency test", slug: `integration-${randomUUID()}`, description: "Disposable test fixture",
    startsAt: new Date("2099-01-01T18:00Z"), endsAt: new Date("2099-01-01T20:00Z"), locationName: "Test", address: "Test",
    status: "PUBLISHED", capacity: 5,
  } });
});
afterAll(async () => {
  if (event) await database.event.delete({ where: { id: event.id } });
  await database.$disconnect();
});
it("admits exactly five of twenty simultaneous RSVPs", async () => {
  const outcomes = await Promise.allSettled(Array.from({ length: 20 }, (_, index) => createRsvp({
    eventId: event.id, firstName: "Test", lastName: "Attendee", email: `test-${index}@example.test`, guestCount: 0, consent: true,
  }, { database })));
  expect(outcomes.filter(result => result.status === "fulfilled")).toHaveLength(5);
  expect(await database.rsvp.count({ where: { eventId: event.id } })).toBe(5);
}, 30000);
