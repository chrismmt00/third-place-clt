import "server-only";
import { db } from "./prisma-db.js";
import { z } from "zod";
import { imageDeliveryUrl } from "./cloudflare.js";
import { eventHeadcount } from "./events.js";
import { directionsUrl, isRsvpOpen, spotsLeft } from "./event-rules.js";

export const publicEventSelect = Object.freeze({
  id: true, slug: true, title: true, description: true, startsAt: true, endsAt: true,
  locationName: true, address: true, mapUrl: true, imageId: true, imageAlt: true,
  status: true, capacity: true, rsvpEnabled: true, rsvpDeadline: true, collectPhone: true,
  maxGuestsPerRsvp: true, showAttendeeCount: true, showAttendeeNames: true, updatedAt: true,
});

export const publicEventWhere = Object.freeze({ status: { in: ["PUBLISHED", "CANCELLED"] } });

export async function listPublicEvents({ past = false, limit = 50, page = 1, now = new Date() } = {}, database = db) {
  z.object({ past: z.boolean(), limit: z.number().int().min(1).max(50), page: z.number().int().min(1).max(10000) }).parse({ past, limit, page });
  const events = await database.event.findMany({
    where: { ...publicEventWhere, startsAt: past ? { lt: now } : { gte: now } },
    select: publicEventSelect, orderBy: { startsAt: past ? "desc" : "asc" }, take: limit, skip: (page - 1) * limit,
  });
  return events.map(event => ({ ...event, imageUrl: imageDeliveryUrl(event.imageId), directionsUrl: directionsUrl(event) }));
}

export async function getPublicEvent(slug, database = db) {
  z.string().min(1).max(150).parse(slug);
  const event = await database.event.findFirst({ where: { slug, ...publicEventWhere }, select: publicEventSelect });
  if (!event) return null;
  const count = await eventHeadcount(database, event.id);
  const names = event.showAttendeeNames ? await database.rsvp.findMany({
    where: { eventId: event.id, status: "GOING", publicNameConsent: true },
    select: { publicName: true }, orderBy: { createdAt: "asc" },
  }) : [];
  return {
    ...event, imageUrl: imageDeliveryUrl(event.imageId, "hero"), ogImageUrl: imageDeliveryUrl(event.imageId, "og"),
    directionsUrl: directionsUrl(event), attendeeCount: event.showAttendeeCount ? count : null,
    attendeeNames: names.map(row => row.publicName), spotsLeft: spotsLeft(event, count), rsvpOpen: isRsvpOpen(event, count),
  };
}
