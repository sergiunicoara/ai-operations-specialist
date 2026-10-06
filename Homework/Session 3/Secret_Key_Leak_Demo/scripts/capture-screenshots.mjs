// Drives the REAL runbook in a headless browser (system Edge/Chrome via puppeteer-core), checks the UI,
// and saves screenshots to docs/screenshots. It uses the real scripts and the real .env.local mechanism.
// Needs: ports 3000 and 4010 free (stop your demo first), a built app (it builds if .next is missing).
// Your existing .env.local is backed up and restored. Usage: npm run screenshots
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { ROOT, ENV_LOCAL } from "./lib/env.mjs";
import { runNext, startNext } from "./lib/harness.mjs";

const OUT = path.join(ROOT, "docs", "screenshots");
const BASE = "http://127.0.0.1:3000";
const CANDIDATES = [process.env.CHROME_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
const executablePath = CANDIDATES.find((p) => p && fs.existsSync(p));
if (!executablePath) { console.error("No Edge/Chrome found. Set CHROME_PATH."); process.exit(1); }

const results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? " -> " + detail : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const node = (args, env = {}) => new Promise((resolve) => {
  const p = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...env } });
  let out = ""; p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d)); p.on("exit", () => resolve(out.trim()));
});

for (const port of [3000, 4010]) {
  if (await fetch(`http://127.0.0.1:${port}/`).then(() => true, () => false)) { console.error(`Port ${port} is in use. Stop your running demo first.`); process.exit(1); }
}
const backup = fs.existsSync(ENV_LOCAL) ? fs.readFileSync(ENV_LOCAL) : null;
fs.mkdirSync(OUT, { recursive: true });
let mockProc, app, browser;
const contentHeight = (page) => page.evaluate(() => Math.ceil(Math.max(...[...document.body.querySelectorAll("*")].map((e) => e.getBoundingClientRect().bottom))) + 40);
const shotTight = async (page, name) => shot(page, name, { clip: { x: 0, y: 0, width: 1500, height: Math.min(1180, await contentHeight(page)) } });
const shot = async (page, name, opts = {}) => { if (opts.stage) { await scrollTo(page, opts.stage); await sleep(150); delete opts.stage; } await page.screenshot({ path: path.join(OUT, name), ...opts }); console.log("  saved", name); };
const scrollTo = (page, id) => page.evaluate((i) => document.getElementById(i)?.scrollIntoView(), id);
const clickButton = async (page, text, nth = 0) => {
  const handles = await page.$$("button");
  const matches = [];
  for (const h of handles) if ((await h.evaluate((e) => e.textContent)).includes(text)) matches.push(h);
  if (!matches[nth]) throw new Error(`button not found: ${text}`);
  await matches[nth].click();
};
const logText = (page) => page.$$eval('[data-testid="log"] li', (l) => l.map((e) => e.textContent));
const waitLog = async (page, n) => { for (let i = 0; i < 40; i++) { if ((await logText(page)).length >= n) return; await sleep(150); } };
// Click, and if the page had not hydrated yet (no new log row), click once more.
const clickLogged = async (page, text, nth, n) => { await clickButton(page, text, nth); await waitLog(page, n); if ((await logText(page)).length < n) { await clickButton(page, text, nth); await waitLog(page, n); } };
const hydrated = (page) => page.waitForFunction(() => document.querySelector('[data-testid="app-label"]')?.textContent !== "…");
const panel = async (page, title, body, name, kind = "term") => {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  await page.setContent(`<body style="margin:0;background:#e2e8f0;font:20px system-ui"><div style="max-width:1300px;margin:40px auto"><p style="font-weight:700;color:#475569">${esc(title)}</p>
    <pre style="background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;font:20px/1.5 Consolas,monospace;white-space:pre-wrap;word-break:break-all">${esc(body)}</pre>
    <p style="color:#475569;font-size:16px">${kind === "term" ? "Captured output of the real command." : "Captured from the browser's network events (same data DevTools → Network shows)."}</p></div></body>`);
  await shotTight(page, name);
};

