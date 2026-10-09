# make

Wires the [`ai-agent-demo`](../ai-agent-demo) ops agent into Slack through
Make.com. Live-demo continuation after showing the agent as a CLI: same
agent, same `plan -> validate -> run -> explain` loop, now triggered from
Slack instead of a terminal. The point for the class — the agent code
never changes; only the trigger does.

```
Slack message "ops: ..."
        |
        v
Make.com: Watch Messages (Slack trigger)
        |
        v
Make.com: Filter — only continue if text starts with "ops:"
        |
        v
Make.com: HTTP — POST to our /ask endpoint   <-- this folder
        |
        v
Make.com: Create a Message (Slack) — reply in thread
```

## Setup

Dependencies are declared in the [root `pyproject.toml`](../../pyproject.toml). From the repo root:

```
uv sync
```

This folder needs its own `.env` for `API_KEY`:

```
cp .env.example .env
```

`GEMINI_API_KEY` / `GEMINI_MODEL` live in
[`../ai-agent-demo/.env`](../ai-agent-demo/.env.example) — `api.py` loads
both files, so set those there (same agent, same credentials, one place).

## Run the API

```
uv run uvicorn api:app --reload --port 8000
```

```
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"request": "show disk usage for the current directory"}'
```

Response:

```json
{
  "ok": true,
  "command": "df -h .",
  "reason": "...",
  "exit_code": "0",
  "stdout": "...",
  "stderr": "",
  "explanation": "..."
}
```

## Security notes before exposing this

This executes LLM-suggested shell commands. The denylist in
[`../ai-agent-demo/agent.py`](../ai-agent-demo/agent.py) blocks *obviously*
destructive commands, but it is not a sandbox — a cleverly phrased request
could still read sensitive files or make a network call. Treat this as a
read-only ops assistant, not a general-purpose remote shell:

- Keep requests to inspection/read-only tasks (disk usage, process list,
  file listing, versions, logs).
- Set `API_KEY` in `.env` once this leaves localhost (e.g. tunneled for
  Make.com) — `api.py` requires it on the `x-api-key` header when set.
- Don't point this at a production host. Run it on a disposable VM or
  container if you want to demo it against a "real" server.

## Outside Make.com: get the API reachable

Make.com's HTTP module needs a public URL — it can't reach `localhost`
directly.

1. Start the API (above), with a real `API_KEY` set.
2. Expose it with a tunnel for the demo (ngrok shown here):

   ```
   ngrok http 8000
   ```

   Copy the `https://....ngrok-free.app` URL it prints — paste this into
   Make.com's HTTP module as `https://<that-url>/ask`.

3. Sanity-check it from outside before switching to Make.com (same `curl`
   as above, pointed at the ngrok URL instead of localhost). If this
   doesn't return JSON, fix it here first — debugging it inside Make.com's
   module tester is slower.

## In Make.com: build the scenario

1. **Create a new scenario.** Add Slack as the app for the first module and
   connect your Slack account/workspace when prompted.

2. **Trigger — Slack "Watch Messages".** Pick the channel you want this
   listening on. This polls on an interval (Make.com's free/starter plans
   don't get Slack event subscriptions), so set it to something like every
   1 minute for the demo.

3. **Filter.** Add a filter on the connection out of the trigger:
   `Text` → *Starts with* → `ops:`. This keeps the scenario from firing (and
   calling the API) on every unrelated message in the channel.

4. **HTTP — "Make a request".**
   - URL: `https://<your-ngrok-url>/ask`
   - Method: `POST`
   - Headers: `Content-Type: application/json`, `x-api-key: <your API_KEY>`
   - Body type: `raw`, content type `JSON (application/json)`
   - Request content:
     ```json
     { "request": "{{replace(1.text; "ops:"; "")}}" }
     ```
     (strips the `ops:` prefix before sending; `1.text` is the Slack
     message text from module 1 — Make.com's mapping panel lets you click
     it in instead of typing the reference by hand)
   - Parse response: on, so later modules can reference fields like
     `command` and `explanation` directly instead of raw JSON text.

5. **Slack — "Create a Message".**
   - Channel: same channel as the trigger.
   - Thread: map it to the triggering message's timestamp, so the reply
     lands as a thread reply rather than a new top-level message.
   - Text, something like:
     ```
     `{{4.command}}`

     {{4.explanation}}
     ```
     (`4.command` / `4.explanation` reference the HTTP module's parsed
     response — adjust the module number if yours differs)

6. **Turn the scenario on**, then test end to end by posting
   `ops: show disk usage for the current directory` in the channel.

## Talking points while it runs

- Worth calling out explicitly: don't point the trigger at a channel where
  people would reasonably type `ops: delete the logs` expecting it to
  actually do that — see the security notes above.
- Swapping Slack for a different trigger (a Typeform submission, a new row
  in Google Sheets, a scheduled run) only changes the first two Make.com
  modules — the HTTP call to `/ask` and the response shape stay the same.
  This is the general pattern for wiring any Make.com trigger to an
  LLM-backed API: trigger → (optional filter/transform) → HTTP call to
  your own API → do something with the structured response.
