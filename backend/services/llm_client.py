"""
llm_client.py
Unified LLM client supporting OpenAI, Anthropic, and Gemini APIs via httpx.
Provides automatic fallback to rule-based logic when no API key is configured.
"""
from __future__ import annotations
import json
import logging
from typing import Any
import httpx

from config import get_settings

logger = logging.getLogger(__name__)


import re


def is_llm_configured() -> bool:
    s = get_settings()
    return bool(s.OPENAI_API_KEY or s.ANTHROPIC_API_KEY or s.GEMINI_API_KEY)


def extract_search_keywords(user_query: str) -> str:
    """
    Extracts core product/category search keywords from natural language sentences.
    Examples:
    - "Which are my current protein powder competitors?" -> "protein powder"
    - "What are the top ingredients in protein bars?" -> "protein bar"
    - "Tell me about vitamin c supplements" -> "vitamin c"
    """
    q = user_query.strip().lower()

    # Remove common leading phrases that don't add product meaning.
    prefixes = [
        "what are the top ingredients in",
        "what are the ingredients in",
        "what are the top products for",
        "what are the claims for",
        "tell me about",
        "show me",
        "find me",
        "find",
        "search for",
        "what is",
        "what are",
        "which are",
        "which is",
        "top",
        "best",
    ]
    for p in prefixes:
        if q.startswith(p):
            q = q[len(p):].strip()

    # Remove common filler phrases and trailing question punctuation.
    filler_phrases = [
        "my current",
        "current",
        "the current",
        "the top",
        "top",
        "for me",
        "for my",
        "in this dashboard",
        "on this dashboard",
        "in this view",
        "on this view",
    ]
    for phrase in filler_phrases:
        if q.startswith(phrase):
            q = q[len(phrase):].strip()

    q = re.sub(r"\b(are|is|my|the|current|top|best|for|about|on|in)\b", "", q)
    q = re.sub(r"[?\.\!,:]", "", q).strip()
    q = re.sub(r"\s+", " ", q).strip()

    # Remove common trailing noun noise.
    for suffix in [" competitors", " products", " brands", " items", " results", " signals"]:
        if q.endswith(suffix):
            q = q[: -len(suffix)].strip()

    if q.endswith("bars"):
        q = q[:-1]

    return q if q else user_query


def get_llm_status() -> dict[str, Any]:
    s = get_settings()
    configured = is_llm_configured()
    active_provider = s.LLM_PROVIDER
    if s.OPENAI_API_KEY:
        active_provider = "openai"
    elif s.ANTHROPIC_API_KEY:
        active_provider = "anthropic"
    elif s.GEMINI_API_KEY:
        active_provider = "gemini"

    return {
        "configured": configured,
        "provider": active_provider if configured else "none (rule-based fallback active)",
        "model": s.GEMINI_MODEL if s.GEMINI_API_KEY else None,
        "has_openai": bool(s.OPENAI_API_KEY),
        "has_anthropic": bool(s.ANTHROPIC_API_KEY),
        "has_gemini": bool(s.GEMINI_API_KEY),
    }


