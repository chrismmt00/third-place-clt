import Link from "next/link";
import { ArrowRight, CalendarPlus, Plus, Users } from "lucide-react";
import { getAdminAccount, getAdminOverview, listAdminEvents } from "@/lib/admin-queries";
import { greeting, formatWhen } from "@/lib/format";
import { headcountLabel, headcountPct } from "@/lib/eventStatus";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/bits";
import { guard } from "../guard";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const [account, overview, drafts, past] = await Promise.all([
    guard(getAdminAccount()),
    guard(getAdminOverview()),
    guard(listAdminEvents({ filter: "draft" })),
    guard(listAdminEvents({ filter: "past" })),
  ]);
  const first = account.name.trim().split(/\s+/)[0];
  const upcoming = overview.events;
  const brandNew = upcoming.length === 0 && drafts.length === 0 && past.length === 0;

  if (brandNew) {
    return (
      <>
        <MobileTopBar title="Overview" />
        <main className="flex flex-col gap-7 px-4 py-5 md:px-8 lg:px-12 lg:py-9">
          <h1 className="m-0 font-display text-[28px] leading-[34px] font-extrabold lg:text-[36px] lg:leading-[42px]">Welcome to your portal, {first}</h1>
          <div className="flex max-w-[640px] flex-col items-start gap-3.5 rounded-[20px] border-[1.5px] border-dashed border-border-strong bg-surface p-6 md:p-10">
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <CalendarPlus size={26} />
            </span>
            <h2 className="m-0 font-display text-[28px] leading-[34px] font-bold">Let&apos;s add your first event.</h2>
            <p className="m-0 text-base text-muted">It takes about five minutes. You can save it as a draft and publish when you&apos;re ready.</p>
            <ol className="m-0 flex flex-col gap-1.5 pl-[22px] text-base">
              <li>Create an event and publish it</li>
              <li>
                Add your contact email and social links in <Link href="/admin/settings">Settings</Link>
              </li>
              {account.role === "OWNER" && (
                <li>
                  Invite teammates from <Link href="/admin/users">Users</Link>
                </li>
              )}
            </ol>
            <Button href="/admin/events/new" size="xl" icon={Plus} className="mt-2 w-full md:w-auto">
              Create your first event
            </Button>
          </div>
        </main>
      </>
    );
  }

  const peopleGoing = upcoming.reduce((n, e) => n + e.headcount, 0);
  const kpis = [
    ["Upcoming events", upcoming.length >= 10 ? "10+" : String(upcoming.length), drafts.length ? `${drafts.length} draft${drafts.length === 1 ? "" : "s"} waiting` : "No drafts waiting", "/admin/events"],
    ["People going", String(peopleGoing), "across upcoming events", "/admin/events"],
    ["Unread messages", String(overview.unreadMessages), "from the contact form", "/admin/messages?status=NEW"],
  ];
  const nextUp = upcoming.slice(0, 4);

  return (
    <>
      <MobileTopBar title="Overview" />
      <main className="flex flex-col gap-4 px-4 pb-8 pt-5 md:px-8 lg:gap-7 lg:px-12 lg:py-9">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-display text-[28px] leading-[34px] font-extrabold lg:text-[36px] lg:leading-[42px] lg:tracking-[-0.02em]">
              {greeting()}, {first}
            </h1>
            <p className="m-0 hidden text-base text-muted lg:block">Here&apos;s what&apos;s coming up.</p>
          </div>
          <Button href="/admin/events/new" size="xl" icon={Plus} className="lg:h-12 lg:px-5 lg:text-base">
            New event
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">
          {kpis.map(([label, value, sub, href]) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col gap-0.5 rounded-[14px] border border-border bg-surface p-4 text-ink no-underline focus-ring hover:border-border-strong hover:text-ink lg:gap-1.5 lg:rounded-lg lg:p-6"
            >
              <span className="text-[13px] font-semibold text-muted lg:text-[15px]">{label}</span>
              <span className="font-display text-[32px] leading-9 font-extrabold lg:text-[44px] lg:leading-[48px]">{value}</span>
              <span className="hidden text-sm text-muted lg:block">{sub}</span>
            </Link>
          ))}
        </div>

        <section aria-labelledby="next-up" className="flex flex-col gap-3 lg:gap-0 lg:rounded-lg lg:border lg:border-border lg:bg-surface">
          <div className="mt-2 flex items-center justify-between lg:mt-0 lg:border-b lg:border-border lg:px-6 lg:py-5">
            <h2 id="next-up" className="m-0 font-display text-xl font-bold">
              Next up
            </h2>
            <Link href="/admin/events" className="hidden min-h-11 items-center gap-1.5 text-[15px] font-bold no-underline focus-ring lg:inline-flex">
              All events
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {nextUp.length === 0 && <p className="m-0 text-base text-muted lg:px-6 lg:py-5">No published events coming up. Drafts show up under Events.</p>}
          {nextUp.map((event) => {
            const pct = headcountPct(event.headcount, event.capacity);
            const label = headcountLabel(event.headcount, event.capacity);
            return (
              <div key={event.id} className="lg:border-b lg:border-border lg:last:border-b-0">
                {/* Phone: whole card links to the RSVP list. */}
                <Link
                  href={`/admin/events/${event.id}/rsvps`}
                  className="flex flex-col gap-2 rounded-[14px] border border-border bg-surface p-4 text-ink no-underline focus-ring hover:text-ink lg:hidden"
                >
                  <strong className="text-base">{event.title}</strong>
                  <span className="text-sm text-muted">
                    {formatWhen(event.startsAt)} · {label}
                  </span>
                  <ProgressBar pct={pct} label={label} />
                </Link>
                {/* Desktop row */}
                <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_140px] items-center gap-6 px-6 py-4 lg:grid">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link href={`/admin/events/${event.id}`} className="truncate text-base font-bold text-ink no-underline hover:underline focus-ring">
                      {event.title}
                    </Link>
                    <span className="text-sm text-muted">{formatWhen(event.startsAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold">{label}</span>
                    <ProgressBar pct={pct} label={label} />
                  </div>
                  <Link
                    href={`/admin/events/${event.id}/rsvps`}
                    className="inline-flex h-11 items-center gap-1.5 justify-self-end rounded-[10px] border-[1.5px] border-border px-3.5 text-sm font-bold text-ink no-underline hover:bg-surface-2 hover:text-ink focus-ring-surface"
                  >
                    <Users size={16} aria-hidden="true" />
                    RSVPs
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}
