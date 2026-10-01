import { notFound } from "next/navigation";
import { submitRsvp } from "@/app/actions/rsvp";
import { getPublicEvent } from "@/lib/public-events";
import { eventMetadata } from "@/lib/metadata";
import { getEventState } from "@/lib/eventStatus";
import { EventDetail } from "@/components/site/EventDetail";
import { loadSettings } from "../../site-data";
import { getSampleEvent, sampleEventState, sampleMetadata } from "@/content/sample-events";
import { SampleEventsBanner } from "@/components/site/SampleEventsBanner";

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  if ((await searchParams).demo === "1") return sampleMetadata;
  return eventMetadata(slug);
}

export default async function EventPage({ params, searchParams }) {
  const { slug } = await params;
  if ((await searchParams).demo === "1") {
    const event = getSampleEvent(slug);
    if (!event) notFound();
    return <><SampleEventsBanner /><EventDetail event={event} state={sampleEventState(event)} preview /></>;
  }
  const [event, settings] = await Promise.all([getPublicEvent(slug), loadSettings()]);
  if (!event) notFound();

  return <EventDetail event={event} state={getEventState(event, event.spotsLeft)} contactEmail={settings.contactEmail} rsvpAction={submitRsvp} />;
}
