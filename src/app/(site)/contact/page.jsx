import { MessageCircle } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { contactPage, site } from "@/content/site";
import { ContactForm } from "@/components/site/ContactForm";
import { loadSettings, socialsFrom } from "../site-data";

export const metadata = {
  title: "Contact",
  description: "Questions, ideas or feedback for Third Place? Send us a note. A real person reads every one.",
};

const dt = "text-sm font-bold uppercase tracking-[0.08em] text-muted";

export default async function ContactPage() {
  const settings = await loadSettings();
  const socials = socialsFrom(settings);

  return (
    <div className="mx-auto flex max-w-content flex-col gap-5 px-4 pb-12 pt-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_560px] lg:items-start lg:gap-x-20 lg:gap-y-6 lg:px-12 lg:pb-24 lg:pt-[72px]">
      <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1 lg:gap-6">
        <h1 className="m-0 font-display text-[38px] leading-[42px] font-extrabold tracking-[-0.03em] lg:text-4xl">{contactPage.headline}</h1>
        <p className="m-0 max-w-[480px] text-[17px] leading-7 lg:text-lg lg:leading-[30px]">
          {contactPage.intro}
        </p>
      </div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <ContactForm action={submitContact} contactEmail={settings.contactEmail} />
      </div>

      <dl className="m-0 flex flex-col gap-5 pt-2 lg:col-start-1 lg:row-start-2 lg:pt-3">
        {settings.contactEmail && (
          <div className="flex flex-col gap-1">
            <dt className={dt}>
              <span className="lg:hidden">Or email us</span>
              <span className="hidden lg:inline">Email</span>
            </dt>
            <dd className="m-0">
              <a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-11 items-center text-lg font-bold focus-ring lg:text-xl">
                {settings.contactEmail}
              </a>
            </dd>
          </div>
        )}
        {settings.chatUrl && (
          <div className="flex flex-col gap-1">
            <dt className={dt}>Community chat</dt>
            <dd className="m-0">
              <a href={settings.chatUrl} className="inline-flex min-h-11 items-center gap-2 text-[17px] font-semibold focus-ring">
                <MessageCircle size={18} aria-hidden="true" />
                {site.chatLabel}
              </a>
            </dd>
          </div>
        )}
        {socials.length > 0 && (
          <div className="flex flex-col gap-1">
            <dt className={dt}>Follow along</dt>
            <dd className="m-0 grid grid-cols-2 gap-x-4 lg:flex lg:flex-wrap lg:gap-x-5 lg:gap-y-1">
              {socials.map((s) => (
                <a key={s.label} href={s.url} className="flex min-h-11 items-center text-base font-semibold focus-ring lg:text-[17px]">
                  {s.label}
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
