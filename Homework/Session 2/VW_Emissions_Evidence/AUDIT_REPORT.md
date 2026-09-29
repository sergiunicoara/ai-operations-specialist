# Audit report: Team 5 Volkswagen presentation (28 September 2026)

Scope: everything in `VW_Emissions_Evidence/` (no other VW material exists in the repository).
**The other team members' slides are not in the repository**, so the "full deck" audited is the
14-slide solo deck plus your 4-slide section.

## Findings by severity (all fixed unless marked)

| # | Severity | Finding | Where | Change made |
|---|---|---|---|---|
| 1 | Critical | No presentable deck existed. The generator needed a private Codex runtime (`@oai/artifact-tool`, `~/.codex/...` finalizer) no teammate can install; both candidate decks **failed** the chart validator (`.presentation-build/finalize.log`); final files were never written | `presentation/generate_decks.mjs`, `.presentation-build/` | New `presentation/build_decks.mjs` on public `pptxgenjs` 4.0.1 (pinned in `package.json`/lockfile); final decks written to `presentation/`; old pipeline moved to `archive/legacy_pipeline/` |
| 2 | Critical | Instructor question "Who paid the price?" had no evidence (slide said the numbers "require separate evidence"); "What did VW do?" was generic; the point where the line was crossed was never stated | `deck_content.json` standalone slides 8–10 | Slide 8 now names the EPA "switch" inputs and dyno/road calibrations; new timeline slide 9 marks the 2006 design decision as the line; slide 10 gives the plea's $2.8B fine, $1.5B civil penalties, $11B consumer/NOx-trust credit, ~585,000 vehicles |
| 3 | High | README pointed presenters to first-draft files containing false claims: "goal was to promote clean diesel", "PEMS agreed within single digits" (actually 18.8 % NOx), "three different technologies", "EPA notice unreadable", speculative "March 2014 conference" | `README.md`, `SLIDES.md`, `SPEAKER_NOTES.md`, `EXPANDED_SCRIPT.md`, `SOURCES.md`, `VERIFICATION.md`, `METHODS_NOTE.md` | Drafts moved to `archive/early_drafts/` with an error list; `METHODS_NOTE.md`, `DATA_TABLE.md`, `README.md` rewritten |
| 4 | High | Slide text said "Error bars: reported ±1 SD" but the generator drew none, and coded untested cells as 0 | `generate_decks.mjs` | Native chart now has custom ±1 SD error bars, true gaps (chart cache and embedded workbook) and a native dashed standard line; `tests/test_evidence.py` verifies all of this inside both .pptx files |
| 5 | High | PowerPoint COM export fails on this machine ("Interface not registered"), so the previous "opened in PowerPoint" path never worked | `export_presentations.ps1` | Portable `render_decks.py` (LibreOffice + PyMuPDF). **Not fixed:** decks were not opened in PowerPoint itself (see limitations) |
| 6 | Medium | Two diverging datasets; Vehicle C Route 3 recorded as 2 runs (Table 3.15 p. 57 lists 3) | `data/nox_data.csv`, `presentation/verified_chart_data.csv` | Single canonical `data/nox_data.csv`, `runs_in_test_matrix` column, source conflict disclosed in the row |
| 7 | Medium | Static chart y-axis capped at 1.75, clipping A/R4 error bar (1.480 + 0.335 = 1.815); called the benchmark a "legal standard"; diagram said FTP-75/NEDC though values are FTP-75; arrows through text; footer clipped; label replace no longer matched data | `chart/make_charts.py` | Axis 0–2.0, wording fixed, diagram labelled "Conceptual illustration, not measured data" with EPA/plea citations, layout fixed |
| 8 | Medium | Citation errors: Table 3.13 p. 54 (is p. 55); "clean diesel" cited to plea ¶¶33–35 (is ¶30); team slide 3 Exh. 2 pp. 11–13 (is 12–14); footers printed "Exh. 2, Exh. 2" | deck, CSV, notes | Corrected; footer shortener fixed |
| 9 | Medium | False precision: "68.4×" from a lab mean of 0.022 ± 0.006 (two tests); cold-start comparability not mentioned | standalone slide 6 | "≈68×" with ± and cold-start caveat (WVU pp. ii–iii) |
| 10 | Medium | Sources give 35×, "~40×" and "10–40×" with no reconciliation (likely audience question) | notes, Q&A | Reconciled: route means max 35.0× (Table 4.3); single run 1.72 g/km = 40.0× (WVU p. 64) matches plea ¶52; EPA p. 4 is fleet/drive-cycle scope |
| 11 | Low | Cover showed "Standalone fallback • approximately 15 minutes" to the audience and did not state the course question | standalone slide 1 | Cover states the course question and the instructor's three questions |
| 12 | Low | Visual QA: card headings touching text, forced line breaks, oversized cards, legend font fallback | build layouts | Fixed and re-rendered; every slide inspected |
| 13 | Low | 24 MB of byte-identical duplicate PDFs (`presentation/sources/`); empty `sources/EPA_NOV.txt` | repo | Removed after SHA-256 match; `.gitignore` for `node_modules/`, `.presentation-build/` |

Several of findings 3, 6–8 originated in my own first-pass drafts earlier in this session; the prior audit pass (`presentation/source_audit.md`) had caught most of them, and every one of its corrections was re-verified here.

## Key claims and sources

Full table (≈40 rows, typed as measurement / limit / company claim / finding / calculation / analysis): [`presentation/sources_and_claims.md`](presentation/sources_and_claims.md).

