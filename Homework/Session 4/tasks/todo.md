# Session 4: Browser agent price-comparison demo

Folder: `Browser_Agent_Price_Demo/` (self-contained, like the Session 1 and Session 3 demos: README, DEMO_RUNBOOK, SPEAKER_NOTES, SOURCES).

## Decisions
- Framework: Browser Use 0.13.11 (pinned), headed Chromium, fresh temp profile, no extensions.
- Model: configurable via `.env` (`LLM_PROVIDER`, `LLM_MODEL`). Key read from `.env`, falling back to the process environment. Key values are never printed or logged, and output is scanned for them.
- Deterministic path: httpx plus schema.org JSON-LD or fixed selectors, no LLM.
- Live shops: proposed in `config/live_task.json`. I'll confirm them with you before the final live run. I'll check each site's robots/terms and record exclusions.
- Fallback: books.toscrape.com, with the same agent, report and deterministic comparison.
- Slides: python-pptx (already installed), 3 slides.
- Recording: ffmpeg is available, so I'll try screen capture. If it fails I'll write a script and say so.

## Steps
- [x] 1. Venv, pinned deps, lockfile, `.gitignore`, `.env.example`
- [x] 2. Read installed Browser Use source: step hooks, usage/cost fields
- [x] 3. `schema.py`: pydantic result model, validators
- [x] 4. `agent_run.py`: safety (allow-list, max steps, time limit, injection logging, system prompt), step capture
- [x] 5. `report.py`: self-contained HTML step log (screenshots, decision, action, verification, time and tokens, summary, mistake highlighting)
- [x] 6. `deterministic.py` and `verify.py`: independent price check
- [x] 7. `compare.py`: N runs each, comparison table
- [x] 8. One-command runners: `run_fallback`, `run_live`, `run_compare`
- [x] 9. Run the fallback end to end, then the live run once shops are confirmed
- [x] 10. Validation checks (domains, secret scan, schema, verify flags a tampered value, report renders)
- [x] 11. Slides, runbook, timed speaker notes, SOURCES, README, screenshots, recording
- [x] 12. Final report, including checks I could not perform

## Review
- All 12 steps done. 28/28 validation checks pass (`VALIDATION.md`); 24/24 selftests.
- Not done / limited: no usable screen recording (labelled replay video instead); `--fast` unmeasured (OpenAI credits exhausted); final comparison batches headless; live shops still need the presenter's confirmation; shop terms of service not read in full.
- Findings worth keeping: the agent reports an unvisited product URL in every fallback run even after a prompt rule against it; Sweetwater shows a bot check to automated browsers (guard stops the agent without interacting); a sleeping/covered display makes headed Chrome stall screenshots 15 s each.
