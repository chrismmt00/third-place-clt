import Link from "next/link";
import { CalendarHeart, MessageCircle } from "lucide-react";
import { dateBlock } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { EventCard } from "./EventCard";
import { site } from "@/content/site";

export function EventsUnavailable({ headingLevel = 3 }) {
  return (
    <NoEvents title="Event listings are temporarily unavailable" body="Please check back soon. You can also find meetup updates on Instagram." headingLevel={headingLevel}>
      <a href={site.instagramUrl} className="flex min-h-11 items-center text-base font-semibold underline focus-ring">
        Visit Third Place on Instagram
      </a>
    </NoEvents>
  );
}

/** 1 column under 768, 2 up to 1024, 3 above. items: [{ event, state }] */
export function EventGrid({ items, headingLevel = 3 }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {items.map(({ event, state }) => (
        <EventCard key={event.id} event={event} state={state} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

/** Plain list for past events: date chip, title, place. */
export function PastEventList({ events }) {
  return (
    <ul className="m-0 flex list-none flex-col border-t border-border p-0">
      {events.map((event) => {
        const { month, day } = dateBlock(event.startsAt);
        return (
          <li key={event.id}>
            <Link
              href={`/events/${event.slug}`}
              className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3.5 border-b border-border py-3.5 text-ink no-underline focus-ring hover:text-ink [&:hover_.title]:underline"
            >
              <span className="flex flex-col items-center rounded-[10px] bg-surface-2 py-1.5">
                <span className="text-xs font-bold tracking-[0.08em] text-muted">{month}</span>
                <span className="font-display text-[22px] leading-6 font-extrabold">{day}</span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="title text-base leading-[22px] font-bold">{event.title}</span>
                <span className="text-sm text-muted">{event.locationName}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Dashed "nothing coming up" card with a chat CTA. */
export function NoEvents({ title, body, chatUrl, chatLabel, headingLevel = 3, primary = false, children }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className="flex max-w-[640px] flex-col items-start gap-3 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface px-5 py-7">
      <span aria-hidden="true" className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent-soft text-accent">
        <CalendarHeart size={24} />
      </span>
      <Heading className="m-0 font-display text-xl font-bold">{title}</Heading>
      <p className="m-0 text-base text-muted">{body}</p>
      {chatUrl && (
        <Button href={chatUrl} variant={primary ? "primary" : "secondary"} size="xl" icon={MessageCircle} className="w-full md:w-auto">
          {chatLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
