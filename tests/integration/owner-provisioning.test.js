import { afterAll, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "node:crypto";
import { assertNonProductionDatabase } from "../../src/lib/database-safety.js";
import { provisionOwner } from "../../src/lib/owner-provisioning.js";

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: assertNonProductionDatabase(process.env.TEST_DATABASE_URL) }), log: [] });
const email = `provision-${randomUUID()}@example.test`;
const input = { OWNER_NAME: "Release fixture", OWNER_EMAIL: email, OWNER_TEMPORARY_PASSWORD: randomUUID() };
let created = false;
let settingsExisted;
afterAll(async () => {
  if (created) await database.adminUser.deleteMany({ where: { email } });
  if (created && !settingsExisted) await database.siteSettings.deleteMany({ where: { id: "site" } });
  await database.$disconnect();
});
it("provisions one owner, requires a password change, and preserves the account on a retry", async () => {
  settingsExisted = !!await database.siteSettings.findUnique({ where: { id: "site" } });
  const result = await provisionOwner(database, input);
  created = result.created;
  expect(created).toBe(true);
  const first = await database.adminUser.findUnique({ where: { email } });
  expect(first.role).toBe("OWNER");
  expect(first.mustChangePassword).toBe(true);
  expect(first.passwordHash).not.toBe(input.OWNER_TEMPORARY_PASSWORD);
  expect(await provisionOwner(database, input)).toEqual({ created: false });
  expect((await database.adminUser.findUnique({ where: { email } })).passwordHash).toBe(first.passwordHash);
  await expect(provisionOwner(database, { ...input, OWNER_TEMPORARY_PASSWORD: randomUUID() })).rejects.toThrow("account already exists");
}, 15000);
