"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronsUpDown,
  ExternalLink,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ToastProvider } from "@/components/ui/Toast";
import { Wordmark } from "@/components/site/Wordmark";

const ShellContext = createContext({ openDrawer: () => {}, account: null });

export const roleLabel = (role) => (role === "OWNER" ? "Owner" : "Admin");
export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const NAV = [
  ["overview", "Overview", "/admin", LayoutDashboard],
  ["events", "Events", "/admin/events", CalendarDays],
  ["messages", "Messages", "/admin/messages", Inbox],
  ["settings", "Settings", "/admin/settings", Settings],
  ["users", "Users", "/admin/users", Users],
];

function activeKey(pathname) {
  if (pathname === "/admin") return "overview";
  return NAV.find(([key]) => key !== "overview" && pathname.startsWith(`/admin/${key}`))?.[0] ?? null;
}

function UserMenu({ account, logoutAction }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => wrapper.current && !wrapper.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      {open && (
        <div role="menu" aria-label="Account" className="absolute bottom-[calc(100%+8px)] left-0 z-20 flex w-[232px] flex-col rounded-md border border-border bg-surface p-1.5 shadow-lg">
          <span className="px-3 pb-2 pt-2.5 text-[13px] text-muted">{account.email}</span>
          <Link
            role="menuitem"
            href="/admin/account"
            onClick={() => setOpen(false)}
            className="flex h-11 items-center gap-2.5 rounded-sm px-3 text-[15px] font-semibold text-ink no-underline hover:bg-surface-2 hover:text-ink focus-ring-surface"
          >
            <KeyRound size={18} aria-hidden="true" />
            Account &amp; password
          </Link>
          <form action={logoutAction}>
            <button
              role="menuitem"
              type="submit"
              className="flex h-11 w-full items-center gap-2.5 rounded-sm px-3 text-left font-body text-[15px] font-semibold text-ink hover:bg-surface-2 focus-ring-surface"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[52px] w-full items-center gap-2.5 rounded-[10px] px-3 py-1.5 text-left font-body text-ink hover:bg-surface-2 focus-ring-surface"
      >
        <span aria-hidden="true" className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-[13px] font-bold text-on-accent">
          {initials(account.name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-bold">{account.name}</span>
          <span className="text-[13px] text-muted">{roleLabel(account.role)}</span>
        </span>
        <ChevronsUpDown size={18} aria-hidden="true" className="text-muted" />
      </button>
    </div>
  );
}

function Sidebar({ account, unread, logoutAction, onNavigate, className }) {
  const pathname = usePathname();
  const active = activeKey(pathname);
  const items = NAV.filter(([key]) => key !== "users" || account.role === "OWNER");

  return (
    <aside className={cn("flex w-64 flex-col border-r border-border bg-surface text-ink", className)}>
      <div className="flex flex-col gap-0.5 px-6 pb-5 pt-6">
        <Wordmark name="Third Place CLT" className="text-xl" />
        <span className="text-[13px] font-semibold text-muted">Client portal</span>
      </div>
      <nav aria-label="Admin" className="flex flex-col gap-0.5 px-3">
        {items.map(([key, label, href, Icon]) => {
          const isActive = key === active;
          const count = key === "messages" && unread > 0 ? unread : null;
          return (
            <Link
              key={key}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] no-underline focus-ring-surface",
                isActive ? "bg-primary-soft font-bold text-primary-hover hover:text-primary-hover" : "font-semibold text-ink hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Icon size={18} aria-hidden="true" className={isActive ? "" : "text-muted"} />
              <span className="flex-1">{label}</span>
              {count && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-[7px] text-xs font-bold text-on-primary">
                  {count}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-sm font-semibold text-muted no-underline hover:bg-surface-2 hover:text-ink focus-ring-surface"
        >
          <ExternalLink size={16} aria-hidden="true" />
          View public site
        </Link>
        <UserMenu account={account} logoutAction={logoutAction} />
      </div>
    </aside>
  );
}

/**
 * Admin chrome: 256px sidebar from 1024px; below that each page shows a
 * <MobileTopBar> whose menu button opens the sidebar as a drawer.
 * account: getAdminAccount() safe fields only.
 */
export function AdminShell({ account, unread = 0, logoutAction, children }) {
  const [drawer, setDrawer] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!drawer) return;
    const root = drawerRef.current;
    root?.querySelector("a[href], button")?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setDrawer(false);
      if (e.key !== "Tab" || !root) return;
      const items = [...root.querySelectorAll("a[href], button:not([disabled])")];
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
  }, [drawer]);

  return (
    <ShellContext.Provider value={{ openDrawer: () => setDrawer(true), account }}>
      <ToastProvider>
        <div className="flex min-h-dvh bg-bg">
          <Sidebar account={account} unread={unread} logoutAction={logoutAction} className="sticky top-0 hidden h-dvh flex-none lg:flex" />
          <div className="min-w-0 flex-1">{children}</div>
        </div>

        {drawer && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-scrim" onClick={() => setDrawer(false)} />
            <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex">
              <Sidebar account={account} unread={unread} logoutAction={logoutAction} onNavigate={() => setDrawer(false)} className="h-full shadow-lg" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
                className="ml-3 mt-3 flex h-12 w-12 items-center justify-center rounded-md bg-surface text-ink shadow-md focus-ring"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </ToastProvider>
    </ShellContext.Provider>
  );
}

/**
 * Phone/tablet top bar. Shows a menu button (or a back link when `back` is set),
 * the page title, and an optional action on the right (defaults to the account avatar).
 */
export function MobileTopBar({ title, back, backLabel = "Back", action, badge }) {
  const { openDrawer, account } = useContext(ShellContext);
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center gap-1 border-b border-border bg-surface px-2 lg:hidden">
      {back ? (
        <Link href={back} aria-label={backLabel} className="flex h-11 w-11 items-center justify-center text-ink focus-ring-surface">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
      ) : (
        <button type="button" aria-label="Open menu" onClick={openDrawer} className="flex h-11 w-11 items-center justify-center text-ink focus-ring-surface">
          <Menu size={22} aria-hidden="true" />
        </button>
      )}
      <span className={cn("min-w-0 truncate font-display text-lg font-bold", !back && "flex-1 text-center")}>{title}</span>
      {badge && <span className="ml-auto mr-2">{badge}</span>}
      {!badge &&
        (action ?? (
          <Link href="/admin/account" aria-label="Account" className={cn("flex h-11 w-11 items-center justify-center focus-ring-surface", back && "ml-auto")}>
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent">
              {initials(account?.name)}
            </span>
          </Link>
        ))}
    </header>
  );
}