| Claim | Type | Source |
|---|---|---|
| Standard 0.043 g/km NOx (= 0.07 g/mi), Tier 2 Bin 5 full useful life | Limit | WVU Table 4.1 p. 59; Table 2.2 p. 5 |
| Lab means A 0.022 ± 0.006, B 0.016 ± 0.002 g/km; C not lab-tested | Measurement | WVU p. 64; pp. 1, 9 |
| 13 road means/SDs (e.g. A rural 1.505, A San Diego 1.480, C rural 0.409) | Measurement | WVU Table 4.3 p. 65 |
| A 15–35×, B 5–20×, C ~10× (rural only) | Report summary | WVU p. ii; pp. 62–63 |
| 35.0× vs ≈68×; 1.72 ÷ 0.043 = 40.0× | Our calculation | Table 4.3; p. 64 |
| PEMS vs lab NOx difference 18.8 % (Vehicle B) | Measurement | WVU §3.3.3.3 p. 50; Table 3.13 p. 55 |
| Conclusions confined to three vehicles | Limitation | WVU p. iv |
| Two high emitters = 2012 Jetta and 2013 Passat (letters not mapped) | Later finding | EPA NOV p. 4 |
| Switch read steering, speed, run time, barometric pressure; dyno vs road calibration; "10 to 40 times" | Later finding | EPA NOV pp. 3–4 |
| Marketed as "clean diesel" | Company claim | Plea Exh. 2 ¶30 |
| Motive: couldn't meet NOx standard and attract demand; built defeat software; "not to get caught" (2006) | Admitted finding | Plea ¶¶32–36 (Exh. 2 pp. 11–14) |
| Steering-angle recognition approved ~April 2013 | Admitted finding | Plea ¶50 (Exh. 2 p. 20) |
| Concealment, false explanations; admission 3 Sept 2015; NOV 18 Sept 2015 | Admitted finding | Plea ¶¶54–58, 63–64; EPA p. 1 |
| ~585,000 U.S. vehicles with defeat software, 2009–2015 | Admitted finding | Plea ¶72 (Exh. 2 p. 27) |
| $2.8B criminal fine; $1.5B civil penalties; $11B consumer/NOx-trust credit; 3 yrs probation + monitor | Court document | Plea pp. 12–14 |
| VW admitted the Statement of Facts as "true and correct" | Court document | Plea §E, PDF p. 7; Exh. 2 intro, PDF p. 43 |
| Health cost of extra NOx | — | Not in any source; deliberately not estimated |

## Reproducibility and rendering checks (all actually run)

```bash
cd VW_Emissions_Evidence
python -m pip install -r requirements.txt
cd presentation && npm ci && npm run build && cd ..
python presentation/render_decks.py
python chart/make_charts.py
python presentation/demo_denominators.py
python -m pytest -q tests
```

| Check | Result |
|---|---|
| Clean setup: copy of the project with every generated output deleted, fresh Python venv, `npm ci` | All outputs regenerated; **11 passed**, 0 skipped |
| `npm run build` | team: 4 slides, 3:55 planned, 503 words (≈3:52 at 130 wpm); standalone: 14 slides, 15:05 planned, 1,869 words (≈14:23) |
| pptx skill `validate.py` on both decks | "All validations PASSED!" (schema, relationships, charts) |
| `render_decks.py` (LibreOffice) | 4 + 14 slides rendered to PDF and PNG; every slide viewed, defects fixed, changed slides re-viewed |
| Data vs source | Test opens the WVU PDF, confirms the page footer ("65 \| P a g e") and finds every plotted mean/SD on that page; lab values, 1.72 g/km and the standard on pp. 64 and 59 |
| Chart vs data | Test parses the chart XML inside each .pptx: plotted values, gaps, error bars, standard line, axis max 2.0, blank workbook cells |
| Notes vs slides | Test checks every slide has notes matching `deck_content.json`, a source line, and planned/word-count timing in range |
| PowerPoint COM export | **Failed** (`0x80040155 Interface not registered`); not used |

## Presentation-ready assets

- Your section: `presentation/team_section_3_to_4_minutes.pptx` (+ `.pdf`), script `presentation/team_section_speaker_notes.md`
- Solo talk: `presentation/standalone_15_minutes.pptx` (+ `.pdf`), script `presentation/standalone_speaker_script.md`
- Chart walkthrough and live demo: `presentation/CHART_WALKTHROUGH.md`, `presentation/demo_denominators.py`
- Static assets: `chart/nox_chart.png`, `chart/lab_vs_road_diagram.png`; previews `presentation/slide_previews/`

## Remaining limitations

1. **Not opened in PowerPoint.** Rendering was verified only in LibreOffice (PowerPoint automation is broken on this machine). Fonts are Arial, so line breaks should match, but open both decks once in PowerPoint and page through Presenter View before presenting.
2. **Other members' slides are absent**, so the full team deck's flow, overlap and 15-minute total cannot be audited. Your section's notes assume a speaker before you ("the claim we have just heard") and one after you on the investigation.
3. **Timings are word-count estimates** (130 wpm), not a rehearsal. The solo deck plans 15:05; if the slot is strictly 15:00, trim the ratio slide's third paragraph (≈20 s).
4. **Source inconsistency left open:** Vehicle C Route 3 has three runs in Table 3.15 but "two consecutive runs" in the Table 4.3 caption; the published mean/SD are used and the conflict is disclosed.
5. EPA names the two high emitters but not which is A or B; the chart keeps the report's letters.
6. No primary source here quantifies health harm; the deck says so rather than estimating.

## Recommendation

**Ready to present**, conditional on two quick steps: open both .pptx files in PowerPoint once
(check that no line wraps differently from the previews), and do one timed read-through of your
3:55 section. For the solo version, rehearse once against the 15-minute limit.
