import { expect, it, vi } from "vitest";
import { provisioningTarget, provisionOwner } from "../src/lib/owner-provisioning.js";

it("requires an explicit release target, matching host and database TLS", () => {
  const env = { DATABASE_URL: "postgresql://ep-fixture-pooler.neon.tech/app?sslmode=require", PRODUCTION_DATABASE_HOST: "ep-fixture.neon.tech" };
  expect(provisioningTarget(env, "production", "ep-fixture.neon.tech")).toBe(env.DATABASE_URL);
  expect(() => provisioningTarget(env, "production", "other.neon.tech")).toThrow();
  expect(() => provisioningTarget(env, "production")).toThrow();
  expect(() => provisioningTarget(env)).toThrow();
  expect(() => provisioningTarget({ ...env, DATABASE_URL: "postgresql://ep-fixture.neon.tech/app" }, "production", "ep-fixture.neon.tech")).toThrow();
  expect(() => provisioningTarget(env, "development")).toThrow();
});

it("does not create another owner when one already exists", async () => {
  const create = vi.fn();
  const database = { $transaction: async fn => fn({ adminUser: { findUnique: async () => null, count: async () => 1, create } }) };
  await expect(provisionOwner(database, { OWNER_NAME: "Fixture", OWNER_EMAIL: "owner@example.test", OWNER_TEMPORARY_PASSWORD: "test-fixture-password" })).rejects.toThrow("owner already exists");
  expect(create).not.toHaveBeenCalled();
});
