"""
ingredient_agent.py
Parses each product's ingredients_text into discrete ingredients and flags
which ones are the "active" functional ingredients for the immune-support
market (vitamin C, zinc, elderberry, etc.) vs filler/inactive ingredients.
"""
from __future__ import annotations
import re
from typing import Any

_ACTIVE_INGREDIENT_CATALOG: dict[str, str] = {
    "vitamin c": "vitamin",
    "ascorbic acid": "vitamin",
    "zinc": "mineral",
    "vitamin d": "vitamin",
    "vitamin d3": "vitamin",
    "elderberry": "botanical",
    "echinacea": "botanical",
    "probiotic": "microbial",
    "beta glucan": "polysaccharide",
    "selenium": "mineral",
    "vitamin b6": "vitamin",
    "vitamin b12": "vitamin",
    "folic acid": "vitamin",
}


def _split_ingredients(ingredients_text: str) -> list[str]:
    # OFF/FDC ingredient strings are comma-separated, sometimes with
    # parenthetical sub-ingredients - strip those for a flat list.
    cleaned = re.sub(r"\([^)]*\)", "", ingredients_text)
    parts = [p.strip().lower() for p in cleaned.split(",")]
    return [p for p in parts if p]


def _parse_product(product: dict[str, Any]) -> list[dict[str, Any]]:
    text = product.get("ingredients_text")
    if not text:
        return []

    results = []
    for raw_name in _split_ingredients(text):
        matched_active = next(
            (key for key in _ACTIVE_INGREDIENT_CATALOG if key in raw_name), None
        )
        results.append(
            {
                "product_source_id": product["source_id"],
                "ingredient_name": raw_name[:120],
                "is_active_ingredient": matched_active is not None,
                "category": _ACTIVE_INGREDIENT_CATALOG.get(matched_active, None)
                if matched_active
                else None,
                "amount_per_serving": None,  # not reliably parseable from free text
            }
        )
    return results


async def run(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    all_ingredients: list[dict[str, Any]] = []
    for product in products:
        all_ingredients.extend(_parse_product(product))
    return all_ingredients
