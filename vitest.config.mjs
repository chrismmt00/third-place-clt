import "dotenv/config";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "server-only": fileURLToPath(new URL("./tests/server-only.js", import.meta.url)),
  } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    exclude: process.env.TEST_DATABASE_URL ? [] : ["tests/integration/**"],
  },
});
