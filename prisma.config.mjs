import "dotenv/config";
import { defineConfig } from "prisma/config";

// Validation and generation work offline. Mutating commands use scripts/database.js.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.js" },
  datasource: { url: process.env.DATABASE_URL || "postgresql://localhost/third_place_unconfigured" },
});
