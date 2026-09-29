# Sources and claims register

Every factual or numerical claim in the decks, the speaker notes and the charts, with its
primary source. Re-audited 28 September 2026: each entry below was checked against the local
PDF (WVU and DOJ by text extraction plus page footers; EPA by rendering and reading the scanned
pages). Supersedes `source_audit.md` where they differ.

## Primary sources (local copies in `../sources/`)

**W: WVU / ICCT.** Thompson, Carder, Besch, Thiruvengadam and Kappanna, *In-Use Emissions
Testing of Light-Duty Diesel Vehicles in the U.S.*, final report, 15 May 2014.
<https://theicct.org/wp-content/uploads/2021/06/WVU_LDDV_in-use_ICCT_Report_Final_may2014.pdf>
Local: [`WVU_ICCT_Report.pdf`](../sources/WVU_ICCT_Report.pdf). Printed page numbers are used; from
Chapter 1 on, PDF page = printed page + 16 (e.g. printed p. 65 = PDF p. 81).

**E: U.S. EPA.** *Notice of Violation* to Volkswagen AG, Audi AG and VW Group of America,
18 September 2015. <https://www.epa.gov/sites/default/files/2015-10/documents/vw-nov-caa-09-18-15.pdf>
Local: [`EPA_NOV.pdf`](../sources/EPA_NOV.pdf) (scanned, 6 pages; printed = PDF page). A
regulatory allegation at the time, not a court judgment.

**D: VW plea agreement.** *United States v. Volkswagen AG*, No. 16-CR-20394 (E.D. Mich.),
11 January 2017, with Exhibit 2, Statement of Facts.
<https://www.justice.gov/archives/opa/press-release/file/924436/dl?inline=>
Local: [`DOJ_Plea_Agreement.pdf`](../sources/DOJ_Plea_Agreement.pdf); text with `[PDF PAGE n]`
markers in [`DOJ_Plea_Agreement.txt`](../sources/DOJ_Plea_Agreement.txt). Exhibit 2 page 2-N =
PDF page N + 42. VW "admits, agrees, and stipulates" that Exhibit 2 is "true and correct"
(§E Factual Basis, PDF p. 7; Exhibit 2 intro, PDF p. 43).

**P: DOJ press release**, 11 January 2017 (read online, not saved). Used only for background;
every number in the deck comes from W, E or D.

## Claim-to-source table

Type: **M** measurement · **L** regulatory limit · **C** company claim/marketing ·
**F** later regulatory or admitted finding · **Calc** our calculation · **A** our analysis.

