"""Validation over everything the demo produced. Writes VALIDATION.md. Nothing here prints a secret."""
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path

from src import config
from src.config import KEY_SHAPES, ROOT, _secret_values
from src.guards import forbidden_page, host_allowed
from src.schema import validate_items

TEXT_EXT = {".json", ".html", ".md", ".log", ".txt", ".py", ".ps1", ".example", ".lock", ".csv", ".srt"}
ROWS: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str = ""):
    ROWS.append((name, bool(ok), detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name} {detail}")


def latest_runs(task: str, suffix: str) -> list[Path]:
    return sorted(p for p in (ROOT / "runs" / task).glob(f"*_{suffix}") if (p / "run.json").exists())


def secret_scan() -> tuple[int, int, list[str]]:
    """Return (files scanned, binary files checked, hits). Hit lines never contain the secret itself."""
    secrets = _secret_values()
    hits, scanned, binaries = [], 0, 0
    roots = [ROOT / "runs", ROOT / "docs", ROOT / "slides", ROOT / "src", ROOT / "tasks", ROOT / "tests", ROOT / "recording"]
    files = [f for r in roots if r.exists() for f in r.rglob("*") if f.is_file()]
    files += [f for f in ROOT.glob("*") if f.is_file() and f.name != ".env"]
    for f in files:
        data = f.read_bytes()
        if f.suffix.lower() in TEXT_EXT or f.suffix == "":
            scanned += 1
            text = data.decode("utf-8", errors="ignore")
            if any(s in text for s in secrets) or KEY_SHAPES.search(text):
                hits.append(str(f.relative_to(ROOT)))
        else:  # png / pptx / mp4: byte-level search for exact secret values
            binaries += 1
            if any(s.encode() in data for s in secrets):
                hits.append(str(f.relative_to(ROOT)))
    return scanned, binaries, hits


def run_all() -> bool:
    for task, suffix in (("fallback", "fallback"), ("live", "live")):
        runs = latest_runs(task, suffix)
        check(f"{task}: at least one pipeline run exists", runs, f"({len(runs)} found)")
        if not runs:
            continue
        r = runs[-1]
        d = json.loads((r / "run.json").read_text(encoding="utf-8"))
        m, steps = d["meta"], d["steps"]
        ok, errs = validate_items(d["results"], timestamp="x")
        check(f"{task}: structured results re-validate against the schema", len(ok) == len(d["results"]) > 0 and not errs, f"({len(ok)} records) {errs}")
        shots = [s for s in steps if s.get("screenshot") and (r / s["screenshot"]).exists()]
        check(f"{task}: every step has a screenshot file", len(shots) == len(steps) > 0, f"({len(shots)}/{len(steps)})")
        rep = (r / "report.html").read_text(encoding="utf-8") if (r / "report.html").exists() else ""
        imgs = len(re.findall(r"<img ", rep))
        check(f"{task}: report.html is self-contained and embeds a screenshot for every step", imgs >= len(steps) and "src='http" not in rep and 'src="http' not in rep, f"({imgs} images, {len(steps)} steps)")
        check(f"{task}: report has all sections", all(k in rep for k in ("Mistakes and recoveries", "Structured result", "Step-by-step log", "est. cost")))
        allowed = m["allowed_domains"]
        bad = [u for u in m["urls_visited"] if not host_allowed(u, allowed)]
        check(f"{task}: all visited URLs are on the allow-list", not bad, str(bad))
        cart = [u for u in m["urls_visited"] if forbidden_page(u)]
        check(f"{task}: no cart / checkout / login / account page visited", not cart, str(cart))
        check(f"{task}: safety guard did not fire and run did not time out", m["guard"] is None and not m["timed_out"])
        check(f"{task}: step and time limits respected", m["steps"] <= m["max_steps"] and m["wall_seconds"] <= m["time_limit"] + 60, f"(steps {m['steps']}/{m['max_steps']}, {m['wall_seconds']}s)")
        check(f"{task}: browser was headed with fresh profile and no extensions", m["headless"] is False and m["fresh_profile"] and not m["extensions_enabled"])
        check(f"{task}: model and framework version recorded", bool(m["model"]) and m["versions"].get("browser-use", "") not in ("", "not installed"), f"({m['provider']}/{m['model']}, browser-use {m['versions'].get('browser-use')})")
        v = json.loads((r / "verification.json").read_text(encoding="utf-8"))
        check(f"{task}: independent verification ran for every result", len(v) == len(d["results"]), str([x["status"] for x in v]))

    scanned, binaries, hits = secret_scan()
    check("secret scan: no API key value or key-shaped string in outputs, logs, reports, docs, source", not hits,
          f"({scanned} text files + {binaries} binary files searched for {len(_secret_values())} known secret values)" + (f" HITS: {hits}" if hits else ""))
    ig = subprocess.run(["git", "check-ignore", "-q", ".env"], cwd=ROOT).returncode == 0
    check(".env is git-ignored", ig)
    ex = (ROOT / ".env.example").read_text(encoding="utf-8")
    check(".env.example holds placeholders only", not KEY_SHAPES.search(ex) and "your-key-here" in ex)

    from tests.selftest import run_all as selftests
    print("\n-- unit/selftests --")
    check("selftests (schema, guards, redaction, tampered-price detection)", selftests())

    passed = sum(1 for _, ok, _ in ROWS if ok)
    lines = [f"# Validation results\n\nRun {datetime.now().isoformat(timespec='seconds')}: {passed}/{len(ROWS)} checks passed.\n", "| Result | Check | Detail |", "|---|---|---|"]
    lines += [f"| {'PASS' if ok else 'FAIL'} | {n} | {d} |" for n, ok, d in ROWS]
    lines.append(
        "\n## Checks not performed or limited\n"
        "- **Screen recording of a run: not generated.** Desktop capture showed the whole desktop with unrelated windows and was deleted; the framework's own recorder produced only 8 s of a 93 s run. `recording/replay_from_screenshots.mp4` is a labelled slideshow of step screenshots, not a screen recording.\n"
        "- **Allow-list enforcement was not actively provoked.** No test made the agent try to leave the allowed domains; the checks show every visited URL was on the list and that the helper functions behave correctly.\n"
        "- **Cart/checkout/login guard** was verified by unit tests and the visited-URL check, not by luring the agent to such a page.\n"
        "- **Bot-check guard** fired in real runs on Sweetwater (see COMPARISON.md); it was not exercised on any other site.\n"
        "- The validated example runs are headed; the final comparison batches ran headless because the headed display stalled for a period.\n"
        "- `--fast` mode was not measured: the OpenAI account ran out of credits.\n"
        "- Screenshots were not OCR-scanned for secrets; they show only public product pages and the key is never typed into any page. Their raw bytes were searched for the exact key values.\n"
        "- No `.env` file exists in this folder: runs used the key already set in the shell environment (the loader reads `.env` first).\n"
        "- Website terms of service were not read in full for every shop; only robots.txt and reachability were checked."
    )
    (ROOT / "VALIDATION.md").write_text(config.redact("\n".join(lines)), encoding="utf-8")
    print(f"\n{passed}/{len(ROWS)} checks passed -> VALIDATION.md")
    return passed == len(ROWS)
