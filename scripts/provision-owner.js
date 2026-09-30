import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parse } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { provisioningTarget, ownerInput, provisionOwner } from "../src/lib/owner-provisioning.js";

// Explicit files prevent .env.local from silently selecting the wrong database.
// Run only after the operator approves the release target and migration.
let database;
try {
  const { values } = parseArgs({ options: { target: { type: "string" }, "env-file": { type: "string" }, "credentials-file": { type: "string" }, "confirm-host": { type: "string" } } });
  if (!values["env-file"] || !values["credentials-file"]) throw new Error();
  const env = parse(readFileSync(values["env-file"]));
  const credentials = ownerInput.parse(parse(readFileSync(values["credentials-file"])));
  const connectionString = provisioningTarget(env, values.target, values["confirm-host"]);
  database = new PrismaClient({ adapter: new PrismaPg({ connectionString }), log: [] });
  const result = await provisionOwner(database, credentials);
  console.log(result.created ? "Initial OWNER provisioned with mandatory password change. Retrieve credentials from the private handoff file." : "This temporary OWNER is already provisioned; no account was changed.");
} catch {
  console.error("Owner provisioning refused or failed. Check the explicit target, migrated schema, private input files and existing owner status. No credential values were printed.");
  process.exitCode = 1;
} finally { if (database) await database.$disconnect(); }
