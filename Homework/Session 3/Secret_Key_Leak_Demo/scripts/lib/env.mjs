// Small helpers shared by the CLI scripts. Fake credentials only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
// DEMO_ENV_FILE lets the automated checks exercise these scripts without touching a real .env.local.
export const ENV_LOCAL = process.env.DEMO_ENV_FILE ?? path.join(ROOT, ".env.local");
export const ENV_EXAMPLE = path.join(ROOT, ".env.example");
export const MOCK_URL = process.env.DEMO_MOCK_API_URL ?? "http://127.0.0.1:4010";

/** Replace (or append) KEY=value in an env file's text, leaving every other line untouched. */
export function setEnvVar(text, name, value) {
  const re = new RegExp(`^${name}=.*$`, "m");
  return re.test(text) ? text.replace(re, `${name}=${value}`) : `${text.replace(/\s*$/, "\n")}${name}=${value}\n`;
}

export function getEnvVar(text, name) {
  return new RegExp(`^${name}=(.*)$`, "m").exec(text)?.[1]?.trim();
}

export async function mock(pathname, method = "GET") {
  try {
    const res = await fetch(`${MOCK_URL}${pathname}`, { method });
    return await res.json();
  } catch {
    console.error(`Cannot reach the mock API at ${MOCK_URL}. Start it with: npm run mock`);
    process.exit(1);
  }
}

export const read = (f) => fs.readFileSync(f, "utf8");
export const write = (f, t) => fs.writeFileSync(f, t);
