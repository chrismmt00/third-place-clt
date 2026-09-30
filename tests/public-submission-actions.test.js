import { beforeEach, expect, it, vi } from "vitest";
import { UserError } from "../src/lib/errors.js";

const mocks = vi.hoisted(() => ({ rateLimit: vi.fn(), contact: vi.fn(), rsvp: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../src/lib/auth.js", () => ({ requireAdmin: vi.fn() }));
vi.mock("../src/lib/rate-limit.js", () => ({ rateLimit: mocks.rateLimit }));
vi.mock("../src/lib/prisma-db.js", () => ({ db: { contactMessage: { create: mocks.contact } } }));
vi.mock("../src/lib/rsvp.js", () => ({ createRsvp: mocks.rsvp }));
import { submitContact } from "../src/app/actions/contact.js";
import { submitRsvp } from "../src/app/actions/rsvp.js";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.rsvp.mockResolvedValue({ ok: true });
});

const cases = [
  ["contact", submitContact, mocks.contact, { name: "Maya", email: "maya@example.test", subject: "Hello", message: "See you soon", consent: "on", website: "" }],
  ["rsvp", submitRsvp, mocks.rsvp, { eventId: "cjld2cjxh0000qzrmn831i7rn", firstName: "Maya", lastName: "Rivera", email: "maya@example.test", guestCount: "0", consent: "on", website: "" }],
];

for (const [scope, action, write, values] of cases) {
  const form = (overrides = {}) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ ...values, ...overrides })) data.set(key, value);
    return data;
  };
  it(`${scope} accepts submissions without a challenge token`, async () => {
    expect(await action(null, form())).toMatchObject({ ok: true });
    expect(mocks.rateLimit).toHaveBeenCalledWith(scope, expect.any(Headers));
    expect(write).toHaveBeenCalledOnce();
  });
  it(`${scope} still rejects a filled honeypot without saving`, async () => {
    expect(await action(null, form({ website: "https://spam.example" }))).toMatchObject({ ok: false, fields: { website: expect.any(String) } });
    expect(write).not.toHaveBeenCalled();
  });
  it(`${scope} still enforces rate limits before saving`, async () => {
    mocks.rateLimit.mockRejectedValue(new UserError("Please wait.", "RATE_LIMIT", 429));
    expect(await action(null, form())).toMatchObject({ ok: false, code: "RATE_LIMIT" });
    expect(write).not.toHaveBeenCalled();
  });
}
