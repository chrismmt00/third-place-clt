/** Normalize Neon pooled/direct endpoints without exposing connection credentials. */
export function normalizedHost(host) {
  return host.toLowerCase().replace(/-pooler(?=\.)/, "");
}

/** Fail closed: mutation/test targets must be local or explicitly identified as nonproduction. */
export function assertNonProductionDatabase(value, env = process.env) {
  if (!value) throw new Error("Configure a nonproduction database before this operation.");
  let url;
  try { url = new URL(value); } catch { throw new Error("Invalid database configuration."); }
  const host = normalizedHost(url.hostname);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("PostgreSQL URL required.");
  if (env.NODE_ENV === "production" || /(^|[\W_])(prod|production)([\W_]|$)/i.test(host + url.pathname)) {
    throw new Error("Production database operations are forbidden by development tooling.");
  }
  if (env.PRODUCTION_DATABASE_HOST && host === normalizedHost(env.PRODUCTION_DATABASE_HOST)) {
    throw new Error("Production database operations are forbidden by development tooling.");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(host);
  if (!local && host !== normalizedHost(env.NONPRODUCTION_DATABASE_HOST || "")) {
    throw new Error("Confirm NONPRODUCTION_DATABASE_HOST before database mutations.");
  }
  return value;
}
