import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ settings: null, authorize: vi.fn(), update: vi.fn(), updateMany: vi.fn(), remove: vi.fn() }));
vi.mock("../src/lib/auth.js", () => ({ requireAdmin: mocks.authorize }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../src/lib/prisma-db.js", () => ({ db: {
  siteSettings: {
    findUnique: async () => mocks.settings,
    upsert: async ({ create, update }) => { mocks.settings = mocks.settings ? update : create; },
  },
  contactMessage: { update: mocks.update, updateMany: mocks.updateMany, delete: mocks.remove },
} }));
import { getSiteSettings } from "../src/lib/settings.js";
import { saveSettings, manageMessage } from "../src/app/actions/contact.js";

beforeEach(() => { vi.clearAllMocks(); mocks.settings = null; });
function form(values) { const value = new FormData(); Object.entries(values).forEach(([key, item]) => value.set(key, item)); return value; }

it("makes saved settings available to public queries and rejects unsafe URLs", async () => {
  const data = { siteName: "Community", contactEmail: "hello@example.test", instagramUrl: "https://example.test/social", facebookUrl: "", chatUrl: "" };
  expect((await saveSettings(null, form(data))).ok).toBe(true);
  expect((await getSiteSettings()).siteName).toBe("Community");
  expect((await saveSettings(null, form({ ...data, chatUrl: "javascript:alert(1)" }))).ok).toBe(false);
});

it("performs authenticated read/archive/delete transitions", async () => {
  const id = "cjld2cjxh0000qzrmn831i7rn";
  for (const operation of ["read", "archive", "delete"]) expect((await manageMessage(null, form({ id, operation }))).ok).toBe(true);
  expect(mocks.authorize).toHaveBeenCalledTimes(3);
  expect(mocks.updateMany).toHaveBeenCalledWith({ where: { id, status: "NEW" }, data: { status: "READ" } });
  expect(mocks.update).toHaveBeenCalledWith({ where: { id }, data: { status: "ARCHIVED" } });
  expect(mocks.remove).toHaveBeenCalledWith({ where: { id } });
});
