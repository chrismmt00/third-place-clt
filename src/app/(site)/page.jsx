import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { copy } from "@/content/copy";
import { home, site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { CommunityPhoto } from "@/components/site/CommunityPhoto";
import { photos } from "@/content/photos";
import { sampleListing, sampleMetadata } from "@/content/sample-events";
import { SampleEventsBanner } from "@/components/site/SampleEventsBanner";
import { EventGrid, EventsUnavailable, NoEvents } from "@/components/site/EventLists";
import { loadSettings, socialsFrom, loadEventListing } from "./site-data";

export async function generateMetadata({ searchParams }) {
  return (await searchParams).demo === "1" ? sampleMetadata : {};
}

export default async function HomePage({ searchParams }) {
  const demo = (await searchParams).demo === "1";
  const eventsHref = demo ? "/events?demo=1" : "/events";
  const [settings, listing] = await Promise.all([loadSettings(), demo ? sampleListing({ limit: 3 }) : loadEventListing({ limit: 3 })]);
  const next = listing.items;
  const chatUrl = settings.chatUrl;

  return (
    <>
      {demo && <SampleEventsBanner />}
      {/* Hero */}
      <section className="mx-auto flex max-w-content flex-col gap-5 px-4 pb-10 pt-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <div className="flex flex-col gap-5 lg:gap-6">
          <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-accent lg:text-sm">{home.eyebrow}</span>
          <h1 className="m-0 font-display text-[40px] leading-[44px] font-extrabold tracking-[-0.03em] text-balance lg:text-4xl">{home.headline}</h1>
          <p className="m-0 max-w-[520px] text-[17px] leading-[26px] lg:text-lg">
            {home.intro}
          </p>
          <div className="flex flex-col gap-2.5 lg:mt-2 lg:flex-row lg:flex-wrap lg:gap-3">
            <Button href={eventsHref} size="xl" iconRight={ArrowRight}>
              {copy.home.cta}
            </Button>
            {chatUrl && (
              <Button href={chatUrl} variant="secondary" size="xl" icon={MessageCircle}>
                {site.chatLabel}
              </Button>
            )}
          </div>
        </div>
        <CommunityPhoto
          photo={photos.conversation}
          eager
          imageClassName="aspect-[4/3] lg:aspect-[5/4]"
        />
      </section>

      {/* Coming up next */}
      <section aria-labelledby="home-next" className="mx-auto flex max-w-content flex-col gap-5 px-4 pb-12 md:px-8 lg:gap-7 lg:px-12 lg:pb-[88px]">
        <div className="flex items-end justify-between gap-6">
          <h2 id="home-next" className="m-0 font-display text-[30px] leading-9 font-extrabold lg:text-3xl lg:tracking-[-0.02em]">
            Coming up next
          </h2>
          {next.length > 0 && (
            <Link href={eventsHref} className="hidden min-h-11 items-center gap-1.5 text-[17px] font-bold no-underline focus-ring lg:inline-flex">
              See all events
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
        {!listing.available ? <EventsUnavailable /> : next.length > 0 ? (
          <>
            <EventGrid items={next} />
            <Button href={eventsHref} variant="secondary" size="xl" iconRight={ArrowRight} className="lg:hidden">
              See all events
            </Button>
          </>
        ) : (
          <NoEvents title={copy.empty.home} body={copy.empty.homeBody} chatUrl={chatUrl} chatLabel={site.chatLabel} />
        )}
      </section>

      {/* What's a third place? */}
      <section aria-labelledby="home-what" className="bg-accent-soft">
        <div className="mx-auto grid max-w-content gap-4 px-4 py-12 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12 lg:py-[88px]">
          <CommunityPhoto
            photo={photos.coffee}
            className="hidden lg:block"
            imageClassName="aspect-[4/3]"
          />
          <div className="flex flex-col gap-4 lg:gap-5">
            <h2 id="home-what" className="m-0 font-display text-[30px] leading-9 font-extrabold lg:text-3xl lg:tracking-[-0.02em]">
              {home.whatTitle}
            </h2>
            <p className="m-0 text-[17px] leading-[26px] lg:text-lg">{home.what}</p>
            <p className="m-0 text-[17px] leading-[26px] lg:text-lg">
              {home.mission}
            </p>
            <Link href="/about#meetups" className="inline-flex min-h-11 w-max items-center gap-1.5 text-[17px] font-bold no-underline focus-ring">
              {home.howLink}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community chat */}
      {chatUrl && (
        <section aria-labelledby="home-chat" className="mx-auto max-w-content px-4 py-12 md:px-8 lg:px-12 lg:py-[88px]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:rounded-[24px] lg:border lg:border-border lg:bg-surface lg:px-14 lg:py-12">
            <div className="flex max-w-[620px] flex-col gap-2.5">
              <h2 id="home-chat" className="m-0 font-display text-[26px] leading-8 font-bold lg:text-2xl">
                {home.chatTitle}
              </h2>
              <p className="m-0 text-base text-muted lg:text-[17px] lg:leading-[26px]">{home.chatBody}</p>
              <div className="mt-1 hidden flex-wrap gap-x-5 gap-y-1 lg:flex">
                {socialsFrom(settings).map((s) => (
                  <a key={s.label} href={s.url} className="flex min-h-11 items-center text-base font-semibold focus-ring">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <Button href={chatUrl} size="xl" icon={MessageCircle} className="flex-none">
              {site.chatLabel}
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
