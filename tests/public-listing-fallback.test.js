import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ list: vi.fn(), detail: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("../src/lib/public-events.js", () => ({ listPublicEvents: mocks.list, getPublicEvent: mocks.detail }));
import { loadEventListing } from "../src/app/(site)/site-data.js";

beforeEach(() => { vi.resetAllMocks(); vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); });

it("reports missing event storage without exposing errors or claiming there are no events", async () => {
  mocks.list.mockRejectedValue(new Error("private-database-diagnostic"));
  expect(await loadEventListing({ limit: 3 })).toEqual({ available: false, events: [], items: [] });
  expect(console.error).toHaveBeenCalledWith("Public event listings are unavailable.");
});
it("keeps a successful empty listing distinct from an outage", async () => {
  mocks.list.mockResolvedValue([]);
  expect(await loadEventListing()).toEqual({ available: true, events: [], items: [] });
  expect(console.error).not.toHaveBeenCalled();
});
it("also handles a capacity-query failure after events load", async () => {
  mocks.list.mockResolvedValue([{ slug: "meetup", capacity: 10, status: "PUBLISHED", rsvpEnabled: true, startsAt: new Date("2099-01-01"), endsAt: new Date("2099-01-02") }]);
  mocks.detail.mockRejectedValue(new Error("private-database-diagnostic"));
  expect(await loadEventListing()).toMatchObject({ available: false, items: [] });
  expect(mocks.detail).toHaveBeenCalledOnce();
});
it("preserves past-event pagination without requesting attendance data", async () => {
  const events = [{ slug: "past-meetup" }];
  mocks.list.mockResolvedValue(events);
  expect(await loadEventListing({ past: true, page: 2, limit: 12 })).toEqual({ available: true, events, items: [] });
  expect(mocks.list).toHaveBeenCalledWith({ past: true, page: 2, limit: 12 });
  expect(mocks.detail).not.toHaveBeenCalled();
});
