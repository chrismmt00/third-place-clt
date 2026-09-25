import { afterEach, expect, it, vi } from "vitest";
import { rateLimit } from "../src/lib/rate-limit.js";

afterEach(() => { vi.unstubAllEnvs(); });
it("enforces shared database counters while storing only hashed IP keys", async () => {
  vi.stubEnv("AUTH_SECRET", "unit-test-only-key");
  const counters = new Map();
  const upsert = vi.fn(async ({ where }) => {
    const count = (counters.get(where.key) || 0) + 1;
    counters.set(where.key, count);
    return { count };
  });
  const database = { rateLimitHit: { upsert, deleteMany: vi.fn(async () => {}) } };
  const headers = new Headers({ "x-forwarded-for": "192.0.2.20, 192.0.2.30" });
  const now = new Date("2026-09-25T12:00:00Z");
  for (let i = 0; i < 5; i++) await rateLimit("contact", headers, { database, now });
  await expect(rateLimit("contact", headers, { database, now })).rejects.toMatchObject({ status: 429 });
  expect(JSON.stringify(upsert.mock.calls)).not.toContain("192.0.2");
  await expect(rateLimit("contact", headers, { database, now: new Date("2026-09-25T12:10:00Z") })).resolves.toBeUndefined();
});
