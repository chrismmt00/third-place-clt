"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Ban, CalendarSearch, ChevronLeft, ChevronRight, ChevronsUpDown, Copy, Eye, EyeOff, Globe, Pencil, Trash2, Users } from "lucide-react";
import { formatWhen } from "@/lib/format";
import { adminBadge, headcountLabel, headcountPct } from "@/lib/eventStatus";
import { cn } from "@/lib/cn";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { ProgressBar, SearchField } from "@/components/ui/bits";
import { RowMenu } from "./RowMenu";
import { useEventOps } from "./useEventOps";

const FILTERS = [
  ["upcoming", "Upcoming"],
  ["past", "Past"],
  ["draft", "Draft"],
  ["cancelled", "Cancelled"],
];

const EMPTY = {
  upcoming: ["No upcoming events", "Published events with a future date show up here."],
  past: ["No past events yet", "Events move here after they start."],
  draft: ["No drafts right now", "Events you save without publishing show up here."],
  cancelled: ["Nothing cancelled", "Good news."],
};

const PAGE_SIZE = 50;
const GRID = "md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.1fr)_200px] md:gap-4";

function menuItems(event, run) {
  const items = [
    { label: "View RSVPs", icon: Users, href: `/admin/events/${event.id}/rsvps` },
    { label: "Preview", icon: Eye, href: `/admin/preview/${event.id}` },
    { label: "Duplicate", icon: Copy, onSelect: () => run("duplicate", event) },
  ];
  if (event.status === "PUBLISHED") items.push({ label: "Unpublish", icon: EyeOff, onSelect: () => run("unpublish", event) });
  else items.push({ label: "Publish", icon: Globe, onSelect: () => run("publish", event) });
  if (event.status === "PUBLISHED") items.push({ label: "Cancel event", icon: Ban, danger: true, onSelect: () => run("cancel", event) });
  items.push({ label: "Delete", icon: Trash2, danger: true, onSelect: () => run("delete", event) });
  return items;
}

/**
 * Admin events list. Filter tabs and search live in the URL (?filter=&q=&page=);
 * sorting happens on the loaded page. rows come from listAdminEvents().
 */
