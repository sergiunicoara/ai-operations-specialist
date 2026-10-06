# Speaker notes: four-minute live demonstration

Target: 4:00. The script is about 330 spoken words (roughly 2.5 minutes at a relaxed pace); the rest of the time is the on-screen actions and the restart. Interface labels are in **bold**; actions are in *italics*. Slide 1 is on screen only until you switch to the browser; slide 3 closes.

| Time | On screen / action | Say |
|---|---|---|
| **0:00 to 0:20** | *Slide 1 (flow), then switch to the demo page.* Point at the yellow banner. | "What actually happens when a secret key leaks? I'll show it with three stages. Everything here is fake and local: fake keys, and a mock API that only runs on this laptop." |
| **0:20 to 1:10** | **Stage A.** *Click **Send request from the browser**. Open Network → `public-ping` → Request Headers. Then Sources, `Ctrl+Shift+F`, search `DEMO_ONLY_PUBLIC`.* | "Stage A. This component reads a variable that starts with `NEXT_PUBLIC_`. Nothing on the page prints it, but watch. The browser sent it in this header, and here, in the production JavaScript file, it is sitting in plain text. Next.js inlines these values at build time. The prefix doesn't make a secret safe; it makes it public. Anything a browser can read, anyone can read." |
| **1:10 to 2:00** | **Stage B.** *Click **Call the server route**. Network → `stage-b`: Request Headers, then Response.* | "Stage B. Now the credential has no prefix and lives on the server. The browser calls our route with no key at all. The server adds the key in its own request to the mock API, and the browser gets back a harmless result. No key in the request, none in the response. But the name alone doesn't protect you. A developer can still return it in a response or copy it into the config. And hiding the key doesn't protect the route: anyone who can reach it can spend the key, so it needs limits, a read-only key and real authentication." |
| **2:00 to 3:30** | **Stage C.** *Click **Run request**: Success, Demo key A.* | "Stage C: the key leaks. First, everything works with Demo key A." |
| | *Click **Rotate key (mock provider)**. Point at the status strip: provider Demo key B, app Demo key A.* | "The provider issues Demo key B and revokes A. Our app doesn't know yet." |
| | *Click **Run request**: Old key rejected, 401.* | "Same app, same code, now rejected. Deleting the key from the repository would not have done this. Only the provider can invalidate it." |
| | *Terminal: `Ctrl+C`, `npm run use-latest-key`, `npm start`. Reload. Status strip shows Demo key B. Click **Run request**: Configuration updated, Success restored.* | "Second half: update our configuration, restart, and the same operation succeeds again. Rotation means changing both what the provider accepts and what the application sends." |
| **3:30 to 4:00** | *Slide 3 (conclusions).* | "Real providers differ. A planned rotation can overlap old and new keys; an actively compromised key needs urgent revocation, and that may interrupt service. So: treat browser values as public, keep credentials on the server, protect the routes that use them, and rotate by revoking at the provider and updating the app." |

## Pacing checkpoints
- 1:10 should find you on Stage B; 2:00 on Stage C. If behind, skip the Sources search and use only the Network header in Stage A.
- The restart takes a few seconds: keep talking ("the app has to re-read its environment").

## Five learning points (say or show each at least once)
1. Browser-delivered values can be inspected.
2. A server can use a credential without giving it to the browser.
3. Removing a key from code does not invalidate it.
4. Rotation must update both provider acceptance and application configuration.
5. A server-side credential still needs permissions, limits and protected endpoints; hiding it does not protect the route.

## Likely questions
- **"Is `NEXT_PUBLIC_` ever fine?"** Yes, for genuinely public values (analytics IDs, publishable keys). Never for secrets.
- **"Why restart?"** `next start` reads the environment when it boots; the demo makes that visible. Platforms with a secrets manager restart or redeploy for you.
- **"Why not just overlap keys?"** For a planned rotation you should. For a compromised key, every minute of overlap is exposure.
- **"Did you test it for real?"** `npm run verify` (42 checks) and `npm run screenshots` (16 UI checks) ran against the production build; see README.
