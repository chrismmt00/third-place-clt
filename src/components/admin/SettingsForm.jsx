"use client";

import { useRef, useState } from "react";
import { CircleCheck } from "lucide-react";
import { copy } from "@/content/copy";
import { isEmail, isWebUrl } from "@/lib/validate";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Input } from "@/components/ui/Field";
import { useAction } from "./useAction";

const LINKS = [
  ["instagramUrl", "Instagram", "https://instagram.com/…"],
  ["facebookUrl", "Facebook", "https://facebook.com/…"],
];
const LABELS = { siteName: "Site name", contactEmail: "Contact email", instagramUrl: "Instagram", facebookUrl: "Facebook", chatUrl: "Invite link" };

function Card({ title, note, children }) {
  return (
    <section className="flex flex-col gap-[18px] rounded-lg border border-border bg-surface px-4 py-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="m-0 font-display text-xl font-bold">{title}</h2>
        {note && <span className="text-sm text-muted">{note}</span>}
      </div>
      {children}
    </section>
  );
}

/** Site settings for the `saveSettings` action. Links must be full web addresses or blank. */
export function SettingsForm({ initial, action }) {
  const [run, pending] = useAction(action);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const summaryRef = useRef(null);
  const set = (key) => (e) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!values.siteName.trim()) found.siteName = "Give the site a name.";
    if (values.contactEmail.trim() && !isEmail(values.contactEmail)) found.contactEmail = copy.err.email;
    for (const key of ["instagramUrl", "facebookUrl", "chatUrl"]) {
      if (values[key].trim() && !isWebUrl(values[key])) found[key] = copy.err.url;
    }
    setFormError("");
    setSaved(false);
    if (Object.keys(found).length) {
      setErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    const result = await run({ ...values, siteName: values.siteName.trim(), contactEmail: values.contactEmail.trim() });
    if (result.ok) setSaved(true);
    else if (result.fields) {
      setErrors(result.fields);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } else setFormError(result.error);
  };

  const errorList = Object.entries(errors)
    .filter(([, m]) => m)
    .map(([key, message]) => ({ id: `set-${key}`, message: `${LABELS[key] ?? key}: ${message}` }));
  const summaryTitle = errorList.length === 1 ? "1 thing needs fixing." : `${errorList.length} things need fixing.`;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <ErrorSummary ref={summaryRef} errors={errorList} title={summaryTitle} />
      {formError && <Alert tone="error">{formError}</Alert>}

      <Card title="Site basics">
        <div className="grid gap-4 md:grid-cols-2">
          <Input id="set-siteName" label="Site name" value={values.siteName} onChange={set("siteName")} error={errors.siteName} disabled={pending} />
          <Input
            id="set-contactEmail"
            type="email"
            label="Contact email"
            value={values.contactEmail}
            onChange={set("contactEmail")}
            error={errors.contactEmail}
            helper="Shown in the footer, on Contact and in RSVP confirmations."
            disabled={pending}
          />
        </div>
      </Card>

      <Card title="Social links" note="Leave any blank to hide it from the site.">
        <div className="grid gap-4 md:grid-cols-2">
          {LINKS.map(([key, label, placeholder]) => (
            <Input key={key} id={`set-${key}`} type="url" label={label} placeholder={placeholder} value={values[key]} onChange={set(key)} error={errors[key]} disabled={pending} />
          ))}
        </div>
      </Card>

      <Card title="Community chat">
        <Input
          id="set-chatUrl"
          type="url"
          label="Invite link"
          placeholder="https://…"
          value={values.chatUrl}
          onChange={set("chatUrl")}
          error={errors.chatUrl}
          helper="Used everywhere the “Join the community chat” button appears. Leave blank to hide those buttons."
          disabled={pending}
        />
      </Card>

      <Card title="Defaults for new events" note="Each event can override these.">
        <div className="flex flex-col gap-1">
          <Checkbox id="set-count" label="Show how many people are going" checked={values.showAttendeeCountDefault} onChange={set("showAttendeeCountDefault")} disabled={pending} />
          <Checkbox id="set-names" label="Show names of people who opt in" checked={values.showAttendeeNamesDefault} onChange={set("showAttendeeNamesDefault")} disabled={pending} />
        </div>
      </Card>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Button type="submit" loading={pending} loadingText="Saving…" className="md:px-6">
          Save settings
        </Button>
        {saved && (
          <span role="status" className="flex items-center gap-2 text-[15px] font-semibold text-success">
            <CircleCheck size={18} aria-hidden="true" />
            {copy.settings.saved}
          </span>
        )}
      </div>
    </form>
  );
}
