import { z } from "zod";
import { easternToUtc } from "./dates.js";
import { emailSchema } from "./passwords.js";

export const idSchema = z.string().cuid();
export const checkbox = z.preprocess(value => value === true || value === "true" || value === "on", z.boolean());
export const optionalUrl = z.union([z.literal(""), z.url().refine(value => ["http:", "https:"].includes(new URL(value).protocol), "Use an http or https URL.")]).default("");
const optionalInteger = z.preprocess(value => value === "" || value == null ? null : value, z.coerce.number().int().min(1).max(100000).nullable());
const optionalText = (max) => z.string().trim().max(max).default("");

export function eventSchema(currentHeadcount = 0) {
  return z.object({
    id: idSchema.optional(), title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(20000),
    startsAt: z.string(), endsAt: z.string(), rsvpDeadline: optionalText(30),
    startsAtOccurrence: z.enum(["reject", "earlier", "later"]).default("reject"),
    endsAtOccurrence: z.enum(["reject", "earlier", "later"]).default("reject"),
    rsvpDeadlineOccurrence: z.enum(["reject", "earlier", "later"]).default("reject"),
    locationName: z.string().trim().min(1).max(200), address: z.string().trim().min(1).max(500),
    mapUrl: optionalUrl, imageId: z.string().regex(/^[A-Za-z0-9_-]+$/).max(200).or(z.literal("")).default(""),
    imageAlt: optionalText(300), capacity: optionalInteger, rsvpEnabled: checkbox,
    collectPhone: checkbox, maxGuestsPerRsvp: z.coerce.number().int().min(0).max(20),
    showAttendeeCount: checkbox.optional(), showAttendeeNames: checkbox.optional(),
  }).transform((data, ctx) => {
    const output = { ...data };
    for (const field of ["startsAt", "endsAt", "rsvpDeadline"]) {
      try { output[field] = data[field] ? easternToUtc(data[field], data[`${field}Occurrence`]) : null; }
      catch { ctx.addIssue({ code: "custom", path: [field], message: "Enter a valid Eastern time; choose earlier/later for a repeated time." }); }
      delete output[`${field}Occurrence`];
    }
    return output;
  }).superRefine((data, ctx) => {
    if (!data.startsAt || !data.endsAt || data.endsAt <= data.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start." });
    if (data.rsvpDeadline && data.rsvpDeadline > data.startsAt) ctx.addIssue({ code: "custom", path: ["rsvpDeadline"], message: "RSVP deadline cannot follow the start." });
    if (data.capacity !== null && data.capacity < currentHeadcount) ctx.addIssue({ code: "custom", path: ["capacity"], message: `Capacity cannot be below ${currentHeadcount} existing attendees.` });
    if (data.imageId && !data.imageAlt) ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe the event image." });
  });
}

export function rsvpSchema(event) {
  return z.object({
    eventId: idSchema, firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100),
    email: emailSchema, phone: optionalText(40), guestCount: z.coerce.number().int().min(0).max(event.maxGuestsPerRsvp),
    note: optionalText(500), consent: checkbox.refine(Boolean, "Please agree to the privacy notice."),
    publicNameConsent: checkbox, website: z.string().max(0).default(""),
  }).transform(data => ({ ...data, phone: event.collectPhone ? data.phone : "" }));
}

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100), email: emailSchema, subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000), website: z.string().max(0).default(""),
  consent: checkbox.refine(Boolean, "Please agree to the privacy notice."),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(100), contactEmail: emailSchema.or(z.literal("")),
  instagramUrl: optionalUrl, facebookUrl: optionalUrl, chatUrl: optionalUrl,
  showAttendeeCountDefault: checkbox, showAttendeeNamesDefault: checkbox,
});
