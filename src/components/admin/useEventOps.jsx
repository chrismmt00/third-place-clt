"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { copy } from "@/content/copy";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAction } from "./useAction";

const DONE = {
  publish: copy.toast.published,
  unpublish: ["Moved to drafts.", "It's no longer on the site."],
  cancel: ["Event cancelled.", "RSVPs are closed. The list is kept."],
  delete: ["Event deleted.", ""],
  duplicate: ["Copy created.", "It's saved as a draft."],
};

/**
 * Publish / unpublish / cancel / duplicate / delete through the updateEventStatus action.
 * Cancel and delete ask first. Returns { run(operation, event), dialog, pending };
 * render `dialog` somewhere in the component.
 * event: { id, title, _count: { rsvps } }
 * onDeleted runs after a delete (e.g. leave the edit page); otherwise the page refreshes.
 */
export function useEventOps(action, { onDeleted } = {}) {
  const router = useRouter();
  const toast = useToast();
  const [call, pending] = useAction(action);
  const [confirm, setConfirm] = useState(null); // { operation, event, count, note }

  const perform = async (operation, event, confirmationCount) => {
    const result = await call({ id: event.id, operation, confirmationCount });
    if (result.ok) {
      setConfirm(null);
      const [title, body] = DONE[operation];
      toast({ tone: "success", title, body });
      if (operation === "duplicate" && result.id) router.push(`/admin/events/${result.id}`);
      else if (operation === "delete" && onDeleted) onDeleted();
      else router.refresh();
      return;
    }
    if (result.code === "CONFIRM_DELETE") {
      // Someone RSVP'd since the page loaded; show the fresh number and ask again.
      const fresh = Number(/(\d+)/.exec(result.error)?.[1] ?? confirmationCount);
      setConfirm({ operation, event, count: fresh, note: "The number of RSVPs changed since you opened this page." });
      return;
    }
    setConfirm(null);
    toast({ tone: "error", title: "Couldn't update the event.", body: result.error });
  };

  const run = (operation, event) => {
    if (operation === "delete" || operation === "cancel") {
      setConfirm({ operation, event, count: event._count?.rsvps ?? 0 });
    } else {
      perform(operation, event);
    }
  };

  let dialog = null;
  if (confirm?.operation === "delete") {
    const { event, count, note } = confirm;
    dialog = (
      <ConfirmDialog
        open
        destructive
        title={copy.confirm.delete(event.title)}
        confirmLabel={count > 0 ? "Delete event and RSVPs" : "Delete event"}
        confirmIcon={Trash2}
        cancelLabel="Keep event"
        busy={pending}
        busyLabel="Deleting…"
        onCancel={() => setConfirm(null)}
        onConfirm={() => perform("delete", event, count)}
      >
        {note && <p className="m-0 font-semibold text-warning">{note}</p>}
        <p className="m-0">
          {count > 0 ? (
            <>
              This will also delete <strong>{count === 1 ? "1 RSVP" : `${count} RSVPs`}</strong>. This can&apos;t be undone.
            </>
          ) : (
            "This can't be undone."
          )}
        </p>
        {count > 0 && event.status !== "CANCELLED" && (
          <p className="m-0 text-[15px] leading-[22px] text-muted">
            If it isn&apos;t happening,{" "}
            <button type="button" className="font-body text-[15px] text-primary underline" onClick={() => setConfirm({ operation: "cancel", event, count })}>
              cancel the event
            </button>{" "}
            instead. That keeps the list.
          </p>
        )}
      </ConfirmDialog>
    );
  } else if (confirm?.operation === "cancel") {
    const { event, count } = confirm;
    dialog = (
      <ConfirmDialog
        open
        title={copy.confirm.cancel}
        confirmLabel="Cancel event"
        confirmVariant="danger"
        cancelLabel="Keep it on"
        busy={pending}
        busyLabel="Cancelling…"
        onCancel={() => setConfirm(null)}
        onConfirm={() => perform("cancel", event)}
      >
        <p className="m-0">
          The event page will show a “cancelled” banner and RSVPs will close.
          {count > 0 && ` The ${count === 1 ? "RSVP stays" : `${count} RSVPs stay`} in your list so you can reach people.`}
        </p>
        <p className="m-0 text-[15px] leading-[22px] text-muted">No emails are sent automatically. Use Export CSV if you want to let people know.</p>
      </ConfirmDialog>
    );
  }

  return { run, dialog, pending };
}
