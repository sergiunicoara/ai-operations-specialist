# Demo runbook: "A browser agent compares prices like a person would"

Four-minute live demo. Timings match [SPEAKER_NOTES.md](SPEAKER_NOTES.md). All commands run from this folder in PowerShell.

## 0. One-time setup (well before presenting)

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.lock
copy .env.example .env        # add your key to .env; never show this file on screen
.\.venv\Scripts\python run.py selftest
```

Expect `all checks passed`. Edit `tasks/live.json` only after you have confirmed the three shops (see section 6).

## 1. Pre-flight (10 minutes before)

| Check | How | Why |
|---|---|---|
| **Display stays awake and unlocked** | Windows: Settings → System → Power → Screen = Never while plugged in; do not lock the PC; plug in power | A sleeping or covered display makes Chrome stop painting: screenshots stall for 15 s each and the run times out. This happened during development. |
| Fresh dress rehearsal | `.\.venv\Scripts\python run.py fallback` once, headed; confirm the report opens | Warms caches, proves key and network |
| Presentation copies of the reports | Open `runs\fallback\<latest>\report.html` and `runs\live\<latest>\report.html` in two browser tabs | Fallback if the live run is slow |
| Terminal readable | Font ≥ 18 pt, window on the left half; browser window will open on the right | The class must see both |
| Secrets hidden | Close the `.env` file; clear terminal history | Key must not appear on screen |
| Notifications off | Windows Focus assist on | Nothing private pops up over the demo |
| Shops still reachable | Open the three shop URLs once by hand | If one shows a bot check, decide now to swap it (section 6) |

## 2. Timed live sequence (4:00)

| Time | Screen | Action |
|---|---|---|
| 0:00 | Slide 1 | Say the task: same product, three public shops, price plus shipping, read-only. |
| 0:30 | Terminal | Run `.\.venv\Scripts\python run.py live`. A fresh Chrome window opens (no logins, no extensions). |
| 0:30-1:30 | Browser window | Narrate what the agent does while it works. Do not touch the mouse or keyboard in that window. |
| 1:30 | Browser tab | Open the step-log report of the run that just finished (or the rehearsal report if still running). Scroll to one flagged step or the verification table. |
| 1:30-2:45 | Report | Walk one step: screenshot → decision → action → check; then show one mistake or recovery (section 4). |
| 2:45 | `COMPARISON.md` or slide 2 | Read the table. |
| 3:30 | Slide 3 | Conclusion. |
| 4:00 | | Stop. |

If the live run is still going at 1:30, narrate from the rehearsal report and say the new one will finish in a moment; open it at the end.

## 3. Safety limits to mention

Allowed domains only, max 25 steps and 240 s per shop, read-only, no login/cart/checkout, page text treated as data, a bot check stops that shop and is recorded as blocked. The report header shows the visited-URL violation count (expected 0).

## 4. Picking the mistake or recovery to show

Do not stage one. Open the report and use what is really there:
- **Flagged steps** (amber border): the agent's own "previous action failed", repeated actions, errors, cookie banner or pop-up mentions.
- **Verification table**: any `MISMATCH` or `UNVERIFIED`, or "URL visited by agent: NO". In our development runs the agent reported the correct price for one book but a product URL it never visited (it wrote `…_973` instead of `…_966`); the independent check flagged it as UNVERIFIED.
- **Blank first page**: in earlier runs the page stayed empty for a few steps before the agent retried.
- If a run really has none: say "no mistakes were flagged in this run" (the report says it too) and show the verification table as proof of checking.

A harder, clearly labelled variant: `.\.venv\Scripts\python run.py live --product "<name>"` with a product whose shipping is only shown at checkout (the agent must report `null`), or add a shop with a cookie banner to `tasks/live.json`. It is more likely to show a mistake, but it is not guaranteed to.

## 5. If something goes wrong mid-demo

| Symptom | Do this |
|---|---|
| A shop shows a "verify you are human" / Press & Hold / Cloudflare page | Do nothing. The guard stops the agent on that shop without interacting, records it under **blocked sites** and moves to the next shop. Say: "A site blocked automation; we do not bypass it. That is a result." Never click the challenge yourself on stage. |
| Whole live run fails or is too slow | Run the fallback: `.\.venv\Scripts\python run.py fallback` (books.toscrape.com is built for this). |
| Fallback also fails (network, API outage) | Open the saved report from `runs\fallback\…\report.html`, the screenshot set in `docs\key_step_screenshots\`, or play `recording\replay_from_screenshots.mp4` (a replay assembled from step screenshots, labelled as such). |
| Steps take ~15 s each and the log shows `ScreenshotWatchdog … TIMEOUT` | The display is asleep or covered. Wake the screen, keep the browser window visible, rerun. |
| `OPENAI_API_KEY is not set` | `.env` missing or wrong provider; fix `.env`. Do not paste the key anywhere visible. |
| API rate limit / 402 / quota | Switch `LLM_PROVIDER`/`LLM_MODEL` in `.env` to another provider you have a key for, or use the saved report. |
| Agent wanders | Let it hit the step limit; that is itself the lesson. Say so, then show the verification table. |

## 6. Confirming the live shops (before the final run)

`tasks/live.json` currently proposes Sweetwater, Alamo Music and Markertek for the Shure SM58-LC. Confirm each shop is acceptable to you (terms of service were not read in full) and that the product is still listed. To change shops, edit `product_name`, `allowed_domains` and `sites` (each site needs `domain`, `start_url`, `extractor`). Excluded shops and reasons are in [SOURCES.md](SOURCES.md).

## 7. After the demo

The harness deletes its temporary browser profile at the end of each run. Reports and screenshots stay in `runs\`. `.env` stays local and git-ignored.
