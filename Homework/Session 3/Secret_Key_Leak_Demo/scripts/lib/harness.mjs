// Process helpers for verify.mjs and capture-screenshots.mjs (start/stop mock API and the production Next server).
import { spawn } from "node:child_process";
import path from "node:path";
import { ROOT } from "./env.mjs";
import { createMockApi } from "../../mock-api/server.mjs";

const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

export function startMock(port) {
  const server = createMockApi();
  const realLog = console.log;
  console.log = (...a) => { if (!String(a[0]).startsWith("[mock-api]")) realLog(...a); }; // keep verify output readable
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({ server, url: `http://127.0.0.1:${port}`, stop: () => new Promise((r) => server.close(r)) });
    });
  });
}

export function runNext(args, env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [NEXT_BIN, ...args], { cwd: ROOT, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("exit", (code) => (code === 0 ? resolve(out) : reject(new Error(`next ${args[0]} failed (${code})\n${out.slice(-2000)}`))));
  });
}

export async function startNext({ port, env = {} }) {
  const p = spawn(process.execPath, [NEXT_BIN, "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: ROOT, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  p.stdout.on("data", (d) => (output += d));
  p.stderr.on("data", (d) => (output += d));
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(base + "/")).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
    if (i === 79) { p.kill(); throw new Error("Next server did not start:\n" + output); }
  }
  return {
    base,
    output: () => output,
    stop: () => new Promise((resolve) => {
      if (p.exitCode !== null) return resolve();
      p.once("exit", resolve);
      if (process.platform === "win32") spawn("taskkill", ["/pid", String(p.pid), "/t", "/f"]); else p.kill();
    }),
  };
}

export const post = (url, init = {}) => fetch(url, { method: "POST", ...init });
