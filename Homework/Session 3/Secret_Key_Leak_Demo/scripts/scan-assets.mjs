// Scans the PRODUCTION build output (.next) for the fake values.
//   public value  -> MUST appear in browser assets (.next/static)   [Stage A proof]
//   private keys  -> MUST NOT appear anywhere in .next              [Stage B proof]
// Usage: npm run build && npm run scan   (exit code 1 on failure)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./lib/env.mjs";

export const PUBLIC_VALUE = "DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL";
export const PRIVATE_PATTERN = /DEMO_KEY_[A-Z]_FAKE_MOCK_ONLY_NOT_A_REAL_CREDENTIAL/;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "cache") yield* walk(p); }
    else yield p;
  }
}

export function scanBuild(buildDir = path.join(ROOT, ".next")) {
  const publicHits = [], privateHits = [];
  for (const f of walk(buildDir)) {
    if (/\.(png|ico|woff2?|map)$/.test(f) && !f.endsWith(".js.map")) continue;
    const text = fs.readFileSync(f, "latin1");
    const rel = path.relative(buildDir, f).replaceAll("\\", "/");
    if (text.includes(PUBLIC_VALUE)) publicHits.push(rel);
    if (PRIVATE_PATTERN.test(text)) privateHits.push(rel);
  }
  return { publicHits, privateHits, clientPublicHits: publicHits.filter((f) => f.startsWith("static/") && f.endsWith(".js")) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (!fs.existsSync(path.join(ROOT, ".next"))) { console.error("No .next build found. Run: npm run build"); process.exit(1); }
  const r = scanBuild();
  console.log("Public value in browser JS:", r.clientPublicHits.length ? r.clientPublicHits : "NOT FOUND");
  console.log("Private key anywhere in build output:", r.privateHits.length ? r.privateHits : "none");
  const ok = r.clientPublicHits.length > 0 && r.privateHits.length === 0;
  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
}
