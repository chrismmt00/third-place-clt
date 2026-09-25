import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ ownerCount: 1, actor: { id: "cjld2cjxh0000qzrmn831i7rn", role: "OWNER", sessionVersion: 0 }, update: vi.fn(), remove: vi.fn(), authorize: vi.fn() }));
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("../src/lib/auth.js", () => ({ requireOwner: state.authorize, requireAdmin: state.authorize, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../src/lib/prisma-db.js", () => ({ db: {
  $transaction: async callback => callback({ adminUser: {
    findUnique: async () => state.actor,
    count: async () => state.ownerCount, update: state.update, delete: state.remove,
  } }),
} }));
import { manageAdmin } from "../src/app/actions/auth.js";
import { UserError } from "../src/lib/errors.js";

beforeEach(() => {
  vi.clearAllMocks(); state.ownerCount = 1;
  state.authorize.mockResolvedValue(state.actor);
});
function form(values) { const result = new FormData(); Object.entries(values).forEach(([key, value]) => result.set(key, value)); return result; }

it("blocks removal and demotion of the last owner", async () => {
  for (const operation of ["remove", "role"]) {
    const result = await manageAdmin(null, form({ id: state.actor.id, operation, role: "EDITOR" }));
    expect(result.ok).toBe(false);
    expect(result.error).toContain("last owner");
  }
  expect(state.remove).not.toHaveBeenCalled();
  expect(state.update).not.toHaveBeenCalled();
});

it("permits role updates with another owner and revokes old sessions", async () => {
  state.ownerCount = 2;
  expect((await manageAdmin(null, form({ id: state.actor.id, operation: "role", role: "EDITOR" }))).ok).toBe(true);
  expect(state.update).toHaveBeenCalledWith({ where: { id: state.actor.id }, data: { role: "EDITOR", sessionVersion: { increment: 1 } } });
});

it("denies an editor before parsing or mutating", async () => {
  state.authorize.mockRejectedValue(new UserError("Owner access required.", "FORBIDDEN", 403));
  expect((await manageAdmin(null, form({}))).code).toBe("FORBIDDEN");
  expect(state.update).not.toHaveBeenCalled();
});
