"""
Regenerates both evidence-section figures from data/nox_data.csv.

Figure 1 (nox_chart.png): grouped bar chart of measured NOx emissions
(study lab test over FTP-75 vs. five on-road routes) for the three WVU/ICCT
test vehicles, with the US-EPA Tier 2 Bin 5 certification benchmark marked.

Figure 2 (lab_vs_road_diagram.png): CONCEPTUAL illustration (not measured
data) of why a certification-cycle measurement and a road measurement can
disagree when the measured system can detect which one it is undergoing.

Data source: West Virginia University / International Council on Clean
Transportation, "In-Use Emissions Testing of Light-Duty Diesel Vehicles in
the U.S." (May 15, 2014). Every plotted number is transcribed verbatim from
the report; see data/nox_data.csv for the page/table citation of each value.

Run: python make_charts.py   (from this directory)
"""

import csv
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(HERE, "..", "data", "nox_data.csv")
OUT_DIR = HERE

# --- validated dataviz-skill categorical palette (slots 1-3; light mode) ---
COLOR_A = "#2a78d6"   # slot 1: blue   -> Vehicle A (LNT)
COLOR_B = "#eb6834"   # slot 2: orange -> Vehicle B (urea-SCR #1)
COLOR_C = "#1baf7a"   # slot 3: aqua   -> Vehicle C (urea-SCR #2)
INK_PRIMARY = "#0b0b0b"
INK_SECONDARY = "#52514e"
INK_MUTED = "#898781"
GRIDLINE = "#e1e0d9"
BASELINE = "#c3c2b7"
STANDARD_RED = "#d03b3b"   # status "critical" step, reserved for the legal-limit line only
SURFACE = "#fcfcfb"

STANDARD_GKM = 0.043  # US-EPA Tier2-Bin5, full useful life -- WVU/ICCT Report Table 4.1, p.59

plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["Segoe UI", "DejaVu Sans", "Arial"]


def load_data():
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append(r)
    return rows


