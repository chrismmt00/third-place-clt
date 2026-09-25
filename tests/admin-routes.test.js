import { beforeEach, expect, it, vi } from "vitest";
const authorize = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/auth.js", () => ({ requireAdmin: authorize }));
import { POST } from "../src/app/api/admin/uploads/direct-url/route.js";
import { GET } from "../src/app/api/admin/events/[id]/rsvps/export/route.js";
import { UserError } from "../src/lib/errors.js";

beforeEach(() => { authorize.mockReset(); });
it("returns 401 before upload or export data access", async () => {
  authorize.mockRejectedValue(new UserError("Please sign in.", "UNAUTHENTICATED", 401));
  expect((await POST(new Request("https://example.test/api/admin/uploads/direct-url", { method: "POST" }))).status).toBe(401);
  expect((await GET(new Request("https://example.test"), { params: Promise.resolve({ id: "invalid" }) })).status).toBe(401);
});
it("returns 403 for a forced-reset account and rejects cross-origin upload", async () => {
  authorize.mockRejectedValueOnce(new UserError("Change your password.", "PASSWORD_CHANGE_REQUIRED", 403));
  expect((await POST(new Request("https://example.test/upload", { method: "POST" }))).status).toBe(403);
  authorize.mockResolvedValue({ id: "a" });
  expect((await POST(new Request("https://example.test/upload", { method: "POST", headers: { origin: "https://attacker.test" } }))).status).toBe(403);
});
