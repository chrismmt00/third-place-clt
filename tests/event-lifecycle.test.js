import { expect, it, vi } from "vitest";
vi.mock("../src/lib/cloudflare.js", () => ({ verifyImage: vi.fn(), deleteImage: vi.fn() }));
import { transitionEvent, saveEvent } from "../src/lib/events.js";

const id = "cjld2cjxh0000qzrmn831i7rn";
function fakeDatabase() {
  const state = { id, slug: "supper", title: "Supper", status: "DRAFT", capacity: 10, imageId: null };
  const database = {
    event: {
      findUnique: async ({ where }) => where.id ? { ...state } : null,
      update: vi.fn(async ({ data }) => Object.assign(state, data)),
      delete: vi.fn(async () => state), create: vi.fn(async ({ data }) => ({ id, ...data })),
    },
    rsvp: { count: async () => 3, aggregate: async () => ({ _count: { id: 3 }, _sum: { guestCount: 2 } }) },
    siteSettings: { findUnique: async () => ({ showAttendeeCountDefault: true, showAttendeeNamesDefault: false }) },
  };
  database.$transaction = async callback => callback(database);
  return { database, state };
}

it("publishes/unpublishes/cancels and duplicates only as a draft without shared image", async () => {
  const { database, state } = fakeDatabase();
  for (const [operation, status] of [["publish", "PUBLISHED"], ["unpublish", "DRAFT"], ["cancel", "CANCELLED"]]) {
    await transitionEvent(id, operation, undefined, { database });
    expect(state.status).toBe(status);
  }
  await transitionEvent(id, "duplicate", undefined, { database });
  expect(database.event.create.mock.calls[0][0].data).toMatchObject({ status: "DRAFT", imageId: null });
});

it("requires the current RSVP count before deleting", async () => {
  const { database } = fakeDatabase();
  await expect(transitionEvent(id, "delete", undefined, { database })).rejects.toMatchObject({ code: "CONFIRM_DELETE" });
  await expect(transitionEvent(id, "delete", 2, { database })).rejects.toMatchObject({ code: "CONFIRM_DELETE" });
  expect(database.event.delete).not.toHaveBeenCalled();
  await transitionEvent(id, "delete", 3, { database });
  expect(database.event.delete).toHaveBeenCalledOnce();
});

it("inherits new-event visibility and checks occupied capacity inside the transaction", async () => {
  const { database } = fakeDatabase();
  const form = { title: "Supper", description: "Meal", startsAt: "2026-11-02T19:00", endsAt: "2026-11-02T21:00", locationName: "Hall", address: "123 Main St", capacity: 5, rsvpEnabled: true, maxGuestsPerRsvp: 2 };
  const event = await saveEvent(form, { database });
  expect(event.showAttendeeCount).toBe(true);
  expect(event.showAttendeeNames).toBe(false);
  await expect(saveEvent({ ...form, id, capacity: 4 }, { database })).rejects.toMatchObject({ name: "ZodError" });
});