def figure_1_bar_chart(rows):
    conditions = []
    seen = set()
    for r in rows:
        if r["condition"] not in seen:
            conditions.append((int(r["order"]), r["condition"]))
            seen.add(r["condition"])
    conditions.sort()
    conditions = [c[1] for c in conditions]

    vehicles = ["Vehicle A (LNT)", "Vehicle B (urea-SCR #1)", "Vehicle C (urea-SCR #2)"]
    colors = {vehicles[0]: COLOR_A, vehicles[1]: COLOR_B, vehicles[2]: COLOR_C}

    data = {v: {} for v in vehicles}
    for r in rows:
        v, c = r["vehicle"], r["condition"]
        val = float(r["nox_gkm"]) if r["nox_gkm"] else None
        std = float(r["stddev_gkm"]) if r["stddev_gkm"] else 0.0
        data[v][c] = (val, std)

    fig, ax = plt.subplots(figsize=(12, 6.5), dpi=200)
    fig.patch.set_facecolor(SURFACE)
    ax.set_facecolor(SURFACE)

    n_groups = len(conditions)
    n_series = len(vehicles)
    group_width = 0.72
    bar_width = group_width / n_series
    x = range(n_groups)

    for i, v in enumerate(vehicles):
        xs = [xi + (i - (n_series - 1) / 2) * bar_width for xi in x]
        ys = [data[v][c][0] for c in conditions]
        errs = [data[v][c][1] for c in conditions]
        ys_plot = [y if y is not None else 0 for y in ys]
        errs_plot = [e if (y is not None and e) else 0 for y, e in zip(ys, errs)]
        bars = ax.bar(
            xs, ys_plot, width=bar_width * 0.88, color=colors[v], label=v,
            yerr=errs_plot, capsize=3,
            error_kw={"ecolor": INK_SECONDARY, "elinewidth": 1, "capthick": 1},
            zorder=3,
        )
        for xi, y, orig in zip(xs, ys_plot, ys):
            if orig is None:
                ax.text(xi, 0.045, "n/d", ha="center", va="bottom",
                         fontsize=7.8, color=INK_MUTED, rotation=0, zorder=4)

    ax.axhline(STANDARD_GKM, color=STANDARD_RED, linewidth=1.6, zorder=5, linestyle=(0, (5, 3)))
    ax.text(n_groups - 0.32, 1.95,
            f"- - -  US-EPA Tier 2 Bin 5 standard\n(full useful life): {STANDARD_GKM} g/km",
            color=STANDARD_RED, fontsize=9.5, fontweight="bold", ha="right", va="top")

    wrapped = [c.replace("Study lab test (FTP-75, weighted average)",
                          "Study lab test\n(FTP-75, weighted avg.)")
               .replace(": ", ":\n") for c in conditions]
    ax.set_xticks(list(x))
    ax.set_xticklabels(wrapped, fontsize=9.2, color=INK_PRIMARY)
    for label in ax.get_xticklabels():
        label.set_ha("center")

    ax.set_ylabel("Average NOx emissions [g/km]", fontsize=10.5, color=INK_PRIMARY)
    ax.tick_params(axis="y", colors=INK_SECONDARY, labelsize=9.5)
    ax.tick_params(axis="x", colors=INK_SECONDARY, length=0)

    ax.grid(axis="y", color=GRIDLINE, linewidth=0.8, zorder=0)
    ax.set_axisbelow(True)
    for spine in ["top", "right", "left"]:
        ax.spines[spine].set_visible(False)
    ax.spines["bottom"].set_color(BASELINE)

    # 2.0 keeps the largest upper error bar (A, Route 4: 1.480 + 0.335 = 1.815) inside the axes.
    ax.set_ylim(0, 2.0)

    ax.legend(
        loc="upper left", frameon=False, fontsize=9.5, ncol=3,
        bbox_to_anchor=(0.0, 1.14),
    )

    ax.set_title(
        "On-road NOx far exceeded the lab-cycle result and the Tier 2 Bin 5 benchmark",
        fontsize=13, fontweight="bold", color=INK_PRIMARY, loc="left", pad=48,
    )
    fig.text(
        0.01, 0.955,
        "Mean NOx by test condition, three WVU/ICCT test vehicles (May 2014); error bars = ±1 SD as published "
        "(none for single runs). Road routes are not certification tests.",
        fontsize=9.5, color=INK_SECONDARY, ha="left",
    )
    fig.text(
        0.01, 0.01,
        "Source: WVU/ICCT report (May 15, 2014): Table 4.3 p.65 (road), p.64 (lab), Table 4.1 p.59 (standard). "
        "“n/d” = not tested (not zero). Three vehicles only: not a fleet-representative sample.",
        fontsize=7.8, color=INK_MUTED, ha="left",
    )

    fig.subplots_adjust(left=0.075, right=0.98, top=0.80, bottom=0.16)
    out_path = os.path.join(OUT_DIR, "nox_chart.png")
    fig.savefig(out_path, facecolor=SURFACE)
    plt.close(fig)
    return out_path


def rounded_box(ax, xy, w, h, text, facecolor, textcolor=INK_PRIMARY, fontsize=10, fontweight="normal"):
    box = FancyBboxPatch(
        xy, w, h, boxstyle="round,pad=0.02,rounding_size=0.06",
        linewidth=1.2, edgecolor=facecolor, facecolor=facecolor + "22", zorder=2,
    )
    ax.add_patch(box)
    ax.text(xy[0] + w / 2, xy[1] + h / 2, text, ha="center", va="center",
            fontsize=fontsize, color=textcolor, fontweight=fontweight, wrap=True, zorder=3)


