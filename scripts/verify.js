import { spawnSync } from "node:child_process";

const checks = [
  [process.execPath, ["node_modules/prisma/build/index.js", "validate"]],
  [process.execPath, ["node_modules/eslint/bin/eslint.js", "."]],
  [process.execPath, ["node_modules/vitest/vitest.mjs", "run"]],
  [process.execPath, ["scripts/check-client-boundary.js"]],
];
for (const [command, args] of checks) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
const types = spawnSync("git", ["ls-files", "*.ts", "*.tsx"], { encoding: "utf8" });
if (types.status !== 0 || types.stdout.trim()) {
  console.error("Tracked TypeScript source gate failed.");
  process.exit(1);
}
console.log("All backend gates passed. Database integration runs only when TEST_DATABASE_URL is configured.");
