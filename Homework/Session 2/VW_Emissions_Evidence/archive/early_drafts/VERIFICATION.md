# Verification report

## 1. Chart visual inspection

Both figures were rendered and viewed directly (not just generated blind):

- `chart/nox_chart.png` — checked for: legal standard clearly marked (yes, red
  dashed line + label), units visible (yes, "g/km" on axis and in title), all
  three vehicles distinguishable with a legend (yes), missing data shown as
  gaps/"n/d" rather than zero-height bars (yes), no label collisions after two
  layout passes (first pass had a clipped x-axis label and an overlapping
  standard-line label; both fixed and re-verified).
- `chart/lab_vs_road_diagram.png` — checked for: does not overstate a single
  blended exceedance range (first draft said "5–35×" as one number; corrected
  to separately state Vehicle A's 15–35× and Vehicle B's 5–20×), explicitly
  labeled as a general mechanism with the DOJ finding cited separately from
  the WVU finding.

## 2. Plotted values vs. source table

Every non-blank NOx value in `data/nox_data.csv` was re-divided by the 0.043
g/km standard and checked against the "multiple of standard" figure stored
alongside it. All 15 measured data points matched within rounding tolerance
(±0.15×). See the recomputation run in this session; no mismatches found.

Every g/km value itself was transcribed by direct reading of the WVU/ICCT PDF
report's text and tables (via `pdftotext -layout`, cross-checked against a
second raw-text pass and against the report's own prose restating the same
figures in the Executive Summary and Results narrative) — not read off a
chart image or approximated. Two figures (Route 1 Vehicle A σ, Route 5 vehicle
B/A single-run status) were cross-checked against the report's own narrative
text describing DPF-regeneration-driven variability and the Table 3.15 test
matrix, respectively, to confirm they were single runs rather than omitted
repeats.

## 3. Values that could NOT be verified / were deliberately excluded

- **Commercial vehicle model names.** Not used anywhere in this evidence
  section. The WVU/ICCT report explicitly anonymizes the three vehicles
  (p.9) and no page in the DOJ press release maps "Vehicle A/B/C" to a
  specific model. Rather than repeat commonly-circulated informal
  identifications from secondary journalism, this section only uses the
  report's own "Vehicle A/B/C" labels.
- **EPA Notice of Violation (source #3), page-specific content.** The PDF at
  the supplied URL is a scanned image with no extractable text layer (checked
  with `pdftotext`, `pdfinfo`-equivalent inspection, and a second extraction
  attempt via a different tool path — both returned effectively zero
  characters of body text). No OCR tool was available in this environment.
  No number, quote, or page reference from this document appears anywhere in
  the slides, script, or chart. It is cited only by its public, undisputed
  metadata (date, docket identifier, subject matter) in `SOURCES.md`, with
  that limitation flagged explicitly rather than silently worked around.
- **DOJ's "up to 40 times" NOx figure.** This appears in the DOJ statement of
  facts as a finding from the full investigation (all defeat-device-equipped
  vehicles, once the mechanism was known), not from the WVU/ICCT study's
  three test vehicles. It is kept clearly separated from the WVU study's own
  15–35× / 5–20× route-level figures throughout — they are not the same
  measurement and are not added together or averaged anywhere.
- **DOJ's "March 2014" publication date** for the WVU study conflicts with the
  report PDF's own May 15, 2014 cover date and the ICCT publication page. This
  is flagged as an open discrepancy in `SOURCES.md` (most likely explained by
  a preliminary spring-2014 conference presentation preceding the final
  written report) rather than silently resolved in favor of one date.

## 4. What this means for presenting

Everything in `chart/nox_chart.png`, `DATA_TABLE.md`, and the slide/script
numeric claims is traceable to a specific page/table in the primary WVU/ICCT
PDF, transcribed directly rather than estimated. The one external fact used
without a page-precise citation (the EPA NOV) is not load-bearing for any
number on the chart — it only supports general scene-setting language, and
that limitation is disclosed rather than glossed over.
