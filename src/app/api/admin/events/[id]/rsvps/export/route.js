import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma-db";
import { idSchema } from "@/lib/validation";
import { rsvpsCsv } from "@/lib/csv";
import { actionError, UserError } from "@/lib/errors";

export async function GET(_request, context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    idSchema.parse(id);
    const event = await db.event.findUnique({ where: { id }, select: { slug: true } });
    if (!event) throw new UserError("Event not found.", "NOT_FOUND", 404);
    const rows = await db.rsvp.findMany({ where: { eventId: id }, orderBy: { createdAt: "asc" } });
    const filename = `rsvps-${event.slug.replace(/[^a-z0-9-]/g, "")}-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(rsvpsCsv(rows), { headers: {
      "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) { return Response.json(actionError(error), { status: error.status || (error.name === "ZodError" ? 400 : 503), headers: { "Cache-Control": "no-store" } }); }
}
