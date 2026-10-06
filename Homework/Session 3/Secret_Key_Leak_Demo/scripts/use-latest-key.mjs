// Stand-in for "copy the new key from the provider dashboard into our secret configuration".
// Writes the provider's current fake key into .env.local. The application must then be restarted.
import fs from "node:fs";
import { ENV_EXAMPLE, ENV_LOCAL, mock, read, setEnvVar, write } from "./lib/env.mjs";

const { label, key } = await mock("/admin/latest-key");
if (!fs.existsSync(ENV_LOCAL)) fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
write(ENV_LOCAL, setEnvVar(read(ENV_LOCAL), "DEMO_MOCK_API_KEY", key));
console.log(`Updated .env.local: DEMO_MOCK_API_KEY is now ${label}.`);
console.log("Restart the app so it re-reads its environment: Ctrl+C, then npm start. Then reload the page.");
