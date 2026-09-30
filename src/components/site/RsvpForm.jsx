"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowRight, Calendar, CircleCheck, Clock, Hourglass, MapPin, ShieldAlert, UserCheck, Users } from "lucide-react";
import { copy } from "@/content/copy";
import { formatWeekday, formatWhenRange } from "@/lib/format";
import { validateRsvp } from "@/lib/validate";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Input, Textarea } from "@/components/ui/Field";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { Turnstile } from "./Turnstile";

const FIELD_ORDER = ["firstName", "lastName", "email", "phone", "guestCount", "note", "consent"];
const EMPTY = { firstName: "", lastName: "", email: "", phone: "", guestCount: 0, note: "", publicNameConsent: false, consent: false, website: "" };
const card = "rounded-lg border border-border bg-surface p-5 text-ink shadow-sm";

/** Maps the RSVP action's { ok, error, code, fields } result to a form state. */
function toState(result, guestCount) {
  if (result?.ok) return { status: "success" };
  if (result?.fields) return { status: "errors", errors: result.fields };
  switch (result?.code) {
    case "DUPLICATE":
      return { status: "duplicate" };
    case "FULL":
      // With guests, fewer might still fit, so keep the form open.
      return guestCount > 0 ? { status: "error", message: result.error } : { status: "filled" };
    case "CLOSED":
    case "NOT_FOUND":
      return { status: "closed" };
    case "RATE_LIMIT":
      return { status: "limited" };
    case "VERIFICATION":
      return { status: "verifyFailed" };
    default:
      return { status: "error", message: result?.error };
  }
}

/**
 * RSVP card for an event page. `action` is the submitRsvp Server Action.
 * event: { id, startsAt, endsAt, locationName, address, collectPhone, maxGuestsPerRsvp, showAttendeeNames }
 */
