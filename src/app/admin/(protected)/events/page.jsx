import Link from "next/link";
import { Plus } from "lucide-react";
import { updateEventStatus } from "@/app/actions/events";
import { listAdminEvents } from "@/lib/admin-queries";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { EventsTable } from "@/components/admin/EventsTable";
import { Button } from "@/components/ui/Button";
import { guard } from "../../guard";

export const metadata = { title: "Events" };

const FILTERS = ["upcoming", "past", "draft", "cancelled"];
const PAGE_SIZE = 50;

const toRow = (e) => ({
  id: e.id,
  title: e.title,
  status: e.status,
  startsAt: e.startsAt.toISOString(),
  capacity: e.capacity,
  headcount: e.headcount,
  _count: { rsvps: e._count.rsvps },
});

export default async function AdminEventsPage({ searchParams }) {
  const params = await searchParams;
  const filter = FILTERS.includes(params.filter) ? params.filter : "upcoming";
  const q = typeof params.q === "string" ? params.q.slice(0, 200) : "";
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page, 10) || 1));

  // One unfiltered list per tab gives the tab counts; the active tab is refetched when searching or paging.
  const lists = await Promise.all(FILTERS.map((f) => guard(listAdminEvents({ filter: f }))));
  const counts = Object.fromEntries(FILTERS.map((f, i) => [f, lists[i].length >= PAGE_SIZE ? `${PAGE_SIZE}+` : lists[i].length]));
  const rows = q || page > 1 ? await guard(listAdminEvents({ filter, search: q, page })) : lists[FILTERS.indexOf(filter)];

  return (
    <>
      <MobileTopBar
        title="Events"
        action={
          <Link href="/admin/events/new" aria-label="New event" className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-on-primary focus-ring hover:bg-primary-hover hover:text-on-primary">
            <Plus size={20} aria-hidden="true" />
          </Link>
        }
      />
      <main className="flex flex-col gap-3 px-4 pb-8 pt-4 md:gap-6 md:px-8 lg:px-12 lg:py-9">
        <div className="hidden items-center justify-between md:flex">
          <h1 className="m-0 font-display text-[36px] leading-[42px] font-extrabold">Events</h1>
          <Button href="/admin/events/new" icon={Plus}>
            New event
          </Button>
        </div>
        <h1 className="sr-only md:hidden">Events</h1>
        <EventsTable key={`${filter}-${q}-${page}`} rows={rows.map(toRow)} filter={filter} q={q} counts={counts} page={page} action={updateEventStatus} />
      </main>
    </>
  );
}
