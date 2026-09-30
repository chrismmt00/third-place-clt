import { addAdmin, manageAdmin } from "@/app/actions/auth";
import { getAdminAccount, listAdminUsers } from "@/lib/admin-queries";
import { MobileTopBar } from "@/components/admin/AdminShell";
import { UsersView } from "@/components/admin/UsersView";
import { guard } from "../../guard";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  // listAdminUsers is owners-only; admins are sent back to the overview.
  const [account, users] = await Promise.all([guard(getAdminAccount()), guard(listAdminUsers())]);

  return (
    <>
      <MobileTopBar title="Users" />
      <main className="flex flex-col gap-5 px-4 pb-10 pt-5 md:px-8 lg:px-12 lg:py-9">
        <UsersView
          users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={account.id}
          addAction={addAdmin}
          manageAction={manageAdmin}
        />
      </main>
    </>
  );
}
