import "server-only";
import { compare, hash } from "bcryptjs";
import { db } from "./db.js";
import { credentialsSchema } from "./passwords.js";
import { rateLimit } from "./rate-limit.js";
import { serializable } from "./transaction.js";

const dummyHash = hash("unavailable-account-dummy-password", 12);

/** Shared Credentials provider path; failures disclose neither account existence nor lock state. */
export async function authenticate(credentials, headers, { database = db, limiter = rateLimit, now = new Date() } = {}) {
  await limiter("login", headers);
  const parsed = credentialsSchema.safeParse(credentials);
  if (!parsed.success) return null;
  const found = await database.adminUser.findUnique({ where: { email: parsed.data.email } });
  const valid = await compare(parsed.data.password, found?.passwordHash || await dummyHash);
  if (!found) return null;
  return serializable(database, async tx => {
    const user = await tx.adminUser.findUnique({ where: { id: found.id } });
    if (!user || user.passwordHash !== found.passwordHash) return null;
    if (user.lockedUntil && user.lockedUntil > now) return null;
    if (!valid) {
      const count = (user.lockedUntil ? 0 : user.failedLoginCount) + 1;
      await tx.adminUser.update({ where: { id: user.id }, data: {
        failedLoginCount: count, lockedUntil: count >= 5 ? new Date(now.getTime() + 15 * 60_000) : null,
      } });
      return null;
    }
    await tx.adminUser.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });
    return { id: user.id, role: user.role, name: user.name, sessionVersion: user.sessionVersion };
  });
}
