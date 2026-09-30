"use client";

import { CircleAlert } from "lucide-react";
import { copy } from "@/content/copy";

/**
 * "Please fix 2 things below" box with jump links to each field.
 * Pass a `ref` and focus it after a failed submit.
 * errors: [{ id: "rsvp-email", message: "Enter an email like …" }]
 */
export function ErrorSummary({ errors, title, ref }) {
  if (!errors.length) return null;

  const jump = (e, id) => {
    const field = document.getElementById(id);
    if (!field) return;
    e.preventDefault();
    field.focus();
    field.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="flex flex-col gap-2 rounded-md border-2 border-danger bg-danger-soft px-4 py-3.5 text-danger focus-ring-surface"
    >
      <p className="m-0 flex items-center gap-2 text-base font-bold">
        <CircleAlert size={18} aria-hidden="true" className="flex-none" />
        {title ?? copy.err.summary(errors.length)}
      </p>
      <ul className="m-0 flex list-disc flex-col gap-0.5 pl-[26px] text-[15px] leading-[22px]">
        {errors.map((e) => (
          <li key={e.id}>
            <a href={`#${e.id}`} onClick={(ev) => jump(ev, e.id)} className="font-semibold text-danger underline hover:text-danger-hover">
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
