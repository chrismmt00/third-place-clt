import { config } from "dotenv";
import { resolve } from "node:path";

/** Local tooling honors shell overrides, then .env.local, then shared .env values. */
export function loadEnvironment(directory = process.cwd(), env = process.env) {
  config({ path: [resolve(directory, ".env.local"), resolve(directory, ".env")], processEnv: env, quiet: true });
}

loadEnvironment();
