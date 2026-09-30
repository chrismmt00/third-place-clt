// Validation shared by the browser forms and the API routes.
import { copy } from "@/content/copy";

export const isEmail = (v) => /^\S+@\S+\.\S+$/.test((v || "").trim());

export function isWebUrl(v) {
  try {
    const u = new URL((v || "").trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateRsvp({ firstName, lastName, email, consent }) {
  const errors = {};
  if (!(firstName || "").trim()) errors.firstName = copy.err.firstName;
  if (!(lastName || "").trim()) errors.lastName = copy.err.lastName;
  if (!isEmail(email)) errors.email = copy.err.email;
  if (!consent) errors.consent = copy.err.consent;
  return errors;
}

export function validateContact({ name, email, subject, message, consent }) {
  const errors = {};
  if (!(name || "").trim()) errors.name = copy.err.name;
  if (!isEmail(email)) errors.email = copy.err.email;
  if (!(subject || "").trim()) errors.subject = copy.err.subject;
  if (!(message || "").trim()) errors.message = copy.err.message;
  if (!consent) errors.consent = copy.err.contactConsent;
  return errors;
}

export function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

export const isSlug = (v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v || "");
