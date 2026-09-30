"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

const ToastContext = createContext(null);
const icons = { success: CircleCheck, error: CircleAlert, info: Info };
const AUTO_DISMISS_MS = 6000;

/**
 * Admin toasts. Bottom-right from 1024px, bottom-center below, in a polite live
 * region. Success and info dismiss after 6 seconds; errors stay until closed.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ tone = "success", title, body }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list, { id, tone, title, body }]);
      if (tone !== "error") timers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 lg:items-end lg:p-6"
      >
        {toasts.map((t) => {
          const Icon = icons[t.tone] || Info;
          return (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-[440px] items-center gap-3 rounded-md bg-ink py-3 pl-4 pr-2 text-bg shadow-md"
            >
              <Icon size={20} aria-hidden="true" className="flex-none" />
              <span className="flex-1 text-[15px] leading-[22px]">
                <strong>{t.title}</strong> {t.body}
              </span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-md text-bg focus-visible:outline-2 focus-visible:outline-bg"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** const toast = useToast(); toast({ tone: "success", title: "Draft saved.", body: "…" }) */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
