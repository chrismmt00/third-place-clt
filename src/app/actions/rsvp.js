"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createRsvp } from "@/lib/rsvp";
import { rateLimit } from "@/lib/rate-limit";
import { actionError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma-db";
import { idSchema } from "@/lib/validation";

export async function submitRsvp(_previous, formData) {
  try {
    const data = Object.fromEntries(formData);
    z.object({ website: z.string().max(0).default(""), eventId: idSchema }).parse(data);
    await rateLimit("rsvp", await headers());
    const result = await createRsvp(data);
    revalidatePath("/", "layout");
    return result;
  } catch (error) { return actionError(error); }
}

export async function manageRsvp(_previous, formData) {
  try {
    await requireAdmin();
    const data = z.object({ id: idSchema, eventId: idSchema, operation: z.enum(["cancel", "delete"]) }).parse(Object.fromEntries(formData));
    if (data.operation === "cancel") await db.rsvp.updateMany({ where: { id: data.id, eventId: data.eventId }, data: { status: "CANCELLED" } });
    else await db.rsvp.deleteMany({ where: { id: data.id, eventId: data.eventId } });
    revalidatePath("/", "layout");
    return { ok: true, message: "RSVP updated." };
  } catch (error) { return actionError(error); }
}
