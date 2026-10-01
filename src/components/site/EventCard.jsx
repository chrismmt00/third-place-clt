import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { copy } from "@/content/copy";
import { formatWhen } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EventImage } from "./EventImage";

/**
 * One event in a grid. The title link stretches over the whole card, so the card
 * is a single tap target and a single tab stop.
 * event: { slug, title, summary?, startsAt, locationName, neighborhood?, imageUrl?, imageAlt, status }
 * state: { badge, spotsLeft } from getEventState()
 */
export function EventCard({ event, state, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const cancelled = event.status === "CANCELLED";
  const place = [event.locationName, event.neighborhood].filter(Boolean).join(" · ");

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-ink shadow-sm transition-shadow hover:shadow-md has-[a:focus-visible]:shadow-[0_0_0_2px_var(--color-bg),0_0_0_4px_var(--color-focus)]">
      <EventImage imageUrl={event.imageUrl} imageAlt={event.imageAlt} startsAt={event.startsAt} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {event.isSample && <span className="text-xs font-bold uppercase tracking-wider text-muted">Sample event</span>}
        {state?.badge && (
          <div className="flex flex-wrap gap-2">
            <StatusBadge kind={state.badge} spotsLeft={state.spotsLeft} />
          </div>
        )}
        <p className="m-0 text-[15px] leading-[22px] font-bold text-accent">{formatWhen(event.startsAt)}</p>
        <Heading className="m-0 font-display text-xl font-bold tracking-[-0.01em] text-pretty [overflow-wrap:anywhere]">
          <Link
            href={`/events/${event.slug}${event.isSample ? "?demo=1" : ""}`}
            className="text-ink no-underline outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:text-ink focus-visible:underline focus-visible:decoration-primary focus-visible:decoration-2"
          >
            {event.title}
          </Link>
        </Heading>
        {place && (
          <p className="m-0 flex items-start gap-1.5 text-[15px] leading-[22px] text-muted">
            <MapPin size={16} aria-hidden="true" className="mt-[3px] flex-none" />
            <span>{place}</span>
          </p>
        )}
        {cancelled ? (
          <p className="m-0 text-[15px] leading-[22px] font-semibold text-danger">{copy.detail.cancelledBanner}</p>
        ) : (
          event.summary && <p className="m-0 line-clamp-3 text-[15px] leading-[22px] text-ink">{event.summary}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1.5 text-[15px] font-bold text-primary">
          {copy.card.link}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
