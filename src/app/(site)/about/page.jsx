import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight, MessageCircle, MessageSquareHeart } from "lucide-react";
import { about, site } from "@/content/site";
import { PhotoPlaceholder } from "@/components/ui/bits";
import { loadSettings } from "../site-data";

export const metadata = {
  title: "About",
  description: "Third Place is a conversation café in Charlotte: an open-invite community group that meets twice a month. Here's how a meetup works.",
};

const h2 = "m-0 font-display text-[30px] leading-9 font-extrabold lg:text-3xl lg:tracking-[-0.02em]";
const section = "mx-auto flex max-w-content flex-col gap-6 px-4 py-12 md:px-8 lg:gap-8 lg:px-12 lg:py-[88px]";

export default async function AboutPage() {
  const settings = await loadSettings();
  const involve = [
    [Calendar, "Come to a meetup", "Pick one and RSVP. It's free, and coming solo is completely normal.", "See upcoming meetups", "/events"],
    ...(settings.chatUrl ? [[MessageCircle, site.chatLabel, "Hear about new meetups first and keep talking between them.", site.chatLabel, settings.chatUrl]] : []),
    [MessageSquareHeart, "Share feedback", "Your feedback is important for the integrity of our shared community.", "Get in touch", "/contact"],
  ];

  return (
    <>
      {/* Who we are */}
      <section className="mx-auto flex max-w-content flex-col gap-4 px-4 pb-10 pt-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:px-12 lg:py-[72px]">
        <div className="flex flex-col gap-4 lg:gap-5">
          <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-accent lg:text-sm">{about.eyebrow}</span>
          <h1 className="m-0 font-display text-[38px] leading-[42px] font-extrabold tracking-[-0.03em] lg:text-4xl">{about.headline}</h1>
          {about.intro.map((p) => (
            <p key={p} className="m-0 text-[17px] leading-7 lg:text-lg lg:leading-[30px]">
              {p}
            </p>
          ))}
        </div>
        <PhotoPlaceholder alt="[CLIENT PHOTO] People at a Third Place meetup" label="photo · people cut out, faces not shown" className="aspect-[4/3] rounded-lg lg:rounded-[20px]" />
      </section>

      {/* What a third place is */}
      <section className="bg-ink text-bg">
        <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-12 md:px-8 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-[88px]">
          <h2 className="m-0 font-display text-[28px] leading-[34px] font-extrabold lg:text-3xl lg:leading-[46px] lg:tracking-[-0.02em]">{about.definitionTitle}</h2>
          <div className="flex flex-col gap-4 text-[17px] leading-7 lg:text-lg lg:leading-[30px]">
            {about.definition.map((p) => (
              <p key={p} className="m-0">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values" className={section}>
        <h2 id="values" className={h2}>
          {about.valuesTitle}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {about.values.map(([n, title, body]) => (
            <div key={n} className="flex flex-col gap-1.5 border-t-[3px] border-primary pt-4 lg:gap-2.5 lg:pt-5">
              <span className="hidden font-display text-lg font-extrabold text-primary lg:block">{n}</span>
              <h3 className="m-0 font-display text-xl leading-[26px] font-bold lg:leading-7">
                <span className="lg:hidden">{n} · </span>
                {title}
              </h3>
              <p className="m-0 text-base text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How a meetup works */}
      <section id="meetups" aria-labelledby="meetups-title" className="scroll-mt-6 bg-accent-soft">
        <div className={section}>
          <h2 id="meetups-title" className={h2}>
            {about.meetupTitle}
          </h2>
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {about.meetupSteps.map(([title, body], i) => (
              <li key={title} className="flex flex-col gap-2 rounded-lg bg-surface p-5 lg:p-6">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-lg font-extrabold text-on-accent">
                  {i + 1}
                </span>
                <h3 className="m-0 font-display text-xl font-bold">{title}</h3>
                <p className="m-0 text-base">{body}</p>
              </li>
            ))}
          </ol>
          <div className="flex max-w-prose flex-col gap-3">
            <h3 className="m-0 text-lg font-bold">Good to know</h3>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-[22px] text-[17px] leading-7">
              {about.meetupNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Example questions */}
      <section aria-labelledby="questions" className={section}>
        <div className="flex max-w-prose flex-col gap-3">
          <h2 id="questions" className={h2}>
            {about.questionsTitle}
          </h2>
          <p className="m-0 text-[17px] leading-7 text-muted lg:text-lg">{about.questionsIntro}</p>
        </div>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {about.questions.map((q) => (
            <li key={q} className="rounded-lg border border-border bg-surface px-5 py-4 font-display text-xl leading-7 font-bold">
              “{q}”
            </li>
          ))}
        </ul>
      </section>

      {/* Community isn't perfect */}
      <section aria-labelledby="imperfect" className="bg-surface-2">
        <div className={`${section} lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16`}>
          <h2 id="imperfect" className={h2}>
            {about.imperfectTitle}
          </h2>
          <div className="flex flex-col gap-4 text-[17px] leading-7 lg:text-lg lg:leading-[30px]">
            {about.imperfect.map((p) => (
              <p key={p} className="m-0">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Get involved */}
      <section aria-labelledby="involved" className={section}>
        <h2 id="involved" className={h2}>
          How to get involved
        </h2>
        {/* Phones: one tappable row per option. */}
        <div className="flex flex-col gap-4 lg:hidden">
          {involve.map(([Icon, title, , cta, href]) => (
            <Link
              key={title}
              href={href}
              className="flex items-center gap-3.5 rounded-[14px] border border-border bg-surface px-4 py-[18px] text-ink no-underline focus-ring hover:text-ink"
            >
              <Icon size={24} aria-hidden="true" className="flex-none text-accent" />
              <span className="flex flex-1 flex-col gap-0.5">
                <strong className="text-[17px]">{title}</strong>
                <span className="text-sm text-muted">{cta}</span>
              </span>
              <ChevronRight size={20} aria-hidden="true" className="text-muted" />
            </Link>
          ))}
        </div>
        {/* Desktop: cards. */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {involve.map(([Icon, title, body, cta, href]) => (
            <div key={title} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-7">
              <Icon size={28} aria-hidden="true" className="text-accent" />
              <h3 className="m-0 font-display text-2xl leading-[30px] font-bold">{title}</h3>
              <p className="m-0 text-base text-muted">{body}</p>
              <Link href={href} className="mt-auto inline-flex min-h-11 w-max items-center gap-1.5 text-base font-bold no-underline focus-ring">
                {cta}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
