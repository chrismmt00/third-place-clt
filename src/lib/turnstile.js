import "server-only";
import { UserError } from "./errors.js";

const testSecret = "1x0000000000000000000000000000000AA";

export async function verifyTurnstile(token, action, { fetcher = fetch, env = process.env } = {}) {
  const production = env.NODE_ENV === "production";
  const secret = env.TURNSTILE_SECRET_KEY || (!production ? testSecret : "");
  if (!secret || production && /^[123]x0{10,}/.test(secret)) throw new UserError("Verification is not configured. Please try again later.", "UNAVAILABLE", 503);
  if (typeof token !== "string" || !token || token.length > 2048) throw new UserError("Please complete the verification.", "VERIFICATION");
  let result;
  try {
    const response = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: new URLSearchParams({ secret, response: token }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error();
    result = await response.json();
  } catch { throw new UserError("Verification is unavailable. Please try again.", "VERIFICATION"); }
  const testMode = !production && secret === testSecret;
  let hostname;
  try { hostname = new URL(env.NEXT_PUBLIC_SITE_URL).hostname; } catch { hostname = null; }
  if (!result.success || !testMode && (!hostname || result.hostname !== hostname || result.action !== action)) {
    throw new UserError("Verification failed. Please try again.", "VERIFICATION");
  }
}
