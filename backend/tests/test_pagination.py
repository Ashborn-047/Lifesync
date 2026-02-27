"""
Tests for Pagination and Indexing (PR #59)
"""

import pytest
from unittest.mock import MagicMock, patch
from src.supabase_client import SupabaseClient

def test_get_history_pagination_logic():
    """Test get_history calculates correct range and returns metadata."""
    # Mock supabase client
    mock_client = MagicMock()
    # Mock count response
    mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.count = 42
    # Mock data response
    mock_data = [{"id": i} for i in range(10)]
    mock_client.table.return_value.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value.data = mock_data

    with patch("src.supabase_client.create_client", return_value=mock_client):
        # We need to clear cache if it was imported/used
        from src.db.cache import history_cache
        history_cache.clear()

        db = SupabaseClient(url="https://test.supabase.co", key="test")

        # Test page 1
        result = db.get_history("user1", page=1, page_size=10)

        # Verify response structure
        assert result["page"] == 1
        assert result["page_size"] == 10
        assert result["total"] == 42
        assert len(result["data"]) == 10

        # Verify supabase calls
        # 1. Count query
        # 2. Data query with range(0, 9)
        assert mock_client.table.call_count >= 2
        # Verify range call
        # The chain is table().select().eq().order().range()
        # We can check the last call to range() on the chain

        # range(0, 9) for page 1, size 10
        mock_client.table().select().eq().order().range.assert_called_with(0, 9)

def test_get_history_pagination_page_2():
    """Test pagination offset calculation for page 2."""
    mock_client = MagicMock()
    mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.count = 42
    mock_client.table.return_value.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value.data = []

    with patch("src.supabase_client.create_client", return_value=mock_client):
        from src.db.cache import history_cache
        history_cache.clear()

        db = SupabaseClient(url="https://test.supabase.co", key="test")

        db.get_history("user1", page=2, page_size=10)

        # range(10, 19) for page 2, size 10
        mock_client.table().select().eq().order().range.assert_called_with(10, 19)

def test_api_pagination_params():
    """Test that API endpoint accepts pagination params."""
    # This requires integration testing with FastAPI TestClient
    # But we can verify the function signature or mocking
    from src.api.routes.assessments import get_assessment_history
    import inspect

    sig = inspect.signature(get_assessment_history)
    assert "page" in sig.parameters
    assert "page_size" in sig.parameters
    assert sig.parameters["page"].default == 1
    assert sig.parameters["page_size"].default == 10