async def generate_completion(prompt: str, system_prompt: str = "") -> str | None:
    """
    Executes a completion request against OpenAI, Anthropic, or Gemini based on configuration.
    Returns None if no API key is configured or if an error occurs.
    """
    s = get_settings()
    if not is_llm_configured():
        return None

    if not (s.OPENAI_API_KEY or s.ANTHROPIC_API_KEY or s.GEMINI_API_KEY):
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. OpenAI
            if s.OPENAI_API_KEY and (s.LLM_PROVIDER == "openai" or not (s.ANTHROPIC_API_KEY or s.GEMINI_API_KEY)):
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {s.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": messages,
                        "temperature": 0.2,
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"OpenAI API error {res.status_code}: {res.text}")

            # 2. Anthropic
            if s.ANTHROPIC_API_KEY and (s.LLM_PROVIDER == "anthropic" or not (s.OPENAI_API_KEY or s.GEMINI_API_KEY)):
                res = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": s.ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "claude-3-5-haiku-20241022",
                        "max_tokens": 512,
                        "system": system_prompt,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    return data["content"][0]["text"]
                else:
                    logger.warning(f"Anthropic API error {res.status_code}: {res.text}")

            # 3. Gemini
            if s.GEMINI_API_KEY:
                models_to_try = [s.GEMINI_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"]
                content_payload = {"contents": [{"parts": [{"text": f"{system_prompt}\n\n{prompt}"}]}]}
                for model in models_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={s.GEMINI_API_KEY}"
                    try:
                        res = await client.post(url, json=content_payload)
                        if res.status_code == 200:
                            data = res.json()
                            return data["candidates"][0]["content"]["parts"][0]["text"]
                        else:
                            logger.warning(f"Gemini API ({model}) error {res.status_code}: {res.text[:200]}")
                            if res.status_code in {429, 404}:
                                break
                    except Exception as exc:
                        logger.warning(f"Gemini request failed for {model}: {exc}")
                        break

    except Exception as exc:
        logger.error(f"LLM request exception: {exc}")

    return None


async def classify_intent_llm(query: str) -> dict[str, Any]:
    """
    Classifies search intent using LLM if available, with keyword fallback.
    """
    system_prompt = (
        "You are a market query classifier. Classify the user query into one of: "
        "'market_trends', 'product_lookup', or 'ingredient_analysis'. "
        "Return ONLY a JSON object with keys 'intent' and 'category_hint'."
    )
    prompt = f"Query: \"{query}\""
    
    raw = await generate_completion(prompt, system_prompt)
    if raw:
        try:
            # Extract JSON substring if formatted with markdown codeblocks
            clean_raw = raw.strip()
            if "```json" in clean_raw:
                clean_raw = clean_raw.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_raw:
                clean_raw = clean_raw.split("```")[1].split("```")[0].strip()
            
            parsed = json.loads(clean_raw)
            if "intent" in parsed:
                parsed["llm_used"] = True
                return parsed
        except Exception:
            pass

    # Keyword fallback
    q = query.lower()
    if any(kw in q for kw in ["barcode", "product", "sku", "label"]):
        intent = "product_lookup"
    elif any(kw in q for kw in ["ingredient", "formulation", "contains", "active"]):
        intent = "ingredient_analysis"
    else:
        intent = "market_trends"

    return {"intent": intent, "category_hint": None, "llm_used": False}


async def extract_claims_llm(product: dict[str, Any]) -> list[dict[str, Any]] | None:
    """
    Extracts structured health/marketing claims from product using LLM if available.
    Returns None if LLM is not configured or fails (triggering rule-based fallback).
    """
    name = product.get("name", "")
    ing = product.get("ingredients_text", "")
    if not name and not ing:
        return None

    system_prompt = (
        "You are an FDA & market compliance claims analyst. Extract health and marketing claims "
        "from product info. Return ONLY a JSON array of objects, each containing: "
        "'claim_text', 'claim_type' (one of: immune_support, energy, digestive, beauty, sleep, other), "
        "and 'confidence' (float 0.0-1.0)."
    )
    prompt = f"Product Name: {name}\nIngredients: {ing}"

    raw = await generate_completion(prompt, system_prompt)
    if not raw:
        return None

    allowed_types = {"immune_support", "energy", "digestive", "beauty", "sleep", "other"}

    try:
        clean_raw = raw.strip()
        if "```json" in clean_raw:
            clean_raw = clean_raw.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_raw:
            clean_raw = clean_raw.split("```")[1].split("```")[0].strip()

        parsed = json.loads(clean_raw)
        if isinstance(parsed, list):
            results = []
            for item in parsed:
                ctype = str(item.get("claim_type", "other")).lower()
                if ctype not in allowed_types:
                    ctype = "other"
                results.append({
                    "product_source_id": product.get("source_id", ""),
                    "claim_text": item.get("claim_text", "Extracted claim"),
                    "claim_type": ctype,
                    "confidence": float(item.get("confidence", 0.85)),
                    "evidence_snippet": f"{name} {ing}"[:100],
                })
            return results
    except Exception as exc:
        logger.warning(f"Failed to parse LLM claims response: {exc}")

    return None
