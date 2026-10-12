# Browser agent vs deterministic extraction: measured comparison

Measured on 2026-10-12. Model: OpenAI `gpt-4.1` through Browser Use 0.13.11 (Playwright 1.62.0, Python 3.11). 3 runs of each approach per task. These final batches ran **headless** (see "Why headless" below); the demo itself is headed. Raw files: `runs/fallback/comparison_20261012_114337.*` and `runs/live/comparison_20261012_114704.*`.

"Success" is strict: every expected item came back as a schema-valid record **and** its page was re-fetched independently and matched (price and, for the agent, a URL that exists).

## Fallback task: three named books on books.toscrape.com

| Measure (mean of 3 runs) | Browser agent | Deterministic (HTTP + fixed selectors) |
|---|---|---|
| Time per run | 72.8 s (54 / 74 / 91) | 4.8 s |
| Cost per run | $0.138 (121,094 tokens) | $0 |
| Requests | 9 model calls + 9 page loads | 6 HTTP requests (3 catalogue pages + 3 product pages) |
| Success rate (strict) | 0/3 | 3/3 |
| Price correct (9 records) | 9/9 | 9/9 |
| Product URL valid (9 records) | 6/9 | 9/9 |
| Result consistency across runs | 3/3 identical | 3/3 identical |
| Per-site code | none | one extractor per site |

**Why the agent scores 0/3 on strict success:** in all three runs the agent reported the right price for *Sophie's World* (15.94) but a product URL it never visited (`…sophies-world_973…` instead of `…_966…`). The independent re-fetch got HTTP 404 and marked it UNVERIFIED. The same URL error appeared in every earlier run, including after the system prompt was changed to say "never build, guess or shorten a URL". It is consistent, not random.

## Live task: Shure SM58-LC on three public shops

| Measure (mean of 3 runs) | Browser agent | Deterministic |
|---|---|---|
| Time per run | 54.1 s (62 / 46 / 54) | 1.7 s |
| Cost per run | $0.068 (59,096 tokens) | $0 |
| Requests | 5 model calls + 4 page loads | 2 HTTP requests |
| Shops returned and verified (of 3) | 2 | 2 |
| Success rate (strict, all 3 shops) | 0/3 | 0/3 |
| Result consistency | 3/3 identical | 3/3 identical |

Both approaches lose the same shop, for different reasons:
- **Sweetwater**: in these headless runs it showed a "Press & Hold to confirm you are a human" page. The step guard detected it at step 1 and stopped the agent **without interacting**; the shop is recorded as blocked. A plain HTTP request got 403, and the harness did not retry. (In one headed run Sweetwater did load normally for the agent: 109.00, free shipping. Bot checks vary run to run.)
- **Alamo Music** and **Markertek**: both approaches returned 109.00 USD, verified OK. Shipping: the agent read free shipping on Markertek (banner "free over $49") and `null` on Alamo (not shown); the deterministic code found the same, because Markertek states the rule in static HTML and Alamo does not.

## What happened in the earlier, headed batch (also kept)

`runs/*/earlier_headed_batch/`. Before the guard and prompt fixes, with a headed window: fallback agent mean 230.9 s, 0/3; two of three runs hit the 240 s limit because Chrome's screenshot calls stalled for 15 s at a time while the display was not painting. Live agent mean 135.4 s. In two live runs the agent clicked a "Press & Hold" human-verification button on Sweetwater. That broke the no-CAPTCHA rule, so the bot-check guard was added and verified in the later runs (the agent is stopped before the decided action runs). These earlier numbers are real but reflect the bugs and the display stall, not the approach.

## Honest limits

- Only 3 runs per cell, one model, one day. Treat times and costs as indicative.
- Time is inflated or deflated by network, API latency and (headed) display state: the same fallback task took 54 to 244 s across batches.
- The independent check uses a deterministic parser, so the deterministic approach checks itself; that is why its success is partly circular. The check is still independent of the agent.
- The deterministic approach has no way to read shipping that is not in static HTML or structured data. It breaks if a page layout changes and needs one extractor per site (here: `jsonld`, `shopify_json`, and a fixed-selector one for books.toscrape.com).
- Request counts are not like for like: the agent's "page loads" are browser navigations that each fetch many resources.
- `--fast` mode (shorter waits, no separate reasoning text) was implemented but **not measured**: the OpenAI account ran out of credits.

## Why headless for the final batches

During development the headed Chrome window stopped painting for about an hour (screenshot calls timed out after 15 s each). Headless runs are not affected. Headed runs worked before and after that period and are what the demo uses; example headed reports are in `docs/example_reports/`.
