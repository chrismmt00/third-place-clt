import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { emailSchema, passwordSchema } from "./passwords.js";
import { normalizedHost, assertNonProductionDatabase } from "./database-safety.js";

/** Release provisioning is separate from development migrations/seeds. */
export function provisioningTarget(env, target, confirmedHost) {
  if (target === "development") return assertNonProductionDatabase(env.DATABASE_URL, env);
  if (target !== "production") throw new Error("Choose an explicit development or production target.");
  let url;
  try { url = new URL(env.DATABASE_URL); } catch { throw new Error("Invalid release database configuration."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.pathname.slice(1) || !confirmedHost || !env.PRODUCTION_DATABASE_HOST ||
      normalizedHost(url.hostname) !== normalizedHost(confirmedHost) || normalizedHost(url.hostname) !== normalizedHost(env.PRODUCTION_DATABASE_HOST) ||
      !["require", "verify-ca", "verify-full"].includes(url.searchParams.get("sslmode"))) {
    throw new Error("Confirm the exact production database host and require database TLS before provisioning.");
  }
  return env.DATABASE_URL;
}

export const ownerInput = z.object({
  OWNER_EMAIL: emailSchema,
  OWNER_NAME: z.string().trim().min(1).max(100),
  OWNER_TEMPORARY_PASSWORD: passwordSchema,
});

/** Create the first owner only; never reset or replace an existing administrator. */
export async function provisionOwner(database, input) {
  const data = ownerInput.parse(input);
  const passwordHash = await hash(data.OWNER_TEMPORARY_PASSWORD, 12);
  return database.$transaction(async tx => {
    const existing = await tx.adminUser.findUnique({ where: { email: data.OWNER_EMAIL } });
    if (existing) {
      if (existing.role !== "OWNER" || !existing.mustChangePassword || !await compare(data.OWNER_TEMPORARY_PASSWORD, existing.passwordHash)) throw new Error("An account already exists; use the authorized account management flow.");
      return { created: false };
    }
    if (await tx.adminUser.count({ where: { role: "OWNER" } })) throw new Error("An owner already exists; use the Users page to manage accounts.");
    await tx.adminUser.create({ data: { email: data.OWNER_EMAIL, name: data.OWNER_NAME, passwordHash, role: "OWNER", mustChangePassword: true } });
    await tx.siteSettings.upsert({ where: { id: "site" }, update: {}, create: { id: "site", instagramUrl: "https://www.instagram.com/thirdplace.clt/" } });
    return { created: true };
  }, { isolationLevel: "Serializable" });
}
