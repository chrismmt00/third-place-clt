import { logout } from "@/app/actions/auth";
import { getAdminAccount, listAdminMessages } from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/AdminShell";
import { guard } from "../guard";

export const metadata = {
  title: { default: "Client portal", template: "%s · Client portal" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const account = await guard(getAdminAccount());

  // A temporary password must be replaced first; the account page shows that form on its own.
  if (account.mustChangePassword) return <div className="min-h-dvh bg-bg">{children}</div>;

  let unread = 0;
  try {
    unread = (await listAdminMessages({ status: "NEW" })).length;
  } catch {
    // The badge is optional; never block the portal on it.
  }

  return (
    <AdminShell account={account} unread={unread} logoutAction={logout}>
      {children}
    </AdminShell>
  );
}
