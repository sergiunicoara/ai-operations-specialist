"""Main agent workflow."""

import json
import re

from llm import chat
from prompts import PLANNER_PROMPT, RESPONSE_PROMPT
from tools import run_cli_command


# The agent intentionally keeps the loop simple: plan, validate, run, explain.
# Each step is isolated so students can see how an LLM-driven tool workflow works.

BLOCKED_PATTERNS = [
    r"\brm\b",
    r"\bmv\b",
    r"\bcp\b",
    r"\bchmod\b",
    r"\bchown\b",
    r"\bsudo\b",
    r"\bshutdown\b",
    r"\breboot\b",
    r"\bmkfs\b",
    r"\bdd\b",
    r"\bkill\b",
    r"\bgit\s+reset\b",
    r"\bgit\s+rebase\b",
    r"\bgit\s+push\b",
    r"\bgit\s+commit\b",
    r"\bgit\s+merge\b",
]


def _extract_json_object(text):
    """Pull the first JSON object out of the planner's text response."""
    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        return text

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return match.group(0)
    return ""


def _plan_command(user_request):
    """Ask the LLM to choose one shell command for the request."""
    planning_messages = [
        {"role": "system", "content": PLANNER_PROMPT},
        {"role": "user", "content": user_request},
    ]

    planner_output = chat(planning_messages)
    json_text = _extract_json_object(planner_output)
    if not json_text:
        return "", "Planner did not return valid JSON."

    try:
        data = json.loads(json_text)
    except json.JSONDecodeError:
        return "", "Planner returned malformed JSON."

    command = str(data.get("command", "")).strip()
    reason = str(data.get("reason", "")).strip()
    if not command:
        return "", "Planner did not provide a command."

    return command, reason


def _is_blocked(command):
    """Reject obvious unsafe commands before they are executed."""
    lowered = command.lower()
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, lowered):
            return True
    return False


def _build_response_messages(user_request, command, reason, result):
    """Package the command output so the LLM can explain it clearly."""
    stdout = result.get("stdout") or "(no stdout)"
    stderr = result.get("stderr") or "(no stderr)"
    exit_code = result.get("exit_code", "unknown")

    user_prompt = f"""
User request:
{user_request}

Planner reason:
{reason or '(none provided)'}

Executed command:
{command}

Exit code:
{exit_code}

STDOUT:
{stdout}

STDERR:
{stderr}

Respond with:
1) A short interpretation.
2) Suggested next command (optional) if helpful.
""".strip()

    return [
        {"role": "system", "content": RESPONSE_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def handle_request_structured(user_request: str) -> dict:
    """Run the plan/validate/run/explain workflow and return a structured result.

    Used by both the CLI (main.py) and the HTTP API (api.py) so the two
    surfaces share one implementation of the agent loop.
    """
    command, reason = _plan_command(user_request)
    if not command:
        return {"ok": False, "error": reason}

    if _is_blocked(command):
        return {"ok": False, "error": f"Blocked unsafe command suggestion: {command}"}

    result = run_cli_command(command)
    messages = _build_response_messages(user_request, command, reason, result)
    explanation = chat(messages)

    return {
        "ok": True,
        "command": command,
        "reason": reason,
        "exit_code": result.get("exit_code"),
        "stdout": result.get("stdout"),
        "stderr": result.get("stderr"),
        "explanation": explanation,
    }


def handle_request(user_request: str) -> str:
    """Process a natural-language request by planning, validating, and running one CLI command."""
    data = handle_request_structured(user_request)
    if not data["ok"]:
        return data["error"]

    return f"$ {data['command']}\n\n{data['explanation']}"
