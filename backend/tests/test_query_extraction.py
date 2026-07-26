import pytest

from services import llm_client


@pytest.mark.parametrize(
    ("query", "expected"),
    [
        ("which are my current protein powder competitors", "protein powder"),
        ("show me the top protein powder brands", "protein powder"),
        ("what are the ingredients in collagen supplements", "collagen supplements"),
    ],
)
def test_extract_search_keywords_removes_filler_terms(query, expected):
    assert llm_client.extract_search_keywords(query) == expected
