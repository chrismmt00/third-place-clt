import { Wordmark } from "@/components/site/Wordmark";

/** Centered card on the cream background, used for sign-in and first-time password setup. */
export function PortalCard({ children }) {
  return (
    <div className="flex min-h-dvh flex-col items-center gap-7 bg-bg px-4 py-12">
      <div className="flex flex-col items-center gap-0.5">
        <Wordmark name="Third Place CLT" className="text-2xl" />
        <span className="text-sm font-semibold text-muted">Client portal</span>
      </div>
      <div className="w-full max-w-[400px] rounded-lg border border-border bg-surface px-5 py-6 shadow-sm">{children}</div>
    </div>
  );
}