export function RsvpForm({ event, action, spotsLeft = null, subline = copy.rsvp.subline, spotsNote, contactEmail, directionsUrl, preview = false, uid = "rsvp" }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: "idle" });
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const summaryRef = useRef(null);

  const maxGuests = Math.max(0, Math.min(event.maxGuestsPerRsvp || 0, spotsLeft === null ? Infinity : spotsLeft - 1));
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const id = (key) => `${uid}-${key}`;
  const { status } = state;

  if (preview) {
    return (
      <div className={`${card} flex flex-col gap-2.5`}>
        <h2 className="m-0 font-display text-2xl font-bold">RSVP</h2>
        <p className="m-0 text-[15px] leading-[22px] text-muted">{copy.rsvp.previewNote}</p>
        <span className="flex h-[52px] items-center justify-center rounded-md bg-border text-[17px] font-bold text-muted">{copy.rsvp.submit}</span>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={card}>
        <div role="status" className="flex flex-col gap-4">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CircleCheck size={28} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h2 className="m-0 font-display text-2xl font-bold">{copy.rsvp.success}</h2>
            <p className="m-0 text-base">{copy.rsvp.successLine(values.firstName.trim() || "friend", values.guestCount)}</p>
          </div>
          <dl className="m-0 flex flex-col gap-3 rounded-md bg-surface-2 p-4">
            <div className="flex gap-2.5">
              <dt className="flex-none">
                <Calendar size={18} aria-label="When" className="mt-[3px] text-accent" />
              </dt>
              <dd className="m-0 text-base font-bold">{formatWhenRange(event.startsAt, event.endsAt)}</dd>
            </div>
            <div className="flex gap-2.5">
              <dt className="flex-none">
                <MapPin size={18} aria-label="Where" className="mt-[3px] text-accent" />
              </dt>
              <dd className="m-0 text-base">
                <strong>{event.locationName}</strong>
                {event.address && (
                  <>
                    <br />
                    {event.address}
                  </>
                )}
                {directionsUrl && (
                  <>
                    <br />
                    <a href={directionsUrl} className="font-semibold underline">
                      {copy.detail.directions}
                    </a>
                  </>
                )}
              </dd>
            </div>
          </dl>
          <p className="m-0 text-[15px] leading-[22px] text-muted">
            Want a reminder? Take a screenshot of this.
            {contactEmail && (
              <>
                {" "}
                If your plans change, email <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a> and we&apos;ll free up your spot.
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className={card}>
        <div role="status" className="flex flex-col gap-3.5">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <UserCheck size={26} />
          </span>
          <h2 className="m-0 font-display text-[26px] leading-8 font-bold">{copy.rsvp.duplicate}</h2>
          <p className="m-0 text-base">
            We found an RSVP with that email, so there&apos;s nothing else to do. See you {formatWeekday(event.startsAt)}.
          </p>
          {contactEmail && (
            <p className="m-0 text-[15px] leading-[22px] text-muted">
              Need to change something? Email <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a>.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === "filled") {
    return (
      <div className={card}>
        <div role="alert" className="flex flex-col gap-3.5">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-warning">
            <Users size={26} />
          </span>
          <h2 className="m-0 font-display text-[26px] leading-8 font-bold">{copy.rsvp.filled}</h2>
          <p className="m-0 text-base">
            Someone grabbed the last spot while you were filling this out. Sorry about that. Your RSVP wasn&apos;t saved.
          </p>
          <Button href="/events" variant="secondary" size="tall" iconRight={ArrowRight}>
            {copy.detail.otherEvents}
          </Button>
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
    const found = validateRsvp(values);
    if (Object.keys(found).length) return showErrors(found);

    setErrors({});
    const form = new FormData();
    form.set("eventId", event.id);
    for (const key of ["firstName", "lastName", "email", "phone", "note", "website"]) form.set(key, values[key]);
    form.set("guestCount", String(values.guestCount));
    form.set("consent", values.consent ? "on" : "");
    form.set("publicNameConsent", values.publicNameConsent ? "on" : "");
    form.set("cf-turnstile-response", token);

    startTransition(async () => {
      let result;
      try {
        result = await action(null, form);
      } catch {
        result = null;
      }
      const next = toState(result, values.guestCount);
      if (next.status === "errors") showErrors(next.errors);
      else setState(next);
      setResetKey((k) => k + 1); // Turnstile tokens are single-use.
    });
  };

  const errorList = FIELD_ORDER.filter((k) => errors[k]).map((k) => ({ id: id(k), message: errors[k] }));
  const busy = pending;

  return (
    <div className={card}>
      <form onSubmit={onSubmit} noValidate aria-labelledby={id("title")} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 id={id("title")} className="m-0 font-display text-[28px] leading-[34px] font-bold">
            RSVP
          </h2>
          <p className="m-0 text-[15px] leading-[22px] text-muted">{subline}</p>
        </div>

        {spotsNote && (
          <p className="m-0 flex items-center gap-2.5 rounded-md bg-warning-soft px-3.5 py-3 text-[15px] leading-[22px] font-semibold text-warning">
            <Hourglass size={18} aria-hidden="true" className="flex-none" />
            {spotsNote}
          </p>
        )}

        <ErrorSummary ref={summaryRef} errors={errorList} />
        {status === "limited" && (
          <Alert tone="error" icon={Clock} title={copy.rsvp.limited}>
            {copy.rsvp.limitedBody}
          </Alert>
        )}
        {status === "verifyFailed" && (
          <Alert tone="error" icon={ShieldAlert} title={copy.rsvp.verify}>
            {copy.rsvp.verifyBody}
          </Alert>
        )}
        {status === "closed" && (
          <Alert tone="error" title="RSVPs just closed for this event.">
            Your RSVP wasn&apos;t saved.
          </Alert>
        )}
        {status === "error" && <Alert tone="error">{state.message || `${copy.toast.saveFail[0]} ${copy.toast.saveFail[1]}`}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          <Input id={id("firstName")} label="First name" autoComplete="given-name" value={values.firstName} onChange={set("firstName")} disabled={busy} error={errors.firstName} />
          <Input id={id("lastName")} label="Last name" autoComplete="family-name" value={values.lastName} onChange={set("lastName")} disabled={busy} error={errors.lastName} />
        </div>
        <Input
          id={id("email")}
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          disabled={busy}
          error={errors.email}
          helper={copy.rsvp.emailHelp}
        />

        {event.collectPhone && (
          <Input
            id={id("phone")}
            type="tel"
            label="Phone"
            optional
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            disabled={busy}
            error={errors.phone}
            helper={copy.rsvp.phoneHelp}
          />
        )}

        {maxGuests > 0 && (
          <NumberStepper
            id={id("guestCount")}
            label="Bringing anyone?"
            value={values.guestCount}
            onChange={(n) => setValues((v) => ({ ...v, guestCount: n }))}
            min={0}
            max={maxGuests}
            disabled={busy}
            error={errors.guestCount}
            helper={copy.rsvp.guestHelp(maxGuests)}
            decreaseLabel="One fewer guest"
            increaseLabel="One more guest"
          />
        )}

        <Textarea
          id={id("note")}
          label="Anything we should know?"
          optional
          rows={3}
          maxLength={500}
          showCount
          value={values.note}
          onChange={set("note")}
          disabled={busy}
          error={errors.note}
          helper={copy.rsvp.noteHelp}
        />

        {event.showAttendeeNames && (
          <Checkbox
            id={id("publicNameConsent")}
            label={copy.rsvp.showName}
            description={copy.rsvp.showNameHelp}
            checked={values.publicNameConsent}
            onChange={set("publicNameConsent")}
            disabled={busy}
          />
        )}

        <Checkbox
          id={id("consent")}
          checked={values.consent}
          onChange={set("consent")}
          disabled={busy}
          error={errors.consent}
          labelClassName="text-[15px] leading-[22px]"
          label={
            <>
              {copy.rsvp.consent} <Link href="/privacy" className="underline">Privacy policy</Link>
            </>
          }
        />

        {/* Honeypot: hidden from people, tempting to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("website")}>Website</label>
          <input id={id("website")} tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </div>

        <Turnstile action="rsvp" onToken={setToken} resetKey={resetKey} />

        <Button type="submit" size="xl" loading={busy} loadingText={copy.rsvp.submitting}>
          {copy.rsvp.submit}
        </Button>
      </form>
    </div>
  );
}
