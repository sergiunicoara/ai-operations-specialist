// Builds the backup walkthrough from ONE list of steps:
//   BACKUP_WALKTHROUGH.md          (screenshots embedded, for reading in the repo)
//   docs/backup_walkthrough.pdf    (presentable offline if the live demo fails)
// Screenshots come from `npm run screenshots`. Usage: npm run backup
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { ROOT } from "./lib/env.mjs";

const steps = [
  ["01-overview.png", "Start state", "Banner marks this as an educational demonstration. Provider accepts Demo key A; the app is configured with Demo key A.", "Both services are local; keys are fake.", "0:00"],
  ["02-stage-a-request.png", "Stage A: browser sends a value", "The component's NEXT_PUBLIC_ value is not printed on the page, but the browser sends it in a request header. The mock public tier accepts it (HTTP 200).", "Anything the browser sends, the user can read.", "0:20"],
  ["03-stage-a-value-in-js.png", "Stage A: the value is in the JavaScript file", "Searching the production chunk for DEMO_ONLY_PUBLIC finds the literal string. Next.js inlined it at build time.", "NEXT_PUBLIC_ makes a value public; it does not make a secret safe.", "0:45"],
  ["04-stage-b-success.png", "Stage B: server route succeeds", "The browser called /api/stage-b. The server added the credential and the mock API accepted it. The browser only sees a harmless result.", "A server can use a credential without handing it to the browser.", "1:10"],
  ["05-stage-b-network.png", "Stage B: nothing secret on the wire to the browser", "The request carries no credential header; the response has only labels and a message.", "Naming alone cannot stop a developer returning a secret; hiding the key does not protect the route (limits, least privilege, authentication).", "1:35"],
  ["06-stage-c-success-key-a.png", "Stage C 1: request works with Demo key A", "First entry in the results list: Success.", "Baseline.", "2:00"],
  ["07-stage-c-rotated.png", "Stage C 2: provider rotates", "The provider issues Demo key B and revokes Demo key A. The status strip now shows a mismatch: provider accepts B, app still has A.", "Rotation changes what the provider accepts first.", "2:15"],
  ["08-stage-c-old-key-rejected.png", "Stage C 3: unchanged app is rejected", "Same app, same code: HTTP 401, old key rejected.", "Removing a key from code does not invalidate it; only the provider can.", "2:30"],
  ["09-config-updated-restart.png", "Stage C 4: update configuration and restart", "npm run use-latest-key writes Demo key B into .env.local; the server is restarted so it re-reads its environment.", "Rotation must update both the provider and the application's configuration.", "2:45"],
  ["10-stage-c-restored.png", "Stage C 5: success restored", "After reload the status strip reads Demo key B. Results: Configuration updated, then Success restored.", "Planned rotation can overlap keys; a compromised key needs urgent revocation and may interrupt service.", "3:10"],
  ["11-reset.png", "Reset", "npm run reset restores Demo key A at the provider and in .env.local; restart the app to repeat the demo.", "The demo is repeatable.", "after"],
  ["12-provider-console.png", "Optional: provider console", "http://127.0.0.1:4010/console shows the active and revoked keys and lets you rotate or reset; a new key is shown once, like a real dashboard.", "Manual alternative for the rotate and config steps.", "optional"],
];

const head = "# Backup walkthrough\n\nUse this if the live demo cannot run. Screenshots were captured from the real production build by `npm run screenshots` (panels 03, 05, 09, 11 render captured real data: the served JS excerpt, the browser's network events, and command output). Educational demonstration: all credentials are fake and local.\n\nSee [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md) for the live procedure and [SPEAKER_NOTES.md](SPEAKER_NOTES.md) for the script.\n";
const md = head + steps.map(([f, t, d, s, time], i) => `\n## ${i + 1}. ${t}  \`${time}\`\n\n![${t}](docs/screenshots/${f})\n\n${d}\n\n**Say:** ${s}\n`).join("");
fs.writeFileSync(path.join(ROOT, "BACKUP_WALKTHROUGH.md"), md);

const b64 = (f) => fs.readFileSync(path.join(ROOT, "docs", "screenshots", f)).toString("base64");
const html = `<!doctype html><meta charset="utf-8"><style>
@page{size:1500px 1000px;margin:0} body{margin:0;font:22px system-ui,sans-serif;color:#0f172a}
section{width:1500px;height:1000px;page-break-after:always;position:relative;background:#f8fafc;overflow:hidden}
h1{margin:0;padding:16px 28px 4px;font-size:30px} .cap{padding:0 28px;font-size:20px;color:#334155;height:78px;overflow:hidden}
img{display:block;margin:0 auto;max-width:1444px;max-height:790px;border:2px solid #cbd5e1;border-radius:8px}
.say{position:absolute;bottom:0;left:0;right:0;background:#0f172a;color:#fff;padding:10px 28px;font-size:20px} .n{color:#f59e0b}
</style>${steps.map(([f, t, d, s, time], i) => `<section><h1><span class="n">${i + 1}/${steps.length}</span> ${t}</h1><div class="cap">${d}</div><img src="data:image/png;base64,${b64(f)}"><div class="say">Say: ${s}</div></section>`).join("")}`;

const exe = [process.env.CHROME_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find((p) => p && fs.existsSync(p));
if (!exe) { console.error("No Edge/Chrome found. Set CHROME_PATH."); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: exe, headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: path.join(ROOT, "docs", "backup_walkthrough.pdf"), width: "1500px", height: "1000px", printBackground: true });
await browser.close();
console.log("wrote BACKUP_WALKTHROUGH.md and docs/backup_walkthrough.pdf");
