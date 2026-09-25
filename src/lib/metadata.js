import "server-only";
import { getPublicEvent } from "./public-events.js";

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) {
    if (process.env.NODE_ENV === "production") throw new Error("Set NEXT_PUBLIC_SITE_URL to the production origin.");
    return "http://localhost:3000";
  }
  const url = new URL(configured);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid site origin.");
  return url.origin;
}

export async function eventMetadata(slug) {
  const event = await getPublicEvent(slug);
  if (!event) return { title: "Event not found", robots: { index: false, follow: false } };
  const description = event.description.slice(0, 160);
  return {
    title: event.title, description, alternates: { canonical: `${siteOrigin()}/events/${event.slug}` },
    openGraph: { title: event.title, description, ...(event.ogImageUrl ? { images: [{ url: event.ogImageUrl, alt: event.imageAlt }] } : {}) },
  };
}
