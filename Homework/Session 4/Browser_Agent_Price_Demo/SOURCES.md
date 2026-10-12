# Sources

Pages opened and read on 2026-10-12. Claims below are limited to what those pages said.

## Browser Use (open source)
- [Open-source quickstart](https://docs.browser-use.com/open-source/quickstart.md): `pip install browser-use`, `Agent(task=..., llm=..., browser=...)`, one API key per provider in `.env`.
- [Agent parameters](https://docs.browser-use.com/open-source/customize/agent/all-parameters.md): `output_model_schema`, `extend_system_message`, `use_vision`, `calculate_cost`, `max_failures`.
- [Browser parameters](https://docs.browser-use.com/open-source/customize/browser/all-parameters.md): `headless`, `user_data_dir`, `allowed_domains` (pattern syntax such as `*.example.com`), `enable_default_extensions`, `record_video_dir`.
- [History / output format](https://docs.browser-use.com/open-source/customize/agent/output-format.md): `AgentHistoryList` methods. The page says `is_successful()` is the agent's own assessment and that important outcomes should be verified separately; this demo does that in `src/verify.py`.
- [Supported models](https://docs.browser-use.com/open-source/supported-models.md) and the [docs index](https://docs.browser-use.com/llms.txt).
- Version used: browser-use **0.13.11** (latest on PyPI on the run date), pinned in `requirements.lock`.

### Outdated or incomplete sources found
- The Browser Use *introduction* page documents the hosted Cloud API / `browser-use-sdk`, which is a different API from the open-source library. The open-source docs live under `/open-source/`.
- The docs index warns against the older `/open-source/llms*.txt` exports; use `llms.txt` and the linked `.md` pages.
- The Agent-parameters page does not list `task`, `llm`, `max_steps`, `register_new_step_callback` or `use_judge`. These were read from the installed 0.13.11 source (`agent/service.py`) instead.
- The output-format page does not describe token or cost usage; those come from `agent.token_cost_service` in the installed source.
- The quickstart example uses `gpt-4.1-mini` and `claude-sonnet-4-0`; model names in docs date quickly. This project reads the model from `.env`.

## Playwright
- [Playwright for Python: installation](https://playwright.dev/python/docs/intro): `playwright install` installs browsers. The page leads with the pytest plugin (`pip install pytest-playwright`); the bare library is a dependency of it and of Browser Use. Playwright 1.62.0 is installed here.

## Model provider agent documentation
- OpenAI, [computer use guide](https://developers.openai.com/api/docs/guides/tools-computer-use): the loop of screenshot, model-returned actions, then a new screenshot; advises treating screen content as untrusted and verifying results rather than trusting the final answer. **Outdated link:** `platform.openai.com/docs/guides/tools-computer-use` now redirects (301) here.
- Anthropic, [computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool): screenshot and action loop (click, type, scroll, wait). The page describes a migration between tool versions. **Outdated link:** `docs.anthropic.com/en/docs/agents-and-tools/tool-use/computer-use-tool` redirects (301) to `platform.claude.com`. Tool version names change; check the page before using them.
- This demo uses the model through Browser Use's `ChatOpenAI` wrapper (DOM text plus screenshot), not the providers' pixel-only computer-use tools. That difference is stated in the slides and notes.

## Practice site and structured data
- [Books to Scrape](https://books.toscrape.com/): a sandbox site built for scraping practice. It has no `robots.txt` (404) and shows no shipping.
- [schema.org Product](https://schema.org/Product) and [Offer](https://schema.org/Offer): the vocabulary behind the JSON-LD the deterministic extractor reads.
- Alamo Music appears to be a Shopify store: its `/products/<handle>.json` endpoint returned product JSON. No Shopify documentation was read for this; treat the endpoint as public but unofficial for price checks.

## Site checks (live shops)
| Site | Result of checks on 2026-10-12 | Decision |
|---|---|---|
| sweetwater.com | robots.txt allows product pages (disallows cart, checkout, account). A plain script got 200 once, then 403 after a handful of requests. The browser agent loaded it normally. | Included for the agent; the deterministic path is recorded as blocked and is not retried. |
| alamomusic.com | robots.txt disallows cart, checkout, account, search; crawl-delay 1. Product page and `.json` allowed. | Included. |
| markertek.com | No robots.txt (404). Product page has JSON-LD. | Included. |
| bookshop.org, betterworldbooks.com | Cloudflare challenge page (403) to plain HTTP clients. | Excluded: would need to bypass a bot check. |
| blackwells.co.uk, booksamillion.com, hive.co.uk, powells.com, alibris.com, microcenter.com | Cloudflare challenge on robots.txt. | Excluded for the same reason. |
| foyles.co.uk | robots.txt disallows GPTBot and Google-Extended. | Excluded: signals no AI crawling. |
| thriftbooks.com | robots.txt disallows `/` for some bots; not used. | Excluded: unclear permission. |
| adorama.com | 403 to scripts. | Excluded: the deterministic path cannot read it, and permission was not checked further. |

Website terms of service were **not** read in full for every shop. Confirm the three shops before the final run.
