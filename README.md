# ai-operations-specialist

Course materials. Each folder is a topic; each demo folder is self-contained and
links back to the shared dependency list in [`pyproject.toml`](pyproject.toml).

| Session | Folder | Topic |
| --- | --- | --- |
| 1 | [01_ai-foundations/genai-demo](01_ai-foundations/genai-demo) | How generative AI actually works: tokenization, embeddings, prediction, generation |
| 2 | [02_data-analytics/spreadsheet-cleanup-demo](02_data-analytics/spreadsheet-cleanup-demo) | Cleaning and categorizing a messy spreadsheet with pandas + a zero-shot classifier |
| 3 | [02_data-analytics/sentiment-analysis-demo](02_data-analytics/sentiment-analysis-demo) | EDA on a Hugging Face dataset, ending in sentiment analysis with a pretrained model |
| 4 | [04_ai-automation](04_ai-automation) | Automation with AI agents: a plan/validate/run/explain ops agent ([`ai-agent-demo`](04_ai-automation/ai-agent-demo)), exposed over a FastAPI endpoint and wired into a Make.com Slack scenario ([`make`](04_ai-automation/make)) |
| 5 | [03_ai-web-dev/typing-test-app](03_ai-web-dev/typing-test-app) | AI-assisted web development: building a typing speed test app live with v0, Next.js, Supabase, Stripe, and Vercel |

## Setup

```
uv sync
```
