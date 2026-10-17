import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { copy } from "@/content/copy";
import { home, homeIndex, site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Binoculars } from "@/components/site/Binoculars";
import { ScanIndex } from "@/components/site/ScanIndex";
import { EventListing } from "@/components/site/EventListing";
import { photos } from "@/content/photos";
import { sampleListing, sampleMetadata } from "@/content/sample-events";
import { SampleEventsBanner } from "@/components/site/SampleEventsBanner";
import { EventsUnavailable, NoEvents } from "@/components/site/EventLists";
import { loadSettings, loadEventListing } from "./site-data";

export async function generateMetadata({ searchParams }) {
  return (await searchParams).demo === "1" ? sampleMetadata : {};
}

export default async function HomePage({ searchParams }) {
  const demo = (await searchParams).demo === "1";
  const eventsHref = demo ? "/events?demo=1" : "/events";
  const [settings, listing] = await Promise.all([loadSettings(), demo ? sampleListing({ limit: 3 }) : loadEventListing({ limit: 3 })]);
  const next = listing.items;
  const chatUrl = settings.chatUrl;

  // External rows only show when the owner has set their links in admin settings.
  const external = { chat: chatUrl, instagram: settings.instagramUrl || site.instagramUrl };
  const links = homeIndex
    .map((item) => (item.external ? { ...item, href: external[item.key] } : item.key === "events" ? { ...item, href: eventsHref } : item))
    .filter((item) => item.href);

  return (
    <>
      {demo && <SampleEventsBanner />}
      {/* Hero */}
      <section className="mx-auto flex max-w-content flex-col gap-8 px-4 pb-10 pt-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 lg:px-12 lg:pb-16 lg:pt-16">
        <div className="flex flex-col gap-5 lg:gap-6">
          <span className="font-mono text-[15px] lowercase text-muted">{home.eyebrow}</span>
          <h1 className="m-0 font-display text-[44px] leading-[46px] text-balance lg:text-[64px] lg:leading-[64px]">{home.headline}</h1>
          <p className="m-0 max-w-[520px] text-[18px] leading-[28px] font-light lg:text-[20px] lg:leading-[30px]">{home.intro}</p>
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
        <Binoculars photo={photos.together} eager />
      </section>

      {/* Index */}
      <section className="mx-auto max-w-content px-4 pb-12 md:px-8 lg:px-12 lg:pb-20">
        <p aria-hidden="true" className="m-0 mb-2 font-mono text-[15px] text-muted">index</p>
        <ScanIndex links={links} />
      </section>

      {/* Coming up next */}
      <section aria-labelledby="home-next" className="mx-auto flex max-w-content flex-col gap-5 px-4 pb-14 md:px-8 lg:gap-7 lg:px-12 lg:pb-24">
        <div className="flex items-end justify-between gap-6">
          <h2 id="home-next" className="m-0 font-display text-[34px] leading-10 lg:text-[44px] lg:leading-[48px]">
            Coming up
          </h2>
          {next.length > 0 && (
            <Link href={eventsHref} className="hidden min-h-11 items-center gap-1.5 font-mono text-[17px] font-bold focus-ring lg:inline-flex">
              all events
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
        {!listing.available ? <EventsUnavailable /> : next.length > 0 ? (
          <>
            <EventListing items={next} />
            <Button href={eventsHref} variant="secondary" size="xl" iconRight={ArrowRight} className="lg:hidden">
              See all events
            </Button>
          </>
        ) : (
          <NoEvents title={copy.empty.home} body={copy.empty.homeBody} chatUrl={chatUrl} chatLabel={site.chatLabel} />
        )}
      </section>

      {/* What's a third place? */}
      <section aria-labelledby="home-what" className="bg-butter">
        <div className="mx-auto grid max-w-content gap-10 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center lg:gap-20 lg:px-12 lg:py-24">
          <figure className="relative m-0 mx-auto w-full max-w-[420px] -rotate-2">
            <div className="sticker bg-surface p-3 pb-12">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src={photos.coffee.src} alt={photos.coffee.alt} fill sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" />
              </div>
              <figcaption className="absolute inset-x-3 bottom-3 font-mono text-xs leading-5 text-muted">
                Stock photo ·{" "}
                <a href={photos.coffee.source} className="underline underline-offset-2 focus-ring">
                  {photos.coffee.photographer} / Pexels
                </a>
              </figcaption>
            </div>
            <span aria-hidden="true" className="tape absolute -top-4 left-1/2 h-9 w-40 -translate-x-1/2 rotate-3" />
          </figure>
          <div className="flex flex-col gap-4 lg:gap-5">
            <h2 id="home-what" className="m-0 font-display text-[34px] leading-10 lg:text-[48px] lg:leading-[52px]">
              {home.whatTitle}
            </h2>
            <p className="m-0 text-[18px] leading-[28px] lg:text-[20px] lg:leading-[30px]">{home.what}</p>
            <p className="m-0 text-[18px] leading-[28px] lg:text-[20px] lg:leading-[30px]">{home.mission}</p>
            <Link href="/about#meetups" className="inline-flex min-h-11 w-max items-center gap-1.5 font-mono text-[17px] font-bold focus-ring">
              {home.howLink.toLowerCase()}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community chat */}
      {chatUrl && (
        <section aria-labelledby="home-chat" className="mx-auto max-w-content px-4 py-14 md:px-8 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-4 border-2 border-dashed border-ink/40 px-5 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-12">
            <div className="flex max-w-[620px] flex-col gap-2.5">
              <h2 id="home-chat" className="m-0 font-display text-[30px] leading-9 lg:text-[36px] lg:leading-[42px]">
                {home.chatTitle}
              </h2>
              <p className="m-0 text-[17px] leading-[26px]">{home.chatBody}</p>
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
