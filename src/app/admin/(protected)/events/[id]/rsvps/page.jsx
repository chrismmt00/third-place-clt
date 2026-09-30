import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";
import { manageRsvp } from "@/app/actions/rsvp";
import { getAdminEvent, listAdminRsvps } from "@/lib/admin-queries";
import { formatWhen } from "@/lib/format";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { RsvpTable } from "@/components/admin/RsvpTable";
import { guard } from "../../../../guard";

export const metadata = { title: "RSVPs" };

const SORTS = ["newest", "oldest", "name"];

export default async function RsvpsPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const sort = SORTS.includes(query.sort) ? query.sort : "newest";
  const q = typeof query.q === "string" ? query.q.slice(0, 200) : "";

  const event = await guard(getAdminEvent(id));
  if (!event) notFound();
  const [{ rows, total, headcount }, all] = await Promise.all([
    guard(listAdminRsvps(id, { search: q, sort })),
    q ? guard(listAdminRsvps(id, {})) : null,
  ]);

  // Stats describe the whole list, even while a search narrows the table.
  const everyone = all?.rows ?? rows;
  const cancelled = everyone.filter((r) => r.status === "CANCELLED").length;
  const guests = everyone.filter((r) => r.status === "GOING").reduce((n, r) => n + r.guestCount, 0);
  const stats = [
    ["Total RSVPs", String(total), total > everyone.length ? "" : cancelled ? `${cancelled} cancelled` : "none cancelled"],
    ["Headcount", String(headcount), guests ? `incl. ${guests} guest${guests === 1 ? "" : "s"}` : "no guests"],
    event.capacity == null ? ["Spots left", "∞", "no limit"] : ["Spots left", String(Math.max(0, event.capacity - headcount)), `of ${event.capacity}`],
  ];
  const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").origin;
  const exportHref = `/api/admin/events/${id}/rsvps/export`;

  return (
    <>
      <MobileTopBar title="RSVPs" back={`/admin/events/${id}`} backLabel="Back to event" />
      <main className="flex flex-col gap-3 px-4 pb-8 pt-4 md:px-8 lg:gap-6 lg:px-12 lg:pb-12 lg:pt-7">
        <nav aria-label="Breadcrumb" className="hidden flex-wrap items-center gap-2 text-sm text-muted lg:flex">
          <Link href="/admin/events" className="inline-flex min-h-11 items-center focus-ring">
            Events
          </Link>
          <ChevronRight size={16} aria-hidden="true" />
          <Link href={`/admin/events/${id}`} className="inline-flex min-h-11 items-center focus-ring">
            {event.title}
          </Link>
          <ChevronRight size={16} aria-hidden="true" />
          <span>RSVPs</span>
        </nav>

        <div className="flex flex-col gap-3 lg:-mt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="sr-only lg:not-sr-only lg:m-0 lg:font-display lg:text-[34px] lg:leading-10 lg:font-extrabold">RSVPs</h1>
            <span className="text-[15px] font-semibold lg:font-normal lg:text-muted">
              {event.title}
              <span className="hidden lg:inline"> · {formatWhen(event.startsAt)}</span>
            </span>
          </div>
          {total > 0 && (
            <a
              href={exportHref}
              download
              className="order-last inline-flex h-12 items-center justify-center gap-2 rounded-md border-[1.5px] border-ink bg-surface px-5 text-base font-bold text-ink no-underline hover:bg-surface-2 hover:text-ink focus-ring lg:order-none"
            >
              <Download size={18} aria-hidden="true" />
              Export CSV
            </a>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 lg:gap-5">
          {stats.map(([label, value, sub]) => (
            <div key={label} className="flex flex-col rounded-md border border-border bg-surface p-3 lg:gap-1 lg:rounded-lg lg:px-6 lg:py-5">
              <span className="order-2 text-xs leading-4 font-semibold text-muted lg:order-none lg:text-[15px] lg:leading-normal">{label}</span>
              <span className="font-display text-[26px] font-extrabold lg:text-3xl">{value}</span>
              {sub && <span className="hidden text-sm text-muted lg:block">{sub}</span>}
            </div>
          ))}
        </div>

        <RsvpTable
          key={`${q}-${sort}`}
          eventId={id}
          eventTitle={event.title}
          publicUrl={`${origin}/events/${event.slug}`}
          rows={rows.map((r) => ({
            id: r.id,
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            phone: r.phone,
            guestCount: r.guestCount,
            note: r.note,
            publicNameConsent: r.publicNameConsent,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
          }))}
          q={q}
          sort={sort}
          action={manageRsvp}
        />
      </main>
    </>
  );
}
