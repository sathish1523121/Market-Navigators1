"""
openfoodfacts_client.py
Thin wrapper around the Open Food Facts v2 structured-search API.

Docs:
  https://openfoodfacts.github.io/openfoodfacts-server/api/
  Search endpoint: GET {base}/api/v2/search

Notes:
  - v2 does NOT support free-text search (no "q=" full text). Structured
    filtering is done via *_tags params (categories_tags_en, brands_tags,
    labels_tags, etc). For a natural-language query like "immune support"
    we map it to the categories/labels tag filters most likely to match,
    falling back to the legacy /cgi/search.pl endpoint which does support
    free text (search_terms=) for broader recall.
  - Always set a descriptive User-Agent; OFF asks integrators to do this.
"""
from __future__ import annotations
import httpx
from typing import Any

from config import get_settings

settings = get_settings()

_HEADERS = {"User-Agent": settings.OPENFOODFACTS_USER_AGENT}

_FIELDS = ",".join(
    [
        "code",
        "product_name",
        "brands",
        "categories",
        "labels",
        "ingredients_text",
        "nutriments",
        "image_front_url",
    ]
)


async def search_products(query: str, page_size: int = 25) -> list[dict[str, Any]]:
    """
    Search Open Food Facts for products matching a free-text query.
    Uses the legacy search.pl endpoint (supports search_terms=) because the
    v2 /search endpoint only supports structured tag filters, not free text.
    """
    url = f"{settings.OPENFOODFACTS_BASE_URL}/cgi/search.pl"
    params = {
        "search_terms": query,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": page_size,
        "fields": _FIELDS,
    }
    async with httpx.AsyncClient(headers=_HEADERS, timeout=20) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    return data.get("products", [])


async def search_by_category(category_tag: str, page_size: int = 25) -> list[dict[str, Any]]:
    """
    Structured search via the v2 API, e.g. category_tag='immune-support'
    or 'dietary-supplements'. Good for precise, faceted market matching
    once you know the taxonomy tag you want.
    """
    url = f"{settings.OPENFOODFACTS_BASE_URL}/api/v2/search"
    params = {
        "categories_tags_en": category_tag,
        "page_size": page_size,
        "fields": _FIELDS,
    }
    async with httpx.AsyncClient(headers=_HEADERS, timeout=20) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    return data.get("products", [])


async def get_product_by_barcode(barcode: str) -> dict[str, Any] | None:
    url = f"{settings.OPENFOODFACTS_BASE_URL}/api/v2/product/{barcode}.json"
    params = {"fields": _FIELDS}
    async with httpx.AsyncClient(headers=_HEADERS, timeout=20) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    if data.get("status") == 1:
        return data.get("product")
    return None


def normalize_product(raw: dict[str, Any], matched_query: str) -> dict[str, Any]:
    """Map an OFF product payload onto our ProductMatch shape."""
    nutriments = raw.get("nutriments", {}) or {}
    return {
        "source": "openfoodfacts",
        "source_id": str(raw.get("code", "")),
        "name": raw.get("product_name") or "Unknown product",
        "brand": (raw.get("brands") or "").split(",")[0].strip() or None,
        "category": (raw.get("categories") or "").split(",")[0].strip() or None,
        "ingredients_text": raw.get("ingredients_text") or None,
        "nutrients": {
            k: v for k, v in nutriments.items() if k.endswith("_100g")
        },
        "image_url": raw.get("image_front_url"),
        "matched_query": matched_query,
        "match_score": 0.0,  # filled in by the matching agent
    }