try {
  console.log("Preparing: reset env to Demo key A, start mock API + production app");
  fs.copyFileSync(path.join(ROOT, ".env.example"), ENV_LOCAL);
  if (!fs.existsSync(path.join(ROOT, ".next"))) await runNext(["build"]);
  mockProc = spawn(process.execPath, ["mock-api/server.mjs"], { cwd: ROOT, stdio: "ignore" });
  await sleep(800);
  await node(["scripts/reset.mjs"]);
  app = await startNext({ port: 3000 });

  browser = await puppeteer.launch({ executablePath, headless: true, defaultViewport: { width: 1500, height: 1180 }, args: ["--no-first-run"] });
  const page = await browser.newPage();
  const netLog = [];
  page.on("request", (r) => { if (r.url().endsWith("/api/stage-b") || r.url().endsWith("/v1/public-ping")) netLog.push({ url: r.url(), method: r.method(), headers: r.headers() }); });
  page.on("response", async (r) => { if (r.url().endsWith("/api/stage-b")) { const e = netLog.filter((n) => n.url === r.url()).at(-1); if (e) e.response = { status: r.status(), body: await r.text() }; } });

  await page.goto(BASE, { waitUntil: "networkidle0" }); await hydrated(page); await sleep(500);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: "networkidle0" }); await hydrated(page); await sleep(500);
  check("page shows educational banner and three stages", (await page.content()).includes("EDUCATIONAL DEMONSTRATION") && (await page.$$(".stage")).length === 3);
  check("status strip: provider and app both on Demo key A", (await page.$eval('[data-testid="provider-label"]', (e) => e.textContent)) === "Demo key A" && (await page.$eval('[data-testid="app-label"]', (e) => e.textContent)) === "Demo key A");
  await shot(page, "01-overview.png");

  // ---- Stage A
  await scrollTo(page, "stage-a");
  check("Stage A page does not print the public value", !(await page.$eval("main", (m) => m.innerText)).includes("DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL"));
  await clickButton(page, "Send request from the browser");
  await page.waitForSelector('[data-testid="stage-a-result"]');
  const a = await page.$eval('[data-testid="stage-a-result"]', (e) => e.textContent);
  check("Stage A browser request accepted by mock public tier (CORS ok)", a.startsWith("HTTP 200"), a);
  await shot(page, "02-stage-a-request.png", { stage: "stage-a" });
  const pub = netLog.find((n) => n.url.endsWith("/v1/public-ping") && n.method === "GET");
  check("Stage A request visibly carries the public value in a header", pub?.headers["x-demo-public-key"] === "DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL");
  const chunkUrls = await page.$$eval("script[src]", (s) => s.map((x) => x.src));
  let found = null;
  for (const u of chunkUrls) { const t = await (await fetch(u)).text(); const i = t.indexOf("DEMO_ONLY_PUBLIC"); if (i >= 0) { found = { u, t, i }; break; } }
  check("Stage A: value found inside a loaded production JS file", !!found);
  if (found) {
    const snippet = found.t.slice(Math.max(0, found.i - 90), found.i + 130).replace(/\s+/g, " ");
    await page.setContent(`<body style="margin:0;background:#1e1e2e;color:#cdd6f4;font:18px/1.6 Consolas,monospace"><div style="padding:14px 24px;background:#313244;font:700 18px system-ui">DevTools → Sources (search result): ${new URL(found.u).pathname}</div><pre style="padding:24px;white-space:pre-wrap;word-break:break-all">…${snippet.replace(/</g, "&lt;").replace("DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL", '<mark style="background:#f9e2af;color:#000;padding:2px 4px">DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL</mark>')}…</pre><p style="padding:0 24px;font:16px system-ui;color:#a6adc8">Excerpt of the real served file, highlight added. Search tip: Ctrl+Shift+F in DevTools, "DEMO_ONLY_PUBLIC".</p></body>`);
    await shotTight(page, "03-stage-a-value-in-js.png");
  }
  await page.goto(BASE, { waitUntil: "networkidle0" }); await hydrated(page); await sleep(500);

  // ---- Stage B
  await scrollTo(page, "stage-b");
  await clickButton(page, "Call the server route");
  await page.waitForSelector('[data-testid="stage-b-result"]');
  const b = await page.$eval('[data-testid="stage-b-result"]', (e) => e.textContent);
  check("Stage B shows success from the provider", b.includes("HTTP 200") && b.includes("Success"), b);
  await shot(page, "04-stage-b-success.png", { stage: "stage-b" });
  const bn = netLog.find((n) => n.url.endsWith("/api/stage-b"));
  const leak = JSON.stringify(bn ?? {});
  check("Stage B network: browser request and response contain no credential", !!bn?.response && !/DEMO_KEY_/.test(leak) && !Object.keys(bn.headers).some((h) => /api-key|authorization/i.test(h)), leak.slice(0, 300));
  await panel(page, "DevTools → Network → /api/stage-b", `Request  ${bn.method} ${new URL(bn.url).pathname}\n${Object.entries(bn.headers).map(([k, v]) => `  ${k}: ${v}`).join("\n")}\n  (no credential header: the browser has none)\n\nResponse ${bn.response.status}\n${JSON.stringify(JSON.parse(bn.response.body), null, 2)}`, "05-stage-b-network.png", "net");
  await page.goto(BASE, { waitUntil: "networkidle0" }); await hydrated(page); await sleep(500);
  await sleep(300);

  // ---- Stage C
  await scrollTo(page, "stage-c");
  await clickLogged(page, "Run request", 0, 1);
  check("Stage C 1: request succeeds with Demo key A", (await logText(page)).at(-1).includes("Success") && (await logText(page)).at(-1).includes("Demo key A"));
  await shot(page, "06-stage-c-success-key-a.png", { stage: "stage-c" });
  await clickLogged(page, "Rotate key", 0, 2);
  check("Stage C 2: provider rotated A -> B", (await logText(page)).at(-1).includes("Demo key B issued"));
  check("status strip shows provider on key B, app still on key A (mismatch highlighted)", (await page.$eval('[data-testid="provider-label"]', (e) => e.textContent)) === "Demo key B" && (await page.$eval('[data-testid="app-label"]', (e) => e.textContent)) === "Demo key A");
  await shot(page, "07-stage-c-rotated.png", { stage: "stage-c" });
  await clickLogged(page, "Run request", 1, 3);
  check("Stage C 3: unchanged app gets old key rejected", (await logText(page)).at(-1).includes("Old key rejected"));
  await shot(page, "08-stage-c-old-key-rejected.png", { stage: "stage-c" });

  const useOut = await node(["scripts/use-latest-key.mjs"]);
  check(".env.local now holds Demo key B", fs.readFileSync(ENV_LOCAL, "utf8").includes("DEMO_KEY_B_"));
  await app.stop();
  const t0 = Date.now(); app = await startNext({ port: 3000 });
  await panel(page, "Terminal", `> npm run use-latest-key\n${useOut}\n\n> (Ctrl+C)   > npm start\nready in ${((Date.now() - t0) / 1000).toFixed(1)}s on http://127.0.0.1:3000`, "09-config-updated-restart.png");
  await page.goto(BASE, { waitUntil: "networkidle0" }); await hydrated(page); await sleep(500);
  check("after restart the app label reads Demo key B", (await page.$eval('[data-testid="app-label"]', (e) => e.textContent)) === "Demo key B");
  await scrollTo(page, "stage-c");
  await clickLogged(page, "Run request", 2, 5);
  const finalLog = await logText(page);
  check("Stage C 4+5: configuration updated, success restored (log survives reload)", finalLog.some((l) => l.includes("Configuration updated")) && finalLog.at(-1).includes("Success restored"), finalLog.join(" | "));
  await shot(page, "10-stage-c-restored.png", { stage: "stage-c" });

  // ---- Reset
  await clickButton(page, "Reset demo");
  const resetOut = await node(["scripts/reset.mjs"]);
  await app.stop(); app = await startNext({ port: 3000 });
  await page.goto(BASE, { waitUntil: "networkidle0" }); await hydrated(page); await sleep(500);
  check("reset: log cleared, provider and app both back on Demo key A", (await logText(page)).length === 1 && (await page.$eval('[data-testid="provider-label"]', (e) => e.textContent)) === "Demo key A" && (await page.$eval('[data-testid="app-label"]', (e) => e.textContent)) === "Demo key A");
  await panel(page, "Terminal", `> npm run reset\n${resetOut}`, "11-reset.png");
  await page.goto("http://127.0.0.1:4010/console", { waitUntil: "networkidle0" });
  await shot(page, "12-provider-console.png", { clip: { x: 0, y: 0, width: 1000, height: 420 } });
} catch (e) {
  check("capture run completed", false, String(e.stack ?? e));
} finally {
  await browser?.close();
  await app?.stop();
  mockProc?.kill();
  if (backup) fs.writeFileSync(ENV_LOCAL, backup); else if (fs.existsSync(ENV_LOCAL)) fs.rmSync(ENV_LOCAL);
}
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} UI checks passed.`);
process.exit(failed ? 1 : 0);
