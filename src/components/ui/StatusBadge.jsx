import {
  Archive,
  CircleCheck,
  CircleX,
  Globe,
  Hourglass,
  Lock,
  Mail,
  MailOpen,
  Pencil,
  Users,
} from "lucide-react";
import { copy } from "@/content/copy";
import { cn } from "@/lib/cn";

const tones = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  ink: "bg-ink text-bg",
  quiet: "border border-border bg-surface-2 text-muted",
  danger: "bg-danger-soft text-danger",
  draft: "border-[1.5px] border-dashed border-border-strong bg-transparent text-muted",
  accent: "bg-accent-soft text-accent",
};

// Event, RSVP and message statuses share the same tones. Icon + words + tint,
// so status never relies on color alone.
const kinds = {
  open: ["success", CircleCheck],
  spots: ["warning", Hourglass],
  full: ["ink", Users],
  closed: ["quiet", Lock],
  cancelled: ["danger", CircleX],
  draft: ["draft", Pencil],
  published: ["accent", Globe],
  going: ["success", CircleCheck],
  rsvpCancelled: ["danger", CircleX],
  new: ["warning", Mail],
  read: ["quiet", MailOpen],
  archived: ["quiet", Archive],
};

export function StatusBadge({ kind = "open", spotsLeft = 0, className }) {
  const [tone, Icon] = kinds[kind] || kinds.open;
  const label = kind === "spots" ? copy.badge.spots(spotsLeft) : copy.badge[kind] || copy.badge.open;
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-body text-[13px] font-bold leading-none",
        tones[tone],
        className
      )}
    >
      <Icon size={14} aria-hidden="true" className="flex-none" />
      {label}
    </span>
  );
}
