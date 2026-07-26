"""
claims_agent.py
Extracts marketing/health claims (e.g. "supports immune health", "high in
vitamin C") from a product's name/ingredients text. Uses a fast rule-based
pass by default; if an LLM API key is configured, delegates ambiguous
cases to the model for higher-quality extraction.
"""
from __future__ import annotations
import re
from typing import Any

from config import get_settings

from services import llm_client

settings = get_settings()

_CLAIM_PATTERNS: dict[str, list[str]] = {
    "immune_support": [
        r"immun\w*", r"vitamin c", r"zinc", r"elderberry", r"echinacea",
    ],
    "energy": [r"energy", r"caffeine", r"b-?vitamins?"],
    "digestive": [r"probiotic", r"digest\w*", r"fiber"],
    "beauty": [r"collagen", r"biotin", r"skin"],
    "sleep": [r"melatonin", r"sleep", r"calm"],
}


def _rule_based_claims(product: dict[str, Any]) -> list[dict[str, Any]]:
    text = f"{product.get('name','')} {product.get('ingredients_text','')}".lower()
    claims = []
    for claim_type, patterns in _CLAIM_PATTERNS.items():
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                claims.append(
                    {
                        "product_source_id": product["source_id"],
                        "claim_text": f"Contains/associated with: {m.group(0)}",
                        "claim_type": claim_type,
                        "confidence": 0.55,  # rule-based, moderate confidence
                        "evidence_snippet": text[max(0, m.start() - 20): m.end() + 20].strip(),
                    }
                )
                break  # one claim per type per product is enough for a demo
    return claims


async def run(products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Extracts claims for a batch of products. Uses LLM extraction if an API key
    is configured, falling back seamlessly to rule-based pattern matching.
    """
    all_claims: list[dict[str, Any]] = []
    for product in products:
        claims = None
        if llm_client.is_llm_configured():
            claims = await llm_client.extract_claims_llm(product)
        if not claims:
            claims = _rule_based_claims(product)
        all_claims.extend(claims)
    return all_claims

