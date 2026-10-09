"""Gemini API communication."""

import os

from dotenv import load_dotenv
from google import genai


# Load environment variables from .env so local development stays simple.
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def _messages_to_text(messages):
    """Convert the chat history into a single prompt string for the Gemini API."""
    parts = []
    for message in messages:
        role = message.get("role", "user").upper()
        content = message.get("content", "")
        parts.append(f"{role}:\n{content}")
    return "\n\n".join(parts)


def chat(messages: list[dict[str, str]]) -> str:
    """Send messages to Gemini and return a text response."""
    if not GEMINI_API_KEY:
        return "Missing GEMINI_API_KEY. Add it to your environment and try again."

    prompt_text = _messages_to_text(messages)

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt_text,
        )
    except Exception as error:
        return f"Gemini API error: {error}"

    if getattr(response, "text", None):
        return response.text.strip()

    return "Gemini returned an empty response."
