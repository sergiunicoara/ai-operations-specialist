"""Render both decks to PDF (LibreOffice) and per-slide PNG previews (PyMuPDF).

Usage (from this folder):  python render_decks.py
Needs LibreOffice (set SOFFICE to its soffice executable if it is not on the default
path) and `pip install pymupdf`. Outputs <deck>.pdf and slide_previews/<deck>/slide-NN.png.
LibreOffice rendering is a QA preview; PowerPoint may differ slightly in line breaks.
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
DECKS = ["team_section_3_to_4_minutes", "standalone_15_minutes"]
CANDIDATES = [
    os.environ.get("SOFFICE", ""),
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    shutil.which("soffice") or "",
    shutil.which("libreoffice") or "",
]


def soffice() -> str:
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    sys.exit("LibreOffice not found: install it or set SOFFICE=/path/to/soffice")


def main() -> None:
    exe = soffice()
    with tempfile.TemporaryDirectory() as profile:
        for deck in DECKS:
            pptx = HERE / f"{deck}.pptx"
            if not pptx.exists():
                sys.exit(f"{pptx.name} missing: run `npm run build` first")
            subprocess.run(
                [exe, f"-env:UserInstallation={Path(profile).as_uri()}", "--headless",
                 "--convert-to", "pdf", "--outdir", str(HERE), str(pptx)],
                check=True, capture_output=True, timeout=240,
            )
            pdf = HERE / f"{deck}.pdf"
            out = HERE / "slide_previews" / deck
            shutil.rmtree(out, ignore_errors=True)
            out.mkdir(parents=True)
            with pymupdf.open(pdf) as doc:
                for i, page in enumerate(doc, 1):
                    page.get_pixmap(dpi=144).save(out / f"slide-{i:02d}.png")
                print(f"{deck}: {doc.page_count} slides -> {pdf.name}, {out.relative_to(HERE)}")


if __name__ == "__main__":
    main()
