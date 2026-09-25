"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/prisma-db";
import { requireAdmin } from "@/lib/auth";
import { contactSchema, settingsSchema, idSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { actionError } from "@/lib/errors";

export async function submitContact(_previous, formData) {
  try {
    const input = Object.fromEntries(formData);
    const { name, email, subject, message } = contactSchema.parse(input);
    await rateLimit("contact", await headers());
    await verifyTurnstile(input["cf-turnstile-response"], "contact");
    await db.contactMessage.create({ data: { name, email, subject, message } });
    revalidatePath("/admin/messages");
    return { ok: true, message: "Your message has been received. Thank you!" };
  } catch (error) { return actionError(error); }
}

export async function manageMessage(_previous, formData) {
  try {
    await requireAdmin();
    const data = z.object({ id: idSchema, operation: z.enum(["read", "archive", "delete"]) }).parse(Object.fromEntries(formData));
    if (data.operation === "delete") await db.contactMessage.delete({ where: { id: data.id } });
    else if (data.operation === "read") await db.contactMessage.updateMany({ where: { id: data.id, status: "NEW" }, data: { status: "READ" } });
    else await db.contactMessage.update({ where: { id: data.id }, data: { status: "ARCHIVED" } });
    revalidatePath("/admin/messages");
    return { ok: true, message: "Message updated." };
  } catch (error) { return actionError(error); }
}

export async function saveSettings(_previous, formData) {
  try {
    await requireAdmin();
    const data = settingsSchema.parse(Object.fromEntries(formData));
    await db.siteSettings.upsert({ where: { id: "site" }, update: data, create: { id: "site", ...data } });
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved." };
  } catch (error) { return actionError(error); }
}
