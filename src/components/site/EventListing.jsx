import Link from "next/link";
import { dateKey, formatTime, formatWeekday } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

/** "10.18" in Charlotte time. */
const monthDay = (value) => dateKey(value).slice(5).replace("-", ".");

function PlaceMark({ n, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex h-7 w-7 flex-none items-center justify-center rounded-full bg-olive font-mono text-[15px] font-bold text-surface", className)}
    >
      {n}
    </span>
  );
}

/**
 * Typewritten event schedule after the Nature School poster: mm.dd, title, and a
 * numbered place marker with a legend underneath. Each row is one link.
 * items: [{ event, state? }]
 */
export function EventListing({ items, headingLevel = 3, showYear = false }) {
  const Heading = `h${headingLevel}`;
  const places = [...new Set(items.map(({ event }) => event.locationName).filter(Boolean))];
  const placeNumber = (name) => places.indexOf(name) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div aria-hidden="true" className="flex justify-between border-b-[1.5px] border-ink pb-1.5 font-mono text-[15px] text-muted">
          <span>{showYear ? "yy.mm.dd" : "mm.dd"}</span>
          <span>pl</span>
        </div>
        <ul className="m-0 list-none p-0">
          {items.map(({ event, state }) => {
            const cancelled = event.status === "CANCELLED";
            const n = placeNumber(event.locationName);
            const href = `/events/${event.slug}${event.isSample ? "?demo=1" : ""}`;
            const date = showYear ? dateKey(event.startsAt).slice(2).replaceAll("-", ".") : monthDay(event.startsAt);
            return (
              <li
                key={event.id}
                className="relative grid grid-cols-[64px_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-dashed border-ink/30 py-3.5 transition-colors hover:bg-butter/70 has-[a:focus-visible]:bg-butter/70 md:grid-cols-[96px_minmax(0,1fr)_auto] md:gap-x-5"
              >
                <span className={cn("font-mono text-[17px] md:text-[21px]", cancelled && "text-muted line-through")}>{date}</span>
                <div className="flex min-w-0 flex-col gap-1">
                  <Heading className="m-0 text-[20px] leading-7 font-light tracking-[-0.01em] text-pretty [overflow-wrap:anywhere] md:text-[26px] md:leading-8">
                    <Link
                      href={href}
                      className={cn(
                        "text-ink no-underline outline-none after:absolute after:inset-0 after:content-[''] hover:text-ink focus-visible:underline focus-visible:decoration-primary focus-visible:decoration-2",
                        cancelled && "line-through decoration-1"
                      )}
                    >
                      {event.title}
                    </Link>
                  </Heading>
                  <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-sm text-muted">
                    <span>
                      {formatWeekday(event.startsAt).toLowerCase()} · {formatTime(event.startsAt).toLowerCase()}
                    </span>
                    {n > 0 && <span className="sr-only">at {event.locationName}</span>}
                    {state?.badge && <StatusBadge kind={state.badge} spotsLeft={state.spotsLeft} />}
                    {event.isSample && <span>(sample)</span>}
                  </p>
                </div>
                {n > 0 ? <PlaceMark n={n} className="self-center" /> : <span aria-hidden="true" className="self-center font-mono text-sm text-muted">tbd</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {places.length > 0 && (
        <div>
          <p className="m-0 mb-2 font-mono text-sm text-muted">where</p>
          <ol className="m-0 grid list-none gap-x-8 gap-y-2.5 p-0 md:grid-cols-2">
            {places.map((name, i) => (
              <li key={name} className="flex items-center gap-3 text-[17px] leading-6 font-light">
                <PlaceMark n={i + 1} />
                <span className="min-w-0 [overflow-wrap:anywhere]">{name}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
