import { cn } from "@/lib/cn";

/** Text wordmark placeholder: the last word of the site name in the primary color. */
export function Wordmark({ name = "Third Place CLT", className }) {
  const words = name.trim().split(/\s+/);
  const last = words.length > 1 ? words.pop() : null;
  return (
    <span className={cn("font-display font-extrabold tracking-[-0.02em]", className)}>
      {words.join(" ")}
      {last && <span className="ml-[0.25em] text-primary">{last}</span>}
    </span>
  );
}
