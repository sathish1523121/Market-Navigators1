"""
usda_fdc_client.py
Thin wrapper around the USDA FoodData Central (FDC) REST API.

Docs: https://fdc.nal.usda.gov/api-guide
  GET /foods/search   - keyword search across Foundation, SR Legacy,
                         Survey (FNDDS) and Branded datasets
  GET /food/{fdcId}   - full nutrient profile for one food

Auth: api_key query param, from api.data.gov. DEMO_KEY works for light
testing but is aggressively rate limited (~30 req/hr) - get a free key at
https://fdc.nal.usda.gov/api-key-signup.html for real usage.
"""
from __future__ import annotations
import httpx
from typing import Any

from config import get_settings

settings = get_settings()


async def search_foods(
    query: str,
    data_types: list[str] | None = None,
    page_size: int = 25,
) -> list[dict[str, Any]]:
    """
    Search FDC for foods matching a keyword query.
    data_types can include: "Foundation", "SR Legacy", "Survey (FNDDS)",
    "Branded". Branded is the most useful dataset for supplement/product
    market analysis since it covers manufacturer-submitted labels.
    """
    url = f"{settings.USDA_FDC_BASE_URL}/foods/search"
    params: dict[str, Any] = {
        "api_key": settings.USDA_FDC_API_KEY,
        "query": query,
        "pageSize": page_size,
    }
    if data_types:
        params["dataType"] = ",".join(data_types)

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    return data.get("foods", [])


async def get_food_details(fdc_id: int | str) -> dict[str, Any]:
    url = f"{settings.USDA_FDC_BASE_URL}/food/{fdc_id}"
    params = {"api_key": settings.USDA_FDC_API_KEY}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


def normalize_food(raw: dict[str, Any], matched_query: str) -> dict[str, Any]:
    """Map an FDC food payload onto our ProductMatch shape."""
    nutrients = {}
    for n in raw.get("foodNutrients", []):
        name = n.get("nutrientName") or (n.get("nutrient") or {}).get("name")
        value = n.get("value") if "value" in n else n.get("amount")
        unit = n.get("unitName") or (n.get("nutrient") or {}).get("unitName")
        if name and value is not None:
            nutrients[name] = f"{value} {unit}".strip()

    return {
        "source": "usda_fdc",
        "source_id": str(raw.get("fdcId", "")),
        "name": raw.get("description") or "Unknown food",
        "brand": raw.get("brandOwner") or raw.get("brandName"),
        "category": raw.get("foodCategory") or raw.get("dataType"),
        "ingredients_text": raw.get("ingredients"),
        "nutrients": nutrients,
        "image_url": None,  # FDC does not provide product imagery
        "matched_query": matched_query,
        "match_score": 0.0,
    }
