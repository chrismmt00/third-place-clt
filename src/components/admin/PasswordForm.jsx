"use client";

import { useRef, useState } from "react";
import { copy } from "@/content/copy";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Input } from "@/components/ui/Field";
import { useAction } from "./useAction";

const MIN = 12;
const FIELD_ORDER = ["currentPassword", "password", "confirmPassword"];

/**
 * Change-password form for the `changePassword` action. `forced` is the
 * first-sign-in variant, where the current password is the temporary one.
 * A successful change signs every session out, so it ends with a link to sign in.
 */
export function PasswordForm({ action, forced = false }) {
  const [run, pending] = useAction(action);
  const [values, setValues] = useState({ currentPassword: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState("");
  const summaryRef = useRef(null);
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success" title="Password changed.">
          {done}
        </Alert>
        <Button href="/admin/login" size="xl">
          Sign in again
        </Button>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.currentPassword) found.currentPassword = forced ? "Enter the temporary password you signed in with." : "Enter your current password.";
    if (values.password.length < MIN) found.password = copy.auth.passwordLength;
    if (values.password !== values.confirmPassword) found.confirmPassword = copy.auth.passwordMatch;
    setFormError("");
    if (Object.keys(found).length) {
      setErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    const result = await run(values);
    if (result.ok) {
      setDone(result.message || "Please sign in again with your new password.");
    } else if (result.fields) {
      setErrors(result.fields);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } else {
      setFormError(result.error);
    }
    setValues((v) => ({ ...v, currentPassword: "", password: "", confirmPassword: "" }));
  };

  const errorList = FIELD_ORDER.filter((k) => errors[k]).map((k) => ({ id: `pw-${k}`, message: errors[k] }));

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
      <ErrorSummary ref={summaryRef} errors={errorList} />
      {formError && <Alert tone="error">{formError}</Alert>}
      <Input
        id="pw-currentPassword"
        type="password"
        autoComplete="current-password"
        label={forced ? "Temporary password" : "Current password"}
        value={values.currentPassword}
        onChange={set("currentPassword")}
        error={errors.currentPassword}
        disabled={pending}
      />
      <Input
        id="pw-password"
        type="password"
        autoComplete="new-password"
        label="New password"
        value={values.password}
        onChange={set("password")}
        error={errors.password}
        helper={forced ? undefined : "At least 12 characters."}
        disabled={pending}
      />
      <Input
        id="pw-confirmPassword"
        type="password"
        autoComplete="new-password"
        label="Type it again"
        value={values.confirmPassword}
        onChange={set("confirmPassword")}
        error={errors.confirmPassword}
        disabled={pending}
      />
      {forced && <p className="m-0 text-sm text-muted">At least 12 characters. A short phrase is easier to remember than a jumble.</p>}
      <Button type="submit" size={forced ? "xl" : "lg"} loading={pending} loadingText="Saving…" className={forced ? "" : "self-start"}>
        {forced ? "Save and continue" : "Update password"}
      </Button>
    </form>
  );
}
