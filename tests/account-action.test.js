import { beforeAll, beforeEach, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
import { UserError } from "../src/lib/errors.js";

const state = vi.hoisted(() => ({ authorize: vi.fn(), update: vi.fn(), user: null }));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("../src/lib/auth.js", () => ({ requireAdmin: state.authorize, requireOwner: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("../src/lib/prisma-db.js", () => ({ db: { adminUser: { updateMany: state.update } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { updateAccount } from "../src/app/actions/auth.js";

const password = "local-test-password-only";
beforeAll(async () => { state.user = { id: "owner-id", sessionVersion: 3, passwordHash: await hash(password, 4) }; });
beforeEach(() => { vi.clearAllMocks(); state.authorize.mockResolvedValue(state.user); state.update.mockResolvedValue({ count: 1 }); });
function form(overrides = {}) {
  const result = new FormData();
  for (const [key, value] of Object.entries({ name: "New name", email: " Owner@Example.test ", currentPassword: password, ...overrides })) result.set(key, value);
  return result;
}

it("changes only the authenticated account and revokes old sessions", async () => {
  expect(await updateAccount(null, form({ id: "another-user", role: "OWNER" }))).toMatchObject({ ok: true, signInRequired: true });
  expect(state.update).toHaveBeenCalledWith({ where: { id: state.user.id, sessionVersion: 3, passwordHash: state.user.passwordHash }, data: { name: "New name", email: "owner@example.test", sessionVersion: { increment: 1 } } });
});
it("checks authentication before parsing the submitted account", async () => {
  state.authorize.mockRejectedValue(new UserError("Sign in first.", "UNAUTHENTICATED", 401));
  expect(await updateAccount(null, null)).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
  expect(state.update).not.toHaveBeenCalled();
});
it("rejects a wrong password and invalid email without a write", async () => {
  expect(await updateAccount(null, form({ currentPassword: "wrong" }))).toMatchObject({ ok: false });
  expect(await updateAccount(null, form({ email: "invalid" }))).toMatchObject({ ok: false });
  expect(state.update).not.toHaveBeenCalled();
});
it("handles a conflicting email without exposing database details", async () => {
  state.update.mockRejectedValue({ code: "P2002", message: "private database detail" });
  const result = await updateAccount(null, form());
  expect(result.ok).toBe(false);
  expect(result.error).not.toContain("private");
});
it("rejects an account changed concurrently", async () => {
  state.update.mockResolvedValue({ count: 0 });
  expect(await updateAccount(null, form())).toMatchObject({ ok: false, code: "UNAUTHENTICATED" });
});
