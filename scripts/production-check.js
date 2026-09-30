import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import { productionConfigIssues } from "../src/lib/production-config.js";

// Intentionally does not import load-env: local overrides must never mask release settings.
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || args[0] && !args[0].startsWith("--env-file=")) throw new Error();
  const env = args[0] ? parse(readFileSync(args[0].slice("--env-file=".length))) : process.env;
  const issues = productionConfigIssues(env);
  if (issues.length) {
    console.error("Production configuration is not ready:");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log("Offline production environment checks passed. Live host, database, widget, and account verification remain required.");
  }
} catch {
  console.error("Could not check configuration. Use production:check with the host environment or --env-file=<private file>.");
  process.exitCode = 1;
}
