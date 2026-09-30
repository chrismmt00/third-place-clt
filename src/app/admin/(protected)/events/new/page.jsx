import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { saveEventDraft, updateEventStatus } from "@/app/actions/events";
import { getAdminAccount } from "@/lib/admin-queries";
import { getSiteSettings, defaultSettings } from "@/lib/settings";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { EventForm } from "@/components/admin/EventForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { guard } from "../../../guard";
import { siteHost } from "../event-form-props";

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await guard(getAdminAccount());
  const settings = await getSiteSettings().catch(() => defaultSettings);

  return (
    <>
      <MobileTopBar title="New event" back="/admin/events" backLabel="Back to events" badge={<StatusBadge kind="draft" />} />
      <main className="flex flex-col gap-5 px-4 pb-8 pt-4 md:px-8 lg:px-12 lg:pb-12 lg:pt-7">
        <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm text-muted lg:flex">
          <Link href="/admin/events" className="inline-flex min-h-11 items-center focus-ring">
            Events
          </Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span>New</span>
        </nav>
        <h1 className="m-0 hidden font-display text-[34px] leading-10 font-extrabold lg:-mt-3 lg:block">New event</h1>
        <h1 className="sr-only lg:hidden">New event</h1>
        <EventForm
          mode="new"
          initial={{
            rsvpEnabled: true,
            maxGuestsPerRsvp: 0,
            capacity: null,
            showAttendeeCount: settings.showAttendeeCountDefault,
            showAttendeeNames: settings.showAttendeeNamesDefault,
          }}
          siteHost={siteHost()}
          saveAction={saveEventDraft}
          statusAction={updateEventStatus}
        />
      </main>
    </>
  );
}
