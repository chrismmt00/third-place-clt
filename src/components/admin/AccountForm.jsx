"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Input } from "@/components/ui/Field";
import { useAction } from "./useAction";

export function AccountForm({ action, name, email }) {
  const [run, pending] = useAction(action);
  const [values, setValues] = useState({ name, email, currentPassword: "" });
  const [result, setResult] = useState(null);
  const summary = useRef(null);
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  if (result?.ok) return (
    <div className="flex flex-col gap-4">
      <Alert tone="success" title="Account updated.">{result.message}</Alert>
      <Button href="/admin/login" size="lg">Sign in again</Button>
    </div>
  );

  async function submit(event) {
    event.preventDefault();
    const next = await run(values);
    setResult(next);
    setValues((current) => ({ ...current, currentPassword: "" }));
    if (!next.ok) requestAnimationFrame(() => summary.current?.focus());
  }

  const errors = result?.fields || {};
  const errorList = Object.entries(errors).map(([key, message]) => ({ id: `account-${key}`, message }));
  return (
    <form onSubmit={submit} className="flex flex-col gap-[18px]">
      <ErrorSummary ref={summary} errors={errorList} />
      {result?.error && <div ref={errorList.length ? undefined : summary} tabIndex={-1}><Alert tone="error">{result.error}</Alert></div>}
      <Input id="account-name" label="Your name" name="name" autoComplete="name" required maxLength={100} value={values.name} onChange={set("name")} error={errors.name} disabled={pending} />
      <Input id="account-email" label="Login email" name="email" type="email" autoComplete="username" required maxLength={254} value={values.email} onChange={set("email")} error={errors.email} disabled={pending} helper="Use this email next time you sign in. This does not change the public contact address in Settings." />
      <Input id="account-currentPassword" label="Confirm your current password" name="currentPassword" type="password" autoComplete="current-password" required value={values.currentPassword} onChange={set("currentPassword")} error={errors.currentPassword} disabled={pending} />
      <p className="m-0 text-sm text-muted">Saving signs out your existing sessions. Double-check your email before continuing.</p>
      <Button type="submit" size="lg" loading={pending} loadingText="Saving…" className="self-start">Save account details</Button>
    </form>
  );
}
