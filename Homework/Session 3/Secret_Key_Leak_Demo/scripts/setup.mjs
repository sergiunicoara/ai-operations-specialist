// Creates .env.local from .env.example (fake values) if it does not exist yet.
import fs from "node:fs";
import { ENV_EXAMPLE, ENV_LOCAL } from "./lib/env.mjs";

if (fs.existsSync(ENV_LOCAL)) {
  console.log(".env.local already exists - left untouched.");
} else {
  fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
  console.log("Created .env.local from .env.example (fake values; git-ignored).");
}
