"""QA preview: PPTX -> PDF (LibreOffice) -> slide PNGs (PyMuPDF). Usage: python render_previews.py
Set SOFFICE if LibreOffice is not at the default Windows path. `pip install pymupdf` first.
LibreOffice rendering can differ slightly from PowerPoint."""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
exe = next(c for c in [os.environ.get("SOFFICE", ""), r"C:\Program Files\LibreOffice\program\soffice.exe", shutil.which("soffice") or ""] if c and Path(c).exists())
with tempfile.TemporaryDirectory() as profile:
    subprocess.run([exe, f"-env:UserInstallation=file:///{profile.replace(chr(92), '/')}", "--headless", "--convert-to", "pdf", "--outdir", str(HERE), str(HERE / "secret_key_leak_demo.pptx")], check=True, capture_output=True)
out = HERE / "slide_previews"
out.mkdir(exist_ok=True)
with pymupdf.open(HERE / "secret_key_leak_demo.pdf") as doc:
    for i, page in enumerate(doc, 1):
        page.get_pixmap(dpi=144).save(out / f"slide-{i:02d}.png")
    print(f"rendered {len(doc)} slides")
