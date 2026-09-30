import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NotFoundContent } from "@/components/site/NotFound";
import { site } from "@/content/site";
import { loadSettings, socialsFrom } from "./(site)/site-data";

export const metadata = { title: "Page not found", robots: { index: false } };

// Unmatched URLs render here, outside the (site) layout, so this adds the site chrome itself.
export default async function NotFound() {
  const settings = await loadSettings();
  return (
    <div className="flex min-h-dvh flex-col">
      <Header siteName={settings.siteName} chatUrl={settings.chatUrl} chatLabel={site.chatLabel} />
      <main id="main" className="flex-1">
        <NotFoundContent />
      </main>
      <Footer
        siteName={settings.siteName}
        tagline={site.tagline}
        contactEmail={settings.contactEmail}
        socials={socialsFrom(settings)}
        chatUrl={settings.chatUrl}
        chatLabel={site.chatLabel}
      />
    </div>
  );
}
