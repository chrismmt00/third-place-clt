import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function client() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured.");
  if (!globalThis.thirdPlaceDatabase) {
    globalThis.thirdPlaceDatabase = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
      log: [],
    });
  }
  return globalThis.thirdPlaceDatabase;
}

// Lazy initialization permits builds without credentials; requests fail closed.
export const db = new Proxy({}, {
  get(_target, key) {
    const value = client()[key];
    return typeof value === "function" ? value.bind(client()) : value;
  },
});
