import { NotFoundContent } from "@/components/site/NotFound";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function SiteNotFound() {
  return <NotFoundContent />;
}
