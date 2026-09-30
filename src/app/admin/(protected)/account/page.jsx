import { changePassword, logout, updateAccount } from "@/app/actions/auth";
import { getAdminAccount } from "@/lib/admin-queries";
import { MobileTopBar, roleLabel } from "@/components/admin/AdminShell";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { AccountForm } from "@/components/admin/AccountForm";
import { PortalCard } from "@/components/admin/PortalCard";
import { guard } from "../../guard";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const account = await guard(getAdminAccount());
  const first = account.name.trim().split(/\s+/)[0];

  if (account.mustChangePassword) {
    return (
      <PortalCard>
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-[26px] leading-8 font-bold">Welcome, {first}. Set your own password.</h1>
            <p className="m-0 text-[15px] leading-[22px] text-muted">You signed in with a temporary password. Choose a new one to continue. After signing in again, you can update your name and login email under Account.</p>
          </div>
          <PasswordForm action={changePassword} forced />
          <form action={logout}>
            <button type="submit" className="flex min-h-11 items-center text-[15px] font-semibold text-primary underline focus-ring-surface">
              Sign out instead
            </button>
          </form>
        </div>
      </PortalCard>
    );
  }

  return (
    <>
      <MobileTopBar title="Account" />
      <main className="flex flex-col gap-5 px-4 py-5 md:px-8 lg:px-12 lg:py-9">
        <div className="flex w-full max-w-[560px] flex-col gap-[18px] rounded-lg border border-border bg-surface p-5 shadow-sm md:p-7">
          <h1 className="m-0 font-display text-[28px] leading-[34px] font-extrabold lg:text-2xl">Your account</h1>
          <p className="m-0 text-[15px] text-muted">
            {account.name} · {account.email} · {roleLabel(account.role)}
          </p>
          <h2 className="m-0 mt-2 font-display text-xl font-bold">Name and login email</h2>
          <AccountForm action={updateAccount} name={account.name} email={account.email} />
          <h2 className="m-0 mt-2 font-display text-xl font-bold">Change password</h2>
          <PasswordForm action={changePassword} />
        </div>
      </main>
    </>
  );
}
