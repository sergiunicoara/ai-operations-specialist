// CLI equivalent of clicking "Rotate" in the mock provider console (fallback if the UI button is unavailable).
import { mock } from "./lib/env.mjs";

const r = await mock("/admin/rotate", "POST");
console.log(`Provider: ${r.issuedLabel} issued, ${r.revokedLabel} revoked.`);
console.log("Next: npm run use-latest-key   then restart the app (Ctrl+C, npm start).");
