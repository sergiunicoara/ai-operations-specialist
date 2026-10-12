"""Settings, secret redaction and logging safety. Keys are never printed or written."""
import logging
import os
import re
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
# Local .env first; falls back to variables already set in the shell.
load_dotenv(ROOT / ".env", override=False)
os.environ.setdefault("ANONYMIZED_TELEMETRY", "false")  # no framework telemetry

KEY_NAME = re.compile(r"(API_KEY|TOKEN|SECRET|PASSWORD)", re.I)
KEY_SHAPES = re.compile(r"(sk-ant-[A-Za-z0-9_\-]{16,}|sk-[A-Za-z0-9_\-]{16,}|AIza[0-9A-Za-z_\-]{20,})")


def _secret_values() -> list[str]:
    return [v for k, v in os.environ.items() if KEY_NAME.search(k) and len(v) >= 8]


def redact(text: str) -> str:
    """Remove any known secret value or key-shaped string from text."""
    if not text:
        return text
    for v in _secret_values():
        text = text.replace(v, "[REDACTED]")
    return KEY_SHAPES.sub("[REDACTED]", text)


class RedactFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        try:
            record.msg = redact(record.getMessage())
            record.args = ()
        except Exception:
            pass
        return True


def install_log_redaction() -> None:
    f = RedactFilter()
    logging.getLogger().addFilter(f)
    for h in logging.getLogger().handlers:
        h.addFilter(f)
    for name in list(logging.root.manager.loggerDict):
        lg = logging.getLogger(name)
        lg.addFilter(f)
        for h in lg.handlers:
            h.addFilter(f)


def setting(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def build_llm():
    """Create the LLM from LLM_PROVIDER / LLM_MODEL. Raises a clear error if the key is missing."""
    provider = setting("LLM_PROVIDER", "openai").lower()
    model = setting("LLM_MODEL", "gpt-4.1")
    need = {"openai": "OPENAI_API_KEY", "google": "GOOGLE_API_KEY", "anthropic": "ANTHROPIC_API_KEY"}
    if provider not in need:
        raise SystemExit(f"LLM_PROVIDER must be one of {sorted(need)}")
    if not setting(need[provider]):
        raise SystemExit(f"{need[provider]} is not set. Copy .env.example to .env and add it.")
    if provider == "openai":
        from browser_use import ChatOpenAI
        return provider, model, ChatOpenAI(model=model, temperature=0)
    if provider == "google":
        from browser_use import ChatGoogle
        return provider, model, ChatGoogle(model=model, temperature=0)
    from browser_use import ChatAnthropic
    return provider, model, ChatAnthropic(model=model, temperature=0)


def versions() -> dict:
    import sys
    from importlib.metadata import PackageNotFoundError, version
    out = {}
    for pkg in ("browser-use", "playwright", "pydantic", "httpx"):
        try:
            out[pkg] = version(pkg)
        except PackageNotFoundError:
            out[pkg] = "not installed"
    out["python"] = sys.version.split()[0]
    return out