def figure_2_explainer(rows=None):
    fig, ax = plt.subplots(figsize=(12, 6), dpi=200)
    fig.patch.set_facecolor(SURFACE)
    ax.set_facecolor(SURFACE)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 6)
    ax.axis("off")

    ax.text(6, 5.6, "Why a certification test and real-world driving can disagree",
            ha="center", fontsize=14, fontweight="bold", color=INK_PRIMARY)
    ax.text(6, 5.15,
            "Both readings can be individually accurate — the gap appears when the vehicle can tell which one it is in",
            ha="center", fontsize=10, color=INK_SECONDARY)

    # Left panel: lab
    rounded_box(ax, (0.4, 3.3), 5.0, 1.4,
                "Laboratory test over the certification cycle\n(FTP-75 on a chassis dynamometer)",
                COLOR_A, fontsize=10.5, fontweight="bold")
    ax.text(2.9, 3.05, "Fixed, published speed/time trace • repeatable • known in advance",
            ha="center", fontsize=8.7, color=INK_SECONDARY)

    rounded_box(ax, (0.4, 1.55), 5.0, 1.1, "“Switch” recognises the test\n→ “dyno calibration”: full emissions control",
                STANDARD_RED, fontsize=9.3)

    rounded_box(ax, (0.4, 0.25), 5.0, 1.0, "Study lab means: 0.022 (A) and 0.016 (B) g/km\n(below the 0.043 g/km standard)",
                COLOR_A, fontsize=9.5, fontweight="bold")

    # Right panel: road
    rounded_box(ax, (6.6, 3.3), 5.0, 1.4,
                "On-road driving\n(portable emissions measurement system, PEMS)",
                COLOR_B, fontsize=10.5, fontweight="bold")
    ax.text(9.1, 3.05, "Variable speed, grade, load, traffic • not a fixed pattern",
            ha="center", fontsize=8.7, color=INK_SECONDARY)

    rounded_box(ax, (6.6, 1.55), 5.0, 1.1, "No test recognised\n→ “road calibration”: emissions control reduced",
                STANDARD_RED, fontsize=9.3)

    rounded_box(ax, (6.6, 0.25), 5.0, 1.0,
                "Road: about 15–35× the standard (Vehicle A)\nand 5–20× (Vehicle B), depending on route",
                COLOR_B, fontsize=9.3, fontweight="bold")

    for (x0, y0), (x1, y1) in [((2.9, 2.93), (2.9, 2.65)), ((2.9, 1.55), (2.9, 1.25)),
                                 ((9.1, 2.93), (9.1, 2.65)), ((9.1, 1.55), (9.1, 1.25))]:
        arrow = FancyArrowPatch((x0, y0), (x1, y1), arrowstyle="-|>", mutation_scale=14,
                                 color=INK_SECONDARY, linewidth=1.3, zorder=4)
        ax.add_patch(arrow)

    ax.annotate("", xy=(6.55, 3.6), xytext=(5.45, 3.6),
                arrowprops=dict(arrowstyle="-", color=BASELINE, linewidth=1))
    ax.text(6.0, 3.85, "same vehicle,\nsame engineering", ha="center", fontsize=8, color=INK_MUTED, style="italic")

    ax.text(6, -0.15,
            "Conceptual illustration, not measured data. The switch mechanism comes from the later investigation (EPA NOV, Sept. 18, 2015, pp. 3–4;\n"
            "VW plea agreement, Jan. 11, 2017, Exh. 2 ¶34), not from WVU/ICCT. Results: WVU/ICCT p.64 (lab means), p.ii and pp.62–63 (road ranges).",
            ha="center", fontsize=8.3, color=INK_MUTED)

    fig.subplots_adjust(left=0.02, right=0.98, top=0.95, bottom=0.05)
    out_path = os.path.join(OUT_DIR, "lab_vs_road_diagram.png")
    fig.savefig(out_path, facecolor=SURFACE)
    plt.close(fig)
    return out_path


if __name__ == "__main__":
    rows = load_data()
    p1 = figure_1_bar_chart(rows)
    p2 = figure_2_explainer(rows)
    print("Wrote:", p1)
    print("Wrote:", p2)
