import "server-only";
import { UserError } from "./errors.js";

const application = "third-place-clt";
function configuration() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_TOKEN;
  if (!account || !token) throw new UserError("Image uploads are not configured yet. You can save the event without an image.", "IMAGES_UNAVAILABLE", 503);
  return { base: `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/images`, token };
}

async function request(path, options = {}) {
  const { base, token } = configuration();
  try {
    const response = await fetch(base + path, { ...options, headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    const body = await response.json();
    if (!response.ok || !body.success) throw new Error("Image service rejected request.");
    return body.result;
  } catch { throw new UserError("The image service is unavailable. Please try again.", "IMAGES_UNAVAILABLE", 503); }
}

export async function directUploadUrl() {
  if (process.env.NODE_ENV !== "production" && (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_IMAGES_TOKEN)) {
    return { available: false, developmentStub: true, message: "Development mode: configure Cloudflare Images to upload. Events can be saved without images." };
  }
  const form = new FormData();
  form.set("metadata", JSON.stringify({ application }));
  form.set("requireSignedURLs", "false");
  form.set("expiry", new Date(Date.now() + 10 * 60_000).toISOString());
  const result = await request("/v2/direct_upload", { method: "POST", body: form });
  return { available: true, id: result.id, uploadURL: result.uploadURL };
}

export async function verifyImage(imageId) {
  const result = await request(`/v1/${encodeURIComponent(imageId)}`);
  if (result.meta?.application !== application || result.draft) throw new UserError("Choose a completed image uploaded by this site.");
}

export async function deleteImage(imageId) {
  if (!imageId) return;
  try {
    await verifyImage(imageId);
    await request(`/v1/${encodeURIComponent(imageId)}`, { method: "DELETE" });
  } catch { console.warn("Event image cleanup failed; retry cleanup in Cloudflare."); }
}

export function imageDeliveryUrl(imageId, variant = "card") {
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH;
  if (!imageId || !accountHash) return null;
  if (!["card", "hero", "og", "thumb"].includes(variant)) throw new Error("Unknown image variant.");
  return `https://imagedelivery.net/${encodeURIComponent(accountHash)}/${encodeURIComponent(imageId)}/${variant}`;
}