export function EventsTable({ rows, filter, q, counts, page, action }) {
  const { run, dialog } = useEventOps(action);
  const [sort, setSort] = useState({ key: "date", dir: filter === "past" ? "desc" : "asc" });

  const sorted = useMemo(() => {
    const list = [...rows];
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "date") list.sort((a, b) => (new Date(a.startsAt) - new Date(b.startsAt)) * dir);
    else list.sort((a, b) => (a.headcount - b.headcount) * dir);
    return list;
  }, [rows, sort]);

  const toggle = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "date" ? "asc" : "desc" }));
  const ariaSort = (key) => (sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none");
  const sortIcon = (key) => {
    const Icon = sort.key !== key ? ChevronsUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
    return <Icon size={14} aria-hidden="true" />;
  };

  const tabs = FILTERS.map(([key, label]) => ({ key, label, count: counts[key], href: `/admin/events?filter=${key}` }));
  const [emptyTitle, emptyBody] = q ? ["No matches", `Nothing in ${filter} events matches “${q}”.`] : EMPTY[filter];
  const from = (page - 1) * PAGE_SIZE + 1;
  const pageHref = (n) => `/admin/events?filter=${filter}${q ? `&q=${encodeURIComponent(q)}` : ""}${n > 1 ? `&page=${n}` : ""}`;

  const search = (
    <form action="/admin/events" role="search" className="md:w-[300px]">
      <input type="hidden" name="filter" value={filter} />
      <SearchField name="q" label="Search by title" defaultValue={q} tall />
    </form>
  );

  return (
    <>
      {/* Phones */}
      <div className="flex flex-col gap-3 md:hidden">
        <SegmentedTabs label="Filter events" items={tabs} active={filter} fill size="md" countsOnNarrow={false} className="[&>a]:text-sm" />
        {search}
        {sorted.map((event) => {
          const label = headcountLabel(event.headcount, event.capacity);
          return (
            <div key={event.id} className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/admin/events/${event.id}`} className="text-[17px] leading-6 font-bold text-ink no-underline [overflow-wrap:anywhere] focus-ring hover:text-ink">
                  {event.title}
                </Link>
                <StatusBadge kind={adminBadge(event.status)} />
              </div>
              <span className="text-sm text-muted">
                {formatWhen(event.startsAt)} · {label}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-ink text-[15px] font-bold text-ink no-underline focus-ring hover:text-ink"
                >
                  <Pencil size={16} aria-hidden="true" />
                  Edit
                </Link>
                <Link
                  href={`/admin/events/${event.id}/rsvps`}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-border text-[15px] font-bold text-ink no-underline focus-ring hover:text-ink"
                >
                  <Users size={16} aria-hidden="true" />
                  RSVPs
                </Link>
                <RowMenu label={`More actions for ${event.title}`} items={menuItems(event, run)} />
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-border-strong bg-surface px-4 py-10 text-center">
            <strong className="text-base">{emptyTitle}</strong>
            <span className="text-sm text-muted">{emptyBody}</span>
          </div>
        )}
      </div>

      {/* Tablet and up */}
      <div className="hidden flex-col rounded-lg border border-border bg-surface md:flex">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
          <SegmentedTabs label="Filter events" items={tabs} active={filter} />
          {search}
        </div>
        <div role="table" aria-label="Events" aria-rowcount={sorted.length + 1}>
          <div role="row" className={cn(GRID, "border-b border-border bg-surface-2 px-5 py-2 text-[13px] font-bold uppercase tracking-[0.05em] text-muted")}>
            <span role="columnheader" aria-sort={ariaSort("date")}>
              <button type="button" onClick={() => toggle("date")} className="flex min-h-8 items-center gap-1.5 font-body font-bold uppercase text-muted focus-ring-surface">
                Event · date {sortIcon("date")}
              </button>
            </span>
            <span role="columnheader" className="flex items-center">
              Status
            </span>
            <span role="columnheader" aria-sort={ariaSort("headcount")}>
              <button type="button" onClick={() => toggle("headcount")} className="flex min-h-8 items-center gap-1.5 font-body font-bold uppercase text-muted focus-ring-surface">
                Headcount {sortIcon("headcount")}
              </button>
            </span>
            <span role="columnheader" className="flex items-center justify-end">
              Actions
            </span>
          </div>
          {sorted.map((event) => {
            const label = headcountLabel(event.headcount, event.capacity);
            return (
              <div key={event.id} role="row" className={cn(GRID, "items-center border-b border-border px-5 py-3.5 hover:bg-bg")}>
                <span role="cell" className="flex min-w-0 flex-col gap-0.5">
                  <Link href={`/admin/events/${event.id}`} title={event.title} className="truncate text-base font-bold text-ink no-underline hover:underline focus-ring hover:text-ink">
                    {event.title}
                  </Link>
                  <span className="text-sm text-muted">{formatWhen(event.startsAt)}</span>
                </span>
                <span role="cell">
                  <StatusBadge kind={adminBadge(event.status)} />
                </span>
                <span role="cell" className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold">{label}</span>
                  <ProgressBar pct={headcountPct(event.headcount, event.capacity)} label={label} height={6} />
                </span>
                <span role="cell" className="flex justify-end gap-1">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="inline-flex h-11 items-center gap-1.5 rounded-[10px] px-3 text-[15px] font-bold no-underline hover:bg-primary-soft focus-ring-surface"
                  >
                    <Pencil size={16} aria-hidden="true" />
                    Edit
                  </Link>
                  <RowMenu label={`More actions for ${event.title}`} items={menuItems(event, run)} />
                </span>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
              <CalendarSearch size={32} aria-hidden="true" className="text-muted" />
              <strong className="text-[17px]">{emptyTitle}</strong>
              <span className="text-[15px] text-muted">{emptyBody}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-sm text-muted">
          <span>{sorted.length > 0 ? `Showing ${from}–${from + sorted.length - 1}` : ""}</span>
          <div className="flex gap-2">
            <PageLink href={page > 1 ? pageHref(page - 1) : null} icon={ChevronLeft}>
              Previous
            </PageLink>
            <PageLink href={rows.length === PAGE_SIZE ? pageHref(page + 1) : null} iconRight={ChevronRight}>
              Next
            </PageLink>
          </div>
        </div>
      </div>
      {dialog}
    </>
  );
}

function PageLink({ href, icon: Icon, iconRight: IconRight, children }) {
  const classes = "inline-flex h-11 items-center gap-1.5 rounded-[10px] border-[1.5px] px-3.5 font-bold no-underline";
  if (!href) {
    return (
      <span aria-disabled="true" className={cn(classes, "border-border text-muted")}>
        {Icon && <Icon size={16} aria-hidden="true" />}
        {children}
        {IconRight && <IconRight size={16} aria-hidden="true" />}
      </span>
    );
  }
  return (
    <Link href={href} className={cn(classes, "border-ink text-ink hover:bg-surface-2 hover:text-ink focus-ring-surface")}>
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
      {IconRight && <IconRight size={16} aria-hidden="true" />}
    </Link>
  );
}
