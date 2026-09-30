import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-bold no-underline transition-colors focus-ring disabled:cursor-not-allowed";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover hover:text-on-primary",
  secondary: "border-[1.5px] border-ink bg-surface text-ink hover:bg-surface-2 hover:text-ink",
  ghost: "bg-transparent text-primary hover:bg-primary-soft hover:text-primary-hover",
  danger: "bg-danger text-on-primary hover:bg-danger-hover hover:text-on-primary",
};

// Loading keeps the pressed tone; disabled goes flat.
const loadingTone = {
  primary: "bg-primary-hover text-on-primary",
  secondary: "border-[1.5px] border-ink bg-surface-2 text-ink",
  ghost: "bg-primary-soft text-primary-hover",
  danger: "bg-danger-hover text-on-primary",
};

const disabledTone = {
  primary: "bg-border text-muted",
  secondary: "border-[1.5px] border-border bg-surface text-muted",
  ghost: "bg-transparent text-muted",
  danger: "bg-border text-muted",
};

// [height + text, horizontal padding]
const sizes = {
  md: ["h-11 text-base", "px-[18px]"],
  lg: ["h-12 text-base", "px-5"],
  xl: ["h-[52px] text-[17px]", "px-6"],
  tall: ["h-[52px] text-base", "px-6"],
  // Bottom-sheet buttons: full 52px on phones, 44px in the centered dialog.
  sheet: ["h-[52px] text-base md:h-11", "px-[18px]"],
};

/**
 * variant: primary | secondary | ghost | danger
 * size: md 44 | lg 48 | xl 52 (17px) | tall 52 (16px) | sheet (52 on phones, 44 from 768)
 * Pass `href` to render a Link. `loading` shows a spinner and `loadingText`.
 */
export function Button({
  variant = "primary",
  size = "lg",
  href,
  loading = false,
  loadingText,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  iconSize = 18,
  className,
  children,
  type = "button",
  ...rest
}) {
  const tone = loading ? loadingTone[variant] : disabled ? disabledTone[variant] : variants[variant];
  const [box, padding] = sizes[size];
  const classes = cn(base, box, variant === "ghost" ? "px-4" : padding, tone, loading && "cursor-progress", className);
  const content = (
    <>
      {loading ? (
        <LoaderCircle size={20} aria-hidden="true" className="animate-spin" />
      ) : (
        Icon && <Icon size={iconSize} aria-hidden="true" />
      )}
      {loading && loadingText ? loadingText : children}
      {!loading && IconRight && <IconRight size={iconSize} aria-hidden="true" />}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
