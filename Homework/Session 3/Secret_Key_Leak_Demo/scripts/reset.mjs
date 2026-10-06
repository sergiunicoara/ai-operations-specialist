// Repeatable reset: provider accepts Demo key A again, and .env.local goes back to Demo key A.
import fs from "node:fs";
import { ENV_EXAMPLE, ENV_LOCAL, getEnvVar, mock, read, setEnvVar, write } from "./lib/env.mjs";

const r = await mock("/admin/reset", "POST");
if (!fs.existsSync(ENV_LOCAL)) fs.copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
const keyA = getEnvVar(read(ENV_EXAMPLE), "DEMO_MOCK_API_KEY");
write(ENV_LOCAL, setEnvVar(read(ENV_LOCAL), "DEMO_MOCK_API_KEY", keyA));
console.log(`Provider reset: ${r.activeKeyLabel} is active again.`);
console.log("Updated .env.local: DEMO_MOCK_API_KEY restored to Demo key A.");
console.log("Restart the app (Ctrl+C, npm start) and reload the page. The browser log clears with the UI Reset button or a new tab.");
