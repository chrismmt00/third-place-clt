import Link from "next/link";
import { copy } from "@/content/copy";
import { site } from "@/content/site";
import { listPublicEvents } from "@/lib/public-events";
import { Button } from "@/components/ui/Button";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { EventGrid, NoEvents, PastEventList } from "@/components/site/EventLists";
import { loadSettings, withCardState } from "../site-data";

export const metadata = {
  title: "Events",
  description: "Upcoming Third Place meetups in Charlotte. Free, open-invite conversation, twice a month.",
};

const PAST_PAGE_SIZE = 12;

export default async function EventsPage({ searchParams }) {
  const params = await searchParams;
  const past = params.tab === "past";
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page, 10) || 1));
  const settings = await loadSettings();

  const tabs = (
    <SegmentedTabs
      label="Which events"
      size="lg"
      fill="mobile"
      active={past ? "past" : "upcoming"}
      items={[
        { key: "upcoming", label: "Upcoming", href: "/events" },
        { key: "past", label: "Past", href: "/events?tab=past" },
      ]}
    />
  );

  let body;
  if (past) {
    const events = await listPublicEvents({ past: true, limit: PAST_PAGE_SIZE, page });
    body =
      events.length > 0 ? (
        <div className="flex max-w-[760px] flex-col gap-5">
          <PastEventList events={events} />
          <div className="flex flex-col gap-2.5 md:flex-row">
            {page > 1 && (
              <Button href={`/events?tab=past${page > 2 ? `&page=${page - 1}` : ""}`} variant="secondary" size="lg">
                Newer events
              </Button>
            )}
            {events.length === PAST_PAGE_SIZE && (
              <Button href={`/events?tab=past&page=${page + 1}`} variant="secondary" size="lg">
                Show older events
              </Button>
            )}
          </div>
        </div>
      ) : (
        <NoEvents title={copy.empty.past} body="Once our first gatherings wrap up, you'll find them here." headingLevel={2}>
          <Link href="/events" className="flex min-h-11 items-center text-base font-semibold focus-ring">
            See upcoming events
          </Link>
        </NoEvents>
      );
  } else {
    const items = await withCardState(await listPublicEvents());
    body =
      items.length > 0 ? (
        <EventGrid items={items} headingLevel={2} />
      ) : (
        <NoEvents title={copy.empty.events} body={copy.empty.eventsBody} chatUrl={settings.chatUrl} chatLabel={site.chatLabel} headingLevel={2} primary>
          <Link href="/events?tab=past" className="flex min-h-11 items-center text-base font-semibold focus-ring">
            Browse past events
          </Link>
        </NoEvents>
      );
  }

  return (
    <div className="mx-auto flex max-w-content flex-col gap-5 px-4 pb-12 pt-7 md:gap-6 md:px-8 md:pb-16 md:pt-10 lg:gap-8 lg:px-12 lg:pb-[88px] lg:pt-14">
      <div className="flex flex-col gap-5 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[36px] leading-10 font-extrabold tracking-[-0.02em] md:text-3xl lg:text-4xl lg:tracking-[-0.03em]">
            {past ? "Past events" : "Upcoming events"}
          </h1>
          <p className="m-0 hidden text-lg text-muted lg:block">
            {past ? "Meetups from the last year, newest first." : "We meet up twice a month. RSVP to save your spot."}
          </p>
        </div>
        {tabs}
      </div>
      {body}
    </div>
  );
}