| Claim | Type | Source and exact location |
|---|---|---|
| ICCT contracted WVU to measure off-cycle NOx, prompted by European findings (4–7× Euro limits) | F | W intro p. 1; objectives p. 2 |
| Three vehicles; A 2.0 L LNT, B 2.0 L urea-SCR, C 3.0 L urea-SCR; two technologies | M | W Table 3.1 p. 10; p. 2 |
| Report anonymises vehicles as A/B/C | — | W §3.1 p. 9 |
| Two high emitters identified as a 2012 Jetta and a 2013 Passat (letter mapping not given) | F | E p. 4 |
| Road routes, runs per vehicle, untested combinations (A/R5, C/R4) | M | W Table 3.15 p. 57 |
| Only A and B were lab-tested (FTP-75, CARB El Monte) | M | W pp. 1, 9, 64 |
| Standard 0.043 g/km NOx, Tier 2 Bin 5, full useful life (= 0.07 g/mi) | L | W Table 4.1 p. 59; Table 2.2 p. 5 |
| Lab means A 0.022 ± 0.006 (2 tests), B 0.016 ± 0.002 (3 tests) g/km | M | W p. 64 (also pp. ii–iii) |
| All 13 road means and SDs in the chart | M | W Table 4.3 p. 65 (plotted in Figure 4.3 p. 62) |
| A's San Diego runs 1.24 and 1.72 g/km | M | W p. 64 |
| Report summary: A 15–35×, B 5–20×, C ~10× on rural route only | M (report's summary) | W p. ii; pp. 62–63 |
| Multiples 14.3–35.0× (A), 8.0–19.0× (B), 9.5× (C/R3) | Calc | Table 4.3 means ÷ 0.043 |
| 35.0× vs ≈68× for the same road mean (denominator changes) | Calc | 1.505 ÷ 0.043; 1.505 ÷ 0.022 |
| 1.72 ÷ 0.043 = 40.0× reconciles plea's "~40×" with the chart's 35× maximum | Calc | W p. 64; D ¶ 52 |
| Weighted FTP-75 includes a cold start; road runs warm; cold starts usually raise NOx | M | W pp. ii–iii, 57 |
| PEMS vs CVS NOx difference 18.8 % on Vehicle B (0.018 vs 0.015 g/km) | M | W §3.3.3.3 p. 50; Table 3.13 p. 55 |
| Researchers' candidate explanations (control strategy, SCR sizing/type, dosing, DPF regeneration) | A (researchers') | W pp. 63–64 |
| Conclusions confined to the three vehicles | — | W p. iv |
| VW marketed the vehicles as "clean diesel"; represented compliance to customers and regulators | C | D ¶¶ 28–30 (Exh. 2 pp. 10–11) |
| Selling diesels in the U.S. was an important strategic goal | F | D ¶ 32 (Exh. 2 pp. 11–12) |
| Engineers could not meet the NOx standard and attract enough demand; built software to detect and defeat the test | F | D ¶ 33 (Exh. 2 p. 12) |
| Software recognised published drive cycles; test mode met NOx standards, road mode reduced control, "sometimes 35 times" | F | D ¶ 34 (Exh. 2 pp. 12–13) |
| 2006 objections; supervisor decided to continue, "not to get caught" | F | D ¶ 36 (Exh. 2 pp. 13–14) |
| "Switch" read steering-wheel position, speed, engine run time and barometric pressure | F | E p. 3 |
| "Dyno calibration" vs "road calibration" reducing SCR/LNT effectiveness; NOx "10 to 40 times" | F | E p. 4 |
| Steering-angle recognition authorised around April 2013; 2014 update misdescribed | F | D ¶¶ 49–51 (Exh. 2 pp. 19–20) |
| VW employees learned of the ICCT study around March 2014; study vehicles "up to approximately 40 times" | F | D ¶ 52 (Exh. 2 p. 21) |
| CARB/EPA alerted in May 2014; VW blamed technical issues; Dec 2014 recall had limited benefit | F | E p. 4 |
| Concealment strategy; false explanations to CARB (1 Oct 2014) | F | D ¶¶ 54–55, 58 (Exh. 2 pp. 21–23) |
| Regulators threatened to withhold MY2016 certification | F | D ¶ 59; E p. 4 |
| Disclosure by an employee 19 Aug 2015; admission 3 Sept 2015; EPA NOV 18 Sept 2015 | F | D ¶¶ 62–64 (Exh. 2 pp. 24–25); E p. 1 |
| About 585,000 U.S. vehicles with defeat software, 2009–2015 (2.0 L and 3.0 L, incl. Porsche) | F | D ¶ 72 (Exh. 2 p. 27) |
| Affected 2.0 L models, MY2009–2015 (Jetta, Golf, Beetle, Passat, Audi A3…) | F | E pp. 1, 5 |
| Guilty plea: conspiracy, obstruction of justice, entry of goods by false statement | F | D p. 1 |
| $2.8 billion criminal fine; $1.5 billion civil penalties | F | D p. 13 |
| $11 billion credit = NPV of consumer settlements and NOx remediation trust payments | F | D p. 13 |
| Three years' probation; independent monitor up to three years | F | D pp. 12, 14 |
| No restitution order: victims too numerous; owners compensated via class settlement | F | D p. 14 |
| Health cost of the extra NOx | — | **Not quantified in any of our sources; deliberately not estimated** |
| Selective presentation vs manipulation; "the line" = engineering the test result | A | Synthesis of W, E, D |

## Numbers deliberately *not* used

- **482,000 vehicles** (widely reported 2.0 L figure): not stated in the EPA NOV text (p. 4 says
  "hundreds of thousands"); the deck uses the plea's ~585,000 instead.
- **~590,000 vehicles** (DOJ press release) vs **~585,000** (plea ¶ 72): the plea, a court
  document, is used.
- **Health-impact estimates**: none in our primary sources.
- **Six indicted executives** (press release): indictments are allegations, not findings; omitted.
