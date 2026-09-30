import Image from "next/image";
import { cn } from "@/lib/cn";

/** Licensed editorial stock imagery; captions distinguish it from meetup photos. */
export function CommunityPhoto({ photo, className, imageClassName, eager = false }) {
  return (
    <figure className={cn("m-0 min-w-0", className)}>
      <div className={cn("relative overflow-hidden rounded-lg bg-surface-2 lg:rounded-[20px]", imageClassName)}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1280px) 600px, (min-width: 1024px) 45vw, 100vw"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover"
        />
      </div>
      <figcaption className="mt-2 text-xs leading-5 text-muted">
        Stock photo · {" "}
        <a href={photo.source} className="rounded underline underline-offset-2 focus-ring">
          {photo.photographer} / Pexels
        </a>
      </figcaption>
    </figure>
  );
}
