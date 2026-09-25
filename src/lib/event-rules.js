export function headcount(rsvps) {
  return rsvps.filter(row => row.status === "GOING").reduce((sum, row) => sum + 1 + row.guestCount, 0);
}

export function spotsLeft(event, count = 0) {
  return event.capacity === null ? null : Math.max(0, event.capacity - count);
}

export function isRsvpOpen(event, count = 0, now = new Date()) {
  return event.status === "PUBLISHED" && event.rsvpEnabled && new Date(event.startsAt) > now &&
    (!event.rsvpDeadline || new Date(event.rsvpDeadline) > now) &&
    (event.capacity === null || count < event.capacity);
}

export function slugBase(title) {
  return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100).replace(/-$/, "") || "event";
}

export async function uniqueSlug(title, exists) {
  const base = slugBase(title);
  for (let suffix = 1; suffix < 10000; suffix++) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }
  throw new Error("Could not allocate a unique event slug.");
}

export function formatPublicName(firstName, lastName) {
  const first = firstName.trim().split(/\s+/)[0];
  const initial = Array.from(lastName.trim())[0];
  return initial ? `${first} ${initial.toLocaleUpperCase("en-US")}.` : first;
}

export function directionsUrl(event) {
  return event.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;
}
