"use client";

import { useTransition } from "react";

const OFFLINE = { ok: false, error: "We couldn't reach the server. Check your connection and try again." };

/**
 * Calls a backend Server Action shaped (previousState, FormData) with a plain object.
 * Booleans are sent as "true"/"false"; null/undefined fields are left out.
 * Resolves to the action's { ok, message?, error?, code?, fields? } result.
 */
export function useAction(action) {
  const [pending, startTransition] = useTransition();

  const run = (fields = {}) =>
    new Promise((resolve) => {
      startTransition(async () => {
        const form = new FormData();
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined && value !== null) form.set(key, String(value));
        }
        try {
          resolve((await action(null, form)) ?? { ok: true });
        } catch {
          resolve(OFFLINE);
        }
      });
    });

  return [run, pending];
}
