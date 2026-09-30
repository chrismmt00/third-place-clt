import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { loadEnvironment } from "../scripts/load-env.js";

it("loads one .env file without replacing explicit shell overrides", () => {
  const directory = mkdtempSync(join(tmpdir(), "third-place-env-"));
  try {
    writeFileSync(join(directory, ".env"), "DATABASE_URL=local-placeholder\nTEST_DATABASE_URL=test-placeholder\nPRODUCTION_DATABASE_HOST=ep-example.neon.tech\n");
    writeFileSync(join(directory, ".env.local"), "DATABASE_URL=obsolete-override\n");
    const env = {};
    loadEnvironment(directory, env);
    expect(env).toEqual({ DATABASE_URL: "local-placeholder", TEST_DATABASE_URL: "test-placeholder", PRODUCTION_DATABASE_HOST: "ep-example.neon.tech" });
    const shell = { DATABASE_URL: "shell-placeholder", TEST_DATABASE_URL: "" };
    loadEnvironment(directory, shell);
    expect(shell.DATABASE_URL).toBe("shell-placeholder");
    expect(shell.TEST_DATABASE_URL).toBe("");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
