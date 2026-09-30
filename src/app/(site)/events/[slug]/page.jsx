import { notFound } from "next/navigation";
import { submitRsvp } from "@/app/actions/rsvp";
import { getPublicEvent } from "@/lib/public-events";
import { eventMetadata } from "@/lib/metadata";
import { getEventState } from "@/lib/eventStatus";
import { EventDetail } from "@/components/site/EventDetail";
import { loadSettings } from "../../site-data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return eventMetadata(slug);
}

export default async function EventPage({ params }) {
  const { slug } = await params;
  const [event, settings] = await Promise.all([getPublicEvent(slug), loadSettings()]);
  if (!event) notFound();

  return <EventDetail event={event} state={getEventState(event, event.spotsLeft)} contactEmail={settings.contactEmail} rsvpAction={submitRsvp} />;
}
