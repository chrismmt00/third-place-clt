import { ChevronDown, CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

// Field anatomy: 15px bold label, 48px control with 16px text and a 1.5px
// border-strong edge, helper below. Errors replace the helper, add an icon and
// thicken the border to 2px danger.

export const controlClass = (error, disabled) =>
  cn(
    "w-full rounded-[10px] font-body text-base placeholder:text-muted field-focus",
    error ? "border-2 border-danger" : disabled ? "border-[1.5px] border-border" : "border-[1.5px] border-border-strong",
    disabled ? "bg-surface-2 text-muted" : "bg-surface text-ink"
  );

export function Label({ htmlFor, id, optional, disabled, className, children }) {
  const Tag = htmlFor ? "label" : "span";
  return (
    <Tag htmlFor={htmlFor} id={id} className={cn("text-[15px] font-bold", disabled && "text-muted", className)}>
      {children}
      {optional && <span className="font-medium text-muted"> (optional)</span>}
    </Tag>
  );
}

export function ErrorText({ id, className, children }) {
  if (!children) return null;
  return (
    <p id={id} className={cn("m-0 flex items-start gap-1.5 text-sm font-semibold text-danger", className)}>
      <CircleAlert size={16} aria-hidden="true" className="mt-0.5 flex-none" />
      <span>{children}</span>
    </p>
  );
}

export function HelperText({ id, children, count, max }) {
  if (!children && max === undefined) return null;
  return (
    <p id={id} className="m-0 flex justify-between gap-3 text-sm text-muted">
      <span>{children}</span>
      {max !== undefined && (
        <span aria-live="polite">
          {count}/{max}
        </span>
      )}
    </p>
  );
}

/** Shared wrapper: label, control, then error or helper (+ optional n/max counter). */
function FieldShell({ id, label, optional, helper, error, disabled, count, maxLength, className, children }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} optional={optional} disabled={disabled}>
        {label}
      </Label>
      {children}
      {error ? (
        <ErrorText id={`${id}-msg`}>{error}</ErrorText>
      ) : (
        <HelperText id={`${id}-msg`} count={count} max={maxLength}>
          {helper}
        </HelperText>
      )}
    </div>
  );
}

const describedBy = (id, error, helper, maxLength) => (error || helper || maxLength !== undefined ? `${id}-msg` : undefined);

export function Input({ id, label, optional, helper, error, disabled, className, inputClassName, showCount, ...rest }) {
  const count = showCount ? String(rest.value ?? "").length : undefined;
  return (
    <FieldShell
      id={id}
      label={label}
      optional={optional}
      helper={helper}
      error={error}
      disabled={disabled}
      count={count}
      maxLength={showCount ? rest.maxLength : undefined}
      className={className}
    >
      <input
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, helper, showCount ? rest.maxLength : undefined)}
        className={cn(controlClass(error, disabled), "h-12 px-3.5", inputClassName)}
        {...rest}
      />
    </FieldShell>
  );
}

export function Textarea({ id, label, optional, helper, error, disabled, className, inputClassName, showCount, rows = 3, ...rest }) {
  const count = showCount ? String(rest.value ?? "").length : undefined;
  return (
    <FieldShell
      id={id}
      label={label}
      optional={optional}
      helper={helper}
      error={error}
      disabled={disabled}
      count={count}
      maxLength={showCount ? rest.maxLength : undefined}
      className={className}
    >
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, helper, showCount ? rest.maxLength : undefined)}
        className={cn(controlClass(error, disabled), "resize-y px-3.5 py-3 leading-6", inputClassName)}
        {...rest}
      />
    </FieldShell>
  );
}

export function Select({ id, label, optional, helper, error, disabled, className, children, ...rest }) {
  return (
    <FieldShell id={id} label={label} optional={optional} helper={helper} error={error} disabled={disabled} className={className}>
      <span className="relative flex">
        <select
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, helper)}
          className={cn(controlClass(error, disabled), "h-12 appearance-none pl-3.5 pr-10")}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown size={18} aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
      </span>
    </FieldShell>
  );
}
