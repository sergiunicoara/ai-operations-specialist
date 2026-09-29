# Sources and precise page references

## 1. WVU/ICCT report (primary source for all chart data)

West Virginia University, Center for Alternative Fuels, Engines and Emissions
(CAFEE). *In-Use Emissions Testing of Light-Duty Diesel Vehicles in the U.S.*
Prepared for the International Council on Clean Transportation. May 15, 2014.

PDF: https://theicct.org/wp-content/uploads/2021/06/WVU_LDDV_in-use_ICCT_Report_Final_may2014.pdf
(local copy: `sources/WVU_ICCT_Report.pdf`)

Cited passages, with page numbers as printed in the report's own footer:

| Content used | Page | Table/Figure |
|---|---|---|
| Vehicles anonymized; no make/model disclosed | p.9 | §3.1, Table 3.1 |
| Vehicle specs (engine, after-treatment type, mileage) | p.10 | Table 3.1 |
| Legal standard: NOx = 0.043 g/km, Tier2-Bin5 full useful life | p.59 | Table 4.1 |
| On-road NOx by route, bar chart | p.62 | Figure 4.3 |
| "15 to 35" / "5 to 20" / "~10" exceedance language | p.ii (Exec. Summary), p.62–63 | — |
| On-road NOx by route, data table | p.65 | Table 4.3 |
| Lab (FTP-75 weighted) NOx result, both vehicles | p.64 | (Results narrative) |
| Lab NOx result, Vehicle B detail (CVS vs. PEMS) | p.54 | Table 3.13 |
| PEMS instrument (Horiba OBS-2200) | p.9, p.39 | §3.1, Table 3.11 |
| Test-vehicle count and generalization caveat | p.iv (Exec. Summary) | — |
| Vehicle test matrix (which vehicle ran which route) | p.57 | Table 3.15 |

## 2. ICCT study page

International Council on Clean Transportation. *In-Use Emissions Testing of
Light-Duty Diesel Vehicles in the U.S.* Publication landing page.
https://theicct.org/publication/in-use-emissions-testing-of-light-duty-diesel-vehicles-in-the-u-s/

Used to confirm the report's publication context and authorship; no numeric
data drawn from this page independent of the PDF itself.

## 3. EPA Notice of Violation

U.S. EPA. *Notice of Violation, CAA-09-18-15.* September 18, 2015.
https://www.epa.gov/sites/default/files/2015-10/documents/vw-nov-caa-09-18-15.pdf
(local copy: `sources/EPA_NOV.pdf`)

**Verification note:** this PDF is a scanned image file with no machine-readable
text layer (confirmed via `pdftotext`; extraction returned zero characters of
body text), and no OCR tool was available in this environment. No page-specific
quotation or figure has been drawn from this document. It is referenced only by
its well-established, publicly reported metadata (date issued, case number,
subject: Clean Air Act Notice of Violation against Volkswagen for defeat-device
equipped 2.0L diesel vehicles). If a page-precise citation from the NOV itself
is required, that PDF needs to be re-processed with OCR — flagged here rather
than guessed.

## 4. DOJ press release / statement of facts

U.S. Department of Justice, Office of Public Affairs. *Volkswagen AG Agrees to
Plead Guilty and Pay $4.3 Billion in Criminal and Civil Penalties; Six
Volkswagen Executives and Employees are Indicted in Connection with Conspiracy
to Cheat U.S. Emissions Tests.* January 11, 2017.
https://www.justice.gov/archives/opa/pr/volkswagen-ag-agrees-plead-guilty-and-pay-43-billion-criminal-and-civil-penalties-six

Retrieved and read directly (HTML page, full text). Key facts used, all
directly from this page's text:

- Software design ("recognize whether a vehicle was undergoing standard U.S.
  emissions testing on a dynamometer or... being driven on the road... if the
  vehicle's software detected that it was being tested, the vehicle performed
  in one mode... If the software detected that the vehicle was not being
  tested, it operated in a different mode... causing the vehicle to emit NOx
  up to 40 times higher than U.S. standards").
- Confirms the WVU/ICCT study as the triggering event: "in March 2014, West
  Virginia University's Center for Alternative Fuels, Engines and Emissions
  published the results of a study commissioned by [ICCT]... identified
  substantial discrepancies in the NOx emissions from certain VW vehicles when
  tested on the road compared to when these vehicles were undergoing EPA and
  CARB standard drive cycle tests."
- ~590,000 affected vehicles (VW, Audi, Porsche diesel models, U.S. market);
  defeat device present model years 2009–2016; refined in 2014 with a
  "steering wheel angle recognition feature."
- ~18 months of VW providing misleading explanations to CARB/EPA after the
  ICCT study before the mechanism was admitted.
- Penalties: $2.8B criminal fine + $1.5B civil (EPA civil penalty, CBP customs
  claims, FIRREA) = $4.3B total.

**Discrepancy noted:** the DOJ statement says the WVU study was published "in
March 2014," while the report PDF itself is dated May 15, 2014, and ICCT's own
publication page lists May 2014. This is likely because a preliminary
conference presentation of the findings (SAE, spring 2014) preceded the final
written report — treat "spring 2014" as the safe framing rather than picking
one date as authoritative.

**Not found in this document:** any mapping of "Vehicle A/B/C" to specific VW
model names, or any reference to the WVU study's internal vehicle labels.

## What "the investigation" adds beyond the WVU/ICCT study

The WVU/ICCT study measured three rental/private vehicles on public roads and
a dynamometer — it never inspected VW's source code and does not use the words
"defeat device." It documents a discrepancy and speculates about possible
mechanical causes (DPF regeneration, catalyst sizing, control strategy). The
DOJ statement of facts, built on the subsequent EPA/CARB/FBI investigation and
VW's own admissions, is what establishes *intent* and the *detect-and-switch
software mechanism* — that distinction is deliberately kept explicit throughout
the slides and script.
