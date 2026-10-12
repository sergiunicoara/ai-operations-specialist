# Validation results

Run 2026-10-12T15:24:16: 28/28 checks passed.

| Result | Check | Detail |
|---|---|---|
| PASS | fallback: at least one pipeline run exists | (13 found) |
| PASS | fallback: structured results re-validate against the schema | (3 records) [] |
| PASS | fallback: every step has a screenshot file | (6/6) |
| PASS | fallback: report.html is self-contained and embeds a screenshot for every step | (11 images, 6 steps) |
| PASS | fallback: report has all sections |  |
| PASS | fallback: all visited URLs are on the allow-list | [] |
| PASS | fallback: no cart / checkout / login / account page visited | [] |
| PASS | fallback: safety guard did not fire and run did not time out |  |
| PASS | fallback: step and time limits respected | (steps 6/25, 58.5s) |
| PASS | fallback: browser was headed with fresh profile and no extensions |  |
| PASS | fallback: model and framework version recorded | (openai/gpt-4.1, browser-use 0.13.11) |
| PASS | fallback: independent verification ran for every result | ['OK', 'OK', 'OK'] |
| PASS | live: at least one pipeline run exists | (4 found) |
| PASS | live: structured results re-validate against the schema | (3 records) [] |
| PASS | live: every step has a screenshot file | (6/6) |
| PASS | live: report.html is self-contained and embeds a screenshot for every step | (9 images, 6 steps) |
| PASS | live: report has all sections |  |
| PASS | live: all visited URLs are on the allow-list | [] |
| PASS | live: no cart / checkout / login / account page visited | [] |
| PASS | live: safety guard did not fire and run did not time out |  |
| PASS | live: step and time limits respected | (steps 6/25, 81.2s) |
| PASS | live: browser was headed with fresh profile and no extensions |  |
| PASS | live: model and framework version recorded | (openai/gpt-4.1, browser-use 0.13.11) |
| PASS | live: independent verification ran for every result | ['UNVERIFIED', 'OK', 'OK'] |
| PASS | secret scan: no API key value or key-shaped string in outputs, logs, reports, docs, source | (227 text files + 347 binary files searched for 3 known secret values) |
| PASS | .env is git-ignored |  |
| PASS | .env.example holds placeholders only |  |
| PASS | selftests (schema, guards, redaction, tampered-price detection) |  |

## Checks not performed or limited
- **Screen recording of a run: not generated.** Desktop capture showed the whole desktop with unrelated windows and was deleted; the framework's own recorder produced only 8 s of a 93 s run. `recording/replay_from_screenshots.mp4` is a labelled slideshow of step screenshots, not a screen recording.
- **Allow-list enforcement was not actively provoked.** No test made the agent try to leave the allowed domains; the checks show every visited URL was on the list and that the helper functions behave correctly.
- **Cart/checkout/login guard** was verified by unit tests and the visited-URL check, not by luring the agent to such a page.
- **Bot-check guard** fired in real runs on Sweetwater (see COMPARISON.md); it was not exercised on any other site.
- The validated example runs are headed; the final comparison batches ran headless because the headed display stalled for a period.
- `--fast` mode was not measured: the OpenAI account ran out of credits.
- Screenshots were not OCR-scanned for secrets; they show only public product pages and the key is never typed into any page. Their raw bytes were searched for the exact key values.
- No `.env` file exists in this folder: runs used the key already set in the shell environment (the loader reads `.env` first).
- Website terms of service were not read in full for every shop; only robots.txt and reachability were checked.