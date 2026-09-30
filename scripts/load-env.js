import { config } from "dotenv";
import { resolve } from "node:path";

/** One local configuration file; explicit shell values take precedence. */
export function loadEnvironment(directory = process.cwd(), env = process.env) {
  config({ path: resolve(directory, ".env"), processEnv: env, quiet: true });
}

loadEnvironment();
