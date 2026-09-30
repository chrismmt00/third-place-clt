import { CircleAlert, CircleCheck, Clock, Info, ShieldAlert, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const tones = {
  success: ["border-[1.5px] border-success bg-success-soft text-success", CircleCheck],
  error: ["border-2 border-danger bg-danger-soft text-danger", CircleAlert],
  info: ["border-[1.5px] border-accent bg-accent-soft text-accent", Info],
  warning: ["border-[1.5px] border-warning bg-warning-soft text-warning", TriangleAlert],
};

export const alertIcons = { clock: Clock, shield: ShieldAlert };

/**
 * Inline alert. `title` is bold, `children` follows on the same line.
 * role defaults to "alert" for errors and "status" otherwise.
 */
export function Alert({ tone = "info", title, icon, role, className, children }) {
  const [classes, DefaultIcon] = tones[tone];
  const Icon = icon || DefaultIcon;
  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn("flex gap-2.5 rounded-md px-4 py-3.5 text-[15px] leading-[22px]", classes, className)}
    >
      <Icon size={18} aria-hidden="true" className="mt-0.5 flex-none" />
      <span>
        {title && <strong>{title}</strong>} {children}
      </span>
    </div>
  );
}
