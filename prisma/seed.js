import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { z } from "zod";
import { assertNonProductionDatabase } from "../src/lib/database-safety.js";

const url = assertNonProductionDatabase(process.env.DATABASE_URL);
const input = z.object({
  email: z.email().transform(value => value.trim().toLowerCase()),
  password: z.string().min(12).refine(value => Buffer.byteLength(value) <= 72),
}).safeParse({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD });
if (!input.success) throw new Error("Set a valid SEED_ADMIN_EMAIL and a 12+ character SEED_ADMIN_PASSWORD (maximum 72 bytes).");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }), log: [] });
try {
  await db.$transaction(async tx => {
    await tx.adminUser.upsert({
      where: { email: input.data.email }, update: {},
      create: { email: input.data.email, name: "Owner", role: "OWNER", passwordHash: await hash(input.data.password, 12), mustChangePassword: true },
    });
    await tx.siteSettings.upsert({ where: { id: "site" }, update: {}, create: { id: "site" } });
  });
  console.log("Nonproduction owner and settings initialized; existing records preserved.");
} catch {
  process.exitCode = 1;
  console.error("Seed failed. Check the nonproduction database configuration.");
} finally { await db.$disconnect(); }
