"""Reproducibility and integrity checks for the VW evidence materials.

Run from VW_Emissions_Evidence/:  python -m pytest -q tests
Build the decks first (presentation/: npm ci && npm run build); deck tests skip if missing.
"""
import csv
import json
import re
import zipfile
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "nox_data.csv"
PRES = ROOT / "presentation"
WVU_PDF = ROOT / "sources" / "WVU_ICCT_Report.pdf"
DECKS = {"team": PRES / "team_section_3_to_4_minutes.pptx", "standalone": PRES / "standalone_15_minutes.pptx"}
STANDARD = 0.043

# Independent transcription of WVU/ICCT Table 4.3 (printed p.65) and lab means (p.64): (mean, sd) in g/km.
SOURCE = {
    ("A", 0): (0.022, 0.006), ("B", 0): (0.016, 0.002),
    ("A", 1): (0.614, 0.283), ("B", 1): (0.344, 0.096), ("C", 1): (0.048, None),
    ("A", 2): (0.989, 0.114), ("B", 2): (0.809, 0.075), ("C", 2): (0.070, 0.041),
    ("A", 3): (1.505, 0.181), ("B", 3): (0.671, 0.016), ("C", 3): (0.409, 0.029),
    ("A", 4): (1.480, 0.335), ("B", 4): (0.675, 0.057),
    ("B", 5): (0.815, None), ("C", 5): (0.053, 0.021),
}
NOT_TESTED = {("C", 0), ("C", 4), ("A", 5)}


def rows():
    with CSV_PATH.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def key(r):
    return r["vehicle"][8], int(r["order"])


def test_csv_matches_source_transcription():
    data = {key(r): r for r in rows()}
    assert len(data) == 18
    for k, (mean, sd) in SOURCE.items():
        r = data[k]
        assert float(r["nox_gkm"]) == pytest.approx(mean), k
        assert (float(r["stddev_gkm"]) if r["stddev_gkm"] else None) == (pytest.approx(sd) if sd else None), k
        assert r["data_status"] == "measured"
    for k in NOT_TESTED:
        assert data[k]["nox_gkm"] == "" and data[k]["data_status"] == "not tested", k


def test_multiples_are_mean_over_standard():
    for r in rows():
        if r["nox_gkm"]:
            m = float(r["nox_gkm"]) / STANDARD
            places = 2 if m < 1 else 1
            assert float(r["multiple_of_standard"]) == pytest.approx(round(m, places)), key(r)


def test_every_row_cites_a_source_page():
    for r in rows():
        assert re.search(r"p\.\s?\d+|pp\.\d", r["source"]), key(r)


def test_runs_follow_test_matrix_table_3_15():
    runs = {key(r): r["runs_in_test_matrix"] for r in rows() if r["nox_gkm"]}
    assert runs[("C", 3)] == "3"  # Table 3.15 p.57 (disclosed conflict with Table 4.3 caption)
    assert runs[("C", 1)] == runs[("B", 5)] == "1"


def test_values_appear_on_cited_wvu_pages():
    pymupdf = pytest.importorskip("pymupdf")
    if not WVU_PDF.exists():
        pytest.skip("WVU PDF not downloaded")
    with pymupdf.open(WVU_PDF) as doc:
        page = lambda printed: doc[printed + 16 - 1].get_text()  # printed page + 16 = PDF page (Chapter 1 on)
        p65, p64, p59, p57 = page(65), page(64), page(59), page(57)
    assert "65 | P a g e" in p65 and "Table 4.3" in p65
    for (mean, sd) in SOURCE.values():
        for v in (mean, sd):
            if v is not None and v not in (0.022, 0.006, 0.002):
                assert f"{v:.3f}" in p65, v
    assert "0.022g/km" in p64 and "0.016g/km" in p64 and "1.72g/km" in p64
    assert "0.043" in p59 and "Table 4.1" in p59
    assert "Table 3.15" in p57


