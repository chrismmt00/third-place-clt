import { notFound } from "next/navigation";
import { updateEventStatus } from "@/app/actions/events";
import { getAdminEvent } from "@/lib/admin-queries";
import { imageDeliveryUrl } from "@/lib/cloudflare";
import { directionsUrl, spotsLeft } from "@/lib/event-rules";
import { getEventState } from "@/lib/eventStatus";
import { site } from "@/content/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { EventDetail } from "@/components/site/EventDetail";
import { PreviewBanner } from "@/components/admin/PreviewBanner";
import { loadSettings, socialsFrom } from "../../../(site)/site-data";
import { guard } from "../../guard";

export const metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Staff-only view of any event (drafts included) on the public layout, with RSVP disabled. */
export default async function PreviewPage({ params }) {
  const { id } = await params;
  const [record, settings] = await Promise.all([guard(getAdminEvent(id)), loadSettings()]);
  if (!record) notFound();

  // Same shape the public page gets from getPublicEvent(), built from the admin record.
  const left = spotsLeft(record, record.headcount);
  const event = {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    locationName: record.locationName,
    address: record.address,
    imageAlt: record.imageAlt,
    status: record.status,
    capacity: record.capacity,
    rsvpEnabled: record.rsvpEnabled,
    rsvpDeadline: record.rsvpDeadline,
    collectPhone: record.collectPhone,
    maxGuestsPerRsvp: record.maxGuestsPerRsvp,
    showAttendeeNames: false,
    imageUrl: imageDeliveryUrl(record.imageId, "hero"),
    directionsUrl: directionsUrl(record),
    attendeeCount: record.showAttendeeCount ? record.headcount : null,
    attendeeNames: [],
    spotsLeft: left,
    rsvpOpen: false,
  };
  // Show the badge the public would see once it's live.
  const state = getEventState({ ...event, status: record.status === "DRAFT" ? "PUBLISHED" : record.status }, left);

  return (
    <div className="flex min-h-dvh flex-col">
      <PreviewBanner eventId={record.id} status={record.status} action={updateEventStatus} />
      <Header siteName={settings.siteName} chatUrl={settings.chatUrl} chatLabel={site.chatLabel} />
      <main id="main" className="flex-1">
        <EventDetail event={event} state={record.status === "DRAFT" ? { ...state, badge: "draft" } : state} contactEmail={settings.contactEmail} preview />
      </main>
      <Footer
        siteName={settings.siteName}
        tagline={site.tagline}
        contactEmail={settings.contactEmail}
        socials={socialsFrom(settings)}
        chatUrl={settings.chatUrl}
        chatLabel={site.chatLabel}
      />
    </div>
  );
}
