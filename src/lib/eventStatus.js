// Display state for an event: which badge and which RSVP panel the UI shows.
// Field names follow prisma/schema.prisma (status DRAFT | PUBLISHED | CANCELLED).

/** Show the "n spots left" badge and note at or below this many spots. */
export const SPOTS_THRESHOLD = 5;

/**
 * phase  — which RSVP area the detail page shows:
 *          cancelled | ended | started | noRsvp | deadline | full | spots | open
 * badge  — StatusBadge kind for cards and the detail header (null = no badge)
 * spotsLeft — as returned by lib/public-events (null when there's no capacity limit)
 */
export function getEventState(event, spotsLeft = null, now = new Date()) {
  const starts = new Date(event.startsAt);
  const ends = event.endsAt ? new Date(event.endsAt) : starts;

  let phase;
  if (event.status === "CANCELLED") phase = "cancelled";
  else if (now >= ends && now >= starts) phase = "ended";
  else if (now >= starts) phase = "started";
  else if (!event.rsvpEnabled) phase = "noRsvp";
  else if (event.rsvpDeadline && now > new Date(event.rsvpDeadline)) phase = "deadline";
  else if (spotsLeft !== null && spotsLeft <= 0) phase = "full";
  else if (spotsLeft !== null && spotsLeft <= SPOTS_THRESHOLD) phase = "spots";
  else phase = "open";

  const badge = {
    cancelled: "cancelled",
    ended: "closed",
    started: "closed",
    noRsvp: null,
    deadline: "closed",
    full: "full",
    spots: "spots",
    open: "open",
  }[phase];

  return { phase, badge, spotsLeft, rsvpOpen: phase === "open" || phase === "spots" };
}

/** Filter tab for the admin events table: Upcoming | Past | Draft | Cancelled. */
export function adminGroup(event, now = new Date()) {
  if (event.status === "DRAFT") return "Draft";
  if (event.status === "CANCELLED") return "Cancelled";
  return new Date(event.endsAt || event.startsAt) <= now ? "Past" : "Upcoming";
}

/** StatusBadge kind for an event's publication status in admin views. */
export const adminBadge = (status) => ({ DRAFT: "draft", PUBLISHED: "published", CANCELLED: "cancelled" })[status];

/** "22 / 60 going" or "18 going · no limit" */
export function headcountLabel(headcount, capacity) {
  return capacity == null ? `${headcount} going · no limit` : `${headcount} / ${capacity} going`;
}

export function headcountPct(headcount, capacity) {
  if (!capacity) return 0;
  return Math.min(100, Math.round((headcount / capacity) * 100));
}

/** Link for "Get directions": the event's map link, else a Google Maps search of the address. */
export function directionsUrl(event) {
  if (event.mapUrl) return event.mapUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || event.locationName || "")}`;
}
