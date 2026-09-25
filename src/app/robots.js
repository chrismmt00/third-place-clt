import { siteOrigin } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export default function robots() {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }, sitemap: `${siteOrigin()}/sitemap.xml` };
}
