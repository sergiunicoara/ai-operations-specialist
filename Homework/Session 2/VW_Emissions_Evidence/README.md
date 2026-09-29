# Team 5: When did a company seriously manipulate its data? (Volkswagen diesel emissions)

Audited 28 September 2026: see [AUDIT_REPORT.md](AUDIT_REPORT.md). Everything a presenter needs
is in `presentation/`. Files in `archive/` are superseded; do not present from them.

## Present from these

| Use | File |
|---|---|
| Your 3–4 min section (independent testing & evidence), 4 slides | [presentation/team_section_3_to_4_minutes.pptx](presentation/team_section_3_to_4_minutes.pptx) · [PDF](presentation/team_section_3_to_4_minutes.pdf) |
| Script for that section (3:55 planned, 503 words) | [presentation/team_section_speaker_notes.md](presentation/team_section_speaker_notes.md) |
| Full solo talk, ~15 min + Q&A, 14 slides | [presentation/standalone_15_minutes.pptx](presentation/standalone_15_minutes.pptx) · [PDF](presentation/standalone_15_minutes.pdf) |
| Script for the solo talk (15:05 planned, 1,869 words) | [presentation/standalone_speaker_script.md](presentation/standalone_speaker_script.md) |
| Chart walkthrough + 60 s live demo | [presentation/CHART_WALKTHROUGH.md](presentation/CHART_WALKTHROUGH.md), [presentation/demo_denominators.py](presentation/demo_denominators.py) |
| Claim-to-source register | [presentation/sources_and_claims.md](presentation/sources_and_claims.md) |
| Data table, methods & limits | [DATA_TABLE.md](DATA_TABLE.md), [METHODS_NOTE.md](METHODS_NOTE.md) |
| Static chart / conceptual diagram (PNG, for handouts or other decks) | [chart/nox_chart.png](chart/nox_chart.png), [chart/lab_vs_road_diagram.png](chart/lab_vs_road_diagram.png) |
| Slide previews | `presentation/slide_previews/<deck>/slide-NN.png` |

Speaker notes are embedded in each .pptx (Presenter View) and mirrored in the two .md scripts.

## How the three instructor questions are answered (solo deck)

- **What did VW do to the test?** Slide 8: the "switch" (steering, speed, run time, barometric
  pressure) selected a compliant "dyno calibration" in the lab and a weaker "road calibration"
  otherwise. Slide 9 marks where the line was crossed (2006 design decision).
- **What was it trying to achieve?** Slide 10: U.S. diesel sales while appearing compliant;
  later, keeping 2016 approval.
- **Who paid the price?** Slide 10: $2.8B criminal fine, $1.5B civil penalties, $11B consumer and
  NOx-trust credit, ~585,000 U.S. vehicles; health cost not quantified in our sources.

## Reproduce everything

Prerequisites: Python 3.10+, Node 18+, LibreOffice (only for PDF/PNG rendering).

```bash
cd VW_Emissions_Evidence
python -m pip install -r requirements.txt
cd presentation && npm ci && npm run build && cd ..   # both .pptx + both .md scripts
python presentation/render_decks.py                     # PDFs + slide_previews/ (LibreOffice)
python chart/make_charts.py                             # static chart + diagram PNGs
python -m pytest -q tests                               # 11 integrity checks
```

Edit slide text in `presentation/deck_content.json` and data only in `data/nox_data.csv`, then rebuild.
The tests re-check each data value against its cited PDF page, the chart inside both decks
against the CSV, timing, notes, and a list of previously corrected overstatements.
`presentation/export_presentations.ps1` exports via PowerPoint COM on machines where that works
(it failed on the audit machine, see AUDIT_REPORT.md).

## Layout

`data/` canonical dataset · `sources/` primary-source PDFs (+ extracted text) · `presentation/`
decks, scripts, build · `chart/` matplotlib assets · `tests/` · `archive/` superseded drafts and the
old private-runtime pipeline · `.presentation-build/` disposable scratch (git-ignored).
