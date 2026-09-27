import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { directUploadUrl, imageDeliveryUrl } from "../src/lib/cloudflare.js";

beforeEach(() => {
  for (const key of ["CLOUDFLARE_IMAGES_ACCOUNT_ID", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_IMAGES_ACCOUNT_HASH", "NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH", "CLOUDFLARE_IMAGES_TOKEN"]) {
    vi.stubEnv(key, "");
  }
  vi.stubEnv("NODE_ENV", "test");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it("uses the existing Images-specific credentials without entering the development stub", async () => {
  vi.stubEnv("CLOUDFLARE_IMAGES_ACCOUNT_ID", "fixture-account");
  vi.stubEnv("CLOUDFLARE_IMAGES_TOKEN", "fixture-token-not-a-real-credential");
  vi.stubEnv("CLOUDFLARE_IMAGES_ACCOUNT_HASH", "fixture-hash");
  const fetcher = vi.fn(async () => ({ ok: true, json: async () => ({ success: true, result: { id: "fixture-image", uploadURL: "https://upload.imagedelivery.net/fixture" } }) }));
  vi.stubGlobal("fetch", fetcher);
  expect(await directUploadUrl()).toMatchObject({ available: true, id: "fixture-image" });
  expect(fetcher.mock.calls[0][0]).toBe("https://api.cloudflare.com/client/v4/accounts/fixture-account/images/v2/direct_upload");
  expect(imageDeliveryUrl("fixture-image")).toBe("https://imagedelivery.net/fixture-hash/fixture-image/card");
});

it("prefers existing names while preserving compatibility with earlier aliases", () => {
  vi.stubEnv("NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH", "legacy-hash");
  expect(imageDeliveryUrl("image")).toContain("/legacy-hash/");
  vi.stubEnv("CLOUDFLARE_IMAGES_ACCOUNT_HASH", "existing-hash");
  expect(imageDeliveryUrl("image")).toContain("/existing-hash/");
});
