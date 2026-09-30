"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Ban, Copy, Eye, EyeOff, Trash2, TriangleAlert, Users } from "lucide-react";
import { copy } from "@/content/copy";
import { formatRelative } from "@/lib/format";
import { isWebUrl } from "@/lib/validate";
import { adminBadge } from "@/lib/eventStatus";
import { cn } from "@/lib/cn";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorSummary } from "@/components/ui/ErrorSummary";
import { Input, Textarea } from "@/components/ui/Field";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { useToast } from "@/components/ui/Toast";
import { ImageUploader } from "./ImageUploader";
import { useAction } from "./useAction";
import { useEventOps } from "./useEventOps";

const FIELD_IDS = {
  title: "ev-title",
  description: "ev-description",
  startsAt: "ev-startsAt",
  endsAt: "ev-endsAt",
  rsvpDeadline: "ev-rsvpDeadline",
  locationName: "ev-locationName",
  address: "ev-address",
  mapUrl: "ev-mapUrl",
  imageId: "event-image",
  imageAlt: "event-image-alt",
  capacity: "ev-capacity",
  maxGuestsPerRsvp: "ev-maxGuestsPerRsvp",
};
const DATE_FIELDS = ["startsAt", "endsAt", "rsvpDeadline"];

function validate(v, headcount) {
  const e = {};
  if (!v.title.trim()) e.title = copy.err.title;
  if (!v.description.trim()) e.description = "Add a description.";
  if (!v.startsAt) e.startsAt = copy.err.start;
  if (!v.endsAt) e.endsAt = "Pick an end date and time.";
  else if (v.startsAt && v.endsAt <= v.startsAt) e.endsAt = copy.err.end;
  if (v.rsvpDeadline && v.startsAt && v.rsvpDeadline > v.startsAt) e.rsvpDeadline = "The RSVP deadline can't be after the start.";
  if (!v.locationName.trim()) e.locationName = copy.err.location;
  if (!v.address.trim()) e.address = copy.err.address;
  if (v.mapUrl.trim() && !isWebUrl(v.mapUrl)) e.mapUrl = copy.err.url;
  if (v.imageId && !v.imageAlt.trim()) e.imageAlt = copy.err.alt;
  if (!v.unlimited && v.capacity < Math.max(1, headcount)) e.capacity = headcount > 0 ? copy.err.capacity(headcount) : "Capacity must be at least 1.";
  return e;
}

/** A card-styled <fieldset>; the floated legend sits inside the card. */
function Section({ title, aside, children }) {
  return (
    <fieldset className="m-0 min-w-0 rounded-lg border border-border bg-surface px-4 py-5 md:p-6">
      <legend className="float-left mb-4 flex w-full items-baseline justify-between p-0 md:mb-[18px]">
        <span className="font-display text-xl font-bold">{title}</span>
        {aside && <span className="text-sm font-normal text-muted">{aside}</span>}
      </legend>
      <div className="clear-both flex flex-col gap-4 md:gap-[18px]">{children}</div>
    </fieldset>
  );
}

/** Earlier/later picker for a wall time that happens twice when clocks fall back. */
function Occurrence({ field, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold">This time happens twice when the clocks change. Which one?</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name={`${field}Occurrence`}
        className="h-11 rounded-[10px] border-[1.5px] border-border-strong bg-surface px-3 font-body text-base field-focus"
      >
        <option value="reject">Choose…</option>
        <option value="earlier">The first one (daylight time)</option>
        <option value="later">The second one (standard time)</option>
      </select>
    </label>
  );
}

/**
 * New / edit event. initial: event fields with Eastern "YYYY-MM-DDTHH:mm" dates.
 * meta (edit only): { status, slug, updatedAt, headcount, rsvpCount }
 * saveAction = saveEventDraft, statusAction = updateEventStatus.
 */
