"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, ArrowLeft, Inbox, Reply, Trash2 } from "lucide-react";
import { copy } from "@/content/copy";
import { formatFull, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SearchField } from "@/components/ui/bits";
import { useToast } from "@/components/ui/Toast";
import { useAction } from "./useAction";

const TABS = [
  ["NEW", "New"],
  ["READ", "Read"],
  ["ARCHIVED", "Archived"],
];
const EMPTY = {
  NEW: [copy.empty.messages, "New messages from the contact form will land here."],
  READ: ["Nothing read yet", "Messages you've opened move here."],
  ARCHIVED: ["Nothing archived", "Archive a message to tidy it away without deleting it."],
};
const kindOf = (status) => ({ NEW: "new", READ: "read", ARCHIVED: "archived" })[status];

/**
 * Contact-form inbox: list on the left, the open message on the right (full screen
 * on phones). Opening a NEW message marks it read through manageMessage; loading the
 * page never does.
 */
export function MessagesView({ messages, counts, status, q, selected, action }) {
  const router = useRouter();
  const toast = useToast();
  const [run, pending] = useAction(action);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const base = `/admin/messages?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const open = async (m) => {
    if (m.status === "NEW") await run({ id: m.id, operation: "read" });
    router.push(`${base}&id=${m.id}`);
  };

  const archive = async () => {
    const result = await run({ id: selected.id, operation: "archive" });
    if (result.ok) {
      toast({ tone: "success", title: "Message archived.", body: "" });
      router.push(base);
    } else toast({ tone: "error", title: "Couldn't archive.", body: result.error });
  };

  const remove = async () => {
    const result = await run({ id: selected.id, operation: "delete" });
    setConfirmDelete(false);
    if (result.ok) {
      toast({ tone: "success", title: "Message deleted.", body: "" });
      router.push(base);
    } else toast({ tone: "error", title: "Couldn't delete.", body: result.error });
  };

  const tabs = TABS.map(([key, label]) => ({ key, label, count: counts[key], href: `/admin/messages?status=${key}` }));
  const [emptyTitle, emptyBody] = q ? ["No matches", `Nothing here matches “${q}”.`] : EMPTY[status];

  const list = (
    <div className={cn("flex min-h-0 flex-col md:border-r md:border-border", selected && "hidden md:flex")}>
      <div className="flex flex-col gap-3 p-4">
        <SegmentedTabs label="Filter messages" items={tabs} active={status} fill />
        <form role="search" action="/admin/messages">
          <input type="hidden" name="status" value={status} />
          <SearchField name="q" label="Search messages" defaultValue={q} />
        </form>
      </div>
      {messages.length === 0 ? (
        <div className="m-4 mt-0 flex flex-col items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface px-5 py-10 text-center">
          <Inbox size={32} aria-hidden="true" className="text-muted" />
          <strong className="text-lg">{emptyTitle}</strong>
          <span className="text-[15px] leading-[22px] text-muted">{emptyBody}</span>
        </div>
      ) : (
        <ul className="m-0 list-none overflow-auto p-0">
          {messages.map((m) => {
            const isSelected = selected?.id === m.id;
            const isNew = m.status === "NEW";
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  disabled={pending}
                  aria-current={isSelected ? "true" : undefined}
                  className={cn(
                    "flex w-full flex-col gap-1 border-l-4 border-t border-t-border py-3.5 pl-5 pr-4 text-left font-body text-ink focus-ring-surface",
                    isSelected ? "border-l-primary bg-primary-soft" : "border-l-transparent bg-surface hover:bg-bg"
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("flex items-center gap-2 text-[15px]", isNew ? "font-bold" : "font-medium")}>
                      {isNew && (
                        <>
                          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
                          <span className="sr-only">New: </span>
                        </>
                      )}
                      {m.name}
                    </span>
                    <span className="flex-none text-[13px] text-muted">{formatRelative(m.createdAt)}</span>
                  </span>
                  <span className={cn("text-[15px]", isNew ? "font-bold" : "font-medium")}>{m.subject || "(no subject)"}</span>
                  <span className="truncate text-sm text-muted">{m.message.split("\n")[0]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const detail = selected ? (
    <article className="flex min-h-0 flex-col gap-5 overflow-auto p-5 md:px-8 md:py-7">
      <Link href={base} className="inline-flex min-h-11 w-max items-center gap-1.5 text-base font-semibold no-underline focus-ring md:hidden">
        <ArrowLeft size={18} aria-hidden="true" />
        All messages
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-display text-[26px] leading-8 font-bold">{selected.subject || "(no subject)"}</h2>
          <span className="text-[15px] [overflow-wrap:anywhere]">
            <strong>{selected.name}</strong> · <a href={`mailto:${selected.email}`}>{selected.email}</a>
          </span>
          <span className="text-sm text-muted">{formatFull(selected.createdAt)}</span>
        </div>
        <StatusBadge kind={kindOf(selected.status)} />
      </div>
      <p className="m-0 max-w-[640px] whitespace-pre-line text-[17px] leading-7">{selected.message}</p>
      <div className="mt-auto flex flex-wrap gap-2.5 border-t border-border pt-5">
        <a
          href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Your message"}`)}`}
          className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-base font-bold text-on-primary no-underline hover:bg-primary-hover hover:text-on-primary focus-ring-surface"
        >
          <Reply size={18} aria-hidden="true" />
          Reply by email
        </a>
        {selected.status !== "ARCHIVED" && (
          <button
            type="button"
            onClick={archive}
            disabled={pending}
            className="inline-flex h-12 items-center gap-2 rounded-md border-[1.5px] border-ink bg-surface px-[18px] font-body text-base font-bold text-ink hover:bg-surface-2 focus-ring-surface"
          >
            <Archive size={18} aria-hidden="true" />
            Archive
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={pending}
          className="inline-flex h-12 items-center gap-2 rounded-md px-4 font-body text-base font-bold text-danger hover:bg-danger-soft focus-ring-surface"
        >
          <Trash2 size={18} aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  ) : (
    <div className="hidden flex-col items-center justify-center gap-2 p-10 text-center text-muted md:flex">
      <Inbox size={32} aria-hidden="true" />
      <span className="text-base">Choose a message to read it.</span>
    </div>
  );

  return (
    <>
      <div className="grid min-h-[520px] flex-1 overflow-hidden border-border bg-surface md:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] md:rounded-lg md:border">
        {list}
        {detail}
      </div>
      <ConfirmDialog
        open={confirmDelete}
        destructive
        title="Delete this message?"
        confirmLabel="Delete message"
        confirmIcon={Trash2}
        cancelLabel="Keep it"
        busy={pending}
        busyLabel="Deleting…"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={remove}
      >
        <p className="m-0">This can&apos;t be undone. To keep it out of the way instead, archive it.</p>
      </ConfirmDialog>
    </>
  );
}
