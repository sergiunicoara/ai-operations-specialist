"""Domain allow-list, forbidden-page check, prompt-injection logging and bot-check detection."""
import re
from urllib.parse import urlparse

FORBIDDEN_PATH = re.compile(
    r"/(cart|basket|bag|checkout|login|signin|sign-in|log-in|register|signup|account|myaccount|password|orders?)(/|\.|\?|$)",
    re.I,
)

# Text aimed at an AI agent. Ordinary shop UI such as an "Add to Cart" button must NOT match.
INJECTION = [
    r"ignore (all |any )?(previous|prior|above) (instructions|prompts)",
    r"disregard (the |your )?(previous|prior|above|system)",
    r"you are (now )?(an? )?(ai|assistant|language model|llm|agent)",
    r"\b(ai|llm|assistant|agent)s?[, ]+(please |must |should )",
    r"(system|developer) (prompt|message|instruction)",
    r"do not (tell|inform|mention to) the user",
    r"(reveal|print|send|output) (your|the) (api key|secret|password|credentials|system prompt)",
    r"\b(ai|llm|assistant|agent|bot)s?\b[^.\n]{0,60}\b(add to cart|proceed to checkout|buy now|log ?in)\b",
    r"instructions? for (ai|llm|agents?|assistants?)",
]
_INJ = re.compile("|".join(INJECTION), re.I)

CHALLENGE = re.compile(
    r"(press\s*(&|and)\s*hold|verify (that )?you are (a )?human|human verification|are you a (robot|human)|captcha|recaptcha|hcaptcha|"
    r"checking your browser|just a moment\.\.\.|unusual traffic|security check|access denied|attention required|verifying you are human)",
    re.I,
)


def host_allowed(url: str, allowed: list[str]) -> bool:
    host = (urlparse(url).hostname or "").lower()
    if not host:
        return url.startswith(("about:", "chrome-error:", "data:"))
    for d in allowed:
        d = d.lower().lstrip("*.")
        if host == d or host.endswith("." + d):
            return True
    return False


def forbidden_page(url: str) -> bool:
    return bool(FORBIDDEN_PATH.search(urlparse(url).path or ""))


def injection_hits(text: str, limit: int = 3) -> list[str]:
    out = []
    for m in _INJ.finditer(text or ""):
        s = max(0, m.start() - 60)
        out.append(text[s:m.end() + 80].replace("\n", " ").strip())
        if len(out) >= limit:
            break
    return out


def challenge_hit(text: str, title: str = "") -> str | None:
    """Return a short snippet if the page looks like a bot check / CAPTCHA / human-verification screen."""
    for blob in (title or "", text or ""):
        m = CHALLENGE.search(blob)
        if m:
            return blob[max(0, m.start() - 40): m.end() + 60].replace("\n", " ").strip()
    return None
