"""Re-apply the current injection patterns to the hits stored in existing run.json files and rebuild their flags."""
import json, sys
from pathlib import Path
from src.agent_run import flag_step
from src.guards import injection_hits
from src.report import build_report

root = Path(__file__).resolve().parent.parent / "runs"
for rj in root.rglob("run.json"):
    d = json.loads(rj.read_text(encoding="utf-8"))
    prev = None
    for s in d["steps"]:
        s["injection"] = [h for h in s.get("injection", []) if injection_hits(h)]
        s["flags"] = flag_step(s, prev)
        prev = s
    rj.write_text(json.dumps(d, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    ver = rj.parent / "verification.json"
    build_report(rj.parent, json.loads(ver.read_text(encoding="utf-8")) if ver.exists() else None)
    print("refiltered", rj.parent.name)
