"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile in its 300×65 slot. Inside a <form>, the widget adds a hidden
 * `cf-turnstile-response` input, so server actions receive the token with the FormData.
 * `action` must match what the server verifies ("rsvp" or "contact"). Tokens are
 * single-use, so change `resetKey` after every submit attempt.
 * Without NEXT_PUBLIC_TURNSTILE_SITE_KEY it renders a labelled placeholder slot.
 */
export function Turnstile({ onToken, resetKey, action }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const container = useRef(null);
  const widgetId = useRef(null);
  const tokenCallback = useRef(onToken);
  const [ready, setReady] = useState(() => typeof window !== "undefined" && !!window.turnstile);

  useEffect(() => {
    tokenCallback.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !ready || !container.current || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action,
      callback: (token) => tokenCallback.current?.(token),
      "expired-callback": () => tokenCallback.current?.(""),
      "error-callback": () => tokenCallback.current?.(""),
    });
    return () => {
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [ready, siteKey, action]);

  useEffect(() => {
    if (resetKey && widgetId.current !== null) {
      window.turnstile?.reset(widgetId.current);
      tokenCallback.current?.("");
    }
  }, [resetKey]);

  if (!siteKey) {
    return (
      <div
        aria-label="Verification"
        className="flex h-[65px] w-[300px] max-w-full items-center gap-3 rounded-[6px] border-[1.5px] border-dashed border-border-strong bg-surface-2 px-3.5 font-mono text-xs text-muted"
      >
        <ShieldCheck size={20} aria-hidden="true" className="flex-none" />
        Cloudflare Turnstile widget · 300×65
      </div>
    );
  }

  return (
    <>
      <Script id="cf-turnstile" src={SCRIPT_SRC} strategy="afterInteractive" onReady={() => setReady(true)} />
      <div ref={container} className="min-h-[65px] w-[300px] max-w-full" />
    </>
  );
}
