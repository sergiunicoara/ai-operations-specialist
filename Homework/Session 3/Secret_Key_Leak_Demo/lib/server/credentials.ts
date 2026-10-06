import "server-only";

// The ONLY module that touches process.env.DEMO_MOCK_API_KEY (a "data access layer" of one file).
// `server-only` makes the build fail if a Client Component ever imports this module.
// Naming (no NEXT_PUBLIC_ prefix) keeps the value out of the browser bundle, but nothing here can stop a
// developer from returning the value in a response or copying it into next.config `env`. Review for that.

export function getMockApiUrl(): string {
  return process.env.DEMO_MOCK_API_URL ?? "http://127.0.0.1:4010";
}

/** Read at request time (not build time), so changing .env.local + restarting changes the credential. */
export function getMockApiKey(): string | undefined {
  return process.env.DEMO_MOCK_API_KEY;
}

/** Demo convention: fake keys look like DEMO_KEY_<LETTER>_..., so we can show "Demo key A" without printing the key. */
export function configuredKeyLabel(): string {
  const key = getMockApiKey();
  if (!key) return "no key configured";
  const m = /^DEMO_KEY_([A-Z])_/.exec(key);
  return m ? `Demo key ${m[1]}` : "unrecognised key";
}
