# Source audit for the presentation

> **Historical record (first audit pass).** Re-verified on 28 September 2026; its findings held.
> Current register: `sources_and_claims.md`. Current audit: `../AUDIT_REPORT.md`. The PDFs now live
> only in `../sources/` (the duplicate `presentation/sources/` copies were removed).

Audited 28 September 2026 against the locally saved primary sources. WVU page references below are printed report pages, not PDF file-page numbers. Table 4.3 and the test matrix were also visually checked from rendered PDF pages. This audit does not silently revise the earlier research notes.

## Chart data

All 15 measured NOx means and all nonblank standard deviations in the original `data/nox_data.csv` agree with the WVU source. Three blank measurements are appropriately missing: C laboratory, C Route 4, and A Route 5. Do not plot them as measured zeros.

| Condition | A mean / SD | B mean / SD | C mean / SD |
|---|---|---|---|
| FTP-75 weighted laboratory | 0.022 / 0.006 | 0.016 / 0.002 | not tested |
| Highway, Route 1 | 0.614 / 0.283 | 0.344 / 0.096 | 0.048 / none reported |
| Los Angeles urban, Route 2 | 0.989 / 0.114 | 0.809 / 0.075 | 0.070 / 0.041 |
| Rural uphill/downhill, Route 3 | 1.505 / 0.181 | 0.671 / 0.016 | 0.409 / 0.029 |
| San Diego urban, Route 4 | 1.480 / 0.335 | 0.675 / 0.057 | no data |
| San Francisco urban, Route 5 | no data | 0.815 / none reported | 0.053 / 0.021 |

Units: g/km. Laboratory source: p.64. Road means and SDs: Table 4.3, p.65 (PDF page 81). SD describes reported repeat variation, not a confidence interval or instrument uncertainty.

**Repeat-count correction:** Table 3.15, p.57 (PDF page 73), lists C Route 3 as **three** runs, while the original CSV says two. All other numeric repeat counts agree: A laboratory 2; B laboratory 3; A Routes 1–4 all 2; B Routes 1–4 all 2 and Route 5 one; C Route 1 one, Route 2 two, Route 3 three, Route 5 two. Table 4.3's general caption says SD over two consecutive test runs, creating an internal source inconsistency for C Route 3. Label a count as “runs in test matrix,” retain the published mean/SD, and disclose the inconsistency; do not assert the SD was calculated from three runs without raw data.

Multiples calculated from the report's rounded 0.043 g/km benchmark:

- A: 14.3, 23.0, 35.0, 34.4 (Routes 1–4).
- B: 8.0, 18.8, 15.6, 15.7, 19.0 (Routes 1–5).
- C: 1.1, 1.6, 9.5, 1.2 (Routes 1, 2, 3, 5).
- Laboratory A 0.51 and B 0.37.

For a presentation using just these five routes, use “A: about 14–35x; B: about 8–19x.” The source's narrative uses 15–35x and 5–20x; those are its broad descriptions, not the exact range calculated from Table 4.3. Avoid pretending 5–20 is simply the rounding of 8–19.

## Corrections to earlier narrative

1. **Two cars received laboratory tests, not all three.** WVU pp.1, 9 and 64 establish A and B were tested on a chassis dynamometer. C has no study laboratory value.
2. **Study objective was measurement and comparison.** WVU introduction pp.1–2 says European off-cycle emissions findings prompted ICCT to commission investigation of real-world emissions, fuel economy and control technologies. “The goal was to promote clean diesel” is unsupported by this report and should be removed.
3. **Two emissions-control technologies across three vehicles.** A used LNT; B and C used urea-SCR. They are not three different technologies. Table 3.1 p.10 also differentiates their California certification: A/B ULEV, C LEV.
4. **Five routes include three urban routes.** Highway; LA urban; rural uphill/downhill; San Diego urban; San Francisco urban. Each vehicle covered a subset, not every car every route. All road route runs started warmed up (p.57); FTP-75 weighted laboratory measurements include cold-start effects.
5. **Laboratory results are research tests over a certification cycle.** Label “Laboratory FTP-75, weighted” rather than implying these are the original certification paperwork. Report p.64 provides the repeated lab means above. Table 3.13 is a separate instrument-comparison result for B and is printed **p.55**, not p.54; it reports CVS 0.018 and PEMS 0.015 g/km. Do not confuse this single comparison with B's 0.016 multi-test average.
6. **PEMS agreement was not uniformly single-digit.** Cross-validation was conducted on B (§3.3.3.3, p.50). Table 3.13 p.55 reports weighted FTP-75 CVS/PEMS differences of 3.6% CO2 and **18.8% NOx**. The p.53 prose refers to a different integrated comparison (about 6% CO2, 10% NOx). Say equipment was cross-checked, with limitations; omit the false “single digits on NOx and CO2” claim.
7. **The 0.043 g/km line is the Tier 2 Bin 5 full-useful-life certification benchmark** (Table 4.1 p.59). It is not a separately specified legal road-route pass/fail test. The report explicitly compares off-cycle road measurements with this benchmark. Prefer “above the certification benchmark on the road” over “road-illegal,” and do not describe the short experiment as emissions “measured over the full useful life.”
8. **Vehicle C demonstrates variation, not an experiment isolating software.** Its road values are 1.1–1.6x on three measured routes and 9.5x on hills. It is a different engine/vehicle with different conditions, so it does not alone prove the cause of A/B's excesses or establish that a technology is good/bad.
9. **WVU established a discrepancy, not deliberate manipulation.** Its possible explanations include control strategy, SCR sizing/type, dosing and DPF regeneration (pp.63–65). The limited three-vehicle sample cannot estimate fleet prevalence (Executive Summary p.iv). Treat the later regulator findings and admissions as separate evidence of intent.
10. **Anonymity reason:** WVU p.9 anonymizes make/model information; the earlier expanded script's claim it did so specifically to avoid an accusation is an inferred motive, not a stated finding.

