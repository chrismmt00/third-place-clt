import "server-only";
import { db } from "./prisma-db.js";
import { serializable } from "./transaction.js";
import { eventHeadcount } from "./events.js";
import { isRsvpOpen, formatPublicName } from "./event-rules.js";
import { rsvpSchema, idSchema } from "./validation.js";
import { UserError } from "./errors.js";

/** Single RSVP creation entry point. HTTP/action caller performs anti-abuse checks first. */
export async function createRsvp(input, { database = db, now = new Date() } = {}) {
  idSchema.parse(input.eventId);
  try {
    await serializable(database, async tx => {
      const event = await tx.event.findUnique({ where: { id: input.eventId } });
      if (!event || event.status === "DRAFT") throw new UserError("This event is not available.", "NOT_FOUND", 404);
      const data = rsvpSchema(event).parse(input);
      const existing = await tx.rsvp.findUnique({ where: { eventId_email: { eventId: event.id, email: data.email } }, select: { id: true } });
      if (existing) throw new UserError("You're already on the list for this event. Contact the organizer if you need a change.", "DUPLICATE");
      const count = await eventHeadcount(tx, event.id);
      if (!isRsvpOpen(event, count, now)) throw new UserError("RSVPs are closed for this event.", "CLOSED");
      if (event.capacity !== null && count + 1 + data.guestCount > event.capacity) throw new UserError("There aren't enough spots for your group. Try fewer guests.", "FULL");
      await tx.rsvp.create({ data: {
        eventId: event.id, firstName: data.firstName, lastName: data.lastName, email: data.email,
        phone: data.phone || null, guestCount: data.guestCount, note: data.note || null,
        publicName: formatPublicName(data.firstName, data.lastName), publicNameConsent: data.publicNameConsent, consentAt: now,
      } });
    });
    // Never echo attendee details or full names into a public action response.
    return { ok: true, message: "You're on the list!" };
  } catch (error) {
    if (error.code === "P2002") throw new UserError("You're already on the list for this event. Contact the organizer if you need a change.", "DUPLICATE");
    throw error;
  }
}
