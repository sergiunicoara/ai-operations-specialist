# Demo runbook: "What happens when a secret key leaks?"

Four-minute live demonstration. Everything is a local simulation with fake credentials. Timings match [SPEAKER_NOTES.md](SPEAKER_NOTES.md).

## 0. One-time setup (do this well before presenting)

```powershell
npm install
npm run setup        # creates .env.local from .env.example (fake values, git-ignored)
npm run build        # production build; NEXT_PUBLIC_ values are inlined NOW
npm run verify -- --skip-build   # optional: 42 automated checks on separate ports
```

> `NEXT_PUBLIC_*` values are frozen at build time. If you change one in `.env.local`, run `npm run build` again.
> Do not run a plain `npm run verify` or `npm run screenshots` while the demo is running: they rebuild or need ports 3000/4010.

## 1. Pre-flight (2 minutes before)

Open **two terminals** in this folder and a browser. Use `127.0.0.1` (not `localhost`) everywhere.

| Window | Command | Expect |
|---|---|---|
| Terminal 1 | `npm run mock` | `EDUCATIONAL MOCK listening on http://127.0.0.1:4010 (active: Demo key A)` |
| Terminal 2 | `npm run reset` then `npm start` | `Ready` on `http://127.0.0.1:3000` |
| Browser | `http://127.0.0.1:3000` (fresh tab) | Banner "EDUCATIONAL DEMONSTRATION"; both status boxes read **Demo key A** |

Browser prep: press `F12`, dock DevTools to the right, open the **Network** tab, zoom the page to ~125% for screen sharing. Keep a second tab on `http://127.0.0.1:4010/console` (optional provider view). Increase terminal font size.

Reset state check: the Stage C **Results** list says "No requests yet."

## 2. The demo, step by step

### Stage A (0:20 to 1:10): a value exposed to the browser

1. Scroll to **Stage A**. Point out that the value is **not printed on the page**.
2. Click **Send request from the browser**. The result box shows `HTTP 200`.
3. In DevTools **Network**, click the `public-ping` request → **Headers** → *Request Headers*: `x-demo-public-key: DEMO_ONLY_PUBLIC_VALUE_NOT_A_REAL_CREDENTIAL`.
4. In DevTools **Sources**, press `Ctrl+Shift+F`, search `DEMO_ONLY_PUBLIC`, click the hit in `/_next/static/chunks/….js`. The literal string sits in the shipped file.
5. Say: the `NEXT_PUBLIC_` prefix makes a value public.

*Production-build proof without DevTools:* `npm run scan` prints the chunk file that contains the public value and confirms the private keys are absent from the whole build.

### Stage B (1:10 to 2:00): a credential used on the server

1. Scroll to **Stage B**. Click **Call the server route**: green box `HTTP 200 … Success`.
2. DevTools **Network** → `stage-b` → **Headers**: no key header. **Response**: only labels and a message.
3. Say: the server added the credential in its own request to the mock API. Naming alone cannot stop a developer returning it in a response or putting it in `next.config` `env`.
4. Say: hiding the key does not protect the route. Anyone who can reach `/api/stage-b` can make the server spend its key. The route has a fixed read-only operation, an origin check and a rate limit; real systems also need authentication and a least-privilege key.

### Stage C (2:00 to 3:30): rotation and revocation

| # | Action | Expect on screen |
|---|---|---|
| 1 | Click **Run request** (step 1) | Results: green **Success** "Demo key A accepted (HTTP 200)" |
| 2 | Click **Rotate key (mock provider)** | Results: amber **Provider rotated** "Demo key B issued, Demo key A revoked". Status strip: *Provider accepts* **Demo key B**, *This app is configured with* **Demo key A** (highlighted) |
| 3 | Click **Run request** (step 3) | Results: red **Old key rejected** "Demo key A is revoked (HTTP 401)" |
| 4 | Terminal 2: `Ctrl+C`, then `npm run use-latest-key` | `Updated .env.local: DEMO_MOCK_API_KEY is now Demo key B.` |
| 5 | Terminal 2: `npm start` (about 1 to 3 seconds) | `Ready` |
| 6 | Browser: reload (`F5`), the log is kept | Status strip: both boxes **Demo key B** |
| 7 | Click **Run request** (step 5) | Amber **Configuration updated**, then green **Success restored** "Demo key B accepted" |

Say: removing a key from code does not invalidate it. Rotation has two halves: the provider's acceptance and our configuration. Planned rotation can overlap old and new keys; an actively compromised key needs urgent revocation and may interrupt service.

*Manual alternative for step 4* (more "real"): open `.env.local`, replace the `DEMO_MOCK_API_KEY=` value with the key shown on `http://127.0.0.1:4010/console` after clicking **Rotate key** there, save, restart.

### Close (3:30 to 4:00)
Switch to the slides' conclusion (or scroll to the Stage C footer text) and read the five takeaways.

## 3. Reset (repeat the demo)

```powershell
# Terminal 2: Ctrl+C to stop the app, then
npm run reset        # provider -> Demo key A; .env.local -> Demo key A
npm start
```

Then reload the browser and click **Reset demo (provider + log)** in Stage C to clear the on-screen log (or open a fresh tab). The status strip must read **Demo key A / Demo key A**.
`npm run reset` needs the mock API running. Restarting Terminal 1 (`npm run mock`) also resets the provider to Demo key A, but not `.env.local`.

## 4. If something goes wrong

| Symptom | Fix |
|---|---|
| Status strip says "mock API offline" | Start Terminal 1: `npm run mock` |
| Stage A button: "Could not reach the mock API" | Same; also open the page at `127.0.0.1`, not another host |
| Request rejected right at step 1 | Provider and app disagree: run `npm run reset`, restart the app |
| `Port 3000 is already in use` | Stop the older `npm start` (Ctrl+C) or end the node process using the port |
| Stage A value not found in JS | You changed `.env.local` after building: `npm run build`, restart |
| Step 7 does not show "Configuration updated" | You skipped the reload, or the log was cleared: the step still succeeds. Check the status strip reads Demo key B |
| Live demo fails entirely | Present [BACKUP_WALKTHROUGH.md](BACKUP_WALKTHROUGH.md) or `docs/backup_walkthrough.pdf` (screenshots of each step) |

## 5. Safety checklist
- All keys are fake and only authenticate against the local mock API. Real `.env*` files stay out of Git (`.gitignore`); only `.env.example` is tracked.
- Both services listen on `127.0.0.1`. No cloud accounts, paid APIs or internet are needed after `npm install`.
- Never paste a real credential into this project.