## EPA notice: now visually verified

Source: `sources/EPA_NOV.pdf`, September 18, 2015; https://www.epa.gov/sites/default/files/2015-10/documents/vw-nov-caa-09-18-15.pdf

Printed p.4 (also PDF page 4) was rendered and read directly. It supports:

- Dyno calibration produced compliant test emissions; road calibration reduced SCR/LNT emissions-control effectiveness.
- CARB/EPA were alerted in May 2014 by WVU's ICCT-commissioned findings.
- The two high-emitting study vehicles are explicitly identified as **2012 Jetta and 2013 Passat**. Keeping A/B anonymous in the chart is still sensible; the blanket earlier claim that commercial names cannot be verified is too broad.
- VW attributed excess emissions to technical issues/unexpected conditions; its December 2014 recall provided only limited benefit in CARB tests; follow-up testing and threat of withholding 2016 certification preceded VW's admission.
- EPA characterized the undisclosed switch and road calibration as illegal defeat devices. This is later legal/regulatory evidence, separate from WVU's descriptive measurements.

Printed p.5 lists affected 2.0 L model-year/test-group vehicles and states the investigation continued. The previous notes' assertion that the PDF cannot be used without OCR is obsolete: direct visual reading verifies it. Renders: `presentation/audit_render/epa-4.png`, `epa-5.png`.

## DOJ agreement: precise primary citations

Saved as `sources/DOJ_Plea_Agreement.pdf` and text with explicit PDF-page markers in `sources/DOJ_Plea_Agreement.txt`.

Source: January 2017 plea agreement, Exhibit 2, Statement of Facts; https://www.justice.gov/archives/opa/press-release/file/924436/dl?inline=

| Claim | Exact citation |
|---|---|
| U.S. diesel sales were a strategic goal; supervisors judged demand and stricter NOx requirements could not both be achieved with their planned engine and directed cheating software | ¶¶32–33, Exh.2-11–12; PDF pp.53–54 |
| Software recognized published standard drive cycles; test mode met NOx standards, road mode substantially reduced emissions-control effectiveness | ¶34, Exh.2-12–13; PDF pp.54–55 |
| Objections were raised internally, and leadership authorized continuation | ¶¶35–37, Exh.2-13–14; PDF pp.55–56 |
| Steering-angle recognition refined test detection; approved around April 2013, then incorporated into vehicles and later updates | ¶¶49–51, Exh.2-19–20; PDF pp.61–62 |
| VW employees learned about ICCT/WVU study results around March 2014, followed by CARB/EPA questions and testing | ¶¶52–53, Exh.2-21; PDF p.63 |
| Supervisors chose concealment while appearing to cooperate and offered fixes/explanations without admitting the software | ¶¶54–55, Exh.2-21–22; PDF pp.63–64 |
| False explanations included driving patterns and technical issues | ¶58, Exh.2-23; PDF p.65 |
| A VW employee disclosed different lab/road treatment on August 19, contrary to supervisors' instructions | ¶62, Exh.2-24; PDF p.66 |
| VW supervisor admitted the defeat device to CARB/EPA on September 3, 2015 | ¶63, Exh.2-24; PDF p.66 |
| EPA issued public NOV September 18, 2015 | ¶64, Exh.2-24–25; PDF pp.66–67 |

The agreement says employees **learned results** around March; it does not say the final report was published then. WVU's final report is dated May 15, 2014, and EPA NOV p.4 describes May publication/notification. Avoid the earlier speculative conference explanation of this apparent discrepancy. A compact presentation can simply use “2014 study” then “2015 admission.”

Use this evidence to distinguish initial measurement findings from subsequent proof of intent. Do not substitute the agency's 10–40x or DOJ's differently scoped numbers for the actual Table 4.3 chart data.
