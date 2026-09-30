import Image from "next/image";
import { dateBlock } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Event photo at a fixed aspect ratio, or the accent date block when there's no photo.
 * imageUrl comes ready-made from the server (Cloudflare Images delivery URL).
 */
export function EventImage({ imageUrl, imageAlt, startsAt, className, variant = "card", sizes = "(min-width: 1024px) 400px, 100vw", priority = false }) {
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-2", className)}>
        <Image src={imageUrl} alt={imageAlt || ""} fill sizes={sizes} priority={priority} unoptimized className="object-cover" />
      </div>
    );
  }

  const { month, day, weekday } = dateBlock(startsAt);

  if (variant === "banner") {
    // Short, wide date strip used at the top of the event page on phones.
    return (
      <div aria-hidden="true" className={cn("flex items-end gap-3 bg-accent px-4 py-5 text-on-accent", className)}>
        <span className="font-display text-[56px] leading-[52px] font-extrabold">{day}</span>
        <span className="flex flex-col pb-1 text-[15px] font-bold tracking-[0.08em]">
          {month}
          <span className="font-medium tracking-normal">{weekday}</span>
        </span>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={cn("flex flex-col justify-end bg-accent px-6 py-5 text-on-accent", className)}>
      <span className="text-sm font-bold tracking-[0.12em]">{month}</span>
      <span className="font-display text-[64px] leading-[60px] font-extrabold">{day}</span>
      <span className="text-[15px] font-medium">{weekday}</span>
    </div>
  );
}
