import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ session: null, user: null }));
vi.mock("next-auth", () => ({ default: () => ({ auth: async () => state.session }) }));
vi.mock("../src/lib/prisma-db.js", () => ({ db: { adminUser: { findUnique: async () => state.user } } }));
import { requireAdmin, requireOwner } from "../src/lib/auth.js";
import { authenticate } from "../src/lib/authentication.js";
import { hash } from "bcryptjs";

beforeEach(() => { state.session = null; state.user = null; });
describe("fresh authorization", () => {
  it("rejects missing and removed users", async () => {
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
    state.session = { user: { id: "a", sessionVersion: 0 } };
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });
  it("rejects EDITOR and stale session versions", async () => {
    state.session = { user: { id: "a", sessionVersion: 0, role: "OWNER" } };
    state.user = { id: "a", role: "EDITOR", sessionVersion: 0 };
    await expect(requireOwner()).rejects.toMatchObject({ status: 403 });
    state.user.sessionVersion = 1;
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
  });
  it("limits forced reset to the account exception", async () => {
    state.session = { user: { id: "a", sessionVersion: 0 } };
    state.user = { id: "a", role: "OWNER", sessionVersion: 0, mustChangePassword: true };
    await expect(requireAdmin()).rejects.toMatchObject({ code: "PASSWORD_CHANGE_REQUIRED" });
    expect((await requireAdmin({ allowPasswordChange: true })).id).toBe("a");
  });
});

it("locks after five failures and unlocks after the interval", async () => {
  const user = { id: "a", email: "owner@example.test", passwordHash: await hash("correct-password", 4), role: "OWNER", sessionVersion: 0, failedLoginCount: 0, lockedUntil: null };
  const database = { adminUser: {
    findUnique: async () => ({ ...user }),
    update: async ({ data }) => Object.assign(user, data),
  } };
  database.$transaction = async callback => callback(database);
  const options = { database, limiter: async () => {}, now: new Date("2026-09-25T12:00Z") };
  for (let i = 0; i < 5; i++) expect(await authenticate({ email: user.email, password: "bad" }, new Headers(), options)).toBeNull();
  expect(user.failedLoginCount).toBe(5);
  expect(await authenticate({ email: user.email, password: "correct-password" }, new Headers(), options)).toBeNull();
  options.now = new Date("2026-09-25T12:16Z");
  expect(await authenticate({ email: user.email, password: "correct-password" }, new Headers(), options)).toMatchObject({ id: "a" });
  expect(user.failedLoginCount).toBe(0);
});
