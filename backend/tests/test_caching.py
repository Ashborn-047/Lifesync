"""
Tests for Caching Strategy (PR #58)
"""

import time
import pytest
from unittest.mock import MagicMock, patch
from cachetools import TTLCache
from src.db.cache import cached, invalidate_assessment_cache, invalidate_history_cache, assessment_cache, history_cache

# Reset caches for testing
def setup_module(module):
    assessment_cache.clear()
    history_cache.clear()

def test_cached_decorator():
    """Test that @cached decorator works."""
    cache = TTLCache(maxsize=10, ttl=60)
    mock_func = MagicMock(return_value="result")

    @cached(cache)
    def cached_func(arg):
        return mock_func(arg)

    # First call - should call mock_func
    result1 = cached_func("test")
    assert result1 == "result"
    assert mock_func.call_count == 1

    # Second call - should use cache
    result2 = cached_func("test")
    assert result2 == "result"
    assert mock_func.call_count == 1 # Count should NOT increment

    # Different arg - should call mock_func
    result3 = cached_func("other")
    assert result3 == "result"
    assert mock_func.call_count == 2

def test_cache_key_generation():
    """Test default cache key generation handles methods correctly."""
    cache = TTLCache(maxsize=10, ttl=60)

    class TestClass:
        @cached(cache)
        def method(self, arg):
            return arg

    obj = TestClass()

    # Call method
    obj.method("test")

    # Check key format in cache
    # It should contain method name, args, but NOT self instance address (ideally)
    # The default key builder we wrote: f"{func.__name__}:{str(key_args)}:{str(kwargs)}"
    # key_args skips self if present.

    keys = list(cache.keys())
    assert len(keys) == 1
    assert "method" in keys[0]
    assert "test" in keys[0]

def test_cache_invalidation():
    """Test cache invalidation helpers."""
    # Set up cache entries
    assessment_cache["get_assessment:('123',):{}"] = "data1"
    assessment_cache["get_assessment:('456',):{}"] = "data2"

    # Invalidate 123
    invalidate_assessment_cache("123")

    assert "get_assessment:('123',):{}" not in assessment_cache
    assert "get_assessment:('456',):{}" in assessment_cache

def test_history_cache_invalidation():
    """Test history cache invalidation."""
    history_cache["get_history:('user1',):{}"] = "history1"
    history_cache["get_history:('user2',):{}"] = "history2"

    invalidate_history_cache("user1")

    assert "get_history:('user1',):{}" not in history_cache
    assert "get_history:('user2',):{}" in history_cache

def test_supabase_client_caching_integration():
    """Test that SupabaseClient uses caching."""
    from src.supabase_client import SupabaseClient, create_client

    # Mock supabase client
    mock_sb_client = MagicMock()
    mock_sb_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": "123"}]

    with patch("src.supabase_client.create_client", return_value=mock_sb_client):
        # We need to patch the CACHE objects used by the decorators on SupabaseClient
        # However, decorators are applied at import time.
        # But we can clear the imported cache objects.
        assessment_cache.clear()

        db = SupabaseClient(url="https://test.supabase.co", key="test")

        # 1. First call
        db.get_assessment("123")
        assert mock_sb_client.table.call_count == 1

        # 2. Second call - should hit cache
        db.get_assessment("123")
        assert mock_sb_client.table.call_count == 1

        # 3. Third call with different ID
        db.get_assessment("456")
        assert mock_sb_client.table.call_count == 2
