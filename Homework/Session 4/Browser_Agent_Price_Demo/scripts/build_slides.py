"""Build the 3-slide editable PPTX from real run data (screenshots, comparison numbers).

Usage: python scripts/build_slides.py <fallback run dir> <fallback comparison .json> [<live comparison .json>]
"""
import json
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parent.parent
BG, CARD, INK, MUTE, ACC, OK, WARN = (RGBColor(*c) for c in [(15, 20, 25), (24, 32, 42), (232, 237, 242), (154, 167, 180), (90, 169, 255), (62, 207, 142), (245, 165, 36)])


def box(slide, x, y, w, h, fill=CARD, line=None):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    s.adjustments[0] = 0.04
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if line:
        s.line.color.rgb = line
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    return s


def text(slide, x, y, w, h, t, size=14, color=INK, bold=False, align=None):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    lines = t if isinstance(t, list) else [t]
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = ln
        p.font.size, p.font.bold, p.font.color.rgb, p.font.name = Pt(size), bold, color, "Segoe UI"
        if align:
            p.alignment = align
    return tb


def base(prs, title, sub=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = BG
    text(s, Inches(0.5), Inches(0.3), Inches(12.3), Inches(0.7), title, 30, INK, True)
    if sub:
        text(s, Inches(0.5), Inches(0.95), Inches(12.3), Inches(0.4), sub, 14, MUTE)
    return s


def clip(t: str, n: int) -> str:
    """Cut at a word boundary and add an ellipsis."""
    t = (t or "").strip()
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + " ..."


def pick_loop_step(steps):
    """A step whose action is a click/navigate with a following step, preferring one that shows a real product or catalogue page."""
    ok = lambda s: s.get("screenshot") and not s.get("screenshot_is_placeholder")
    for i, s in enumerate(steps[:-1]):  # first choice: a real interaction (click/navigate/scroll/search) followed by another step
        if s["action_names"][:1] in (["click"], ["navigate"], ["scroll"], ["search_page"]) and ok(s) and ok(steps[i + 1]) and s["step"] >= 2:
            return i
    for i, s in enumerate(steps[:-1]):
        if ok(s) and ok(steps[i + 1]) and s["action_names"][:1] != ["done"]:
            return i
    return 0


def main():
    run = Path(sys.argv[1])
    fb = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    lv = json.loads(Path(sys.argv[3]).read_text(encoding="utf-8")) if len(sys.argv) > 3 else None
    data = json.loads((run / "run.json").read_text(encoding="utf-8"))
    steps, m = data["steps"], data["meta"]
    prs = Presentation()
    prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)

    # ---- slide 1: loop
    i = pick_loop_step(steps)
    a, b = steps[i], steps[i + 1]
    s = base(prs, "How the agent works: observe → decide → act → verify", f"Real step {a['step']} from our run ({m['provider']}/{m['model']}, browser-use {m['versions']['browser-use']}), headed Chrome, fresh profile")
    cols = [("1  OBSERVE", "Screenshot + page elements the agent saw", a["screenshot"]),
            ("2  DECIDE", None, None), ("3  ACT", None, None), ("4  VERIFY", "Same agent, next step: did it work?", b["screenshot"])]
    x0, cw, gap, y0, ch = Inches(0.5), Inches(2.95), Inches(0.17), Inches(1.5), Inches(5.3)
    for k, (title, cap, img) in enumerate(cols):
        x = x0 + k * (cw + gap)
        box(s, x, y0, cw, ch)
        text(s, x + Inches(0.12), y0 + Inches(0.08), cw, Inches(0.4), title, 15, ACC, True)
        if img:
            pic = s.shapes.add_picture(str(run / img), x + Inches(0.1), y0 + Inches(0.55), width=cw - Inches(0.2))
            if pic.height > Inches(2.9):
                pic.crop_bottom = 1 - Inches(2.9) / pic.height
                pic.height = Inches(2.9)
            text(s, x + Inches(0.12), y0 + Inches(3.5), cw - Inches(0.24), Inches(1.7), cap if k == 0 else [cap, "Agent says: " + (b["evaluation"] or "")[:170]], 12, MUTE)
        elif k == 1:
            text(s, x + Inches(0.12), y0 + Inches(0.55), cw - Inches(0.24), Inches(4.6), ["Goal:", a["next_goal"][:220], "", "Reasoning:", clip(a["thinking"] or "(none returned)", 300)], 12, INK)
        else:
            acts = ", ".join(a["action_names"])
            text(s, x + Inches(0.12), y0 + Inches(0.55), cw - Inches(0.24), Inches(4.6), [f"Action(s): {acts}", "", a["actions"][:260], "", (f"Step took {a['duration']} s, {a['prompt_tokens'] + a['completion_tokens']:,} tokens" if a["duration"] > 0 else "(timing for each step is in the report)")], 12, INK)
        if k < 3:
            ar = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x + cw - Inches(0.02), y0 + Inches(2.4), gap + Inches(0.04), Inches(0.35))
            ar.fill.solid(); ar.fill.fore_color.rgb = ACC; ar.line.fill.background()
    s.notes_slide.notes_text_frame.text = ("Observe: the agent gets a screenshot and the page's interactive elements. Decide: the model writes a goal and picks an action. Act: the framework executes click/type/scroll/navigate. "
        "Verify: at the next step the model judges whether the page changed as hoped. Everything on this slide comes from one real step in our run; the full log is in the HTML report.")

    # ---- slide 2: comparison
    s = base(prs, "Same task, two approaches: measured", "Mean of repeated runs; success = every item returned and its price re-verified on the page")
    def rows(cmp, name):
        A, D = cmp["A"], cmp["D"]
        c = f"${A['cost']:.3f}" if A["cost"] is not None else "n/a"
        return [name, f"{A['time_s']:.0f} s", c, A["requests"], A["success"], A["consistent"], f"{D['time_s']:.1f} s", "$0", D["requests"], D["success"], D["consistent"]]
    hdr = ["Task", "Agent time", "Agent cost", "Agent requests", "Agent success", "Agent consistency", "Det. time", "Det. cost", "Det. requests", "Det. success", "Det. consistency"]
    data_rows = [rows(fb, "Fallback: 3 books")] + ([rows(lv, "Live: 3 shops")] if lv else [])
    tbl = s.shapes.add_table(len(data_rows) + 1, len(hdr), Inches(0.4), Inches(1.6), Inches(12.5), Inches(1.9)).table
    for c, h in enumerate(hdr):
        cell = tbl.cell(0, c); cell.text = h
        cell.fill.solid(); cell.fill.fore_color.rgb = CARD
        p = cell.text_frame.paragraphs[0]; p.font.size, p.font.bold, p.font.color.rgb = Pt(11), True, ACC
    for r, row in enumerate(data_rows, 1):
        for c, v in enumerate(row):
            cell = tbl.cell(r, c); cell.text = str(v)
            cell.fill.solid(); cell.fill.fore_color.rgb = BG
            p = cell.text_frame.paragraphs[0]; p.font.size, p.font.color.rgb = Pt(11), INK
    bullets = ["Agent: prices right 9/9 on the books, but it reported a product URL it never visited in 3/3 runs, so strict success is 0/3. Our independent re-fetch caught it.",
               "Live: both approaches lost one shop. Sweetwater showed a human-verification page: the agent was stopped without touching it, plain HTTP got 403. Two shops verified OK.",
               "Deterministic: fast, free, repeatable, but one extractor per site, breaks if layout changes, and cannot see shipping that is not in the static page.",
               "Honest limits: 3 runs, one model (gpt-4.1), one day; the check re-reads pages with a deterministic parser."]
    box(s, Inches(0.4), Inches(3.9), Inches(12.5), Inches(2.9))
    text(s, Inches(0.6), Inches(4.0), Inches(12.1), Inches(2.7), ["• " + b for b in bullets], 14, INK)
    s.notes_slide.notes_text_frame.text = "Numbers are measured from the runs in the runs folder (COMPARISON.md has the per-run detail and the limits)."

    # ---- slide 3: conclusion
    s = base(prs, "When to use a browser agent, and when to use an API", None)
    L = ["Use a browser agent when:", "• there is no API or data feed", "• many different sites, layouts you do not control", "• the answer is only visible after rendering or interaction", "• one-off or low-volume research tasks", "Guard it: allow-list, step and time limits, read-only, verify the output"]
    R = ["Use an API or structured data when:", "• a documented API or feed exists", "• the same sites are read again and again", "• you need speed, low cost, exact repeatability", "• results feed other systems or decisions", "Expect: one extractor per site, maintenance when pages change"]
    for k, (lines, col) in enumerate([(L, ACC), (R, OK)]):
        x = Inches(0.5) + k * Inches(6.3)
        box(s, x, Inches(1.3), Inches(6.0), Inches(4.3), CARD, col)
        text(s, x + Inches(0.2), Inches(1.45), Inches(5.6), Inches(0.5), lines[0], 20, col, True)
        text(s, x + Inches(0.2), Inches(2.1), Inches(5.6), Inches(3.4), lines[1:], 16, INK)
    box(s, Inches(0.5), Inches(5.85), Inches(12.3), Inches(1.2), CARD, WARN)
    text(s, Inches(0.7), Inches(5.9), Inches(11.9), Inches(1.1), ["Best of both: let the agent explore and extract once, then turn what it learned into a deterministic extractor for the sites you keep using.",
         "Never trust an agent's own 'done': check the numbers independently (our check caught a made-up product URL in every fallback run)."], 15, INK)
    s.notes_slide.notes_text_frame.text = "Conclusion: agents trade cost and speed for flexibility. Use structured data where it exists; use an agent where it does not; verify either way."

    out = ROOT / "slides" / "browser_agent_demo.pptx"
    out.parent.mkdir(exist_ok=True)
    prs.save(out)
    print("wrote", out)


if __name__ == "__main__":
    main()
