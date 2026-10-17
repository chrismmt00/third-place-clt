import { CalendarHeart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
