"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * "More actions" menu button. items: [{ label, icon, onSelect, href, danger }]
 * Arrow keys move between items, Esc closes and returns focus to the button.
 */
export function RowMenu({ label, items, className, buttonClassName }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const button = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const menu = wrapper.current?.querySelector('[role="menu"]');
    const entries = () => [...(menu?.querySelectorAll('[role="menuitem"]') ?? [])];
    entries()[0]?.focus();

    const onDown = (e) => wrapper.current && !wrapper.current.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      const list = entries();
      const i = list.indexOf(document.activeElement);
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        list[(i + 1) % list.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        list[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        list[list.length - 1]?.focus();
      } else if (e.key === "Tab") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass = (danger) =>
    cn(
      "flex h-11 w-full items-center gap-2.5 rounded-sm px-3 text-left font-body text-[15px] font-semibold no-underline hover:bg-surface-2 focus:bg-surface-2 focus:outline-none",
      danger ? "text-danger hover:text-danger" : "text-ink hover:text-ink"
    );

  return (
    <div ref={wrapper} className={cn("relative", className)}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-[10px] border-[1.5px] border-border bg-surface text-ink hover:bg-surface-2 focus-ring-surface",
          buttonClassName
        )}
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label={label} className="absolute right-0 top-[calc(100%+6px)] z-20 flex w-[220px] flex-col rounded-md border border-border bg-surface p-1.5 shadow-lg">
          {items.map(({ label: text, icon: Icon, onSelect, href, danger }) =>
            href ? (
              <a key={text} role="menuitem" tabIndex={-1} href={href} className={itemClass(danger)} onClick={() => setOpen(false)}>
                {Icon && <Icon size={18} aria-hidden="true" />}
                {text}
              </a>
            ) : (
              <button
                key={text}
                role="menuitem"
                tabIndex={-1}
                type="button"
                className={itemClass(danger)}
                onClick={() => {
                  setOpen(false);
                  onSelect?.();
                }}
              >
                {Icon && <Icon size={18} aria-hidden="true" />}
                {text}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
