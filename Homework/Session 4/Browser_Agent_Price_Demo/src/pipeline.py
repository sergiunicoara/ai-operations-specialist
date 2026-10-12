"""One full pass: browser agent -> independent verification -> deterministic approach -> HTML report."""
import asyncio
import json
from datetime import datetime
from pathlib import Path

from src import deterministic
from src.agent_run import run_agent
from src.config import ROOT, redact
from src.report import build_report
from src.verify import verify_results


def load_task(name_or_path: str) -> dict:
    p = Path(name_or_path)
    if not p.exists():
        p = ROOT / "tasks" / f"{name_or_path}.json"
    return json.loads(p.read_text(encoding="utf-8"))


def run_deterministic(cfg: dict):
    if cfg["reference"]["kind"] == "books_toscrape":
        return deterministic.books_toscrape(cfg["items"])
    return deterministic.live_shops(cfg)


def expected_count(cfg: dict) -> int:
    return len(cfg["items"]) if "items" in cfg else len(cfg["sites"])


def score(cfg: dict, records: list[dict], verification: list[dict]) -> dict:
    """success = every expected item returned a schema-valid record whose price re-verifies on the page."""
    want = expected_count(cfg)
    ok = sum(1 for v in verification if v["status"] == "OK")
    return {"expected": want, "returned": len(records), "verified_ok": ok, "success": ok == want}


def fingerprint(records: list[dict]) -> str:
    return json.dumps(sorted((r["site"], r["product_title"], r["price"], r["shipping_cost"], r["total"]) for r in records), default=str)


def one_pass(cfg: dict, label: str = "", headless: bool = False, runs_dir: Path | None = None, report: bool = True, record: bool = False, fast: bool = False) -> dict:
    runs_dir = runs_dir or ROOT / "runs"
    rid = datetime.now().strftime("%Y%m%d_%H%M%S") + (f"_{label}" if label else "")
    run_dir = runs_dir / cfg["name"] / rid
    run_dir.mkdir(parents=True, exist_ok=True)

    out = asyncio.run(run_agent(cfg, run_dir, headless=headless, record=record, fast=fast))
    verification = verify_results(out["results"])
    # agent-reported URLs must be pages the agent really visited (catches invented links)
    visited = set(out["meta"]["urls_visited"])
    for v in verification:
        v["url_visited_by_agent"] = v["url"] in visited
    (run_dir / "verification.json").write_text(redact(json.dumps(verification, indent=2)), encoding="utf-8")

    det_recs, det_stats = run_deterministic(cfg)
    det_ver = verify_results(det_recs) if det_recs else []
    (run_dir / "deterministic.json").write_text(redact(json.dumps({"records": det_recs, "stats": det_stats}, indent=2, default=str)), encoding="utf-8")

    summary = {
        "run_dir": str(run_dir),
        "agent": {"meta": out["meta"], "score": score(cfg, out["results"], verification), "fingerprint": fingerprint(out["results"])},
        "deterministic": {"stats": det_stats, "score": score(cfg, det_recs, det_ver), "fingerprint": fingerprint(det_recs)},
    }
    (run_dir / "summary.json").write_text(redact(json.dumps(summary, indent=2, default=str)), encoding="utf-8")
    if report:
        build_report(run_dir, verification)
    return summary


def print_summary(s: dict) -> None:
    m = s["agent"]["meta"]
    cost = f"${m['cost_usd']:.3f}" if m["cost_usd"] is not None else "n/a"
    print(f"\nAgent: {m['steps']} steps, {m['model_calls']} model calls, {m['total_tokens']:,} tokens, {cost}, {m['wall_seconds']}s; score {s['agent']['score']}")
    d = s["deterministic"]
    print(f"Deterministic: {d['stats']['requests']} requests, {d['stats']['seconds']}s, $0; score {d['score']}")
    if d["stats"].get("errors"):
        print("  deterministic errors:", d["stats"]["errors"])
    print(f"Safety: violations={m['domain_or_page_violations']} guard={m['guard']} timed_out={m['timed_out']}")
    print(f"Report: {Path(s['run_dir']) / 'report.html'}")
