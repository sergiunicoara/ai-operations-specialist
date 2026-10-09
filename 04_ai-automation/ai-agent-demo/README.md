# ai-agent-demo

A small AI agent for terminal commands: it accepts a natural-language
request, asks Gemini to suggest one shell command, runs it, and explains
the real output. No LangChain, CrewAI, AutoGen, or other agent framework —
just plan, validate, run, explain.

`agent.handle_request_structured()` is the one implementation of that
loop; `main.py` is the CLI in front of it. The [`../make`](../make) folder
puts an HTTP API in front of the same function so an automation tool like
Make.com can call it — see that folder for the API and the Slack scenario
built on top of it.

## Setup

Dependencies are declared in the [root `pyproject.toml`](../../pyproject.toml). From the repo root:

```
uv sync
```

Then create a local env file in this folder:

```
cp .env.example .env
```

and add your Gemini key:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Usage

```
uv run python main.py "show me the current directory"
uv run python main.py "list the files in this folder"
uv run python main.py "show disk usage for the current directory"
uv run python main.py "tell me which Python version is installed"
```

## How it works

1. Receive the user request.
2. Ask Gemini to suggest one shell command as JSON (`agent._plan_command`).
3. Validate and safety-check the suggested command against a denylist of
   mutating/high-risk patterns (`rm`, `chmod`, `sudo`, `git push`, etc.).
4. Execute the command and capture stdout/stderr (`tools.run_cli_command`).
5. Ask Gemini to explain the real output — it's told not to invent details.
6. Return the result as text (`handle_request`) or structured data
   (`handle_request_structured`, used by `../make/api.py`).

## Notes

- This project does not use LangChain, CrewAI, AutoGen, or other agent
  frameworks.
- The assistant is instructed to avoid inventing output details.
- For safety, mutating or high-risk commands are blocked — but this is a
  denylist, not a sandbox. See
  [`../make/README.md`](../make/README.md#security-notes-before-exposing-this)
  before exposing this agent over the network.
