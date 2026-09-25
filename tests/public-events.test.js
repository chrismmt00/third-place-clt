import { expect, it, vi } from "vitest";
import { publicEventSelect, publicEventWhere, getPublicEvent, listPublicEvents } from "../src/lib/public-events.js";

it("never selects private RSVP fields and filters drafts at query time", async () => {
  expect(JSON.stringify(publicEventSelect)).not.toMatch(/email|phone|note|firstName|lastName/);
  expect(publicEventWhere.status.in).toEqual(["PUBLISHED", "CANCELLED"]);
  const findFirst = vi.fn(async () => null);
  expect(await getPublicEvent("draft", { event: { findFirst } })).toBeNull();
  expect(findFirst.mock.calls[0][0].where.status.in).not.toContain("DRAFT");
  const findMany = vi.fn(async () => []);
  await listPublicEvents({ limit: 3 }, { event: { findMany } });
  expect(findMany.mock.calls[0][0]).toMatchObject({ take: 3, select: publicEventSelect });
});

it("returns only consented formatted names and keeps cancelled RSVP closed", async () => {
  const findMany = vi.fn(async () => [{ publicName: "Maya R." }]);
  const database = {
    event: { findFirst: async () => ({ id: "a", status: "CANCELLED", rsvpEnabled: true, capacity: 10, startsAt: new Date("2099-01-01"), showAttendeeNames: true, showAttendeeCount: false, address: "Charlotte" }) },
    rsvp: { aggregate: async () => ({ _count: { id: 1 }, _sum: { guestCount: 2 } }), findMany },
  };
  const result = await getPublicEvent("cancelled", database);
  expect(result.attendeeNames).toEqual(["Maya R."]);
  expect(result.attendeeCount).toBeNull();
  expect(result.rsvpOpen).toBe(false);
  expect(findMany.mock.calls[0][0]).toMatchObject({ where: { publicNameConsent: true, status: "GOING" }, select: { publicName: true } });
});
