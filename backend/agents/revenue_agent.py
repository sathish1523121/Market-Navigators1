"""
revenue_agent.py
Attributes estimated revenue to each matched product. Neither Open Food
Facts nor USDA FDC expose sales data (they're nutritional/product
databases, not POS systems) - so this agent's job is to combine matched
products with whatever internal sales data you have (e.g. a Supabase
table populated from your own POS/ERP export) and produce a
best-available estimate. Without internal sales data connected, it falls
back to a transparent, clearly-labeled category-share placeholder so the
UI has something to render in demo mode.

Replace `_fetch_internal_sales` with a real query against your sales
warehouse when you have one.
"""
from __future__ import annotations
from typing import Any

from services import supabase_client


async def _fetch_internal_sales(source_ids: list[str]) -> dict[str, float]:
    """
    Looks up actual revenue-per-SKU from your own sales data in Supabase,
    if a `sku_sales` table has been populated (see db/schema.sql).
    Returns {} if unavailable, which triggers the placeholder estimate.
    """
    return supabase_client.fetch_sku_sales(source_ids)


async def run(products: list[dict[str, Any]], period: str = "latest") -> list[dict[str, Any]]:
    source_ids = [p["source_id"] for p in products]
    actual_sales = await _fetch_internal_sales(source_ids)

    results = []
    for product in products:
        sid = product["source_id"]
        if sid in actual_sales:
            results.append(
                {
                    "product_source_id": sid,
                    "estimated_revenue_usd": actual_sales[sid],
                    "revenue_period": period,
                    "confidence": 0.95,
                    "methodology": "internal_sales_data",
                }
            )
        else:
            # Transparent placeholder - scored by match_score so
            # higher-relevance immune-support products get a larger
            # illustrative share. Clearly NOT real revenue; the UI should
            # label this as an estimate/placeholder until real sales data
            # is connected.
            placeholder = round(product.get("match_score", 0.0) * 10_000, 2)
            results.append(
                {
                    "product_source_id": sid,
                    "estimated_revenue_usd": placeholder,
                    "revenue_period": period,
                    "confidence": 0.1,
                    "methodology": "category_share_estimate_placeholder",
                }
            )
    return results
