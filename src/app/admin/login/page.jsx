import { login } from "@/app/actions/auth";
import { PortalCard } from "@/components/admin/PortalCard";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in · Client portal", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <PortalCard>
      <LoginForm action={login} />
    </PortalCard>
  );
}
