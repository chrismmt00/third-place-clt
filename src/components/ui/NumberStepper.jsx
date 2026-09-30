"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { ErrorText } from "./Field";

/**
 * −/+ stepper with 48px buttons. Controlled via `value` + `onChange(next)`.
 * Pass `name` to also submit the value with a form.
 */
export function NumberStepper({
  id,
  label,
  helper,
  error,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  name,
  decreaseLabel = "Decrease",
  increaseLabel = "Increase",
  valueClassName = "min-w-16",
  editable = false,
  className,
}) {
  const labelId = `${id}-label`;
  const msgId = `${id}-msg`;
  const set = (next) => onChange?.(Math.min(max, Math.max(min, next)));
  const button =
    "flex h-12 w-12 items-center justify-center bg-surface-2 text-ink focus-ring-surface disabled:cursor-not-allowed disabled:text-muted";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span id={labelId} className={cn("text-[15px] font-bold", disabled && "text-muted")}>
        {label}
      </span>
      <div
        role="group"
        id={editable ? undefined : id}
        tabIndex={editable ? undefined : -1}
        aria-labelledby={labelId}
        aria-describedby={error || helper ? msgId : undefined}
        className={cn(
          "flex w-max items-center overflow-hidden rounded-md",
          error ? "border-2 border-danger" : disabled ? "border-[1.5px] border-border text-muted" : "border-[1.5px] border-border-strong"
        )}
      >
        <button type="button" aria-label={decreaseLabel} onClick={() => set(value - step)} disabled={disabled || value <= min} className={button}>
          <Minus size={18} aria-hidden="true" />
        </button>
        {editable ? (
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={Number.isFinite(max) ? max : undefined}
            value={value}
            disabled={disabled}
            aria-labelledby={labelId}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              if (!Number.isNaN(n)) set(n);
            }}
            className={cn(
              "h-12 w-[72px] border-0 bg-transparent text-center font-body text-lg font-bold text-ink [appearance:textfield] focus:outline-none focus-visible:bg-surface-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              disabled && "text-muted"
            )}
          />
        ) : (
          <output aria-live="polite" className={cn("text-center text-lg font-bold", valueClassName)}>
            {value}
          </output>
        )}
        <button type="button" aria-label={increaseLabel} onClick={() => set(value + step)} disabled={disabled || value >= max} className={button}>
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
      {name && <input type="hidden" name={name} value={value} />}
      {error ? (
        <ErrorText id={msgId}>{error}</ErrorText>
      ) : (
        helper && (
          <p id={msgId} className="m-0 text-sm text-muted">
            {helper}
          </p>
        )
      )}
    </div>
  );
}
