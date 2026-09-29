"""Generate natural English voiceover segments for the team presentation."""

import asyncio
import re
from pathlib import Path

import edge_tts

HERE = Path(__file__).resolve().parent
NOTES = (HERE / "team_section_speaker_notes.md").read_text(encoding="utf-8")
OUT = HERE / "voiceover_team_neural"
OUT.mkdir(exist_ok=True)


def section(start: str, end: str) -> str:
    match = re.search(re.escape(start) + r"\s*(.*?)\s*" + re.escape(end), NOTES, re.S)
    if not match:
        raise ValueError(f"Missing section: {start}")
    text = match.group(1)
    text = re.sub(r"(?m)^\*.*?\*\s*$", "", text)
    text = re.sub(r"(?m)^Source:.*$", "", text)
    text = re.sub(r"(?m)^#{1,6} .*?$", "", text)
    text = text.replace("*", "").replace("_", "")
    return re.sub(r"\s+", " ", text).strip()


async def main() -> None:
    segments = {
        "slide-01": section("## Slide 1", "## Slide 2"),
        "slide-02": section("## Slide 2", "## Slide 3"),
        "slide-03": section("## Slide 3", "## Slide 4"),
    }
    for name, text in segments.items():
        # Andrew is Microsoft's conversational neural US English male voice.
        await edge_tts.Communicate(text, voice="en-US-AndrewNeural", rate="+5%").save(OUT / f"{name}.mp3")
        print(f"Wrote {name}.mp3 ({len(text)} characters)")


asyncio.run(main())