def chart_xml(deck):
    with zipfile.ZipFile(deck) as z:
        name = next(n for n in z.namelist() if re.fullmatch(r"ppt/charts/chart\d+\.xml", n))
        wb = next(n for n in z.namelist() if n.startswith("ppt/embeddings/") and n.endswith(".xlsx"))
        return z.read(name).decode("utf-8"), z.read(wb)


@pytest.mark.parametrize("deck", DECKS.values(), ids=DECKS.keys())
def test_native_chart_reproduces_csv(deck):
    if not deck.exists():
        pytest.skip("deck not built")
    xml, wb = chart_xml(deck)
    assert '<c:dispBlanksAs val="gap"/>' in xml
    assert not re.search(r"<c:v>\s*</c:v>", xml), "empty values must be omitted, not blank"
    bar = re.search(r"<c:barChart>.*?</c:barChart>", xml, re.S).group(0)
    series = re.findall(r"<c:ser>.*?</c:ser>", bar, re.S)
    assert len(series) == 3
    for letter, ser in zip("ABC", series):
        val = re.search(r"<c:val>(.*?)</c:val>", ser, re.S).group(1)
        plotted = {int(i): float(v) for i, v in re.findall(r'<c:pt idx="(\d)"><c:v>([^<]+)</c:v>', val)}
        expected = {o: m for (l, o), (m, _) in SOURCE.items() if l == letter}
        assert plotted == pytest.approx(expected), letter
        plus = re.search(r"<c:plus>(.*?)</c:plus>", ser, re.S).group(1)
        errs = {int(i): float(v) for i, v in re.findall(r'<c:pt idx="(\d)"><c:v>([^<]+)</c:v>', plus)}
        assert errs == pytest.approx({o: s for (l, o), (_, s) in SOURCE.items() if l == letter and s}), letter
    line = re.search(r"<c:lineChart>.*?</c:lineChart>", xml, re.S).group(0)
    assert set(re.findall(r"<c:v>([0-9.]+)</c:v>", line)) == {"0.043"}
    with zipfile.ZipFile(__import__("io").BytesIO(wb)) as z:
        sheet = z.read("xl/worksheets/sheet1.xml").decode()
    assert not re.search(r"<v>\s*</v>", sheet)
    assert re.search(r"<c:max val=\"2\"/>", xml), "axis must reach 2.0 so the A/R4 +1 SD (1.815) is visible"


def slide_texts(deck):
    pptx = pytest.importorskip("pptx")
    prs = pptx.Presentation(deck)
    out = []
    for s in prs.slides:
        body = " ".join(sh.text_frame.text for sh in s.shapes if sh.has_text_frame)
        notes = s.notes_slide.notes_text_frame.text if s.has_notes_slide else ""
        out.append((body, notes))
    return out


@pytest.mark.parametrize("name,low,high", [("team", 180, 240), ("standalone", 840, 960)])
def test_timing_and_notes(name, low, high):
    deck = DECKS[name]
    if not deck.exists():
        pytest.skip("deck not built")
    content = json.loads((PRES / "deck_content.json").read_text(encoding="utf-8"))[name]
    planned = sum(d["seconds"] for d in content)
    words = sum(len(d["notes"].split()) for d in content if d["seconds"])
    assert low <= planned <= high
    assert low <= words / 130 * 60 <= high, "spoken-word estimate at 130 wpm out of range"
    texts = slide_texts(deck)
    assert len(texts) == len(content)
    for (body, notes), d in zip(texts, content):
        assert "SOURCE (not spoken)" in notes
        assert d["notes"].split(".")[0] in notes, d["title"]


BANNED = [
    r"promote clean diesel", r"lab-legal", r"road-illegal", r"legal road limit", r"68\.4",
    r"single.digit", r"Standalone fallback", r"March 2014 conference", r"three different (NOx )?technolog",
]


@pytest.mark.parametrize("deck", DECKS.values(), ids=DECKS.keys())
def test_no_known_overstatements(deck):
    if not deck.exists():
        pytest.skip("deck not built")
    blob = " ".join(b + " " + n for b, n in slide_texts(deck))
    for pattern in BANNED:
        assert not re.search(pattern, blob, re.I), pattern
