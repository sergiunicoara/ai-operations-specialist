"""Self-contained HTML step-log report (screenshots embedded as base64)."""
import base64
import html
import io
import json
from pathlib import Path

from PIL import Image

from src.config import redact

CSS = """
:root{--bg:#0f1419;--card:#18202a;--ink:#e8edf2;--mute:#9aa7b4;--line:#2a3541;--acc:#5aa9ff;--ok:#3ecf8e;--warn:#f5a524;--bad:#ff5d5d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,Segoe UI,sans-serif}
main{max-width:1180px;margin:0 auto;padding:24px 16px 80px}h1{font-size:24px;margin:0 0 4px}h2{font-size:18px;margin:32px 0 10px}
.sub{color:var(--mute)}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:16px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}.card b{display:block;font-size:22px}.card span{color:var(--mute);font-size:12px}
table{border-collapse:collapse;width:100%;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:13px}
th,td{padding:7px 9px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{color:var(--mute);font-weight:600}
.step{background:var(--card);border:1px solid var(--line);border-radius:12px;margin:16px 0;overflow:hidden}
.step.flag{border-color:var(--warn)}.hd{display:flex;gap:12px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.num{background:var(--acc);color:#04111f;border-radius:999px;font-weight:700;padding:2px 10px}.url{color:var(--mute);font-size:12px;word-break:break-all}
.body{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;padding:14px}@media(max-width:820px){.body{grid-template-columns:1fr}}
img{max-width:100%;border:1px solid var(--line);border-radius:8px;display:block}.lbl{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);margin:10px 0 3px}
.box{background:#101820;border:1px solid var(--line);border-radius:8px;padding:8px 10px;white-space:pre-wrap;word-break:break-word;font-size:13px}
code{font-family:ui-monospace,Consolas,monospace;font-size:12px}.chip{display:inline-block;border-radius:999px;padding:1px 9px;font-size:12px;margin:2px 4px 2px 0}
.c-ok{background:#12372a;color:var(--ok)}.c-warn{background:#3d2e0c;color:var(--warn)}.c-bad{background:#3d1717;color:var(--bad)}.c-info{background:#14304d;color:var(--acc)}
.mini{display:flex;gap:12px;color:var(--mute);font-size:12px;padding:0 14px 12px;flex-wrap:wrap}.note{background:#14202c;border-left:3px solid var(--acc);padding:8px 12px;border-radius:6px;margin:10px 0;font-size:13px}
details summary{cursor:pointer;color:var(--acc);font-size:13px;margin-top:6px}
"""


def e(s) -> str:
    return html.escape(redact(str(s if s is not None else "")))


def data_uri(path: Path, width: int = 1000) -> str:
    im = Image.open(path).convert("RGB")
    if im.width > width:
        im = im.resize((width, int(im.height * width / im.width)))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=70)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def chip(kind, text):
    cls = {"error": "bad", "failed": "warn", "popup": "info", "repeat": "warn", "injection": "bad", "guard": "bad"}.get(kind, "info")
    return f'<span class="chip c-{cls}">{e(text)}</span>'


