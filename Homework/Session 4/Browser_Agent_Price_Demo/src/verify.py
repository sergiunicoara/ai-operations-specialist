"""Independent verification: re-fetch each product page directly and compare with the agent's reported price."""
import copy
import re

from src.deterministic import Http, fetch_page_price

TOL = 0.01


def title_similar(a: str, b: str, min_overlap: float = 0.5) -> bool:
    """Shops show titles slightly differently; compare word overlap. Price is the binding check."""
    ta, tb = set(re.findall(r"[a-z0-9]+", a.lower())), set(re.findall(r"[a-z0-9]+", b.lower()))
    return bool(ta and tb) and len(ta & tb) / min(len(ta), len(tb)) >= min_overlap


def verify_results(results: list[dict], http: Http | None = None) -> list[dict]:
    http = http or Http()
    out = []
    for r in results:
        row = {"site": r["site"], "url": r["url"], "agent_price": r["price"], "agent_title": r["product_title"]}
        try:
            page = fetch_page_price(r["url"], http)
            row.update(page_price=page["price"], page_title=page["title"], source=page["source"])
            row["price_match"] = abs(page["price"] - r["price"]) <= TOL
            row["title_match"] = title_similar(r["product_title"], page["title"] or "")
            row["status"] = "OK" if row["price_match"] and row["title_match"] else "MISMATCH"
        except Exception as e:
            row.update(status="UNVERIFIED", error=str(e)[:160], price_match=None, title_match=None)
        out.append(row)
    return out


def self_test() -> dict:
    """Alter one price on purpose and confirm verification flags exactly that record."""
    from src.deterministic import books_toscrape
    recs, _ = books_toscrape(["Sophie's World"])
    good = verify_results(copy.deepcopy(recs))
    tampered = copy.deepcopy(recs)
    tampered[0]["price"] = round(tampered[0]["price"] + 3.00, 2)
    tampered[0]["total"] = tampered[0]["price"]
    bad = verify_results(tampered)
    ok = good[0]["status"] == "OK" and bad[0]["status"] == "MISMATCH"
    return {"unaltered": good[0]["status"], "altered_by_+3.00": bad[0]["status"], "pass": ok}
