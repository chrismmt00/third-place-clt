import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

const TILTS = ["-4deg", "3deg", "-2deg", "5deg", "-5deg", "2deg"];

/**
 * Birdcall-style index: a picture of an object beside each link, in a plain
 * bordered table. The pictures are placeholders for the client's own scans.
 * links: [{ label, href, note?, art, external? }]
 */
export function ScanIndex({ links, label = "Around the site" }) {
  return (
    <nav aria-label={label}>
      <ul className="m-0 grid list-none gap-1 border-2 border-ink/25 bg-surface/50 p-1 md:grid-cols-2">
        {links.map(({ label: text, href, note, art, external }, i) => {
          const Anchor = external ? "a" : Link;
          return (
            <li key={href} className="scan-row relative grid grid-cols-[96px_minmax(0,1fr)] gap-1 transition-colors hover:bg-butter/70 has-[a:focus-visible]:bg-butter/70 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-ink md:grid-cols-[124px_minmax(0,1fr)]">
              <span className="flex aspect-square items-center justify-center border border-ink/25 p-2.5">
                <Image
                  src={art}
                  alt=""
                  width={200}
                  height={200}
                  unoptimized
                  className="sticker scan-wiggle h-full w-full object-contain"
                  style={{ "--tilt": TILTS[i % TILTS.length] }}
                />
              </span>
              <span className="flex flex-col justify-center gap-1 border border-ink/25 px-4 py-3">
                <Anchor
                  href={href}
                  className={cn(
                    "text-[21px] leading-7 font-medium text-primary underline decoration-[1.5px] underline-offset-4 outline-none",
                    "after:absolute after:inset-0 after:content-[''] hover:text-primary-hover focus-visible:decoration-[3px]"
                  )}
                >
                  {text}
                  {external && (
                    <>
                      <span aria-hidden="true"> ↬</span>
                      <span className="sr-only"> (external site)</span>
                    </>
                  )}
                </Anchor>
                {note && <span className="font-mono text-sm leading-5 text-muted">{note}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
