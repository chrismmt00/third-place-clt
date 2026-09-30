import { expect, it } from "vitest";
import { productionConfigIssues } from "../src/lib/production-config.js";

function configured() {
  return { DATABASE_URL: "postgresql://fixture:fixture@ep-example-pooler.neon.tech/app?sslmode=require", PRODUCTION_DATABASE_HOST: "ep-example.neon.tech", AUTH_SECRET: "fixture-only-value-for-offline-tests", AUTH_URL: "https://example.org", NEXT_PUBLIC_SITE_URL: "https://example.org", CLOUDFLARE_IMAGES_TOKEN: "fixture", CLOUDFLARE_IMAGES_ACCOUNT_ID: "fixture", CLOUDFLARE_IMAGES_ACCOUNT_HASH: "fixture" };
}
it("accepts complete configuration without CAPTCHA keys and pooled production equivalents", () => { expect(productionConfigIssues(configured())).toEqual([]); });
it("rejects local URLs, leaked test configuration and seed credentials", () => {
  const issues = productionConfigIssues({ ...configured(), AUTH_URL: "http://localhost:3000", TEST_DATABASE_URL: "fixture", SEED_ADMIN_PASSWORD: "fixture" });
  expect(issues).toHaveLength(3);
});
it("rejects missing secrets, a different database, non-TLS connections and mismatched origins", () => {
  const issues = productionConfigIssues({ ...configured(), AUTH_SECRET: "short", DATABASE_URL: "postgresql://fixture:fixture@other.example.org/app", AUTH_URL: "https://other.example.org" });
  expect(issues).toHaveLength(4);
  expect(productionConfigIssues({}).length).toBe(8);
});
it("does not include sensitive values in errors", () => {
  const sensitive = "never-print-this-value";
  expect(productionConfigIssues({ DATABASE_URL: sensitive, AUTH_URL: sensitive, AUTH_SECRET: sensitive }).join(" ")).not.toContain(sensitive);
});
