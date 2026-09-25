import { db } from "@/lib/prisma-db";
import { publicEventWhere } from "@/lib/public-events";
import { siteOrigin } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export default async function sitemap() {
  const origin = siteOrigin();
  const events = await db.event.findMany({ where: publicEventWhere, select: { slug: true, updatedAt: true }, take: 49000 });
  return [
    ...["", "/about", "/events", "/contact", "/privacy"].map(path => ({ url: origin + path })),
    ...events.map(event => ({ url: `${origin}/events/${event.slug}`, lastModified: event.updatedAt })),
  ];
}
