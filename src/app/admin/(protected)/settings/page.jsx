import { saveSettings } from "@/app/actions/contact";
import { getAdminAccount } from "@/lib/admin-queries";
import { getSiteSettings } from "@/lib/settings";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { guard } from "../../guard";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await guard(getAdminAccount());
  const settings = await getSiteSettings();

  return (
    <>
      <MobileTopBar title="Settings" />
      <main className="flex max-w-[960px] flex-col gap-5 px-4 pb-10 pt-5 md:px-8 lg:px-12 lg:py-9">
        <h1 className="m-0 hidden font-display text-[36px] leading-[42px] font-extrabold md:block">Settings</h1>
        <h1 className="sr-only md:hidden">Settings</h1>
        <SettingsForm
          action={saveSettings}
          initial={{
            siteName: settings.siteName,
            contactEmail: settings.contactEmail,
            instagramUrl: settings.instagramUrl,
            facebookUrl: settings.facebookUrl,
            chatUrl: settings.chatUrl,
            showAttendeeCountDefault: settings.showAttendeeCountDefault,
            showAttendeeNamesDefault: settings.showAttendeeNamesDefault,
          }}
        />
      </main>
    </>
  );
}
