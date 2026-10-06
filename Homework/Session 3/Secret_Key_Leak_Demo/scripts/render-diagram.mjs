// Renders docs/architecture.svg to docs/architecture.png using the system Edge/Chrome via puppeteer-core.
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { ROOT } from "./lib/env.mjs";

const exe = [process.env.CHROME_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].find((p) => p && fs.existsSync(p));
if (!exe) { console.error("No Edge/Chrome found. Set CHROME_PATH."); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: exe, headless: true, defaultViewport: { width: 1600, height: 900, deviceScaleFactor: 2 } });
const page = await browser.newPage();
await page.goto("file:///" + path.join(ROOT, "docs", "architecture.svg").replaceAll("\\", "/"));
await page.screenshot({ path: path.join(ROOT, "docs", "architecture.png") });
await browser.close();
console.log("wrote docs/architecture.png");
