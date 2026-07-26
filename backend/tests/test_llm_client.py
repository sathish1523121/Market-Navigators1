import asyncio
from types import SimpleNamespace

from services import llm_client


class _DummyResponse:
    def __init__(self, status_code: int, text: str = ""):
        self.status_code = status_code
        self.text = text


class _DummyAsyncClient:
    def __init__(self, *args, **kwargs):
        self.calls = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, url, json=None):
        self.calls.append(url)
        return _DummyResponse(429, "quota exceeded")


def test_generate_completion_stops_after_quota_error(monkeypatch):
    monkeypatch.setattr(llm_client, "get_settings", lambda: SimpleNamespace(
        OPENAI_API_KEY="",
        ANTHROPIC_API_KEY="",
        GEMINI_API_KEY="fake-key",
        GEMINI_MODEL="gemini-2.5-flash",
        LLM_PROVIDER="gemini",
    ))

    dummy_client = _DummyAsyncClient()
    monkeypatch.setattr(llm_client.httpx, "AsyncClient", lambda *args, **kwargs: dummy_client)

    async def run():
        return await llm_client.generate_completion("hello", "system")

    assert asyncio.run(run()) is None
    assert len(dummy_client.calls) == 1
