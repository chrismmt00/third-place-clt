import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { copy } from "@/content/copy";

const link = "flex min-h-11 items-center text-ink decoration-2 underline-offset-4 hover:text-ink focus-ring";

/**
 * Site footer. Ink on the client's sky blue. 3 columns from 1024px, stacked below.
 * socials: [{ label: "Instagram", url }] — entries with an empty url are hidden.
 */
export function Footer({ siteName, tagline, contactEmail, socials = [], chatUrl, chatLabel }) {
  const shown = socials.filter((s) => s.url);
  const year = new Date().getFullYear();
  const chatText = chatLabel || copy.chat.defaultLabel;

  const bottomBar = (className) => (
    <div className={`flex items-center justify-between border-t border-ink/30 font-mono text-sm ${className}`}>
      <span>
        © {year} {siteName}
      </span>
      <Link href="/privacy" className={link}>
        Privacy
      </Link>
    </div>
  );

  return (
    <footer className="bg-sky text-ink">
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-12 px-12 pb-10 pt-14">
          <div className="flex flex-col gap-3">
            <span className="font-display text-[44px] leading-[48px]">{siteName}</span>
            {tagline && <p className="m-0 max-w-[340px] text-base">{tagline}</p>}
          </div>
          {shown.length > 0 && (
            <div className="flex flex-col gap-1">
              <h2 className="m-0 mb-2 font-mono text-sm font-bold uppercase tracking-[0.08em]">Find us</h2>
              {shown.map((s) => (
                <a key={s.label} href={s.url} className={`${link} text-base font-medium`}>
                  {s.label}
                </a>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h2 className="m-0 mb-2 font-mono text-sm font-bold uppercase tracking-[0.08em]">Get in touch</h2>
            {chatUrl && (
              <a href={chatUrl} className={`${link} gap-2 text-base font-semibold`}>
                <MessageCircle size={18} aria-hidden="true" />
                {chatText}
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className={`${link} gap-2 text-base`}>
                <Mail size={18} aria-hidden="true" />
                {contactEmail}
              </a>
            )}
          </div>
        </div>
        {bottomBar("px-12 pb-6 pt-4")}
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-7 px-5 pb-6 pt-10 lg:hidden">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[34px] leading-10">{siteName}</span>
          {tagline && <p className="m-0 text-base">{tagline}</p>}
        </div>
        {chatUrl && (
          <a
            href={chatUrl}
            className="flex h-[52px] items-center justify-center gap-2 border-[1.5px] border-ink bg-butter text-base font-bold text-ink no-underline hover:bg-surface hover:text-ink focus-ring rounded-full"
          >
            <MessageCircle size={18} aria-hidden="true" />
            {chatText}
          </a>
        )}
        {shown.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4">
            {shown.map((s) => (
              <a key={s.label} href={s.url} className={`${link} text-base`}>
                {s.label}
              </a>
            ))}
          </div>
        )}
        {contactEmail && (
          <a href={`mailto:${contactEmail}`} className={`${link} gap-2 text-base`}>
            <Mail size={18} aria-hidden="true" />
            {contactEmail}
          </a>
        )}
        {bottomBar("pt-4")}
      </div>
    </footer>
  );
}
