# What happens when a secret key leaks? (live demo)

A four-minute, fully local demonstration for a team presentation. A Next.js (TypeScript) app plus a tiny mock API show three things: a value exposed to the browser, a credential used only on the server, and key rotation/revocation.

**Educational demonstration.** Every credential is fake and authenticates only against the local mock API. No cloud account, paid API or internet access is needed after `npm install`. Both services bind to `127.0.0.1`.

## Quick start

Requires Node.js 20.9+ (tested on Node 24, Next.js 16.3.8, React 19.3.0).

```powershell
npm install
npm run setup     # .env.local from .env.example (fake values; git-ignored)
npm run build     # production build (NEXT_PUBLIC_ values are inlined here)
```

Then use **two terminals**:

```powershell
npm run mock      # terminal 1: mock provider API on http://127.0.0.1:4010
npm start         # terminal 2: Next.js production server on http://127.0.0.1:3000
```

Open `http://127.0.0.1:3000`. The full live procedure, rotation, restart and reset steps are in [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md).

## What is where

| Path | Purpose |
|---|---|
| `app/`, `components/` | UI: Stage A, B, C sections and a live status strip |
| `app/api/stage-b/route.ts` | Browser → server route → mock API. Adds the credential server-side; returns a harmless result |
| `lib/server/*` | `server-only` modules: credential access, mock client, route guards |
| `mock-api/server.mjs` | Dependency-free mock provider (key state, rotate/revoke, `/console`) |
| `scripts/` | `setup`, `rotate`, `use-latest-key`, `reset`, `scan-assets`, `verify`, `capture-screenshots`, `render-diagram`, `build-backup-walkthrough` |
| `.env.example` | Fake values only. Copy to `.env.local` (git-ignored) |
| `presentation/` | Editable 3-slide deck `secret_key_leak_demo.pptx` (+ PDF, previews, build script) |
| `docs/` | `architecture.svg/png`, `screenshots/`, `backup_walkthrough.pdf` |
| `SPEAKER_NOTES.md`, `DEMO_RUNBOOK.md`, `BACKUP_WALKTHROUGH.md`, `ARCHITECTURE.md`, `SOURCES.md` | Talk, procedure, fallback, design, references |

## npm scripts

| Command | Does |
|---|---|
| `npm run mock` | Start the mock API (in-memory state; restart = Demo key A active) |
| `npm run build` / `npm start` | Production build / serve it (use these for the demo, not `dev`) |
| `npm run rotate` | CLI version of "provider rotates the key" |
| `npm run use-latest-key` | Copy the provider's current fake key into `.env.local` (then restart the app) |
| `npm run reset` | Provider back to Demo key A **and** `.env.local` back to Demo key A |
| `npm run scan` | After a build: public value must be in browser JS; private keys must be nowhere in `.next` |
| `npm run verify` | 43 automated end-to-end checks (own ports 4110/3110x, never touches your `.env.local`) |
| `npm run screenshots` | Drive the real flow in headless Edge/Chrome, run 16 UI checks, save `docs/screenshots` (needs ports 3000/4010 free) |
| `npm run diagram` / `npm run backup` | Re-render the architecture PNG / the backup walkthrough |
| `npm run typecheck` | `tsc --noEmit` |

## The three stages in one paragraph each

**A. Exposed to the browser.** `components/StageA.tsx` references `process.env.NEXT_PUBLIC_DEMO_EXPOSED_KEY`; `next build` replaces it with the literal string in the JavaScript sent to browsers. The button sends it to the mock API's public tier, so it is visible in the Network tab, and it can be found in `/_next/static/chunks/*.js`. Nothing on the page prints it.

**B. Used on the server.** `DEMO_MOCK_API_KEY` has no `NEXT_PUBLIC_` prefix, is read in a `server-only` module at request time, and is added as an `x-demo-api-key` header by the route handler. The browser sends no credential and gets back only `{ ok, message, labels }`. The route additionally has a fixed read-only operation, an origin check and a rate limit; these are illustrative, not a substitute for authentication.

**C. Rotation.** The mock provider holds its own key state (independent of the app's config). Rotating issues Demo key B and invalidates Demo key A at once; the unchanged app then receives `401 revoked_key`; updating `.env.local` and restarting restores success.

## Verification status (what was actually run)

Run on Windows 11, Node 24.12, Next.js 16.3.8, Edge 154 (headless):
- `npm run typecheck`: clean.
- `npm run verify`: **43/43** checks, including: public value inlined in browser JS; private keys absent from `.next` and from served HTML/JS; mock API rejects missing, incorrect and revoked credentials; works before rotation, fails with the revoked key, works after the config update and restart; reset and a second full cycle are repeatable; no credential in any response or in the server log; scanner negative control.
- `npm run screenshots`: **16/16** UI checks in a real browser against the production build, using the real scripts and `.env.local`.

Not performed / limitations:
- Not tested on macOS or Linux, or with browsers other than Chromium-based Edge.
- Screenshots 03, 05, 09 and 11 are rendered panels built from captured real data (served JS excerpt, browser network events, command output), because headless browsers cannot capture the DevTools UI itself. The DevTools clicking steps in the runbook were not exercised in a visible DevTools window.
- Slide previews were rendered with LibreOffice; PowerPoint was not available here (its automation interface is broken on this machine), so line breaks in PowerPoint may differ slightly.
- Mock rotation is a simplification: it revokes immediately with no overlap window. Real providers differ.
- The in-memory rate limit and origin check protect a single process only. They illustrate the idea.

## Troubleshooting
See the table in [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md#4-if-something-goes-wrong). Most issues are: mock API not running, page opened on a different host than `127.0.0.1`, or `.env.local` edited after the build (rebuild for `NEXT_PUBLIC_` changes, restart for the server key).
