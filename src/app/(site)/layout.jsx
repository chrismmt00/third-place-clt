import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { site } from "@/content/site";
import { loadSettings, socialsFrom } from "./site-data";

// Event availability and settings change at runtime; never serve a build-time copy.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }) {
  const settings = await loadSettings();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-ink px-4 py-3 font-bold text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 hover:text-bg"
      >
        Skip to content
      </a>
      <Header siteName={settings.siteName} chatUrl={settings.chatUrl} chatLabel={site.chatLabel} />
      <main id="main" className="flex-1">
        {children}
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
