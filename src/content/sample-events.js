import { photos } from "./photos.js";
import { getEventState } from "../lib/eventStatus.js";

// Visual fixtures only. Never seed these into a database or accept registrations.
const sampleNow = new Date("2026-09-30T12:00:00-04:00");
const examples = [
  { slug: "sample-coffee-conversation", title: "Coffee & good conversation", startsAt: "2026-10-10T11:00:00-04:00", endsAt: "2026-10-10T13:00:00-04:00", locationName: "The neighborhood café · sample venue", photo: photos.conversation, capacity: 24, spotsLeft: 12, summary: "A slow Saturday morning, a few good questions, and some new faces around the table.", description: "Pull up a chair and settle into a relaxed morning of conversation. Come on your own or bring a friend—there’s room for both.\n\n### What to expect\n- A warm welcome and quick introductions\n- Small-group conversations with a few thoughtful prompts\n- Time to swap stories and get to know someone new\n\nThis is a fictional event for previewing the website. The date and venue are examples; no meetup or booking is scheduled." },
  { slug: "sample-stories-around-table", title: "Stories around the table", startsAt: "2026-10-17T14:00:00-04:00", endsAt: "2026-10-17T16:00:00-04:00", locationName: "Community living room · sample venue", photo: photos.together, capacity: 18, spotsLeft: 3, summary: "Bring a memory, a question, or just your curiosity. We’ll take turns talking and listening.", description: "What’s something you’ve changed your mind about? Start with a question and see where the conversation goes.\n\n### The afternoon\n- Meet a few new people in groups of three\n- Take turns sharing and listening\n- Rotate groups for a fresh perspective\n\nThis is a fictional event. Dates, venue and attendance numbers are examples only. RSVPs are disabled." },
  { slug: "sample-sunday-slowdown", title: "The Sunday slowdown", startsAt: "2026-10-25T15:00:00-04:00", endsAt: "2026-10-25T17:00:00-04:00", locationName: "A shared table · sample venue", photo: photos.coffee, capacity: 16, spotsLeft: 0, summary: "Make a little space in your weekend for connection, reflection, and an unhurried chat.", description: "An easygoing afternoon to check in, share what’s on your mind, and spend a little time together.\n\nThis fictional event demonstrates the full-capacity design. No real places have been booked and no registrations are accepted." },
  { slug: "sample-first-hellos", title: "First hellos & familiar faces", startsAt: "2026-09-19T11:00:00-04:00", endsAt: "2026-09-19T13:00:00-04:00", locationName: "A neighborhood gathering space · sample venue", photo: photos.together, capacity: 20, spotsLeft: 0, summary: "An example of how a past community conversation appears on the site.", description: "This fictional past event shows the archive and closed-RSVP layout. It does not describe an actual Third Place meetup." },
];

export function getSampleEvents({ past = false, limit = 50 } = {}) {
  return examples.filter(event => (new Date(event.startsAt) < sampleNow) === past).slice(0, limit).map(toEvent);
}

export function getSampleEvent(slug) {
  const example = examples.find(event => event.slug === slug);
  return example ? toEvent(example) : null;
}

function toEvent({ photo, ...event }) {
  return {
    ...event, id: event.slug, isSample: true, status: "PUBLISHED", address: "Charlotte, NC · illustrative location only",
    imageUrl: photo.src, imageAlt: photo.alt, rsvpEnabled: true, rsvpOpen: false, rsvpDeadline: null,
    collectPhone: false, maxGuestsPerRsvp: 0, showAttendeeNames: false, attendeeNames: [], attendeeCount: null, directionsUrl: null,
  };
}

export function sampleEventState(event) {
  return getEventState(event, event.spotsLeft, sampleNow);
}

export function sampleListing(options) {
  const events = getSampleEvents(options);
  return { available: true, events, items: events.map(event => ({ event, state: sampleEventState(event) })) };
}

export const sampleMetadata = { title: "Sample events preview", description: "Fictional events for reviewing the website design. No real bookings or RSVPs.", robots: { index: false, follow: false } };
