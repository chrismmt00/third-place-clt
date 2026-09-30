"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Link as LinkIcon, Trash2, UserX, Users } from "lucide-react";
import { copy } from "@/content/copy";
import { formatStamp } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SearchField } from "@/components/ui/bits";
import { useToast } from "@/components/ui/Toast";
import { useAction } from "./useAction";

const GRID = "lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_132px_64px_minmax(0,1.4fr)_72px_110px_110px_96px] lg:gap-3";
const iconButton = "flex h-11 w-11 items-center justify-center rounded-[10px] border-[1.5px] border-border bg-surface hover:bg-surface-2 focus-ring-surface";

/**
 * RSVP list for one event. rows come from listAdminRsvps(); search and sort live in
 * the URL (?q=&sort=newest|oldest|name). manageRsvp cancels or deletes one RSVP.
 */
export function RsvpTable({ eventId, eventTitle, publicUrl, rows, q, sort, action }) {
  const router = useRouter();
  const toast = useToast();
  const [run, pending] = useAction(action);
  const [confirm, setConfirm] = useState(null); // { operation, rsvp }

  const fullName = (r) => `${r.firstName} ${r.lastName}`.trim();
  const sortHref = (next) => `?sort=${next}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const perform = async () => {
    const { operation, rsvp } = confirm;
    const result = await run({ id: rsvp.id, eventId, operation });
    setConfirm(null);
    if (result.ok) {
      toast({ tone: "success", title: operation === "delete" ? "RSVP deleted." : "RSVP cancelled.", body: operation === "delete" ? "" : "They're no longer counted." });
      router.refresh();
    } else {
      toast({ tone: "error", title: "Couldn't update the RSVP.", body: result.error });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({ tone: "info", title: "Link copied.", body: "Share it anywhere." });
    } catch {
      toast({ tone: "error", title: "Couldn't copy.", body: publicUrl });
    }
  };

  const search = (
    <form role="search" className="w-full lg:w-[340px]">
      <input type="hidden" name="sort" value={sort} />
      <SearchField name="q" label="Search by name or email" defaultValue={q} tall />
    </form>
  );

  if (rows.length === 0 && !q) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface px-5 py-10 text-center">
        <Users size={32} aria-hidden="true" className="text-muted" />
        <strong className="text-lg">{copy.empty.rsvps}</strong>
        <span className="text-[15px] leading-[22px] text-muted">When people sign up for {eventTitle}, they&apos;ll show up here.</span>
        <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-1.5 font-body text-[15px] font-bold text-primary underline focus-ring-surface">
          <LinkIcon size={16} aria-hidden="true" />
          Copy event link
        </button>
      </div>
    );
  }

  const nameSort = sort === "name";
  const dateIcon = sort === "oldest" ? ArrowUp : ArrowDown;
  const DateIcon = nameSort ? ChevronsUpDown : dateIcon;
  const NameIcon = nameSort ? ArrowDown : ChevronsUpDown;

  return (
    <>
      {/* Phones and tablets */}
      <div className="flex flex-col gap-3 lg:hidden">
        {search}
        <label className="flex items-center gap-2 text-sm font-semibold">
          Sort
          <select
            value={sort}
            onChange={(e) => router.push(sortHref(e.target.value))}
            className="h-11 rounded-[10px] border-[1.5px] border-border-strong bg-surface px-3 font-body text-base field-focus"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">By last name</option>
          </select>
        </label>
        {rows.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-[14px] border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-[17px]">{fullName(r)}</strong>
              <StatusBadge kind={r.status === "GOING" ? "going" : "rsvpCancelled"} />
            </div>
            <span className="text-[15px] [overflow-wrap:anywhere]">{r.email}</span>
            <span className="text-sm text-muted">
              {r.phone || "—"} · +{r.guestCount} guest{r.guestCount === 1 ? "" : "s"} · {r.publicNameConsent ? "Name shown" : "Private"}
            </span>
            {r.note && <span className="rounded-sm bg-surface-2 px-2.5 py-2 text-sm">{r.note}</span>}
            <div className="flex gap-2">
              {r.status === "GOING" && (
                <button
                  type="button"
                  onClick={() => setConfirm({ operation: "cancel", rsvp: r })}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-border bg-surface font-body text-[15px] font-bold text-ink hover:bg-surface-2 focus-ring-surface"
                >
                  <UserX size={16} aria-hidden="true" />
                  Cancel RSVP
                </button>
              )}
              <button type="button" aria-label={`Delete RSVP for ${fullName(r)}`} onClick={() => setConfirm({ operation: "delete", rsvp: r })} className={cn(iconButton, "text-danger")}>
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="m-0 py-6 text-center text-[15px] text-muted">No RSVPs match “{q}”.</p>}
      </div>

      {/* Desktop */}
      <div className="hidden flex-col overflow-hidden rounded-lg border border-border bg-surface lg:flex">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          {search}
          <span className="text-sm text-muted">Includes cancelled RSVPs · headcount counts Going only</span>
        </div>
        <div role="table" aria-label={`RSVPs for ${eventTitle}`}>
          <div role="row" className={cn(GRID, "bg-surface-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.05em] text-muted")}>
            <span role="columnheader" aria-sort={nameSort ? "ascending" : "none"}>
              <Link href={sortHref("name")} className="flex min-h-8 items-center gap-1 text-muted no-underline hover:text-ink focus-ring-surface">
                Name <NameIcon size={14} aria-hidden="true" />
              </Link>
            </span>
            <span role="columnheader" className="flex items-center">Email</span>
            <span role="columnheader" className="flex items-center">Phone</span>
            <span role="columnheader" className="flex items-center">Guests</span>
            <span role="columnheader" className="flex items-center">Note</span>
            <span role="columnheader" className="flex items-center">Public</span>
            <span role="columnheader" className="flex items-center">Status</span>
            <span role="columnheader" aria-sort={nameSort ? "none" : sort === "oldest" ? "ascending" : "descending"}>
              <Link href={sortHref(sort === "newest" ? "oldest" : "newest")} className="flex min-h-8 items-center gap-1 text-muted no-underline hover:text-ink focus-ring-surface">
                Submitted <DateIcon size={14} aria-hidden="true" />
              </Link>
            </span>
            <span role="columnheader" className="flex items-center justify-end">Actions</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} role="row" className={cn(GRID, "items-center border-t border-border px-5 py-3 text-[15px]")}>
              <strong role="cell" className="truncate" title={fullName(r)}>
                {fullName(r)}
              </strong>
              <span role="cell" className="truncate" title={r.email}>
                {r.email}
              </span>
              <span role="cell" className="whitespace-nowrap">{r.phone || "—"}</span>
              <span role="cell">{r.guestCount}</span>
              <span role="cell" className="truncate text-muted" title={r.note || ""}>
                {r.note || "—"}
              </span>
              <span role="cell" className="text-sm">{r.publicNameConsent ? "Shown" : "Private"}</span>
              <span role="cell">
                <StatusBadge kind={r.status === "GOING" ? "going" : "rsvpCancelled"} />
              </span>
              <span role="cell" className="text-sm text-muted">{formatStamp(r.createdAt)}</span>
              <span role="cell" className="flex justify-end gap-1">
                {r.status === "GOING" && (
                  <button type="button" aria-label={`Cancel RSVP for ${fullName(r)}`} onClick={() => setConfirm({ operation: "cancel", rsvp: r })} className={cn(iconButton, "text-ink")}>
                    <UserX size={18} aria-hidden="true" />
                  </button>
                )}
                <button type="button" aria-label={`Delete RSVP for ${fullName(r)}`} onClick={() => setConfirm({ operation: "delete", rsvp: r })} className={cn(iconButton, "text-danger")}>
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </span>
            </div>
          ))}
          {rows.length === 0 && <p className="m-0 border-t border-border px-5 py-10 text-center text-[15px] text-muted">No RSVPs match “{q}”.</p>}
        </div>
      </div>

      {confirm?.operation === "delete" && (
        <ConfirmDialog
          open
          destructive
          title={copy.confirm.rsvpDelete(fullName(confirm.rsvp))}
          confirmLabel="Delete RSVP"
          cancelLabel="Keep it"
          busy={pending}
          busyLabel="Deleting…"
          onCancel={() => setConfirm(null)}
          onConfirm={perform}
        >
          <p className="m-0">
            This removes {confirm.rsvp.firstName}
            {confirm.rsvp.guestCount > 0 && ` and ${confirm.rsvp.guestCount} guest${confirm.rsvp.guestCount === 1 ? "" : "s"}`} from the list for good.
            {confirm.rsvp.status === "GOING" && (
              <>
                {" "}
                To keep a record, choose <strong>Cancel RSVP</strong> instead.
              </>
            )}
          </p>
        </ConfirmDialog>
      )}
      {confirm?.operation === "cancel" && (
        <ConfirmDialog
          open
          title={copy.confirm.rsvpCancel(fullName(confirm.rsvp))}
          confirmLabel="Cancel RSVP"
          confirmVariant="danger"
          cancelLabel="Keep it"
          busy={pending}
          busyLabel="Cancelling…"
          onCancel={() => setConfirm(null)}
          onConfirm={perform}
        >
          <p className="m-0">
            They&apos;ll stay in the list as cancelled and stop counting toward the headcount. No email is sent.
          </p>
        </ConfirmDialog>
      )}
    </>
  );
}
