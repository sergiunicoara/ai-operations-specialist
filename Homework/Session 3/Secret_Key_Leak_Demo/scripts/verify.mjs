// End-to-end verification on isolated ports (mock 4110, app 3110/3111/3112). Uses env overrides only:
// it never reads or writes your real .env.local. Usage: npm run verify [-- --skip-build]
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { startMock, runNext, startNext, post } from "./lib/harness.mjs";
import { scanBuild, PUBLIC_VALUE } from "./scan-assets.mjs";
import { keyFor, labelFor, PUBLIC_VALUE as MOCK_PUBLIC } from "../mock-api/server.mjs";

const MOCK_PORT = 4110, APP_PORT = 3110;
const MOCK = `http://127.0.0.1:${MOCK_PORT}`;
const KEY_A = keyFor(0), KEY_B = keyFor(1);
const results = [];
const check = (name, cond, detail = "") => {
  results.push({ name, ok: !!cond });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${!cond && detail ? `\n      ${detail}` : ""}`);
};
const noKeys = (s) => !/DEMO_KEY_[A-Z]_FAKE/.test(s);
const status = (key) => fetch(`${MOCK}/v1/status`, { headers: key === undefined ? {} : { "x-demo-api-key": key } });
const appEnv = (key, extra = {}) => ({
  DEMO_MOCK_API_KEY: key, DEMO_MOCK_API_URL: MOCK,
  NEXT_PUBLIC_DEMO_EXPOSED_KEY: PUBLIC_VALUE, NEXT_PUBLIC_DEMO_MOCK_API_URL: MOCK, ...extra,
});

const mock = await startMock(MOCK_PORT);
const apps = [];
try {
  console.log("\n== Mock API ==");
  check("binds to 127.0.0.1 only", mock.server.address().address === "127.0.0.1");
  let r = await status(undefined);
  check("rejects a missing credential (401 missing_key)", r.status === 401 && (await r.json()).error === "missing_key");
  r = await status("DEMO_KEY_WRONG");
  check("rejects an incorrect credential (401 invalid_key)", r.status === 401 && (await r.json()).error === "invalid_key");
  r = await status(KEY_A);
  check("accepts Demo key A before rotation", r.status === 200 && (await r.json()).keyLabel === "Demo key A");
  r = await fetch(`${MOCK}/v1/records/purge`, { method: "POST", headers: { "x-demo-api-key": KEY_A } });
  check("least privilege: demo key cannot purge (403 insufficient_scope)", r.status === 403);
  r = await fetch(`${MOCK}/v1/public-ping`, { headers: { "x-demo-public-key": MOCK_PUBLIC, origin: "http://127.0.0.1:3000" } });
  check("public tier accepts the browser-delivered value, with CORS for the demo origin", r.status === 200 && r.headers.get("access-control-allow-origin") === "http://127.0.0.1:3000");
  r = await fetch(`${MOCK}/v1/public-ping`, { headers: { origin: "http://evil.example" } });
  check("public tier: unknown origin gets no CORS header", r.status === 401 && !r.headers.get("access-control-allow-origin"));
  r = await status(KEY_B);
  check("Demo key B is not valid before it is issued", r.status === 401 && (await r.json()).error === "invalid_key");

  const rot = await (await post(`${MOCK}/admin/rotate`)).json();
  check("rotation issues Demo key B and revokes Demo key A", rot.issuedLabel === "Demo key B" && rot.revokedLabel === "Demo key A" && rot.newKey === KEY_B);
  r = await status(KEY_A);
  const body = await r.json();
  check("rejects the revoked key (401 revoked_key, labelled Demo key A)", r.status === 401 && body.error === "revoked_key" && body.keyLabel === "Demo key A");
  r = await status(KEY_B);
  check("accepts Demo key B after rotation", r.status === 200);
  r = await status(undefined);
  check("still rejects missing credential after rotation", r.status === 401);

  await post(`${MOCK}/admin/reset`);
  r = await status(KEY_A);
  check("reset restores Demo key A", r.status === 200);
  r = await status(KEY_B);
  check("reset discards Demo key B", r.status === 401);
  const example = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
  check(".env.example holds only the fake A key and public value", example.includes(`DEMO_MOCK_API_KEY=${KEY_A}`) && example.includes(`NEXT_PUBLIC_DEMO_EXPOSED_KEY=${PUBLIC_VALUE}`) && !example.includes(KEY_B));
  check("labels are as documented", labelFor(0) === "Demo key A" && labelFor(1) === "Demo key B");

  console.log("\n== CLI scripts (temp env file) ==");
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "skl-")), ".env.local");
  const cli = async (s) => (await promisify(execFile)(process.execPath, [path.join(ROOT, "scripts", s)], { env: { ...process.env, DEMO_ENV_FILE: tmp, DEMO_MOCK_API_URL: MOCK }, encoding: "utf8" })).stdout;
  await cli("setup.mjs");
  check("setup creates the env file with Demo key A", fs.readFileSync(tmp, "utf8").includes(`DEMO_MOCK_API_KEY=${KEY_A}`));
  await cli("rotate.mjs"); await cli("use-latest-key.mjs");
  check("rotate + use-latest-key writes Demo key B into the env file", fs.readFileSync(tmp, "utf8").includes(`DEMO_MOCK_API_KEY=${KEY_B}`));
  await cli("reset.mjs");
  check("reset restores Demo key A in env file and provider", fs.readFileSync(tmp, "utf8").includes(`DEMO_MOCK_API_KEY=${KEY_A}`) && (await status(KEY_A)).status === 200);

  console.log("\n== Production build and browser assets ==");
  if (!process.argv.includes("--skip-build")) {
    await runNext(["build"], appEnv(KEY_A));
  }
  const scan = scanBuild();
  check("fake public value is inlined into browser JavaScript (.next/static)", scan.clientPublicHits.length > 0, JSON.stringify(scan));
  check("private fake keys appear nowhere in the build output", scan.privateHits.length === 0, JSON.stringify(scan.privateHits));

  // Negative control: the scanner must flag a deliberately planted leak, otherwise "none found" would prove nothing.
  const fake = fs.mkdtempSync(path.join(os.tmpdir(), "skl-build-"));
  fs.mkdirSync(path.join(fake, "static", "chunks"), { recursive: true });
  fs.writeFileSync(path.join(fake, "static", "chunks", "leak.js"), `var k="${KEY_A}";`);
  const planted = scanBuild(fake);
  check("scanner negative control: detects a planted private key in client JS", planted.privateHits.length === 1 && planted.clientPublicHits.length === 0);

  console.log("\n== Application: before rotation (key A) ==");
  const appA = await startNext({ port: APP_PORT, env: appEnv(KEY_A) }); apps.push(appA);
  const html = await (await fetch(appA.base + "/")).text();
  const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
  const served = await Promise.all(scripts.map(async (s) => (await fetch(appA.base + s)).text()));
  check("browser receives JS files", served.length > 0);
  check("served browser JS contains the public value", served.some((t) => t.includes(PUBLIC_VALUE)));
  check("served HTML + JS contain no private key", noKeys(html) && served.every(noKeys));
  check("page HTML is educational-labelled", html.includes("EDUCATIONAL DEMONSTRATION"));

  let res = await post(appA.base + "/api/stage-b");
  let text = await res.text(); let j = JSON.parse(text);
  check("Stage B works with Demo key A (200, ok)", res.status === 200 && j.ok === true && j.providerKeyLabel === "Demo key A");
  check("Stage B response contains no credential", noKeys(text));
  res = await fetch(appA.base + "/api/demo/state"); text = await res.text();
  check("state endpoint exposes labels only", noKeys(text) && JSON.parse(text).app.configuredKeyLabel === "Demo key A");

  console.log("\n== Rotation: unchanged application ==");
  res = await post(appA.base + "/api/demo/rotate", { headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "rotate" }) });
  text = await res.text();
  check("demo rotate route returns labels but not the new key", res.status === 200 && noKeys(text) && JSON.parse(text).issuedLabel === "Demo key B");
  res = await post(appA.base + "/api/stage-b"); text = await res.text(); j = JSON.parse(text);
  check("unchanged app is rejected: 502 / revoked_key / upstream 401", res.status === 502 && j.reason === "revoked_key" && j.upstreamStatus === 401);
  check("failure response contains no credential", noKeys(text));
  check("server log contains no credential", noKeys(appA.output()), appA.output().slice(-500));
  await appA.stop(); apps.pop();

  console.log("\n== Config updated to Demo key B, restart ==");
  const appB = await startNext({ port: APP_PORT, env: appEnv(KEY_B) }); apps.push(appB);
  res = await post(appB.base + "/api/stage-b"); text = await res.text(); j = JSON.parse(text);
  check("same operation succeeds again with Demo key B", res.status === 200 && j.ok && j.providerKeyLabel === "Demo key B" && j.configuredKeyLabel === "Demo key B");
  check("no credential in response or log after restart", noKeys(text) && noKeys(appB.output()));

  console.log("\n== Reset procedure is repeatable ==");
  await post(`${MOCK}/admin/reset`);
  res = await post(appB.base + "/api/stage-b"); j = await res.json();
  check("after provider reset, app still on key B is rejected (config must be reset too)", res.status === 502 && j.reason === "invalid_key");
  await appB.stop(); apps.pop();
  const appA2 = await startNext({ port: APP_PORT, env: appEnv(KEY_A) }); apps.push(appA2);
  res = await post(appA2.base + "/api/stage-b"); j = await res.json();
  check("after reset + restart with key A the demo works again", res.status === 200 && j.ok);
  // second full cycle proves repeatability
  await post(`${MOCK}/admin/rotate`);
  res = await post(appA2.base + "/api/stage-b"); j = await res.json();
  check("second cycle: rotation again revokes key A", res.status === 502 && j.reason === "revoked_key");
  await post(`${MOCK}/admin/reset`);

  console.log("\n== Route guards and failure modes ==");
  res = await post(appA2.base + "/api/stage-b", { headers: { origin: "http://evil.example" } });
  check("cross-origin browser request is refused (403)", res.status === 403);
  res = await post(appA2.base + "/api/stage-b", { headers: { origin: appA2.base } });
  check("same-origin request is allowed", res.status === 200);
  await appA2.stop(); apps.pop();

  const noKeyApp = await startNext({ port: APP_PORT, env: appEnv("") }); apps.push(noKeyApp);
  res = await post(noKeyApp.base + "/api/stage-b"); j = await res.json();
  check("app with no key configured: provider answers missing_key", res.status === 502 && j.reason === "missing_key" && j.configuredKeyLabel === "no key configured");
  await noKeyApp.stop(); apps.pop();

  const downApp = await startNext({ port: APP_PORT, env: appEnv(KEY_A, { DEMO_MOCK_API_URL: "http://127.0.0.1:4119" }) }); apps.push(downApp);
  res = await post(downApp.base + "/api/stage-b"); text = await res.text(); j = JSON.parse(text);
  check("provider unreachable: clean error, no credential", res.status === 502 && j.reason === "unreachable" && noKeys(text) && noKeys(downApp.output()));
  await downApp.stop(); apps.pop();

  const limited = await startNext({ port: APP_PORT, env: appEnv(KEY_A, { DEMO_ROUTE_RATE_LIMIT_PER_MIN: "3" }) }); apps.push(limited);
  const codes = []; for (let i = 0; i < 5; i++) codes.push((await post(limited.base + "/api/stage-b")).status);
  check("rate limit returns 429 after the limit", codes.slice(0, 3).every((c) => c === 200) && codes.slice(3).every((c) => c === 429), codes.join(","));
  await limited.stop(); apps.pop();
} catch (e) {
  check("verification ran without an unexpected error", false, String(e.stack ?? e));
} finally {
  for (const a of apps) await a.stop();
  await mock.stop();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
