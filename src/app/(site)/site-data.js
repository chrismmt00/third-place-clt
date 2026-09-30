import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { getSiteSettings, defaultSettings } from "@/lib/settings";
import { getPublicEvent, listPublicEvents } from "@/lib/public-events";
import { getEventState } from "@/lib/eventStatus";
import { summaryFrom } from "@/lib/format";

// Page-side helpers for the public site. Data comes only from the backend's
// public queries (lib/settings, lib/public-events).

/** Site settings for this request; falls back to defaults so the chrome still renders if the database is down. */
export const loadSettings = cache(async () => {
  await connection();
  try {
    return await getSiteSettings();
  } catch {
    return { ...defaultSettings };
  }
});

export function socialsFrom(settings) {
  return [
    { label: "Instagram", url: settings.instagramUrl },
    { label: "Facebook", url: settings.facebookUrl },
  ].filter((s) => s.url);
}

/** Keep public content available when event storage is unavailable. */
export async function loadEventListing(options = {}) {
  try {
    const events = await listPublicEvents(options);
    const items = options.past ? [] : await withCardState(events);
    return { available: true, events, items };
  } catch {
    // Database errors may contain connection details; never log or serialize them.
    console.error("Public event listings are unavailable.");
    return { available: false, events: [], items: [] };
  }
}

/**
 * Adds card display state to listPublicEvents() results. The list doesn't carry
 * headcounts, so events with a capacity look up spotsLeft through getPublicEvent().
 */
export async function withCardState(events) {
  return Promise.all(
    events.map(async (event) => {
      let spotsLeft = null;
      const preliminary = getEventState(event, null);
      if (event.capacity !== null && preliminary.phase === "open") {
        spotsLeft = (await getPublicEvent(event.slug))?.spotsLeft ?? null;
      }
      return {
        event: { ...event, summary: summaryFrom(event.description) },
        state: getEventState(event, spotsLeft),
      };
    })
  );
}
