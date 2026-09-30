"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Menu, MessageCircle, X } from "lucide-react";
import { copy } from "@/content/copy";
import { cn } from "@/lib/cn";
import { Wordmark } from "./Wordmark";

const NAV = [
  ["home", "Home", "/"],
  ["about", "About", "/about"],
  ["events", "Events", "/events"],
  ["contact", "Contact", "/contact"],
];

function activeKey(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "contact";
  return null;
}

/**
 * Desktop nav + "See Events" from 1024px. Below that, a 48px menu button opens a
 * full-screen panel: focus stays inside, Esc closes it.
 */
export function Header({ siteName, chatUrl, chatLabel }) {
  const pathname = usePathname();
  const active = activeKey(pathname);
  const [open, setOpen] = useState(false);
  const panel = useRef(null);
  const menuButton = useRef(null);
  const wasOpen = useRef(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) menuButton.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const root = panel.current;
    const focusables = () => [...root.querySelectorAll("a[href], button:not([disabled])")];
    focusables()[0]?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const homeLink = (size) => (
    <Link
      href="/"
      aria-label={`${siteName}, home`}
      onClick={close}
      className={cn("flex min-h-11 items-center text-ink no-underline focus-ring hover:text-ink", size)}
    >
      <Wordmark name={siteName} />
    </Link>
  );

  return (
    <>
      <header className="border-b border-border bg-bg">
        {/* Desktop */}
        <div className="hidden h-20 items-center justify-between gap-6 px-12 lg:flex">
          {homeLink("text-[22px]")}
          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV.map(([key, label, href]) =>
              key === active ? (
                <Link
                  key={key}
                  href={href}
                  aria-current="page"
                  className="flex h-11 items-center px-3.5 text-base font-bold text-ink underline decoration-primary decoration-[3px] underline-offset-[10px] focus-ring hover:text-ink"
                >
                  {label}
                </Link>
              ) : (
                <Link
                  key={key}
                  href={href}
                  className="flex h-11 items-center px-3.5 text-base font-semibold text-muted no-underline focus-ring hover:text-ink"
                >
                  {label}
                </Link>
              )
            )}
            <Link
              href="/events"
              className="ml-3 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-base font-bold text-on-primary no-underline focus-ring hover:bg-primary-hover hover:text-on-primary"
            >
              {copy.nav.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </nav>
        </div>

        {/* Mobile, closed */}
        <div className="flex h-16 items-center justify-between pl-4 pr-3 lg:hidden">
          {homeLink("text-xl")}
          <button
            ref={menuButton}
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-md border-[1.5px] border-border bg-surface text-ink focus-ring"
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile, open */}
      {open && (
        <div ref={panel} id="mobile-menu" className="fixed inset-0 z-50 overflow-y-auto bg-bg lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-border pl-4 pr-3">
            {homeLink("text-xl")}
            <button
              type="button"
              aria-label="Close menu"
              aria-expanded="true"
              aria-controls="mobile-menu"
              onClick={() => setOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-md border-[1.5px] border-ink bg-ink text-bg focus-ring"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Main" className="flex flex-col px-4 pb-6 pt-3">
            {NAV.map(([key, label, href]) => (
              <Link
                key={key}
                href={href}
                onClick={close}
                aria-current={key === active ? "page" : undefined}
                className="flex min-h-[60px] items-center justify-between border-b border-border font-display text-[26px] font-bold text-ink no-underline focus-ring hover:text-ink"
              >
                {label}
                <ChevronRight size={20} aria-hidden="true" className="text-muted" />
              </Link>
            ))}
            <Link
              href="/events"
              onClick={close}
              className="mt-6 flex h-[52px] items-center justify-center gap-2 rounded-md bg-primary text-[17px] font-bold text-on-primary no-underline focus-ring hover:bg-primary-hover hover:text-on-primary"
            >
              {copy.nav.cta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {chatUrl && (
              <a
                href={chatUrl}
                className="mt-2 flex min-h-12 items-center justify-center gap-2 text-base font-semibold text-primary focus-ring"
              >
                <MessageCircle size={18} aria-hidden="true" />
                {chatLabel || copy.chat.defaultLabel}
              </a>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
