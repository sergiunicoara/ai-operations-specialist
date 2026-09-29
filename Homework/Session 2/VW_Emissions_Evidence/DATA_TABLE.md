# Data table behind the chart

Machine-readable, single source for every chart and deck: [`data/nox_data.csv`](data/nox_data.csv).
Values are transcribed from the WVU/ICCT report (15 May 2014); `tests/test_evidence.py` checks
each one against the text of the cited PDF page. Units: g/km. "×std" = mean ÷ 0.043 (our
calculation). SD = standard deviation as published; "—" = none published (single run).

Benchmark: US-EPA Tier 2 Bin 5 NOx, full useful life = **0.043 g/km** (Table 4.1, p. 59;
= 0.07 g/mi, Table 2.2, p. 5).

| Condition | Vehicle A (LNT) | ×std | Vehicle B (urea-SCR) | ×std | Vehicle C (urea-SCR) | ×std | Source |
|---|---|---|---|---|---|---|---|
| Study lab, FTP-75 weighted | 0.022 ± 0.006 (2 tests) | 0.51 | 0.016 ± 0.002 (3 tests) | 0.37 | not tested | — | p. 64 |
| R1 Highway | 0.614 ± 0.283 | 14.3 | 0.344 ± 0.096 | 8.0 | 0.048 — (1 run) | 1.1 | Table 4.3 p. 65 |
| R2 Urban, Los Angeles | 0.989 ± 0.114 | 23.0 | 0.809 ± 0.075 | 18.8 | 0.070 ± 0.041 | 1.6 | Table 4.3 p. 65 |
| R3 Rural up/downhill | 1.505 ± 0.181 | 35.0 | 0.671 ± 0.016 | 15.6 | 0.409 ± 0.029 (3 runs*) | 9.5 | Table 4.3 p. 65 |
| R4 Urban, San Diego | 1.480 ± 0.335 | 34.4 | 0.675 ± 0.057 | 15.7 | not tested | — | Table 4.3 p. 65 |
| R5 Urban, San Francisco | not tested | — | 0.815 — (1 run) | 19.0 | 0.053 ± 0.021 | 1.2 | Table 4.3 p. 65 |

\* Table 3.15 (p. 57) lists three runs; the Table 4.3 caption says SD is over two runs. Disclosed, not resolved.

Run counts: Table 3.15, p. 57. Untested combinations are gaps in every chart, never zeros.

## Other numbers used in the deck

| Number | Meaning | Source |
|---|---|---|
| 15–35× (A), 5–20× (B), ~10× (C, R3) | Report's own summary of road NOx vs the standard, by route | WVU Exec. Summary p. ii; pp. 62–63 |
| 14–35× (A), 8–19× (B) | Same comparison computed from the plotted route means | Our calculation from Table 4.3 |
| 1.24 and 1.72 g/km | Vehicle A's two San Diego runs (mean 1.480); 1.72 ÷ 0.043 = 40.0× | WVU p. 64 |
| ≈68× | 1.505 ÷ 0.022, road mean vs A's own lab mean (lab ± 0.006 from two tests: order of magnitude only) | Our calculation |
| 18.8 % | CVS vs PEMS NOx difference, Vehicle B, weighted FTP-75 (0.018 vs 0.015 g/km) | Table 3.13 p. 55 |
| "up to approximately 40 times" | Plea's description of the WVU study vehicles | Plea Exh. 2 ¶ 52 (Exh. 2-21) |
| "sometimes 35 times" | Plea's description of road-mode emissions generally | Plea Exh. 2 ¶ 34 (Exh. 2-13) |
| "10 to 40 times" | EPA's description, depending on drive cycle | EPA NOV p. 4 |
