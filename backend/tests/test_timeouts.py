"""
Tests for Request and Database Timeouts (PR #57)
"""

import pytest
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from src.api.server import app
from src.db.timeout import TimeoutError
from src.supabase_client import SupabaseClient
from src.api.config import config

client = TestClient(app)

# Test 1: Verify Request Timeout Middleware (408)
@pytest.mark.asyncio
async def test_request_timeout_middleware():
    """
    Test that the middleware correctly intercepts long-running requests
    and returns a 408 Request Timeout response.
    """
    # Create a mock route that simulates a slow operation
    @app.get("/test/slow-endpoint")
    async def slow_endpoint():
        await asyncio.sleep(2.0)
        return {"message": "Success"}

    # Temporarily override config to a short timeout
    original_timeout = config.REQUEST_TIMEOUT
    config.REQUEST_TIMEOUT = 0.5  # 500ms timeout

    try:
        # Use TestClient to make a request
        # Note: TestClient runs sync, but the app is async.
        # Standard TestClient might not trigger the middleware's asyncio.wait_for correctly
        # without running in a separate thread/process or using AsyncClient.
        # However, for unit testing middleware logic, we can verify the middleware function directly
        # or rely on starlette's TestClient support for async apps.

        # Let's try mocking the sleep to be longer than the timeout
        with patch("src.api.config.config.REQUEST_TIMEOUT", 0.1):
             response = client.get("/test/slow-endpoint")

             # Assert 408 Timeout
             assert response.status_code == 408
             assert response.json() == {
                 "error": "Request Timeout",
                 "detail": f"Request took longer than 0.1 seconds to process"
             }

    finally:
        # Restore config
        config.REQUEST_TIMEOUT = original_timeout

# Test 2: Verify Database Timeout Context
def test_db_timeout_context():
    """
    Test that the TimeoutContext correctly raises TimeoutError
    for slow synchronous operations.
    """
    from src.db.timeout import TimeoutContext
    import time

    # Define a slow function
    def slow_function():
        time.sleep(0.5)
        return "Finished"

    # Test with sufficient timeout
    with TimeoutContext(1.0):
        result = slow_function()
        assert result == "Finished"

    # Test with insufficient timeout
    # Note: signal-based timeout only works in main thread and on Unix
    # We should skip if not supported (e.g. Windows)
    import signal
    if not hasattr(signal, "SIGALRM"):
        pytest.skip("Signal-based timeout not supported on this platform")

    with pytest.raises(TimeoutError) as excinfo:
        with TimeoutContext(0.1):
            slow_function()

    assert "timed out" in str(excinfo.value)

# Test 3: Verify SupabaseClient applies timeouts
def test_supabase_client_applies_timeout():
    """
    Verify that SupabaseClient methods are wrapped with TimeoutContext.
    We mock TimeoutContext to verify it's called with correct config.
    """
    with patch("src.supabase_client.TimeoutContext") as MockTimeoutContext:
        # Setup mock client
        mock_client = MagicMock()
        mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{}]

        # Initialize SupabaseClient with mocked internal client
        with patch("src.supabase_client.create_client", return_value=mock_client):
            db = SupabaseClient(url="https://test.supabase.co", key="test")

            # Call a method (e.g., get_assessment)
            db.get_assessment("550e8400-e29b-41d4-a716-446655440000")

            # Verify TimeoutContext was initialized with DATABASE_QUERY_TIMEOUT
            MockTimeoutContext.assert_called_with(config.DATABASE_QUERY_TIMEOUT)

            # Verify context manager was entered
            MockTimeoutContext.return_value.__enter__.assert_called()
            MockTimeoutContext.return_value.__exit__.assert_called()

# Test 4: Verify Auth operations use AUTH_TIMEOUT
def test_supabase_auth_timeout():
    """
    Verify that Auth methods use DATABASE_AUTH_TIMEOUT.
    """
    with patch("src.supabase_client.TimeoutContext") as MockTimeoutContext:
        # Setup mock client
        mock_client = MagicMock()
        mock_client.auth.sign_in_with_password.return_value.session = "session"
        mock_client.auth.sign_in_with_password.return_value.user = "user"

        with patch("src.supabase_client.create_client", return_value=mock_client):
            db = SupabaseClient(url="https://test.supabase.co", key="test")

            # Call sign_in
            db.sign_in("test@example.com", "password")

            # Verify TimeoutContext uses AUTH_TIMEOUT
            MockTimeoutContext.assert_called_with(config.DATABASE_AUTH_TIMEOUT)
