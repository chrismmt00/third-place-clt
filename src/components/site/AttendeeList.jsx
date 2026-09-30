import { useId } from "react";
import { Users } from "lucide-react";
import { copy } from "@/content/copy";

/**
 * "Who's coming". Driven by the event's showAttendeeCount / showAttendeeNames.
 * `names` arrive pre-formatted from the server ("Maya R."), and only for people who
 * opted in. Hidden entirely when both switches are off.
 */
export function AttendeeList({ showCount, showNames, headcount, names = [] }) {
  const headingId = useId();
  if (!showCount && !showNames) return null;

  const others = headcount - names.length;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3.5 text-ink">
      <h2 id={headingId} className="m-0 font-display text-2xl leading-[30px] font-bold">
        Who&apos;s coming
      </h2>

      {showCount && (
        <p className="m-0 flex items-center gap-2.5 text-lg leading-[26px]">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent-soft text-accent">
            <Users size={20} aria-hidden="true" />
          </span>
          <span>
            <strong className="font-bold">
              {headcount} {headcount === 1 ? "person" : "people"}
            </strong>{" "}
            {headcount === 1 ? "is" : "are"} going
          </span>
        </p>
      )}

      {showNames && names.length > 0 && (
        <>
          <ul aria-label="Attendees who chose to share their name" className="m-0 flex list-none flex-wrap gap-2 p-0">
            {names.map((name, i) => (
              <li
                key={`${name}-${i}`}
                className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface pl-1 pr-3.5 text-[15px] font-semibold"
              >
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary-hover">
                  {name[0]}
                </span>
                {name}
              </li>
            ))}
          </ul>
          {showCount && others > 0 && (
            <p className="m-0 text-[15px] leading-[22px] text-muted">…and {others} more who kept their name private.</p>
          )}
        </>
      )}

      {showNames && names.length === 0 && (
        <p className="m-0 rounded-md bg-surface-2 px-4 py-3.5 text-[15px] leading-[22px] text-muted">
          {copy.empty.attendees} When people RSVP they can choose to show their first name here.
        </p>
      )}
    </section>
  );
}
