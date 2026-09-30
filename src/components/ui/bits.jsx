import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

/** Accent bar showing headcount against capacity. */
export function ProgressBar({ pct, label, height = 8, className }) {
  return (
    <span
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("block overflow-hidden rounded-full bg-surface-2", className)}
      style={{ height }}
    >
      <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
    </span>
  );
}

/** Search box with a leading icon. The input is labelled for screen readers. `tall` = 48px on phones. */
export function SearchField({ label, tall = false, className, ...rest }) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 rounded-[10px] border-[1.5px] border-border-strong bg-surface px-3 focus-within:border-ink focus-within:shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-focus)]",
        tall ? "h-12 md:h-11" : "h-11",
        className
      )}
    >
      <Search size={18} aria-hidden="true" className="flex-none text-muted" />
      <input
        type="search"
        aria-label={label}
        placeholder={label}
        className={cn("min-w-0 flex-1 border-none bg-transparent font-body text-ink outline-none placeholder:text-muted", tall ? "text-base md:text-[15px]" : "text-[15px]")}
        {...rest}
      />
    </label>
  );
}

/** Dashed box for "nothing here yet" states. */
export function EmptyState({ icon: Icon, title, children, action, align = "center", className, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border-[1.5px] border-dashed border-border-strong bg-surface",
        align === "center" ? "items-center px-5 py-10 text-center" : "items-start px-5 py-7",
        className
      )}
    >
      {Icon && <Icon size={32} aria-hidden="true" className="text-muted" />}
      <Heading className="m-0 text-lg font-bold">{title}</Heading>
      {children && <p className="m-0 text-[15px] leading-[22px] text-muted">{children}</p>}
      {action}
    </div>
  );
}

/** Striped stand-in for a photo the client hasn't supplied yet, with a small label. */
export function PhotoPlaceholder({ label, alt, className, light = false, labelClassName }) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("flex items-end p-3 md:p-4", light ? "photo-placeholder-light" : "photo-placeholder", className)}
    >
      {label && (
        <span className={cn("rounded bg-surface px-1.5 py-[3px] font-mono text-[11px] text-muted md:px-2 md:py-1 md:text-xs", labelClassName)}>
          {label}
        </span>
      )}
    </div>
  );
}

/** Inline "[CLIENT COPY]" marker for placeholder text the client still needs to write. `inverse` for dark sections. */
export function ClientCopy({ inverse = false, className }) {
  return (
    <span className={cn("rounded px-1.5 py-0.5 font-mono text-xs", inverse ? "bg-bg text-ink" : "bg-primary-soft text-primary-hover", className)}>
      [CLIENT COPY]
    </span>
  );
}
