"""
tasks/jobs.py
Celery task wrappers around each agent. Kept thin on purpose: all real
logic lives in agents/*.py so those modules stay testable without Celery
or Redis running (see backend/tests if you add pytest later).

Pipeline shape (matches the architecture diagram):
  1. run_match_agent        -> finds candidate SKUs, writes to Supabase
  2. run_claims_agent       -> extracts claims from matched SKUs
  3. run_ingredient_agent   -> parses ingredients from matched SKUs
  4. run_revenue_agent      -> attributes revenue to matched SKUs
Steps 2-4 depend on step 1's output but are independent of each other,
so the orchestrator fires them in parallel once matching completes.
"""
from __future__ import annotations
import asyncio
from typing import Any

from celery_app import celery_app
from services import supabase_client
from agents import match_agent, claims_agent, ingredient_agent, revenue_agent


def _run_async(coro):
    """Celery tasks are sync; agents are async (they do concurrent HTTP
    calls). This bridges the two without needing a persistent event loop
    per worker process."""
    return asyncio.run(coro)


@celery_app.task(name="tasks.jobs.run_match_agent", bind=True)
def run_match_agent(self, job_id: str, query: str, limit: int = 25) -> list[dict[str, Any]]:
    supabase_client.set_job_status(job_id, "match_agent", "running")
    try:
        products = _run_async(match_agent.run(query, limit=limit))
        supabase_client.upsert_products(job_id, products)
        supabase_client.set_job_status(job_id, "match_agent", "success")
        return products
    except Exception as exc:  # noqa: BLE001 - report and re-raise for Celery retry/visibility
        supabase_client.set_job_status(job_id, "match_agent", "failed", error=str(exc))
        raise


@celery_app.task(name="tasks.jobs.run_claims_agent", bind=True)
def run_claims_agent(self, job_id: str, products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    supabase_client.set_job_status(job_id, "claims_agent", "running")
    try:
        claims = _run_async(claims_agent.run(products))
        supabase_client.insert_claims(job_id, claims)
        supabase_client.set_job_status(job_id, "claims_agent", "success")
        return claims
    except Exception as exc:  # noqa: BLE001
        supabase_client.set_job_status(job_id, "claims_agent", "failed", error=str(exc))
        raise


@celery_app.task(name="tasks.jobs.run_ingredient_agent", bind=True)
def run_ingredient_agent(self, job_id: str, products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    supabase_client.set_job_status(job_id, "ingredient_agent", "running")
    try:
        ingredients = _run_async(ingredient_agent.run(products))
        supabase_client.insert_ingredients(job_id, ingredients)
        supabase_client.set_job_status(job_id, "ingredient_agent", "success")
        return ingredients
    except Exception as exc:  # noqa: BLE001
        supabase_client.set_job_status(job_id, "ingredient_agent", "failed", error=str(exc))
        raise


@celery_app.task(name="tasks.jobs.run_revenue_agent", bind=True)
def run_revenue_agent(self, job_id: str, products: list[dict[str, Any]]) -> list[dict[str, Any]]:
    supabase_client.set_job_status(job_id, "revenue_agent", "running")
    try:
        revenue = _run_async(revenue_agent.run(products))
        supabase_client.insert_revenue(job_id, revenue)
        supabase_client.set_job_status(job_id, "revenue_agent", "success")
        return revenue
    except Exception as exc:  # noqa: BLE001
        supabase_client.set_job_status(job_id, "revenue_agent", "failed", error=str(exc))
        raise


def dispatch_pipeline(job_id: str, query: str, limit: int = 25):
    """
    Kicks off the full pipeline: match first (its output feeds the other
    three), then claims/ingredients/revenue in parallel via a Celery
    chord so the orchestrator can await a single AsyncResult.
    """
    from celery import chain, group

    workflow = chain(
        run_match_agent.s(job_id, query, limit),
        group(
            run_claims_agent.s(job_id),
            run_ingredient_agent.s(job_id),
            run_revenue_agent.s(job_id),
        ),
    )
    return workflow.apply_async()
