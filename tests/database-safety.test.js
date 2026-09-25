import { describe, expect, it } from "vitest";
import { assertNonProductionDatabase } from "../src/lib/database-safety.js";

describe("database safety", () => {
  it("permits local disposable databases", () => {
    expect(assertNonProductionDatabase("postgresql://localhost/test", {})).toContain("localhost");
  });
  it("rejects unidentified remote branches", () => {
    expect(() => assertNonProductionDatabase("postgresql://ep-sample.neon.tech/test", {})).toThrow("Confirm");
  });
  it("recognizes pooled and direct production equivalents", () => {
    expect(() => assertNonProductionDatabase("postgresql://ep-sample-pooler.neon.tech/test", {
      NONPRODUCTION_DATABASE_HOST: "ep-sample.neon.tech", PRODUCTION_DATABASE_HOST: "ep-sample.neon.tech",
    })).toThrow("Production");
  });
  it("rejects production runtime, labels, absent and invalid URLs", () => {
    for (const url of [undefined, "invalid", "postgresql://localhost/production", "https://localhost/test"]) {
      expect(() => assertNonProductionDatabase(url, {})).toThrow();
    }
    expect(() => assertNonProductionDatabase("postgresql://localhost/test", { NODE_ENV: "production" })).toThrow();
  });
});
