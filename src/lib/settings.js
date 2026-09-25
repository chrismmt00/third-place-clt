import "server-only";
import { db } from "./prisma-db.js";

export const settingsSelect = Object.freeze({
  siteName: true, contactEmail: true, instagramUrl: true, facebookUrl: true, chatUrl: true,
  showAttendeeCountDefault: true, showAttendeeNamesDefault: true,
});
export const defaultSettings = Object.freeze({
  siteName: "Third Place CLT", contactEmail: "", instagramUrl: "", facebookUrl: "", chatUrl: "",
  showAttendeeCountDefault: false, showAttendeeNamesDefault: false,
});

export async function getSiteSettings(database = db) {
  return await database.siteSettings.findUnique({ where: { id: "site" }, select: settingsSelect }) || { ...defaultSettings };
}
