"""Live demo (about 60 s): the same road measurement gives different headlines depending on the denominator.

Run from VW_Emissions_Evidence/:  python presentation/demo_denominators.py
"""
import csv
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
STANDARD = 0.043  # g/km, WVU Table 4.1 p.59
rows = list(csv.DictReader((Path(__file__).resolve().parents[1] / "data" / "nox_data.csv").open(encoding="utf-8")))
lab = {r["vehicle"][8]: float(r["nox_gkm"]) for r in rows if r["order"] == "0" and r["nox_gkm"]}

print(f"{'vehicle':8} {'route':32} {'g/km':>6} {'÷ standard':>11} {'÷ own lab':>10}")
for r in rows:
    if r["order"] == "0" or not r["nox_gkm"]:
        continue
    v, x = r["vehicle"][8], float(r["nox_gkm"])
    own = f"{x / lab[v]:9.0f}×" if v in lab else "   no lab"
    print(f"{v:8} {r['condition']:32} {x:6.3f} {x / STANDARD:10.1f}× {own:>10}")

print("\nSame bar, two headlines: 1.505 ÷ 0.043 =", round(1.505 / STANDARD, 1), "× vs 1.505 ÷ 0.022 =", round(1.505 / 0.022), "×")
print("Plea ¶52 says 'up to ~40×': A's single San Diego run 1.72 ÷ 0.043 =", round(1.72 / STANDARD, 1), "× (WVU p.64)")
print("Caveat: A's lab mean is 0.022 ± 0.006 from two tests, so the ÷ own-lab column is order-of-magnitude only.")
