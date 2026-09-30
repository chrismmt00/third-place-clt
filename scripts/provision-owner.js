import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parse } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { provisioningTarget, ownerInput, provisionOwner } from "../src/lib/owner-provisioning.js";

// Configuration and owner credentials share the same .env file.
// Run only after the operator approves the release target and migration.
let database;
try {
  const { values } = parseArgs({ options: { target: { type: "string" }, "env-file": { type: "string", default: ".env" }, "confirm-host": { type: "string" } } });
  const env = parse(readFileSync(values["env-file"]));
  const credentials = ownerInput.parse(env);
  const connectionString = provisioningTarget(env, values.target, values["confirm-host"]);
  database = new PrismaClient({ adapter: new PrismaPg({ connectionString }), log: [] });
  const result = await provisionOwner(database, credentials);
  console.log(result.created ? "Initial OWNER provisioned with mandatory password change. Retrieve credentials from the private .env file." : "This temporary OWNER is already provisioned; no account was changed.");
} catch {
  console.error("Owner provisioning refused or failed. Check the explicit target, migrated schema, private input files and existing owner status. No credential values were printed.");
  process.exitCode = 1;
} finally { if (database) await database.$disconnect(); }
