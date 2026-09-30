import "server-only";
import { utcToEasternInput } from "@/lib/dates";

/** Site host shown in front of an event's web address, e.g. "thirdplaceclt.org". */
export function siteHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").host;
  } catch {
    return "";
  }
}

/** An admin event record -> the plain EventForm `initial` shape with Eastern input values. */
export function formInitial(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: utcToEasternInput(event.startsAt),
    endsAt: utcToEasternInput(event.endsAt),
    rsvpDeadline: event.rsvpDeadline ? utcToEasternInput(event.rsvpDeadline) : "",
    locationName: event.locationName,
    address: event.address,
    mapUrl: event.mapUrl || "",
    imageId: event.imageId || "",
    imageAlt: event.imageAlt || "",
    capacity: event.capacity,
    rsvpEnabled: event.rsvpEnabled,
    collectPhone: event.collectPhone,
    maxGuestsPerRsvp: event.maxGuestsPerRsvp,
    showAttendeeCount: event.showAttendeeCount,
    showAttendeeNames: event.showAttendeeNames,
  };
}
