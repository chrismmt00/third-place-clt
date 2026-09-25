import "server-only";
import { requireAdmin, requireOwner } from "./auth.js";
import { db } from "./prisma-db.js";
import { z } from "zod";
import { idSchema } from "./validation.js";
import { eventHeadcount } from "./events.js";

const pageSchema = z.coerce.number().int().min(1).max(10000).default(1);

export async function listAdminEvents(input = {}) {
  await requireAdmin();
  const { filter, search, page } = z.object({ filter: z.enum(["upcoming", "past", "draft", "cancelled"]).default("upcoming"), search: z.string().max(200).default(""), page: pageSchema }).parse(input);
  const status = filter === "draft" ? "DRAFT" : filter === "cancelled" ? "CANCELLED" : "PUBLISHED";
  const events = await db.event.findMany({
    where: { status, title: { contains: search, mode: "insensitive" }, ...(filter === "upcoming" ? { startsAt: { gte: new Date() } } : filter === "past" ? { startsAt: { lt: new Date() } } : {}) },
    include: { _count: { select: { rsvps: true } } }, orderBy: { startsAt: filter === "past" ? "desc" : "asc" }, skip: (page - 1) * 50, take: 50,
  });
  return Promise.all(events.map(async event => ({ ...event, headcount: await eventHeadcount(db, event.id) })));
}

export async function getAdminEvent(id) {
  await requireAdmin();
  idSchema.parse(id);
  const event = await db.event.findUnique({ where: { id }, include: { _count: { select: { rsvps: true } } } });
  return event ? { ...event, headcount: await eventHeadcount(db, id) } : null;
}

export async function listAdminUsers() {
  await requireOwner();
  return db.adminUser.findMany({ select: { id: true, email: true, name: true, role: true, mustChangePassword: true, createdAt: true }, orderBy: { createdAt: "asc" } });
}

export async function getAdminAccount() {
  const user = await requireAdmin({ allowPasswordChange: true });
  return { id: user.id, email: user.email, name: user.name, role: user.role, mustChangePassword: user.mustChangePassword };
}

export async function listAdminRsvps(eventId, input = {}) {
  await requireAdmin();
  idSchema.parse(eventId);
  const { search, sort, page } = z.object({ search: z.string().max(200).default(""), sort: z.enum(["newest", "oldest", "name"]).default("newest"), page: pageSchema }).parse(input);
  const [rows, total, count] = await Promise.all([
    db.rsvp.findMany({
      where: { eventId, OR: ["firstName", "lastName", "email"].map(field => ({ [field]: { contains: search, mode: "insensitive" } })) },
      orderBy: sort === "name" ? [{ lastName: "asc" }, { firstName: "asc" }] : { createdAt: sort === "oldest" ? "asc" : "desc" }, take: 50, skip: (page - 1) * 50,
    }), db.rsvp.count({ where: { eventId } }), eventHeadcount(db, eventId),
  ]);
  return { rows, total, headcount: count };
}

export async function getAdminOverview() {
  await requireAdmin();
  const [events, rsvpTotal, unreadMessages] = await Promise.all([
    db.event.findMany({ where: { startsAt: { gte: new Date() }, status: "PUBLISHED" }, orderBy: { startsAt: "asc" }, take: 10 }),
    db.rsvp.count(), db.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  return { events: await Promise.all(events.map(async event => ({ ...event, headcount: await eventHeadcount(db, event.id) }))), rsvpTotal, unreadMessages };
}

export async function listAdminMessages(input = {}) {
  await requireAdmin();
  const { status, search, page } = z.object({ status: z.enum(["NEW", "READ", "ARCHIVED", "ALL"]).default("NEW"), search: z.string().max(200).default(""), page: pageSchema }).parse(input);
  return db.contactMessage.findMany({
    where: { ...(status === "ALL" ? {} : { status }), OR: ["name", "email", "subject"].map(field => ({ [field]: { contains: search, mode: "insensitive" } })) },
    orderBy: { createdAt: "desc" }, take: 50, skip: (page - 1) * 50,
  });
}

export async function getAdminMessage(id) {
  await requireAdmin();
  idSchema.parse(id);
  // Reading data during a GET/render must not mutate state. Opening UI posts manageMessage(read).
  return db.contactMessage.findUnique({ where: { id } });
}
