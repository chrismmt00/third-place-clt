"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { copy } from "@/content/copy";
import { useAction } from "./useAction";

/** Accent banner on the staff-only preview of an event, with Back to editor and Publish. */
export function PreviewBanner({ eventId, status, action }) {
  const router = useRouter();
  const [run, pending] = useAction(action);
  const [error, setError] = useState("");
  const isDraft = status === "DRAFT";

  const publish = async () => {
    setError("");
    const result = await run({ id: eventId, operation: "publish" });
    if (result.ok) router.push(`/admin/events/${eventId}`);
    else setError(result.error);
  };

  return (
    <div role="status" className="bg-accent text-on-accent">
      <div className="mx-auto flex max-w-content flex-col gap-2.5 px-4 py-3.5 md:flex-row md:items-center md:justify-between md:px-8 lg:px-12">
        <span className="flex items-start gap-2.5 text-[15px] leading-[22px]">
          <Eye size={18} aria-hidden="true" className="mt-0.5 flex-none" />
          <span>
            <strong>{isDraft ? copy.preview.banner : "Staff preview."}</strong>{" "}
            {isDraft ? copy.preview.bannerBody : "This is how the page looks. RSVPs are turned off here."}
            {error && <strong className="block">{error}</strong>}
          </span>
        </span>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${eventId}`}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-on-accent px-4 text-[15px] font-bold text-on-accent no-underline hover:bg-on-accent/10 hover:text-on-accent focus-ring md:flex-none"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to editor
          </Link>
          {isDraft && (
            <button
              type="button"
              onClick={publish}
              disabled={pending}
              className="flex h-11 flex-1 items-center justify-center rounded-[10px] bg-on-accent px-4 font-body text-[15px] font-bold text-accent focus-ring md:flex-none"
            >
              {pending ? "Publishing…" : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
