import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { connection } from "next/server";
import { adminGroup, getEventState } from "./eventStatus";
import { createSeed } from "./seed";

/*
 * Data access for the whole app. This implementation keeps everything in memory
 * (seeded from lib/seed.js) so the site runs with zero setup. It resets when the
 * server restarts. To go live, re-implement these functions against a real
 * database; nothing outside this file touches the store directly.
 */

function store() {
  globalThis.__thirdPlaceStore ??= createSeed();
  return globalThis.__thirdPlaceStore;
}

const nowIso = () => new Date().toISOString();
const clone = (o) => (o ? { ...o } : null);
const byStart = (a, b) => new Date(a.startsAt) - new Date(b.startsAt);
const PUBLIC_STATUSES = new Set(["published", "cancelled"]);
const YEAR = 365 * 86400000;

// ---------------------------------------------------------------- events

function headcountFor(eventId) {
  return store()
    .rsvps.filter((r) => r.eventId === eventId && r.status === "going")
    .reduce((n, r) => n + 1 + r.guests, 0);
}

function withState(event, now = new Date()) {
  const headcount = headcountFor(event.id);
  return { ...event, headcount, state: getEventState(event, headcount, now) };
}

/** Published (and cancelled) events that haven't ended, soonest first. */
export async function listUpcomingEvents({ limit } = {}) {
  await connection();
  const now = new Date();
  const list = store()
    .events.filter((e) => PUBLIC_STATUSES.has(e.status) && new Date(e.endsAt || e.startsAt) > now)
    .sort(byStart)
    .map((e) => withState(e, now));
  return limit ? list.slice(0, limit) : list;
}

/** Published events from the last 12 months that have ended, newest first. */
export async function listPastEvents({ limit = 12 } = {}) {
  await connection();
  const now = new Date();
  const all = store()
    .events.filter((e) => {
      const ends = new Date(e.endsAt || e.startsAt);
      return e.status === "published" && ends <= now && now - ends < YEAR;
    })
    .sort((a, b) => byStart(b, a));
  return { events: all.slice(0, limit).map((e) => withState(e, now)), total: all.length };
}

/** Public event by slug. Drafts only come back when `includeDrafts` (staff preview). */
export async function getEventBySlug(slug, { includeDrafts = false } = {}) {
  await connection();
  const e = store().events.find((x) => x.slug === slug);
  if (!e) return null;
  if (!includeDrafts && !PUBLIC_STATUSES.has(e.status)) return null;
  return withState(e);
}

/** "Maya R." for everyone going who opted in. Nothing else about them leaves the server. */
export async function getPublicAttendeeNames(eventId) {
  return store()
    .rsvps.filter((r) => r.eventId === eventId && r.status === "going" && r.showNamePublicly)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((r) => publicName(r.name));
}

function publicName(full) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export async function listAdminEvents() {
  await connection();
  const now = new Date();
  return store()
    .events.map((e) => ({
      ...withState(e, now),
      group: adminGroup(e, now),
      rsvpCount: store().rsvps.filter((r) => r.eventId === e.id).length,
    }))
    .sort(byStart);
}

export async function getEventById(id) {
  await connection();
  const e = store().events.find((x) => x.id === id);
  if (!e) return null;
  const rsvps = store().rsvps.filter((r) => r.eventId === id);
  return {
    ...withState(e),
    rsvpCount: rsvps.length,
    goingCount: rsvps.filter((r) => r.status === "going").length,
  };
}

export async function isSlugTaken(slug, exceptId) {
  return store().events.some((e) => e.slug === slug && e.id !== exceptId);
}

export async function uniqueSlug(base, exceptId) {
  let slug = base || "event";
  let n = 2;
  while (await isSlugTaken(slug, exceptId)) slug = `${base}-${n++}`;
  return slug;
}

