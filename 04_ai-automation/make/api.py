"""HTTP API wrapper around the ops agent, so automation tools (Make.com, Slack,
anything that can send a POST request) can drive it instead of a terminal.

Run locally with:

    uv run uvicorn api:app --reload --port 8000

A request still goes through the same plan -> validate -> run -> explain
workflow as the CLI in ../ai-agent-demo (agent.handle_request_structured),
including the read-only command denylist defined there. Only read-only,
inspection-style requests should ever be sent here - see ./README.md for
the security notes before exposing this beyond localhost.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# agent.py/llm.py/tools.py live in the sibling ai-agent-demo folder - this is
# the one piece of wrapping code that needs to reach across the two folders.
AGENT_DEMO_DIR = Path(__file__).resolve().parent.parent / "ai-agent-demo"
sys.path.insert(0, str(AGENT_DEMO_DIR))

load_dotenv(AGENT_DEMO_DIR / ".env")  # GEMINI_API_KEY / GEMINI_MODEL, shared with the CLI
load_dotenv()  # API_KEY, local to this folder

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from agent import handle_request_structured

API_KEY = os.getenv("API_KEY", "")

app = FastAPI(title="Ops Agent API", version="0.1.0")


class AskRequest(BaseModel):
    request: str


def _check_api_key(x_api_key: str) -> None:
    # Skipping this check when API_KEY is unset keeps local demos simple, but
    # means the endpoint is wide open - always set API_KEY before this is
    # reachable from anywhere but localhost (see README security notes).
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask(payload: AskRequest, x_api_key: str = Header(default="")):
    _check_api_key(x_api_key)

    user_request = payload.request.strip()
    if not user_request:
        raise HTTPException(status_code=400, detail="request must not be empty")

    return handle_request_structured(user_request)
