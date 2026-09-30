import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { saveEventDraft, updateEventStatus } from "@/app/actions/events";
import { getAdminEvent } from "@/lib/admin-queries";
import { imageDeliveryUrl } from "@/lib/cloudflare";
import { adminBadge } from "@/lib/eventStatus";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { guard } from "../../../guard";
import { formInitial, siteHost } from "../event-form-props";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const event = await guard(getAdminEvent(id));
  if (!event) notFound();

  const badge = <StatusBadge kind={adminBadge(event.status)} />;

  return (
    <>
      <MobileTopBar title="Edit event" back="/admin/events" backLabel="Back to events" badge={badge} />
      <main className="flex flex-col gap-5 px-4 pb-8 pt-4 md:px-8 lg:px-12 lg:pb-12 lg:pt-7">
        <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm text-muted lg:flex">
          <Link href="/admin/events" className="inline-flex min-h-11 items-center focus-ring">
            Events
          </Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span>Edit</span>
        </nav>
        <div className="flex flex-wrap items-center gap-3.5 lg:-mt-3">
          <h1 className="m-0 font-display text-[26px] leading-8 font-extrabold [overflow-wrap:anywhere] lg:text-[34px] lg:leading-10">{event.title}</h1>
          <span className="hidden lg:inline-flex">{badge}</span>
        </div>
        <EventForm
          key={event.updatedAt.toISOString()}
          mode="edit"
          initial={formInitial(event)}
          imageUrl={imageDeliveryUrl(event.imageId, "card")}
          meta={{
            status: event.status,
            slug: event.slug,
            updatedAt: event.updatedAt.toISOString(),
            headcount: event.headcount,
            rsvpCount: event._count.rsvps,
          }}
          siteHost={siteHost()}
          saveAction={saveEventDraft}
          statusAction={updateEventStatus}
        />
      </main>
    </>
  );
}
