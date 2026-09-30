"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { CircleCheck, Clock, ShieldAlert } from "lucide-react";
import { copy } from "@/content/copy";
import { validateContact } from "@/lib/validate";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Input, Textarea } from "@/components/ui/Field";
import { Turnstile } from "./Turnstile";

const EMPTY = { name: "", email: "", subject: "", message: "", consent: false, website: "" };
const FIELD_ORDER = ["name", "email", "subject", "message", "consent"];

/** Contact card. `action` is the submitContact Server Action. */
export function ContactForm({ action, contactEmail, uid = "contact" }) {
  const [values, setValues] = useState(EMPTY);
  const [sentTo, setSentTo] = useState("");
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: "idle" });
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const summaryRef = useRef(null);
  const id = (key) => `${uid}-${key}`;
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const { status } = state;

  const card = "rounded-lg border border-border bg-surface p-5 text-ink shadow-sm";

  if (status === "success") {
    return (
      <div className={card}>
        <div role="status" className="flex flex-col gap-3.5">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CircleCheck size={28} />
          </span>
          <h2 className="m-0 font-display text-[28px] leading-[34px] font-bold">{copy.contact.successTitle}</h2>
          <p className="m-0 text-base">
            Someone from our team will reply to <strong>{sentTo}</strong>. {copy.contact.successReplyTime}
          </p>
          <button
            type="button"
            onClick={() => setState({ status: "idle" })}
            className="flex h-11 items-center gap-2 self-start px-1 text-base font-bold text-primary underline underline-offset-[3px] focus-ring-surface hover:text-primary-hover"
          >
            {copy.contact.again}
          </button>
        </div>
      </div>
    );
  }

  const showErrors = (found) => {
    setErrors(found);
    setState({ status: "errors" });
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validateContact(values);
    if (Object.keys(found).length) return showErrors(found);

    setErrors({});
    const form = new FormData();
    for (const key of ["name", "email", "subject", "message", "website"]) form.set(key, values[key]);
    form.set("consent", values.consent ? "on" : "");
    form.set("cf-turnstile-response", token);

    startTransition(async () => {
      let result;
      try {
        result = await action(null, form);
      } catch {
        result = null;
      }
      if (result?.ok) {
        setSentTo(values.email.trim());
        setValues(EMPTY);
        setState({ status: "success" });
      } else if (result?.fields) {
        showErrors(result.fields);
      } else if (result?.code === "RATE_LIMIT") {
        setState({ status: "limited" });
      } else if (result?.code === "VERIFICATION") {
        setState({ status: "verifyFailed" });
      } else {
        setState({ status: "error", message: result?.error });
      }
      setResetKey((k) => k + 1); // Turnstile tokens are single-use.
    });
  };

  const errorList = FIELD_ORDER.filter((k) => errors[k]).map((k) => ({ id: id(k), message: errors[k] }));
  const busy = pending;

  return (
    <div className={card}>
      <form onSubmit={onSubmit} noValidate aria-label="Contact form" className="flex flex-col gap-[18px]">
        <ErrorSummary ref={summaryRef} errors={errorList} />
        {status === "limited" && (
          <Alert tone="error" icon={Clock} title={copy.contact.limited}>
            {contactEmail ? copy.contact.limitedBody(contactEmail) : "Please wait a few minutes and try again."}
          </Alert>
        )}
        {status === "verifyFailed" && (
          <Alert tone="error" icon={ShieldAlert} title={copy.rsvp.verify}>
            Please complete the check below and send your message again.
          </Alert>
        )}
        {status === "error" && <Alert tone="error">{state.message || `${copy.toast.saveFail[0]} ${copy.toast.saveFail[1]}`}</Alert>}

        <Input id={id("name")} label="Your name" autoComplete="name" value={values.name} onChange={set("name")} disabled={busy} error={errors.name} />
        <Input id={id("email")} type="email" label="Email" autoComplete="email" value={values.email} onChange={set("email")} disabled={busy} error={errors.email} />
        <Input id={id("subject")} label="Subject" value={values.subject} onChange={set("subject")} disabled={busy} error={errors.subject} />
        <Textarea id={id("message")} label="Message" rows={5} value={values.message} onChange={set("message")} disabled={busy} error={errors.message} />

        <Checkbox
          id={id("consent")}
          checked={values.consent}
          onChange={set("consent")}
          disabled={busy}
          error={errors.consent}
          labelClassName="text-[15px] leading-[22px]"
          label={
            <>
              {copy.contact.consent} <Link href="/privacy" className="underline">Privacy policy</Link>
            </>
          }
        />

        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("website")}>Website</label>
          <input id={id("website")} tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </div>

        <Turnstile action="contact" onToken={setToken} resetKey={resetKey} />

        <Button type="submit" size="xl" loading={busy} loadingText={copy.contact.submitting}>
          {copy.contact.submit}
        </Button>
      </form>
    </div>
  );
}