def build_report(run_dir: Path, verification: list[dict] | None = None, det: dict | None = None) -> Path:
    run_dir = Path(run_dir)
    data = json.loads((run_dir / "run.json").read_text(encoding="utf-8"))
    m, steps, results = data["meta"], data["steps"], data["results"]
    flagged = [s for s in steps if s["flags"]]
    cost = f"${m['cost_usd']:.3f}" if m.get("cost_usd") is not None else "n/a"
    P = []
    P.append(f"<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>Step log: {e(m['title'])}</title><style>{CSS}</style><main>")
    P.append(f"<h1>{e(m['title'])}</h1><div class=sub>Run started {e(m['started'])} · model <b>{e(m['provider'])}/{e(m['model'])}</b> · browser-use {e(m['versions'].get('browser-use'))} · playwright {e(m['versions'].get('playwright'))} · headed, fresh profile, no extensions</div>")
    P.append("<div class=cards>" + "".join(
        f"<div class=card><b>{v}</b><span>{k}</span></div>" for k, v in [
            ("total time", f"{m['wall_seconds']:.0f}s"), ("steps", m["steps"]), ("model calls", m["model_calls"]),
            ("prompt tokens", f"{m['prompt_tokens']:,}"), ("completion tokens", f"{m['completion_tokens']:,}"),
            ("est. cost", cost), ("results", len(results)), ("flagged steps", len(flagged))]) + "</div>")
    P.append(f"<div class=sub>Cost source: {e(m['cost_source'])}. Safety: max {m['max_steps']} steps, {m['time_limit']}s limit, allowed domains {e(', '.join(m['allowed_domains']))}. Pages visited outside the list or on cart/login/checkout pages: <b>{len(m['domain_or_page_violations'])}</b>. Timed out: {m['timed_out']}. Guard triggered: {e(m['guard'] or 'no')}.</div>")

    # mistakes and recoveries
    P.append("<h2>Mistakes and recoveries</h2>")
    P.append("<div class=note>Flags are computed automatically from the agent's own self-evaluation, tool errors and repeated actions. They are candidates for discussion, not proof of error. Nothing here was staged.</div>")
    if not flagged and not (verification and any(v["status"] != "OK" for v in verification)):
        P.append("<p><b>No mistakes were flagged in this run.</b></p>")
    for s in flagged:
        rec = " <span class='chip c-ok'>recovered next step</span>" if s.get("recovered") else ""
        P.append(f"<p>Step {s['step']}: " + "".join(chip(f["kind"], f["label"]) for f in s["flags"]) + rec + "</p>")
    if verification:
        for v in verification:
            if v["status"] != "OK":
                why = v.get("error") or f"agent price {v['agent_price']} vs page price {v.get('page_price')}"
                P.append(f"<p><span class='chip c-bad'>Verification {e(v['status'])}</span> {e(v['site'])}: {e(v['agent_title'])} - {e(why)[:200]}</p>")

    # results
    P.append("<h2>Structured result (schema-validated)</h2>")
    if results:
        P.append("<table><tr><th>site<th>title<th>price<th>shipping<th>total<th>cur<th>confidence<th>timestamp<th>URL / notes</tr>")
        for r in results:
            ship = "not shown" if r["shipping_cost"] is None else f"{r['shipping_cost']:.2f}"
            P.append(f"<tr><td>{e(r['site'])}<td>{e(r['product_title'])}<td>{r['price']:.2f}<td>{ship}<td>{r['total']:.2f}<td>{e(r['currency'])}<td>{e(r['confidence'])}<td>{e(r['timestamp'])}<td><code>{e(r['url'])}</code><br>{e(r['notes'])}</tr>")
        P.append("</table>")
    else:
        P.append("<p>No valid result records.</p>")
    if m["validation_errors"]:
        P.append("<p class=sub>Schema errors: " + e("; ".join(m["validation_errors"])) + "</p>")
    if m["blocked_sites"]:
        P.append("<p><span class='chip c-warn'>Blocked sites reported by agent</span> " + e(", ".join(m["blocked_sites"])) + "</p>")
    if m["suspicious_page_text_reported_by_agent"]:
        P.append("<p><span class='chip c-bad'>Instruction-like page text reported by agent</span> " + e(" | ".join(m["suspicious_page_text_reported_by_agent"])) + "</p>")

    if verification:
        P.append("<h2>Independent price verification (direct fetch, no browser, no LLM)</h2><table><tr><th>site<th>agent price<th>page price<th>title match<th>URL visited by agent<th>status<th>detail</tr>")
        visited = set(m["urls_visited"])
        for v in verification:
            seen = "yes" if v["url"] in visited else "NO: not in agent's visited URLs"
            P.append(f"<tr><td>{e(v['site'])}<td>{v['agent_price']}<td>{e(v.get('page_price','-'))}<td>{e(v.get('title_match'))}<td>{e(seen)}<td><b>{e(v['status'])}</b><td>{e(v.get('error') or v.get('source',''))[:120]}</tr>")
        P.append("</table>")

    # steps
    P.append("<h2>Step-by-step log: observe → decide → act → verify</h2>")
    for s in steps:
        cls = "step flag" if s["flags"] else "step"
        P.append(f"<section class='{cls}'><div class=hd><span class=num>Step {s['step']}</span><b>{e(s['title'])[:90]}</b><span class=url>{e(s['url'])}</span>")
        P.append("".join(chip(f["kind"], f["label"]) for f in s["flags"]) + "</div><div class=body><div>")
        P.append("<div class=lbl>1 · Observe: screenshot the agent saw</div>")
        if s.get("screenshot") and (run_dir / s["screenshot"]).exists():
            P.append(f"<img alt='step {s['step']} screenshot' src='{data_uri(run_dir / s['screenshot'])}'>")
        else:
            P.append("<div class=box>(no screenshot captured for this step)</div>")
        P.append("</div><div>")
        P.append(f"<div class=lbl>2 · Decide: what it concluded and why</div><div class=box><b>Previous action check:</b> {e(s['evaluation'])}\n<b>Goal:</b> {e(s['next_goal'])}\n<b>Reasoning:</b> {e(s['thinking']) or '(none returned)'}</div>")
        P.append(f"<div class=lbl>3 · Act: action taken</div><div class=box><code>{e(s['actions'])}</code></div>")
        res = "\n".join(s.get("result_text") or []) or "(no text result)"
        P.append(f"<div class=lbl>Tool result</div><div class=box>{e(s['error'] or res)}</div>")
        P.append(f"<div class=lbl>4 · Verify: how it checked the action worked (agent's evaluation at the next step)</div><div class=box>{e(s['verification'])}</div>")
        if s.get("after_screenshot") and (run_dir / s["after_screenshot"]).exists():
            P.append(f"<details><summary>Screenshot after the action (= next step's view)</summary><img alt='after step {s['step']}' src='{data_uri(run_dir / s['after_screenshot'], 700)}'></details>")
        for h in s.get("injection") or []:
            P.append(f"<div class=lbl>Instruction-like page text logged</div><div class=box>{e(h)}</div>")
        P.append("</div></div>")
        P.append(f"<div class=mini><span>time {s['duration']}s</span><span>model calls {s['model_calls']}</span><span>prompt tokens {s['prompt_tokens']:,}</span><span>completion tokens {s['completion_tokens']:,}</span></div></section>")
    P.append("<h2>Run details</h2><details open><summary>Metadata</summary><div class=box>" + e(json.dumps({k: v for k, v in m.items() if k not in ("urls_visited",)}, indent=1, default=str)) + "</div></details>")
    P.append("<details><summary>URLs visited</summary><div class=box>" + e("\n".join(m["urls_visited"])) + "</div></details></main>")
    out = run_dir / "report.html"
    out.write_text(redact("".join(P)), encoding="utf-8")
    return out


if __name__ == "__main__":
    import sys
    print(build_report(Path(sys.argv[1])))
