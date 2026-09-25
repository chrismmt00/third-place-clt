import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
// bcrypt truncates at 72 bytes; reject rather than silently accept an equivalent password.
export const passwordSchema = z.string().min(12, "Use at least 12 characters.").refine(value => new TextEncoder().encode(value).length <= 72, "Use at most 72 bytes.");
export const credentialsSchema = z.object({ email: emailSchema, password: z.string().min(1).refine(value => new TextEncoder().encode(value).length <= 72) });
