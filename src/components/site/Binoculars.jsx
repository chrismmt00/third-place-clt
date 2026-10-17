import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * A photo seen through binoculars, slowly drifting, tinted the client's sky blue.
 * A CSS take on the Nature School GIF; the drift stops for reduced motion.
 */
export function Binoculars({ photo, className, eager = false }) {
  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <div className="relative aspect-[2/1]">
        <div className="binoculars absolute inset-0 overflow-hidden bg-sky">
          <div className="binocular-pan absolute inset-0">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : undefined}
              className="object-cover grayscale contrast-125"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-sky mix-blend-multiply" />
        </div>
        {/* Rangefinder marks */}
        <svg aria-hidden="true" viewBox="0 0 200 100" className="absolute inset-0 h-full w-full text-ink/70" fill="none" stroke="currentColor" strokeWidth="0.6">
          <path d="M84 34v-5h5M116 34v-5h-5M84 66v5h5M116 66v5h-5" />
          <path d="M100 45v10M95 50h10" />
          <path d="M6 50h5M189 50h5" />
        </svg>
      </div>
      <figcaption className="mt-2 font-mono text-xs leading-5 text-muted">
        Stock photo ·{" "}
        <a href={photo.source} className="underline underline-offset-2 focus-ring">
          {photo.photographer} / Pexels
        </a>
      </figcaption>
    </figure>
  );
}
