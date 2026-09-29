"""Rebuild the exact native chart from the verified CSV and export its PNG.

Run: python presentation/make_charts.py (Windows desktop session).
Needs Node + @oai/artifact-tool, Python + Pillow, PowerPoint, and the dependencies
used by prepare_chart.py. The delivered deck_content.json supplies slide text.
This regenerates private draft decks and verified_chart.png, not final decks.
"""
from pathlib import Path
import os,subprocess,sys,hashlib
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent
BUILD=ROOT/'.presentation-build'
BUILD.mkdir(exist_ok=True)
NODE=os.environ.get('VW_NODE',r'C:\Users\Sergiu\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe')
with (BUILD/'chart_regeneration.log').open('w',encoding='utf-8') as log:
 subprocess.run([NODE,str(HERE/'generate_decks.mjs')],cwd=ROOT,stdout=log,stderr=log,check=True)
subprocess.run([sys.executable,str(HERE/'prepare_chart.py')],cwd=ROOT,check=True)
subprocess.run(['powershell','-NoProfile','-File',str(HERE/'export_chart.ps1'),'-DeckPath',str(BUILD/'team_candidate.pptx'),'-ImagePath',str(BUILD/'regenerated_chart_slide.png')],cwd=ROOT,check=True)
# Native slide is 1280x720, exported at 1.5x. Include units, chart and disclosures.
im=Image.open(BUILD/'regenerated_chart_slide.png')
im.crop((60,183,1860,1059)).save(HERE/'verified_chart.png')
print('verified_chart.png SHA256',hashlib.sha256((HERE/'verified_chart.png').read_bytes()).hexdigest())
