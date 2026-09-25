import "server-only";
import { createHmac } from "node:crypto";
import { db } from "./prisma-db.js";
import { UserError } from "./errors.js";

/** Only trust x-forwarded-for when the deployment proxy overwrites it. */
export function requestIp(headers) {
  const value = headers.get("x-forwarded-for")?.split(",")[0].trim();
  return value || "unknown";
}

export async function rateLimit(action, headers, { database = db, now = new Date() } = {}) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new UserError("This service is not configured yet.", "UNAVAILABLE", 503);
  const login = action === "login";
  const windowMs = (login ? 15 : 10) * 60_000;
  const limit = login ? 10 : 5;
  const window = Math.floor(now.getTime() / windowMs);
  const digest = createHmac("sha256", secret).update(requestIp(headers)).digest("hex");
  const key = `${action}:${digest}:${window}`;
  const hit = await database.rateLimitHit.upsert({
    where: { key }, update: { count: { increment: 1 } },
    create: { key, expiresAt: new Date((window + 1) * windowMs) },
  });
  // Opportunistic cleanup; errors cannot disable the limiter or expose request data.
  if (Math.random() < 0.02) await database.rateLimitHit.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});
  if (hit.count > limit) throw new UserError("Too many attempts. Please try again later.", "RATE_LIMIT", 429);
}
