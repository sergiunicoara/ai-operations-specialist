"""Single entry point.

  python run.py fallback            # books.toscrape.com: agent + report + verification + deterministic
  python run.py live                # public shops from tasks/live.json (confirm shops first)
  python run.py compare fallback    # N runs each, comparison table   (--runs 3)
  python run.py selftest            # unit checks incl. tampered-price detection
  python run.py validate            # safety/secret scans over runs/
"""
import argparse
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def keep_display_on():
    """Headed demos need an awake display (a sleeping display stalls screenshots). Windows only; harmless elsewhere."""
    try:
        import ctypes
        ES_CONTINUOUS, ES_SYSTEM_REQUIRED, ES_DISPLAY_REQUIRED = 0x80000000, 0x1, 0x2
        ctypes.windll.kernel32.SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED)
    except Exception:
        pass


def main():
    keep_display_on()
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["fallback", "live", "compare", "selftest", "validate"])
    ap.add_argument("task", nargs="?", default="fallback")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--product", help="override PRODUCT_NAME for the live task")
    ap.add_argument("--record", action="store_true", help="save a video of the browser viewport into the run folder")
    ap.add_argument("--fast", action="store_true", help="shorter page waits and no separate reasoning text: faster and cheaper, thinner step log")
    ap.add_argument("--headless", action="store_true", help="test only; demos are headed")
    a = ap.parse_args()

    if a.cmd in ("fallback", "live"):
        from src.pipeline import load_task, one_pass, print_summary
        cfg = load_task(a.cmd)
        if a.product:
            cfg["product_name"] = a.product
        print_summary(one_pass(cfg, label=a.cmd, headless=a.headless, record=a.record, fast=a.fast))
    elif a.cmd == "compare":
        from src.compare import compare
        compare(a.task, a.runs, a.headless)
    elif a.cmd == "selftest":
        from tests.selftest import run_all
        sys.exit(0 if run_all() else 1)
    else:
        from tests.validate import run_all
        sys.exit(0 if run_all() else 1)


if __name__ == "__main__":
    main()
