import Link from "next/link";
import { cn } from "@/lib/cn";

const sizes = {
  md: "h-10 px-3.5 text-[15px]",
  lg: "h-11 px-[18px] text-base",
};

/**
 * Pill tab row on a sunken track. Each tab is a link (`href`) or a button (`onSelect`).
 * items: [{ key, label, count?, href? }]
 * fill: true = tabs share the full width; "mobile" = only below 768px.
 */
export function SegmentedTabs({ items, active, onSelect, label, size = "md", fill = false, className, countsOnNarrow = true }) {
  const track = fill === true ? "w-full" : fill === "mobile" ? "w-full md:w-max" : "w-max max-w-full";
  return (
    <div role="tablist" aria-label={label} className={cn("flex gap-1 rounded-md bg-surface-2 p-1", track, className)}>
      {items.map((item) => {
        const selected = item.key === active;
        const classes = cn(
          "flex items-center justify-center gap-1.5 rounded-[9px] no-underline focus-ring-surface",
          sizes[size],
          fill === true && "flex-1 px-1",
          fill === "mobile" && "flex-1 md:flex-none",
          selected ? "bg-surface font-bold text-ink shadow-sm hover:text-ink" : "font-semibold text-muted hover:text-ink"
        );
        const content = (
          <>
            {item.label}
            {item.count !== undefined && (
              <span className={cn("text-[13px]", selected ? "text-muted" : "", !countsOnNarrow && "hidden md:inline")}>{item.count}</span>
            )}
          </>
        );
        return item.href ? (
          <Link key={item.key} href={item.href} role="tab" aria-selected={selected} scroll={false} className={classes}>
            {content}
          </Link>
        ) : (
          <button key={item.key} type="button" role="tab" aria-selected={selected} onClick={() => onSelect?.(item.key)} className={classes}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
