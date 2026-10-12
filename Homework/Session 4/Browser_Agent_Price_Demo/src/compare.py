"""Run the browser agent and the deterministic approach N times each and write a comparison table."""
import json
import statistics as st
from datetime import datetime
from pathlib import Path

from src.config import ROOT, redact
from src.pipeline import fingerprint, load_task, one_pass, run_deterministic, score
from src.verify import verify_results


def _mean(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None


def compare(task: str, runs: int = 3, headless: bool = False) -> Path:
    cfg = load_task(task)
    agent_rows, det_rows = [], []
    for i in range(1, runs + 1):
        print(f"\n=== browser agent run {i}/{runs} ===")
        s = one_pass(cfg, label=f"cmp{i}", headless=headless)
        m = s["agent"]["meta"]
        agent_rows.append({
            "run_dir": s["run_dir"], "seconds": m["wall_seconds"], "cost": m["cost_usd"], "model_calls": m["model_calls"],
            "page_loads": len(m["urls_visited"]), "tokens": m["total_tokens"], "steps": m["steps"],
            "success": s["agent"]["score"]["success"], "fp": s["agent"]["fingerprint"], "score": s["agent"]["score"],
            "violations": m["domain_or_page_violations"],
        })
    for i in range(1, runs + 1):
        print(f"=== deterministic run {i}/{runs} ===")
        recs, stats = run_deterministic(cfg)
        ver = verify_results(recs) if recs else []
        sc = score(cfg, recs, ver)
        det_rows.append({"seconds": stats["seconds"], "requests": stats["requests"] + len(ver) * 0, "success": sc["success"],
                         "fp": fingerprint(recs), "score": sc, "errors": stats.get("errors", [])})

    def consistent(rows):
        fps = [r["fp"] for r in rows]
        top = max(set(fps), key=fps.count)
        return fps.count(top), len(fps)

    ac, dc = consistent(agent_rows), consistent(det_rows)
    A = {
        "time_s": _mean([r["seconds"] for r in agent_rows]), "cost": _mean([r["cost"] for r in agent_rows]),
        "requests": f"{_mean([r['model_calls'] for r in agent_rows]):.0f} model calls + {_mean([r['page_loads'] for r in agent_rows]):.0f} page loads",
        "success": f"{sum(r['success'] for r in agent_rows)}/{runs}", "consistent": f"{ac[0]}/{ac[1]} identical",
        "tokens": _mean([r["tokens"] for r in agent_rows]),
    }
    D = {
        "time_s": _mean([r["seconds"] for r in det_rows]), "cost": 0.0,
        "requests": f"{_mean([r['requests'] for r in det_rows]):.0f} HTTP requests",
        "success": f"{sum(r['success'] for r in det_rows)}/{runs}", "consistent": f"{dc[0]}/{dc[1]} identical",
    }
    cost_s = f"${A['cost']:.3f}" if A["cost"] is not None else "n/a"
    md = [
        f"# Browser agent vs deterministic extraction: {cfg['title']}",
        f"\nRuns per approach: {runs}. Generated {datetime.now().isoformat(timespec='seconds')}. Model: see run folders (run.json).",
        "\n| Measure (mean of runs) | Browser agent (LLM + Chrome) | Deterministic (HTTP + fixed selectors / JSON-LD / JSON) |",
        "|---|---|---|",
        f"| Time per run | {A['time_s']:.1f} s | {D['time_s']:.1f} s |",
        f"| Cost per run | {cost_s} (tokens: {A['tokens']:,.0f}) | $0 |",
        f"| Requests | {A['requests']} | {D['requests']} |",
        f"| Success rate (all items returned and price re-verified) | {A['success']} | {D['success']} |",
        f"| Result consistency across runs | {A['consistent']} | {D['consistent']} |",
        f"| Per-site code needed | none: same prompt works anywhere | one extractor per site |",
        f"| Breaks when page layout changes | usually adapts, may misread | yes, until the extractor is fixed |",
        "\n## Per-run detail",
        "\n| Run | Approach | Seconds | Cost | Success | Score |", "|---|---|---|---|---|---|",
    ]
    for i, r in enumerate(agent_rows, 1):
        c = f"${r['cost']:.3f}" if r["cost"] is not None else "n/a"
        md.append(f"| {i} | agent | {r['seconds']} | {c} | {r['success']} | {r['score']} |")
    for i, r in enumerate(det_rows, 1):
        md.append(f"| {i} | deterministic | {r['seconds']} | $0 | {r['success']} | {r['score']} |")
    errs = {json.dumps(e) for r in det_rows for e in r["errors"]}
    if errs:
        md.append("\n## Deterministic failures observed\n" + "\n".join(f"- {e}" for e in sorted(errs)))
    bad = [r for r in agent_rows if r["violations"]]
    md.append(f"\nAgent domain/cart/login violations across runs: {sum(len(r['violations']) for r in agent_rows)}.")
    md.append("\n## Honest limits\n- Success for both approaches is judged by re-reading the product page with the same deterministic parser, so a page that is misparsed the same way twice would pass.\n- The deterministic path cannot see shipping unless the page states it in static HTML or structured data; the agent sees the rendered page.\n- Few runs (small sample): treat times and costs as indicative, not statistical.\n- Live prices and bot protection change; numbers apply to the day of the run.")
    out = ROOT / "runs" / cfg["name"] / f"comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    out.write_text(redact("\n".join(md)), encoding="utf-8")
    (out.with_suffix(".json")).write_text(redact(json.dumps({"agent": agent_rows, "deterministic": det_rows, "A": A, "D": D}, indent=2, default=str)), encoding="utf-8")
    print("\n" + "\n".join(md[:14]))
    print(f"\nSaved: {out}")
    return out
