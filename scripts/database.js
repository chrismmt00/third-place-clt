import "./load-env.js";
import { spawnSync } from "node:child_process";
import { assertNonProductionDatabase } from "../src/lib/database-safety.js";

try {
  assertNonProductionDatabase(process.env.DATABASE_URL);
  const action = process.argv[2];
  if (!["migrate", "seed"].includes(action)) throw new Error("Use migrate or seed.");
  const args = action === "migrate" ? ["node_modules/prisma/build/index.js", "migrate", "deploy"] : ["prisma/seed.js"];
  // Capture output: Prisma diagnostics may contain database identifiers or URLs.
  const result = spawnSync(process.execPath, args, { encoding: "utf8", env: process.env });
  if (result.status !== 0) throw new Error("Database operation failed. Inspect the configuration locally; no credentials were printed.");
  console.log(`Nonproduction ${action} completed.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
