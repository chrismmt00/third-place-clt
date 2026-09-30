"use client";

import { useEffect, useId, useRef } from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

/**
 * Native <dialog>. Centered from 768px up, bottom sheet below with stacked buttons.
 * Focus starts on the safe (cancel) action. Destructive adds a danger top border + icon.
 * cancelLabel={null} hides the cancel button (for simple notices); Esc still closes.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  confirmVariant,
  confirmIcon,
  busy = false,
  busyLabel,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      (cancelRef.current ?? confirmRef.current)?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={destructive ? "alertdialog" : "dialog"}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel?.();
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) cancels.
        if (e.target === ref.current && !busy) onCancel?.();
      }}
      className={cn(
        "m-0 w-full max-w-none border-0 bg-transparent p-0 text-ink backdrop:bg-scrim",
        "fixed inset-x-0 bottom-0 top-auto md:inset-0 md:m-auto md:h-max md:w-[calc(100%-48px)] md:max-w-[440px]"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 bg-surface px-4 pb-5 pt-6 shadow-lg md:rounded-lg md:p-7",
          "rounded-t-[20px]",
          destructive && "border-t-[6px] border-danger"
        )}
      >
        {destructive && (
          <span aria-hidden="true" className="hidden h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger md:flex">
            <TriangleAlert size={22} />
          </span>
        )}
        <h2 id={titleId} className="m-0 font-display text-2xl leading-[30px] font-bold">
          {title}
        </h2>
        <div className="flex flex-col gap-3 text-base">{children}</div>
        <div className="mt-2 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          {cancelLabel !== null && (
            <Button ref={cancelRef} variant="secondary" size="sheet" onClick={onCancel} disabled={busy}>
              {cancelLabel}
            </Button>
          )}
          <Button
            ref={confirmRef}
            variant={confirmVariant ?? (destructive ? "danger" : "primary")}
            size="sheet"
            icon={confirmIcon}
            loading={busy}
            loadingText={busyLabel}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