export function EventForm({ mode, initial, meta, imageUrl, siteHost, saveAction, statusAction }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = mode === "new";
  const headcount = meta?.headcount ?? 0;
  const status = meta?.status ?? "DRAFT";

  const toValues = (src) => ({
    title: src.title ?? "",
    description: src.description ?? "",
    startsAt: src.startsAt ?? "",
    endsAt: src.endsAt ?? "",
    rsvpDeadline: src.rsvpDeadline ?? "",
    startsAtOccurrence: "reject",
    endsAtOccurrence: "reject",
    rsvpDeadlineOccurrence: "reject",
    locationName: src.locationName ?? "",
    address: src.address ?? "",
    mapUrl: src.mapUrl ?? "",
    imageId: src.imageId ?? "",
    imageAlt: src.imageAlt ?? "",
    unlimited: src.capacity == null,
    capacity: src.capacity ?? Math.max(30, headcount),
    rsvpEnabled: src.rsvpEnabled ?? true,
    collectPhone: src.collectPhone ?? false,
    maxGuestsPerRsvp: src.maxGuestsPerRsvp ?? 0,
    showAttendeeCount: !!src.showAttendeeCount,
    showAttendeeNames: !!src.showAttendeeNames,
  });

  const [values, setValues] = useState(() => toValues(initial));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toValues(initial)));
  const [preview, setPreview] = useState(imageUrl || null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [leaveTo, setLeaveTo] = useState(null);
  const summaryRef = useRef(null);
  const [save, saving] = useAction(saveAction);
  const [changeStatus, changing] = useAction(statusAction);
  const ops = useEventOps(statusAction, { onDeleted: () => router.push("/admin/events") });

  const dirty = JSON.stringify(values) !== baseline;
  const busy = saving || changing;
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  // Warn before closing the tab or following a link with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(url.pathname + url.search);
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const showErrors = (found) => {
    setErrors(found);
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  /** Validates and saves. Resolves to the saved event id, or null on failure. */
  const persist = async () => {
    setFormError("");
    const found = validate(values, headcount);
    if (Object.keys(found).length) {
      showErrors(found);
      return null;
    }
    setErrors({});
    const result = await save({
      ...(isNew ? {} : { id: initial.id }),
      title: values.title,
      description: values.description,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      rsvpDeadline: values.rsvpDeadline,
      startsAtOccurrence: values.startsAtOccurrence,
      endsAtOccurrence: values.endsAtOccurrence,
      rsvpDeadlineOccurrence: values.rsvpDeadlineOccurrence,
      locationName: values.locationName,
      address: values.address,
      mapUrl: values.mapUrl.trim(),
      imageId: values.imageId,
      imageAlt: values.imageId ? values.imageAlt : "",
      capacity: values.unlimited ? "" : values.capacity,
      rsvpEnabled: values.rsvpEnabled,
      collectPhone: values.collectPhone,
      maxGuestsPerRsvp: values.maxGuestsPerRsvp,
      showAttendeeCount: values.showAttendeeCount,
      showAttendeeNames: values.showAttendeeNames,
    });
    if (result.ok) {
      setBaseline(JSON.stringify(values));
      return result.id;
    }
    if (result.fields) showErrors(result.fields);
    else {
      setFormError(result.error);
      toast({ tone: "error", title: copy.toast.saveFail[0], body: result.error || copy.toast.saveFail[1] });
    }
    return null;
  };

  const onSave = async () => {
    const id = await persist();
    if (!id) return;
    if (isNew) {
      toast({ tone: "success", title: copy.toast.draft[0], body: copy.toast.draft[1] });
      router.replace(`/admin/events/${id}`);
    } else {
      toast({ tone: "success", title: copy.toast.saved[0], body: status === "PUBLISHED" ? copy.toast.saved[1] : "" });
      router.refresh();
    }
  };

  const onPublish = async () => {
    const id = dirty || isNew ? await persist() : initial.id;
    if (!id) return;
    const result = await changeStatus({ id, operation: "publish" });
    if (result.ok) {
      toast({ tone: "success", title: copy.toast.published[0], body: copy.toast.published[1] });
      if (isNew) router.replace(`/admin/events/${id}`);
      else router.refresh();
    } else {
      toast({ tone: "error", title: "Couldn't publish.", body: result.error });
      if (isNew) router.replace(`/admin/events/${id}`);
    }
  };

  const errorList = Object.entries(errors)
    .filter(([, message]) => message)
    .map(([key, message]) => ({ id: FIELD_IDS[key] ?? FIELD_IDS.title, message }));
  const eventForOps = { id: initial.id, title: values.title || initial.title, status, _count: { rsvps: meta?.rsvpCount ?? 0 } };
  const spotsLeft = values.unlimited ? null : Math.max(0, values.capacity - headcount);
  const showPublish = isNew || status !== "PUBLISHED";

  const sideActions = isNew
    ? []
    : [
        { label: "Duplicate", icon: Copy, onClick: () => ops.run("duplicate", eventForOps) },
        status === "PUBLISHED" && { label: "Unpublish", icon: EyeOff, onClick: () => ops.run("unpublish", eventForOps) },
        status === "PUBLISHED" && { label: "Cancel event", icon: Ban, danger: true, onClick: () => ops.run("cancel", eventForOps) },
        { label: "Delete", icon: Trash2, danger: true, onClick: () => ops.run("delete", eventForOps) },
      ].filter(Boolean);

  const dateInput = (field, label, extra = {}) => (
    <div className="flex flex-col gap-2">
      <Input
        id={FIELD_IDS[field]}
        type="datetime-local"
        label={label}
        value={values[field]}
        onChange={set(field)}
        error={errors[field]}
        disabled={busy}
        {...extra}
      />
      {errors[field] && /earlier|later|twice|repeated/i.test(errors[field]) && (
        <Occurrence field={field} value={values[`${field}Occurrence`]} onChange={(v) => setValue(`${field}Occurrence`, v)} />
      )}
    </div>
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-5 pb-28 lg:pb-0">
      {dirty && (
        <div role="status" className="flex flex-col gap-1 rounded-md border-[1.5px] border-warning bg-warning-soft px-4 py-3 text-[15px] text-warning md:flex-row md:items-center md:justify-between md:gap-4">
          <span className="flex items-center gap-2.5">
            <TriangleAlert size={18} aria-hidden="true" />
            <strong>You have unsaved changes.</strong>
          </span>
          <span>Leaving this page will ask you to confirm.</span>
        </div>
      )}
      <ErrorSummary
        ref={summaryRef}
        errors={errorList}
        title={`${errorList.length} ${errorList.length === 1 ? "thing needs" : "things need"} fixing before you can save`}
      />
      {formError && <Alert tone="error">{formError}</Alert>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-7">
        <div className="flex flex-col gap-4 md:gap-5">
          <Section title="Basics">
            <Input id={FIELD_IDS.title} label="Title" maxLength={160} value={values.title} onChange={set("title")} error={errors.title} disabled={busy} />
            {!isNew && meta?.slug && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[15px] font-bold">Web address</span>
                <span className="flex min-h-12 flex-wrap items-center rounded-[10px] border-[1.5px] border-border bg-surface-2 px-3.5 py-2 text-[15px] text-muted [overflow-wrap:anywhere]">
                  {siteHost}/events/<span className="text-ink">{meta.slug}</span>
                </span>
                <span className="text-sm text-muted">Made from the title when the event was created, so shared links keep working.</span>
              </div>
            )}
            <Textarea
              id={FIELD_IDS.description}
              label="Description"
              rows={8}
              value={values.description}
              onChange={set("description")}
              error={errors.description}
              disabled={busy}
              inputClassName="font-mono text-[15px]"
              helper="Markdown works: **bold**, - lists, ### headings. The first paragraph also appears on event cards. Use Preview to check it."
            />
          </Section>

          <Section title="Date & time" aside="All times Eastern">
            <div className="grid gap-4 md:grid-cols-2">
              {dateInput("startsAt", "Starts")}
              {dateInput("endsAt", "Ends")}
            </div>
            <div className="md:max-w-[50%] md:pr-2">
              {dateInput("rsvpDeadline", "RSVP deadline", { optional: true, helper: "Leave blank to close RSVPs when the event starts." })}
            </div>
          </Section>

          <Section title="Location">
            <div className="grid gap-4 md:grid-cols-2">
              <Input id={FIELD_IDS.locationName} label="Place name" value={values.locationName} onChange={set("locationName")} error={errors.locationName} disabled={busy} />
              <Input id={FIELD_IDS.address} label="Address" value={values.address} onChange={set("address")} error={errors.address} disabled={busy} />
            </div>
            <Input
              id={FIELD_IDS.mapUrl}
              type="url"
              label="Map link"
              optional
              placeholder="https://maps.google.com/…"
              value={values.mapUrl}
              onChange={set("mapUrl")}
              error={errors.mapUrl}
              disabled={busy}
              helper="Leave blank and “Get directions” will search the address."
            />
          </Section>

          <Section title="Image">
            <ImageUploader
              value={{ imageId: values.imageId, previewUrl: preview }}
              onChange={({ imageId, previewUrl }) => {
                setValue("imageId", imageId);
                setPreview(previewUrl);
              }}
              alt={values.imageAlt}
              onAltChange={(v) => setValue("imageAlt", v)}
              altError={errors.imageAlt}
              disabled={busy}
            />
          </Section>

          <Section title="RSVP settings">
            <Checkbox
              id="ev-rsvpEnabled"
              label="Take RSVPs for this event"
              description="Turn off for drop-in events. The page will say “No RSVP needed.”"
              checked={values.rsvpEnabled}
              onChange={set("rsvpEnabled")}
              disabled={busy}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <NumberStepper
                  id={FIELD_IDS.capacity}
                  label="Capacity"
                  editable
                  value={values.capacity}
                  onChange={(n) => setValue("capacity", n)}
                  min={1}
                  max={100000}
                  disabled={busy || values.unlimited || !values.rsvpEnabled}
                  error={errors.capacity}
                  helper={headcount > 0 ? `${headcount} people are already going.` : undefined}
                  decreaseLabel="Lower capacity"
                  increaseLabel="Raise capacity"
                />
                <label className="flex min-h-11 items-center gap-2.5 text-[15px]">
                  <input type="checkbox" checked={values.unlimited} onChange={set("unlimited")} disabled={busy || !values.rsvpEnabled} className="h-5 w-5 focus-ring-surface" />
                  No limit
                </label>
              </div>
              <NumberStepper
                id={FIELD_IDS.maxGuestsPerRsvp}
                label="Guests per RSVP"
                value={values.maxGuestsPerRsvp}
                onChange={(n) => setValue("maxGuestsPerRsvp", n)}
                min={0}
                max={20}
                disabled={busy || !values.rsvpEnabled}
                error={errors.maxGuestsPerRsvp}
                helper={values.rsvpEnabled ? "0 means no plus-ones." : "Turn on RSVPs to change this."}
                decreaseLabel="Fewer guests per RSVP"
                increaseLabel="More guests per RSVP"
                valueClassName="min-w-[72px]"
              />
            </div>
            <Checkbox
              id="ev-collectPhone"
              label="Ask for a phone number"
              description="Optional for guests. Only staff can see it."
              checked={values.collectPhone}
              onChange={set("collectPhone")}
              disabled={busy || !values.rsvpEnabled}
            />
          </Section>

          <Section title="Attendee visibility">
            <Checkbox
              id="ev-showAttendeeCount"
              label="Show how many people are going"
              description="Counts guests too, like “22 people are going.”"
              checked={values.showAttendeeCount}
              onChange={set("showAttendeeCount")}
              disabled={busy}
            />
            <Checkbox
              id="ev-showAttendeeNames"
              label="Show names of people who opt in"
              description="First name and last initial only. Guests choose this themselves when they RSVP."
              checked={values.showAttendeeNames}
              onChange={set("showAttendeeNames")}
              disabled={busy}
            />
          </Section>
        </div>

        {/* Action rail (desktop) */}
        <aside className="hidden flex-col gap-4 lg:sticky lg:top-6 lg:flex">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
            <span className="text-sm text-muted">
              {isNew ? "Not saved yet" : `${copy.badge[adminBadge(status)]} · last saved ${formatRelative(meta.updatedAt)}`}
            </span>
            {showPublish ? (
              <>
                <Button type="button" onClick={onPublish} loading={changing} loadingText="Publishing…" disabled={busy}>
                  Publish
                </Button>
                <Button type="button" variant="secondary" onClick={onSave} loading={saving} loadingText="Saving…" disabled={busy}>
                  {isNew ? "Save as draft" : "Save changes"}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={onSave} loading={saving} loadingText="Saving…" disabled={busy}>
                Save changes
              </Button>
            )}
            {!isNew && (
              <Button href={`/admin/preview/${initial.id}`} variant="secondary" icon={Eye}>
                Preview
              </Button>
            )}
            {sideActions.length > 0 && <div className="my-1 h-px bg-border" />}
            {sideActions.map(({ label, icon: Icon, danger, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                disabled={busy}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-left font-body text-[15px] font-bold hover:bg-surface-2 focus-ring-surface disabled:text-muted",
                  danger ? "text-danger" : "text-ink"
                )}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          {!isNew && (
            <Link href={`/admin/events/${initial.id}/rsvps`} className="flex items-center gap-3 rounded-lg bg-accent-soft px-5 py-4 text-accent no-underline focus-ring hover:text-accent">
              <Users size={20} aria-hidden="true" />
              <span className="flex flex-1 flex-col">
                <strong className="text-base">{headcount} going</strong>
                <span className="text-sm">
                  {meta.rsvpCount} RSVP{meta.rsvpCount === 1 ? "" : "s"}
                  {spotsLeft !== null && ` · ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
                </span>
              </span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </aside>
      </div>

      {/* Phones/tablets: extra actions, then a sticky save bar */}
      {!isNew && (
        <div className="flex flex-col gap-3 lg:hidden">
          <Link href={`/admin/events/${initial.id}/rsvps`} className="flex items-center gap-3 rounded-lg bg-accent-soft px-4 py-4 text-accent no-underline focus-ring hover:text-accent">
            <Users size={20} aria-hidden="true" />
            <span className="flex-1 text-base font-bold">
              {headcount} going · {meta.rsvpCount} RSVP{meta.rsvpCount === 1 ? "" : "s"}
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-2">
            <Link
              href={`/admin/preview/${initial.id}`}
              className="flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-[15px] font-bold text-ink no-underline hover:bg-surface-2 hover:text-ink focus-ring-surface"
            >
              <Eye size={18} aria-hidden="true" />
              Preview
            </Link>
            {sideActions.map(({ label, icon: Icon, danger, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                disabled={busy}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-[10px] px-3 text-left font-body text-[15px] font-bold hover:bg-surface-2 focus-ring-surface disabled:text-muted",
                  danger ? "text-danger" : "text-ink"
                )}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2.5 border-t border-border bg-surface px-4 pb-5 pt-3 shadow-bar lg:hidden">
        {showPublish ? (
          <>
            <Button type="button" variant="secondary" size="tall" onClick={onSave} loading={saving} loadingText="Saving…" disabled={busy}>
              {isNew ? "Save as draft" : "Save draft"}
            </Button>
            <Button type="button" size="tall" onClick={onPublish} loading={changing} loadingText="Publishing…" disabled={busy}>
              Publish
            </Button>
          </>
        ) : (
          <Button type="button" size="tall" onClick={onSave} loading={saving} loadingText="Saving…" disabled={busy} className="col-span-2">
            Save changes
          </Button>
        )}
      </div>

      {ops.dialog}
      <ConfirmDialog
        open={!!leaveTo}
        title={copy.confirm.leave}
        confirmLabel="Leave page"
        cancelLabel="Keep editing"
        onCancel={() => setLeaveTo(null)}
        onConfirm={() => {
          const to = leaveTo;
          setBaseline(JSON.stringify(values));
          setLeaveTo(null);
          router.push(to);
        }}
      >
        <p className="m-0 text-muted">Your changes to this event haven&apos;t been saved yet.</p>
      </ConfirmDialog>
    </form>
  );
}
