import { requireAdmin } from "@/lib/auth";
import { directUploadUrl } from "@/lib/cloudflare";
import { actionError, UserError } from "@/lib/errors";
import { z } from "zod";

export async function POST(request) {
  try {
    await requireAdmin();
    const origin = request.headers.get("origin");
    const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
    if (origin !== expected) throw new UserError("Invalid request origin.", "FORBIDDEN", 403);
    z.object({}).strict().parse(await request.json());
    return Response.json(await directUploadUrl(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(actionError(error), { status: error.status || (error.name === "ZodError" ? 400 : 503) });
  }
}
