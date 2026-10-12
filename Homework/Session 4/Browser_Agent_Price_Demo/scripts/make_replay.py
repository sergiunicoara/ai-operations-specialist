"""Build a backup 'replay' video from a run's step screenshots and decisions.

This is NOT a screen recording. It is a slideshow of what the agent saw at each step with the
agent's goal and action as captions, labelled as such in every frame.

Usage: python scripts/make_replay.py runs/fallback/<run folder> [out.mp4] [seconds_per_step]
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H, BAR = 1280, 720, 150


def font(size):
    for name in ("segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def wrap(draw, text, fnt, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    return lines + ([cur] if cur else [])


def main():
    run = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else run / "replay_from_screenshots.mp4"
    secs = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
    data = json.loads((run / "run.json").read_text(encoding="utf-8"))
    steps = data["steps"]
    tmp = Path(tempfile.mkdtemp(prefix="replay_"))
    f1, f2 = font(22), font(17)
    for i, s in enumerate(steps, 1):
        canvas = Image.new("RGB", (W, H), (15, 20, 25))
        shot = Image.open(run / s["screenshot"]).convert("RGB")
        area_h = H - BAR
        scale = min(W / shot.width, area_h / shot.height)
        shot = shot.resize((int(shot.width * scale), int(shot.height * scale)))
        canvas.paste(shot, ((W - shot.width) // 2, 0))
        d = ImageDraw.Draw(canvas)
        d.rectangle([0, H - BAR, W, H], fill=(24, 32, 42))
        d.text((16, H - BAR + 8), f"Step {s['step']}/{len(steps)}   action: {', '.join(s['action_names'])}   ({s['duration']}s, {s['prompt_tokens'] + s['completion_tokens']:,} tokens)", font=f1, fill=(90, 169, 255))
        for j, line in enumerate(wrap(d, "Goal: " + (s["next_goal"] or ""), f2, W - 32)[:3]):
            d.text((16, H - BAR + 42 + j * 22), line, font=f2, fill=(232, 237, 242))
        d.text((16, H - 26), "REPLAY assembled from step screenshots - not a screen recording", font=f2, fill=(245, 165, 36))
        canvas.save(tmp / f"f{i:03d}.png")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", f"1/{secs}", "-i", str(tmp / "f%03d.png"),
                    "-vf", "fps=10,format=yuv420p", "-c:v", "libx264", "-crf", "26", str(out)], check=True)
    print(f"wrote {out} ({len(steps)} steps x {secs}s)")


if __name__ == "__main__":
    main()
