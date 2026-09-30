import { normalizedHost } from "./database-safety.js";

/** Offline release checks; messages contain variable names, never their values. */
export function productionConfigIssues(env) {
  const issues = [];
  const required = ["DATABASE_URL", "PRODUCTION_DATABASE_HOST", "AUTH_SECRET", "AUTH_URL", "NEXT_PUBLIC_SITE_URL", "CLOUDFLARE_IMAGES_TOKEN"];
  for (const key of required) if (!env[key]?.trim()) issues.push(`${key} is required.`);
  if (!(env.CLOUDFLARE_IMAGES_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID)) issues.push("CLOUDFLARE_IMAGES_ACCOUNT_ID is required.");
  if (!(env.CLOUDFLARE_IMAGES_ACCOUNT_HASH || env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH)) issues.push("CLOUDFLARE_IMAGES_ACCOUNT_HASH is required.");
  if (env.AUTH_SECRET && env.AUTH_SECRET.length < 32) issues.push("AUTH_SECRET must contain at least 32 characters from a secure random generator.");
  const origins = {};
  for (const key of ["AUTH_URL", "NEXT_PUBLIC_SITE_URL"]) {
    if (!env[key]) continue;
    try {
      const url = new URL(env[key]);
      if (url.protocol !== "https:" || /^(localhost|127\.|\[::1\])/.test(url.hostname) || /\.(test|invalid|localhost)$/.test(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error();
      origins[key] = url.origin;
    } catch { issues.push(`${key} must be the public HTTPS origin without credentials, query, or path.`); }
  }
  if (origins.AUTH_URL && origins.NEXT_PUBLIC_SITE_URL && origins.AUTH_URL !== origins.NEXT_PUBLIC_SITE_URL) issues.push("AUTH_URL and NEXT_PUBLIC_SITE_URL must use the same origin.");
  if (env.TEST_DATABASE_URL) issues.push("Remove TEST_DATABASE_URL from the production environment.");
  if (env.SEED_ADMIN_PASSWORD) issues.push("Remove SEED_ADMIN_PASSWORD from the production runtime after provisioning.");
  if (env.DATABASE_URL) {
    try {
      const url = new URL(env.DATABASE_URL);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.pathname.slice(1) || /^(localhost|127\.|\[::1\])/.test(url.hostname)) throw new Error();
      if (normalizedHost(url.hostname) !== normalizedHost(env.PRODUCTION_DATABASE_HOST || "")) issues.push("DATABASE_URL must match the confirmed PRODUCTION_DATABASE_HOST.");
      if (!/^(require|verify-ca|verify-full)$/.test(url.searchParams.get("sslmode") || "")) issues.push("DATABASE_URL must require TLS through sslmode.");
    } catch { issues.push("DATABASE_URL must identify the production PostgreSQL database, not a local fixture."); }
  }
  return issues;
}
