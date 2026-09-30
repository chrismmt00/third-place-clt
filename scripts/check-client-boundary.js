import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";

const root = resolve("src");
function files(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry => {
    const next = resolve(path, entry.name);
    return entry.isDirectory() ? files(next) : /\.[cm]?jsx?$/.test(entry.name) ? [next] : [];
  });
}
const visited = new Set();
const forbidden = /\b(CLOUDFLARE_IMAGES_TOKEN|CLOUDFLARE_STREAM_TOKEN|AUTH_SECRET|DATABASE_URL)\b/;
function inspect(path) {
  if (visited.has(path)) return;
  visited.add(path);
  const source = readFileSync(path, "utf8");
  // Server actions are RPC boundaries; their implementation is never bundled into clients.
  if (/^\s*["']use server["'];?/.test(source)) return;
  if (forbidden.test(source) || /import\s+["']server-only["']/.test(source)) {
    throw new Error(`Private server module reachable from client: ${path}`);
  }
  const imports = source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)["']([^"']+)["']/g);
  for (const [, specifier] of imports) {
    if (!(specifier.startsWith(".") || specifier.startsWith("@/"))) continue;
    const base = specifier.startsWith("@/") ? resolve(root, specifier.slice(2)) : resolve(dirname(path), specifier);
    if (extname(base) && !/\.[cm]?jsx?$/.test(base)) continue;
    const candidates = [base, ...[".js", ".jsx", ".mjs", "/index.js", "/index.jsx"].map(suffix => base + suffix)];
    const found = candidates.find(candidate => existsSync(candidate) && /\.[cm]?jsx?$/.test(candidate));
    if (found) inspect(found);
    else throw new Error(`Unresolved local client import: ${specifier}`);
  }
}
for (const path of files(root)) {
  if (/^\s*["']use client["'];?/.test(readFileSync(path, "utf8"))) inspect(path);
}
console.log(`Client secret boundary check passed (${visited.size} modules).`);
