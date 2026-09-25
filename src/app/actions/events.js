"use server";

import { requireAdmin } from "@/lib/auth";
import { saveEvent, transitionEvent } from "@/lib/events";
import { actionError } from "@/lib/errors";
import { z } from "zod";
import { idSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function saveEventDraft(_previous, formData) {
  try {
    await requireAdmin();
    const event = await saveEvent(Object.fromEntries(formData));
    revalidatePath("/", "layout");
    return { ok: true, id: event.id, slug: event.slug, message: "Event saved." };
  } catch (error) { return actionError(error); }
}

export async function updateEventStatus(_previous, formData) {
  try {
    await requireAdmin();
    const data = z.object({ id: idSchema, operation: z.enum(["publish", "unpublish", "cancel", "duplicate", "delete"]), confirmationCount: z.preprocess(value => value === undefined || value === "" ? undefined : Number(value), z.number().int().min(0).optional()) }).parse(Object.fromEntries(formData));
    const result = await transitionEvent(data.id, data.operation, data.confirmationCount);
    revalidatePath("/", "layout");
    return { ok: true, ...result, message: "Event updated." };
  } catch (error) { return actionError(error); }
}
