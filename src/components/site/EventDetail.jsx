import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CalendarX,
  CircleX,
  DoorOpen,
  Lock,
  MapPin,
  Navigation,
  Radio,
  Users,
} from "lucide-react";
import { copy } from "@/content/copy";
import { dateKey, formatDay, formatTime, formatWhen } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AttendeeList } from "./AttendeeList";
import { EventImage } from "./EventImage";
import { Markdown } from "./Markdown";
import { RsvpForm } from "./RsvpForm";

/** Closed-RSVP panel: icon + title, a line of explanation, an optional CTA. */
function RsvpPanel({ icon: Icon, title, body, cta }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <h2 className="m-0 flex items-center gap-2.5 font-display text-2xl leading-[30px] font-bold">
        <Icon size={22} aria-hidden="true" className="flex-none text-accent" />
        {title}
      </h2>
      <p className="m-0 text-base">{body}</p>
      {cta && (
        <Button href={cta.href} variant="secondary" size="tall" iconRight={ArrowRight} className="mt-1">
          {cta.label}
        </Button>
      )}
    </div>
  );
}

function rsvpSubline(event, spotsLeft) {
  const parts = ["Free"];
  if (event.capacity != null && spotsLeft != null) parts.push(`${spotsLeft} of ${event.capacity} spots left`);
  if (event.rsvpDeadline) parts.push(`RSVPs close ${formatWhen(event.rsvpDeadline)}`);
  return parts.length > 1 ? parts.join(" · ") : copy.rsvp.subline;
}

function RsvpArea({ event, state, contactEmail, rsvpAction, preview }) {
  if (event.isSample) return <RsvpPanel icon={Lock} title="Preview only" body="This is a sample event. RSVPs are disabled and no places can be booked." />;
  const upcoming = { href: "/events", label: copy.detail.upcoming };
  const others = { href: "/events", label: copy.detail.otherEvents };

  // The live page trusts the server's rsvpOpen; a staff preview shows what the public would get once published.
  if (preview ? state.rsvpOpen : event.rsvpOpen) {
    return (
      <RsvpForm
        event={{
          id: event.id,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          locationName: event.locationName,
          address: event.address,
          collectPhone: event.collectPhone,
          maxGuestsPerRsvp: event.maxGuestsPerRsvp,
          showAttendeeNames: event.showAttendeeNames,
        }}
        action={rsvpAction}
        preview={preview}
        spotsLeft={state.spotsLeft}
        subline={rsvpSubline(event, state.spotsLeft)}
        spotsNote={state.phase === "spots" ? copy.detail.spots(state.spotsLeft) : undefined}
        contactEmail={contactEmail}
        directionsUrl={event.directionsUrl}
      />
    );
  }

  switch (state.phase) {
    case "cancelled":
      return <RsvpPanel icon={CalendarX} title={copy.detail.cancelledTitle} body={copy.detail.cancelledBody} cta={upcoming} />;
    case "ended":
      return <RsvpPanel icon={CalendarCheck} title={copy.detail.endedTitle} body={copy.detail.endedBody} cta={upcoming} />;
    case "started":
      return (
        <RsvpPanel
          icon={Radio}
          title={copy.detail.startedTitle}
          body={event.rsvpEnabled ? copy.detail.startedBody(formatTime(event.endsAt)) : copy.detail.startedBodyNoRsvp(formatTime(event.endsAt))}
          cta={{ href: event.directionsUrl, label: copy.detail.directions }}
        />
      );
    case "noRsvp":
      return <RsvpPanel icon={DoorOpen} title={copy.detail.noRsvpTitle} body={copy.detail.noRsvpBody} />;
    case "full":
      return <RsvpPanel icon={Users} title={copy.detail.fullTitle} body={copy.detail.fullBody(event.capacity)} cta={others} />;
    default:
      return (
        <RsvpPanel
          icon={Lock}
          title={event.rsvpDeadline ? copy.detail.deadlineTitle(formatDay(event.rsvpDeadline)) : "RSVPs are closed."}
          body={copy.detail.deadlineBody(contactEmail)}
          cta={others}
        />
      );
  }
}

/**
 * The public event page. Also used for staff draft previews (`preview` disables RSVP).
 * event: getPublicEvent() DTO — imageUrl, directionsUrl, rsvpOpen, attendeeCount, attendeeNames …
 * state: getEventState(event, event.spotsLeft)
 */
