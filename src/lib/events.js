import "server-only";
import { db } from "./prisma-db.js";
import { serializable } from "./transaction.js";
import { eventSchema, idSchema } from "./validation.js";
import { uniqueSlug } from "./event-rules.js";
import { UserError } from "./errors.js";
import { verifyImage, deleteImage } from "./cloudflare.js";
export { headcount, spotsLeft, isRsvpOpen, uniqueSlug } from "./event-rules.js";

export async function eventHeadcount(database, eventId) {
  const result = await database.rsvp.aggregate({ where: { eventId, status: "GOING" }, _count: { id: true }, _sum: { guestCount: true } });
  return result._count.id + (result._sum.guestCount || 0);
}

/** Caller authenticates first. Capacity checks and updates share a serializable transaction. */
export async function saveEvent(input, { database = db } = {}) {
  const initial = eventSchema().parse(input);
  const existing = initial.id ? await database.event.findUnique({ where: { id: initial.id } }) : null;
  if (initial.id && !existing) throw new UserError("Event not found.");
  if (initial.imageId && initial.imageId !== existing?.imageId) await verifyImage(initial.imageId);
  let result;
  for (let attempt = 0; ; attempt++) {
    try {
      result = await serializable(database, async tx => {
        const previous = initial.id ? await tx.event.findUnique({ where: { id: initial.id } }) : null;
        if (initial.id && !previous) throw new UserError("Event not found.");
        const count = previous ? await eventHeadcount(tx, previous.id) : 0;
        const { id, ...data } = eventSchema(count).parse(input);
        const settings = await tx.siteSettings.findUnique({ where: { id: "site" } });
        data.showAttendeeCount ??= previous?.showAttendeeCount ?? settings?.showAttendeeCountDefault ?? false;
        data.showAttendeeNames ??= previous?.showAttendeeNames ?? settings?.showAttendeeNamesDefault ?? false;
        data.imageId ||= null;
        data.mapUrl ||= null;
        const saved = id ? await tx.event.update({ where: { id }, data }) : await tx.event.create({ data: {
          ...data, slug: await uniqueSlug(data.title, slug => tx.event.findUnique({ where: { slug }, select: { id: true } })),
        } });
        return { event: saved, oldImageId: previous?.imageId !== saved.imageId ? previous?.imageId : null };
      });
      break;
    } catch (error) {
      if (error.code === "P2002" && !initial.id && String(error.meta?.target).includes("slug") && attempt < 3) continue;
      if (error.code === "P2002") throw new UserError("That image is already used by another event. Upload a separate image.");
      throw error;
    }
  }
  await deleteImage(result.oldImageId);
  return result.event;
}

export async function transitionEvent(id, operation, confirmationCount, { database = db } = {}) {
  idSchema.parse(id);
  const result = await serializable(database, async tx => {
    const event = await tx.event.findUnique({ where: { id } });
    if (!event) throw new UserError("Event not found.");
    if (operation === "delete") {
      const count = await tx.rsvp.count({ where: { eventId: id } });
      if (confirmationCount !== count) throw new UserError(`This will delete ${count} RSVPs. Review the current count and confirm again.`, "CONFIRM_DELETE");
      await tx.event.delete({ where: { id } });
      return { id, slug: event.slug, oldImageId: event.imageId };
    }
    if (operation === "duplicate") {
      const { id: _id, createdAt: _created, updatedAt: _updated, ...data } = event;
      return tx.event.create({ data: {
        ...data, title: `${event.title.slice(0, 150)} (copy)`, status: "DRAFT", imageId: null, imageAlt: "",
        slug: await uniqueSlug(event.title, slug => tx.event.findUnique({ where: { slug }, select: { id: true } })),
      } });
    }
    const status = { publish: "PUBLISHED", unpublish: "DRAFT", cancel: "CANCELLED" }[operation];
    if (!status) throw new UserError("Unknown event operation.");
    return tx.event.update({ where: { id }, data: { status } });
  });
  if (operation === "delete") await deleteImage(result.oldImageId);
  return { id: result.id, slug: result.slug };
}
