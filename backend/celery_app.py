"""
celery_app.py
Celery application instance. Run workers with:

    celery -A celery_app worker --loglevel=info -Q matching,claims,ingredients,revenue

Separate queues per agent let you scale each independently (e.g. more
workers on `matching` since it fans out to two external HTTP APIs).
"""
from celery import Celery
from config import get_settings

settings = get_settings()

celery_app = Celery(
    "immune_market_insights",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["tasks.jobs"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_routes={
        "tasks.jobs.run_match_agent": {"queue": "matching"},
        "tasks.jobs.run_claims_agent": {"queue": "claims"},
        "tasks.jobs.run_ingredient_agent": {"queue": "ingredients"},
        "tasks.jobs.run_revenue_agent": {"queue": "revenue"},
    },
    task_track_started=True,
)