export function EventDetail({ event, state, contactEmail, rsvpAction, preview = false }) {
  const cancelled = event.status === "CANCELLED";
  const sameDay = dateKey(event.startsAt) === dateKey(event.endsAt);
  const until = sameDay ? `until ${formatTime(event.endsAt)}` : `until ${formatWhen(event.endsAt)}`;
  const showAttendees = !cancelled && event.rsvpEnabled && (event.attendeeCount !== null || event.showAttendeeNames);
  const backLink = (
    <Link href={event.isSample ? "/events?demo=1" : "/events"} className="inline-flex min-h-11 w-max items-center gap-1.5 text-base font-semibold no-underline focus-ring">
      <ArrowLeft size={18} aria-hidden="true" />
      {copy.detail.back}
    </Link>
  );

  return (
    <article>
      {cancelled && (
        <div role="alert" className="flex gap-3 bg-danger p-4 text-on-primary lg:justify-center lg:px-12">
          <CircleX size={22} aria-hidden="true" className="mt-px flex-none" />
          <div className="flex flex-col gap-1">
            <strong className="text-[17px] leading-6">{copy.detail.cancelledBanner}</strong>
            <span className="text-[15px] leading-[22px]">{copy.detail.cancelledBannerBody}</span>
          </div>
        </div>
      )}

      {/* Phone/tablet image: full bleed */}
      <EventImage
        imageUrl={event.imageUrl}
        imageAlt={event.imageAlt}
        startsAt={event.startsAt}
        variant="banner"
        priority
        sizes="100vw"
        className={event.imageUrl ? "aspect-[16/10] lg:hidden" : "h-[140px] lg:hidden"}
      />

      <div className="mx-auto max-w-content lg:px-12 lg:pb-[88px] lg:pt-8">
        <div className="hidden flex-col gap-7 lg:flex">
          {backLink}
          <EventImage
            imageUrl={event.imageUrl}
            imageAlt={event.imageAlt}
            startsAt={event.startsAt}
            variant="banner"
            priority
            sizes="1280px"
            className={event.imageUrl ? "aspect-[21/8] rounded-[20px]" : "h-[160px] rounded-[20px]"}
          />
        </div>

        <div className="grid lg:mt-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-x-16">
          <header className="flex flex-col gap-4 px-4 pb-8 pt-4 md:px-8 lg:col-start-1 lg:row-start-1 lg:gap-8 lg:px-0 lg:pt-0">
            <div className="lg:hidden">{backLink}</div>
            <div className="flex flex-col gap-4">
              {state.badge && (
                <div>
                  <StatusBadge kind={state.badge} spotsLeft={state.spotsLeft} />
                </div>
              )}
              <h1 className="m-0 font-display text-[34px] leading-[38px] font-extrabold tracking-[-0.02em] [overflow-wrap:anywhere] lg:text-4xl lg:tracking-[-0.03em]">
                {event.title}
              </h1>
            </div>
            <dl className="m-0 flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:gap-4">
              <div className="flex gap-3 lg:gap-3.5 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:p-5">
                <dt>
                  <span className="sr-only">When</span>
                  <Calendar size={22} aria-hidden="true" className="text-accent" />
                </dt>
                <dd className="m-0 flex flex-col gap-0.5">
                  <strong className="text-[17px] leading-6">{formatWhen(event.startsAt)}</strong>
                  <span className="text-[15px] text-muted">{until}</span>
                </dd>
              </div>
              <div className="flex gap-3 lg:gap-3.5 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:p-5">
                <dt>
                  <span className="sr-only">Where</span>
                  <MapPin size={22} aria-hidden="true" className="text-accent" />
                </dt>
                <dd className="m-0 flex flex-col gap-0.5">
                  <strong className="text-[17px] leading-6">{event.locationName}</strong>
                  <span className="text-[15px] leading-[22px] text-muted">{event.address}</span>
                  {!cancelled && event.directionsUrl && (
                    <a href={event.directionsUrl} className="inline-flex min-h-11 w-max items-center gap-1.5 text-[15px] font-bold focus-ring">
                      <Navigation size={16} aria-hidden="true" />
                      {copy.detail.directions}
                    </a>
                  )}
                </dd>
              </div>
            </dl>
          </header>

          <div className="px-4 pb-8 md:px-8 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:px-0 lg:pb-0">
            <div className="lg:sticky lg:top-6">
              <RsvpArea event={event} state={state} contactEmail={contactEmail} rsvpAction={rsvpAction} preview={preview} />
            </div>
          </div>

          <section aria-labelledby="about-event" className="flex max-w-prose flex-col gap-3.5 px-4 pb-8 md:px-8 lg:col-start-1 lg:row-start-2 lg:gap-4 lg:px-0">
            <h2 id="about-event" className="m-0 font-display text-2xl leading-[30px] font-bold lg:text-2xl">
              About this event
            </h2>
            <Markdown
              source={event.description}
              classNames={{
                p: "m-0 text-[17px] leading-7 lg:text-lg lg:leading-[30px]",
                h3: "m-0 mt-2 text-lg font-bold",
                ul: "m-0 list-disc pl-[22px] text-[17px] leading-7 lg:text-lg lg:leading-[30px]",
              }}
            />
          </section>

          {showAttendees && (
            <div className="px-4 pb-10 md:px-8 lg:col-start-1 lg:row-start-3 lg:border-t lg:border-border lg:px-0 lg:pb-0 lg:pt-8">
              <AttendeeList
                showCount={event.attendeeCount !== null}
                showNames={event.showAttendeeNames}
                headcount={event.attendeeCount ?? 0}
                names={event.attendeeNames || []}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
