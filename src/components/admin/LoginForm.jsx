"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { controlClass, Label } from "@/components/ui/Field";

/** Sign-in form for the `login` Server Action (email + password; generic error on failure). */
export function LoginForm({ action }) {
  const [state, formAction, pending] = useActionState(action, null);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const alertRef = useRef(null);

  useEffect(() => {
    if (state?.error) alertRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <h1 className="m-0 font-display text-[28px] leading-[34px] font-bold">Sign in</h1>

      {state?.error && (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="flex gap-2.5 rounded-md border-2 border-danger bg-danger-soft px-3.5 py-3 text-[15px] leading-[22px] font-semibold text-danger focus-ring-surface"
        >
          <CircleAlert size={18} aria-hidden="true" className="mt-0.5 flex-none" />
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Email</Label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${controlClass(false, false)} h-12 px-3.5`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password">Password</Label>
        <span className="relative flex">
          <input
            id="login-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${controlClass(false, false)} h-12 pl-3.5 pr-14`}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            onClick={() => setShow((s) => !s)}
            className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center rounded-[8px] text-muted focus-ring-surface"
          >
            {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </span>
      </div>

      <Button type="submit" size="xl" loading={pending} loadingText="Signing in…">
        Sign in
      </Button>
      <p className="m-0 text-sm text-muted">Forgot your password? Ask an owner to reset it from the Users page.</p>
    </form>
  );
}
