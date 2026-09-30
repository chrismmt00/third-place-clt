import { cn } from "@/lib/cn";
import { ErrorText } from "./Field";

/** Native checkbox with a 44px row, optional description and error. `labelClassName` replaces the label's type style. */
export function Checkbox({ id, label, description, error, disabled, className, labelClassName = "text-base font-semibold", children, ...rest }) {
  const errorId = error ? `${id}-err` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("flex min-h-11 items-start gap-3", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="mt-px h-[22px] w-[22px] flex-none focus-ring-surface"
          {...rest}
        />
        <span className="flex flex-col gap-0.5">
          <span className={cn(labelClassName, disabled && "text-muted")}>{label}</span>
          {description && <span className="text-sm text-muted">{description}</span>}
          {children}
        </span>
      </label>
      {error && (
        <ErrorText id={errorId} className="ml-[34px]">
          {error}
        </ErrorText>
      )}
    </div>
  );
}
