"""Deterministic (no LLM) price extraction: fixed selectors and schema.org JSON-LD.

Every function returns (records, stats). `stats` counts HTTP requests and elapsed time.
Each site needs its own small extractor: this is the price of being cheap and repeatable.
"""
import json
import re
import time
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from src.schema import ProductResult, now_iso

UA = "course-demo-price-check/1.0 (educational; low volume; contact: course project)"
DELAY = 0.5  # seconds between requests: keep volume low


class Http:
    """Tiny polite HTTP client that counts requests."""

    def __init__(self):
        self.client = httpx.Client(headers={"User-Agent": UA}, timeout=20, follow_redirects=True)
        self.requests = 0

    def get(self, url: str) -> httpx.Response:
        if self.requests:
            time.sleep(DELAY)
        self.requests += 1
        r = self.client.get(url)
        r.raise_for_status()
        return r


def money(text: str) -> float | None:
    m = re.search(r"(\d[\d,]*\.?\d*)", text.replace("\xa0", " "))
    return float(m.group(1).replace(",", "")) if m else None


def jsonld_products(html: str) -> list[dict]:
    """Return schema.org Product objects found in JSON-LD blocks (flattening @graph)."""
    soup = BeautifulSoup(html, "lxml")
    found = []

    def walk(o):
        if isinstance(o, list):
            for x in o:
                walk(x)
        elif isinstance(o, dict):
            t = o.get("@type")
            if t == "Product" or (isinstance(t, list) and "Product" in t):
                found.append(o)
            for k in ("@graph", "mainEntity"):
                if k in o:
                    walk(o[k])

    for s in soup.find_all("script", type="application/ld+json"):
        try:
            walk(json.loads(s.string or ""))
        except Exception:
            continue
    return found


def offer_of(product: dict) -> dict:
    o = product.get("offers") or product.get("Offers") or {}
    if isinstance(o, list):
        o = o[0] if o else {}
    if o.get("@type") == "AggregateOffer" and "lowPrice" in o:
        o = {**o, "price": o["lowPrice"]}
    return o


def _record(site, title, price, shipping, currency, url, conf, notes) -> dict:
    total = round(price + (shipping or 0), 2)
    return ProductResult(
        site=site, product_title=title, price=price, shipping_cost=shipping, total=total,
        currency=currency, url=url, confidence=conf, notes=notes, timestamp=now_iso(),
    ).model_dump()


# --------------------------------------------------------------------------- books.toscrape.com
def parse_books_product(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    return {"title": soup.select_one("div.product_main h1").get_text(strip=True),
            "price": money(soup.select_one("p.price_color").get_text())}


def books_toscrape(titles: list[str], http: Http | None = None, max_pages: int = 50):
    t0 = time.time()
    http = http or Http()
    base = "https://books.toscrape.com/catalogue/"
    want, found = {t.lower(): t for t in titles}, {}
    for page in range(1, max_pages + 1):
        soup = BeautifulSoup(http.get(f"{base}page-{page}.html").text, "lxml")
        for a in soup.select("article.product_pod h3 a"):
            key = a["title"].lower()
            if key in want and key not in found:
                found[key] = urljoin(f"{base}page-{page}.html", a["href"])
        if len(found) == len(want):
            break
    recs = []
    for key, url in found.items():
        p = parse_books_product(http.get(url).text)
        recs.append(_record("books.toscrape.com", p["title"], p["price"], None, "GBP", url, "high",
                            "No shipping shown on this practice site; total equals price."))
    stats = {"requests": http.requests, "seconds": round(time.time() - t0, 2), "found": len(found), "wanted": len(want)}
    return recs, stats


# --------------------------------------------------------------------------- live shops
def _shipping_from_rule(html: str, price: float, rule: str | None):
    """Only trust a rule the page itself states, e.g. 'FREE SHIPPING ON ORDERS OVER $49'."""
    if not rule:
        return None, "Shipping not in the static HTML or structured data; reported as not shown."
    text = re.sub(r"\s+", " ", BeautifulSoup(html, "lxml").get_text(" "))
    m = re.search(rule, text, re.I)
    if m and price >= float(m.group(1)):
        return 0.0, f"Free shipping: page banner says free over ${m.group(1)}; price is above it."
    return None, "Shipping rule not found or threshold not met; reported as not shown."


def jsonld_site(site: dict, http: Http | None = None):
    t0 = time.time()
    http = http or Http()
    html = http.get(site["start_url"]).text
    prods = jsonld_products(html)
    if not prods:
        raise ValueError(f"no JSON-LD Product on {site['start_url']}")
    p = prods[0]
    off = offer_of(p)
    price = float(off["price"])
    ship, note = _shipping_from_rule(html, price, site.get("free_shipping_rule"))
    rec = _record(site["domain"], p.get("name", ""), price, ship, off.get("priceCurrency", "USD"), site["start_url"], "medium", note)
    return [rec], {"requests": http.requests, "seconds": round(time.time() - t0, 2)}


def shopify_json_site(site: dict, http: Http | None = None):
    """Shopify stores publish /products/<handle>.json: a structured endpoint, still unofficial for price checks."""
    t0 = time.time()
    http = http or Http()
    d = http.get(site["start_url"].split("?")[0].rstrip("/") + ".json").json()["product"]
    v = d["variants"][0]
    rec = _record(site["domain"], d["title"], float(v["price"]), None, site.get("currency", "USD"), site["start_url"], "medium",
                  "Price from the store's public product JSON. Shipping is calculated at checkout and is not in this data.")
    return [rec], {"requests": http.requests, "seconds": round(time.time() - t0, 2)}


EXTRACTORS = {"jsonld": jsonld_site, "shopify_json": shopify_json_site}


BLOCKED: dict[str, str] = {}  # sites that answered 403/429 once: we do not keep hitting them


def live_shops(cfg: dict):
    """Run each site's extractor. A failure on one site is recorded, not hidden."""
    t0 = time.time()
    recs, errors, reqs = [], [], 0
    for site in cfg["sites"]:
        if site["domain"] in BLOCKED:
            errors.append({"site": site["domain"], "error": "skipped after earlier block: " + BLOCKED[site["domain"]]})
            continue
        http = Http()
        try:
            r, st = EXTRACTORS[site["extractor"]](site, http)
            recs += r
        except Exception as e:
            msg = f"{type(e).__name__}: {str(e)[:120]}"
            errors.append({"site": site["domain"], "error": msg})
            if "403" in msg or "429" in msg:
                BLOCKED[site["domain"]] = msg
        reqs += http.requests
    return recs, {"requests": reqs, "seconds": round(time.time() - t0, 2), "errors": errors, "wanted": len(cfg["sites"]), "found": len(recs)}


def fetch_page_price(url: str, http: Http | None = None) -> dict:
    """Independent re-read of a product page, used by verify.py."""
    http = http or Http()
    html = http.get(url).text
    if "books.toscrape.com" in url:
        p = parse_books_product(html)
        return {"title": p["title"], "price": p["price"], "source": "css:p.price_color"}
    prods = jsonld_products(html)
    if prods:
        off = offer_of(prods[0])
        return {"title": prods[0].get("name"), "price": float(off["price"]), "source": "json-ld"}
    if "/products/" in url:  # Shopify product JSON
        d = http.get(url.split("?")[0].rstrip("/") + ".json").json()["product"]
        return {"title": d["title"], "price": float(d["variants"][0]["price"]), "source": "shopify product json"}
    raise ValueError(f"no known extractor for {url}")