export async function createEvent(data) {
  const event = {
    id: randomUUID(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    publishedAt: data.status === "published" ? nowIso() : null,
    ...data,
  };
  store().events.push(event);
  return clone(event);
}

export async function updateEvent(id, data) {
  const e = store().events.find((x) => x.id === id);
  if (!e) return null;
  if (data.status === "published" && e.status !== "published" && !e.publishedAt) data.publishedAt = nowIso();
  Object.assign(e, data, { updatedAt: nowIso() });
  return clone(e);
}

export async function duplicateEvent(id) {
  const e = store().events.find((x) => x.id === id);
  if (!e) return null;
  const copy = {
    ...e,
    id: randomUUID(),
    title: `${e.title} (copy)`,
    slug: await uniqueSlug(`${e.slug}-copy`),
    status: "draft",
    publishedAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store().events.push(copy);
  return clone(copy);
}

/** Deletes the event and all of its RSVPs. */
export async function deleteEvent(id) {
  const s = store();
  s.events = s.events.filter((e) => e.id !== id);
  s.rsvps = s.rsvps.filter((r) => r.eventId !== id);
}

// ---------------------------------------------------------------- RSVPs

/**
 * Saves an RSVP if there's room. Returns { kind } where kind is one of
 * "success" | "duplicate" | "filled" | "closed" | "notFound".
 */
export async function createRsvp(slug, input) {
  const s = store();
  const event = s.events.find((e) => e.slug === slug && e.status === "published");
  if (!event) return { kind: "notFound" };

  const headcount = headcountFor(event.id);
  const state = getEventState(event, headcount);
  if (!state.rsvpOpen && state.phase !== "full") return { kind: "closed", event: withState(event) };

  const email = input.email.trim().toLowerCase();
  const existing = s.rsvps.find((r) => r.eventId === event.id && r.status === "going" && r.email.toLowerCase() === email);
  if (existing) return { kind: "duplicate", event: withState(event) };

  const guests = Math.max(0, Math.min(event.maxGuestsPerRsvp, input.guests | 0));
  if (state.spotsLeft !== null && 1 + guests > state.spotsLeft) return { kind: "filled", event: withState(event) };

  const rsvp = {
    id: randomUUID(),
    eventId: event.id,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: event.collectPhone ? (input.phone || "").trim() : "",
    guests,
    note: (input.note || "").trim().slice(0, 500),
    showNamePublicly: !!input.showNamePublicly,
    status: "going",
    createdAt: nowIso(),
  };
  s.rsvps.push(rsvp);
  return { kind: "success", rsvp: clone(rsvp), event: withState(event) };
}

export async function listRsvpsForEvent(eventId) {
  await connection();
  return store()
    .rsvps.filter((r) => r.eventId === eventId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(clone);
}

export async function getRsvp(id) {
  return clone(store().rsvps.find((r) => r.id === id));
}

export async function setRsvpStatus(id, status) {
  const r = store().rsvps.find((x) => x.id === id);
  if (r) r.status = status;
  return clone(r);
}

export async function deleteRsvp(id) {
  const s = store();
  s.rsvps = s.rsvps.filter((r) => r.id !== id);
}

// ---------------------------------------------------------------- messages

export async function createMessage({ name, email, subject, body }) {
  const message = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim(),
    subject: (subject || "").trim(),
    body: body.trim(),
    status: "new",
    createdAt: nowIso(),
  };
  store().messages.push(message);
  return clone(message);
}

export async function listMessages() {
  await connection();
  return store()
    .messages.slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(clone);
}

export async function countUnreadMessages() {
  await connection();
  return store().messages.filter((m) => m.status === "new").length;
}

export async function setMessageStatus(id, status) {
  const m = store().messages.find((x) => x.id === id);
  if (m) m.status = status;
  return clone(m);
}

export async function deleteMessage(id) {
  const s = store();
  s.messages = s.messages.filter((m) => m.id !== id);
}

// ---------------------------------------------------------------- settings

export async function getSettings() {
  await connection();
  return { ...store().settings };
}

export async function updateSettings(data) {
  Object.assign(store().settings, data);
  return { ...store().settings };
}

// ---------------------------------------------------------------- users

const safeUser = (u) => {
  if (!u) return null;
  const { passwordHash, failedAttempts, lockedUntil, ...rest } = u;
  return rest;
};

export async function listUsers() {
  await connection();
  return store().users.map(safeUser);
}

export async function getUserById(id) {
  return safeUser(store().users.find((u) => u.id === id));
}

/** Includes the password hash and lockout fields; only for lib/auth. */
export async function getUserRecordByEmail(email) {
  const u = store().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  return u ? { ...u } : null;
}

export async function getUserRecordById(id) {
  const u = store().users.find((x) => x.id === id);
  return u ? { ...u } : null;
}

export async function createUser({ name, email, role, passwordHash, mustChangePassword }) {
  const u = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim(),
    role,
    passwordHash,
    mustChangePassword: !!mustChangePassword,
    lastSignInAt: null,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: nowIso(),
  };
  store().users.push(u);
  return safeUser(u);
}

export async function updateUser(id, data) {
  const u = store().users.find((x) => x.id === id);
  if (!u) return null;
  Object.assign(u, data);
  return safeUser(u);
}

export async function deleteUser(id) {
  const s = store();
  s.users = s.users.filter((u) => u.id !== id);
  await deleteSessionsForUser(id);
}

export async function countOwners() {
  return store().users.filter((u) => u.role === "owner").length;
}

// ---------------------------------------------------------------- sessions

const SESSION_DAYS = 7;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  store().sessions.set(hashToken(token), { userId, expiresAt });
  return { token, expiresAt };
}

export async function getSessionUserId(token) {
  if (!token) return null;
  const key = hashToken(token);
  const session = store().sessions.get(key);
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    store().sessions.delete(key);
    return null;
  }
  return session.userId;
}

export async function deleteSession(token) {
  if (token) store().sessions.delete(hashToken(token));
}

export async function deleteSessionsForUser(userId, { exceptToken } = {}) {
  const keep = exceptToken ? hashToken(exceptToken) : null;
  for (const [key, s] of store().sessions) {
    if (s.userId === userId && key !== keep) store().sessions.delete(key);
  }
}

// ---------------------------------------------------------------- images

export async function saveImage({ type, data, name }) {
  const id = randomUUID();
  store().images.set(id, { id, type, data, name, size: data.length, createdAt: nowIso() });
  return id;
}

export async function getImage(id) {
  return store().images.get(id) || null;
}

// ---------------------------------------------------------------- overview

export async function getOverview() {
  await connection();
  const now = new Date();
  const s = store();
  const upcoming = s.events
    .filter((e) => e.status === "published" && new Date(e.endsAt || e.startsAt) > now)
    .sort(byStart)
    .map((e) => withState(e, now));
  return {
    totalEvents: s.events.length,
    upcomingCount: upcoming.length,
    draftCount: s.events.filter((e) => e.status === "draft").length,
    peopleGoing: upcoming.reduce((n, e) => n + e.headcount, 0),
    unread: s.messages.filter((m) => m.status === "new").length,
    nextUp: upcoming.slice(0, 4),
  };
}
