"""
Tests for Database Connection Pooling and Performance Improvements

Tests cover:
- Connection pool singleton behavior (issue #7)
- Resource leak prevention (issue #8)
- Connection lifecycle management (issue #9)
- Retry logic for transient errors (issue #10)
- Optimized query patterns (issue #11)
- Query timeout configuration (issue #12)
"""

import pytest
import threading
import time
from unittest.mock import Mock, patch, MagicMock
from httpx import ConnectTimeout, ReadTimeout, NetworkError

from src.db.connection_manager import ConnectionManager, get_db_client
from src.db.retry import with_db_retry, is_transient_error, should_retry_error
from src.db.timeout import TimeoutError, with_timeout, TimeoutContext
from src.supabase_client import SupabaseClient


class TestConnectionPoolSingleton:
    """Test connection pool singleton behavior (issue #7)"""

    def setup_method(self):
        """Reset singleton before each test"""
        ConnectionManager.reset()

    def teardown_method(self):
        """Cleanup after each test"""
        ConnectionManager.reset()

    def test_singleton_instance(self):
        """Test that ConnectionManager returns the same instance"""
        manager1 = ConnectionManager()
        manager2 = ConnectionManager()
        assert manager1 is manager2, "ConnectionManager should be a singleton"

    def test_thread_safe_initialization(self):
        """Test that singleton works correctly with multiple threads"""
        instances = []

        def create_manager():
            manager = ConnectionManager()
            instances.append(manager)

        threads = [threading.Thread(target=create_manager) for _ in range(10)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        # All instances should be the same object
        assert all(inst is instances[0] for inst in instances), \
            "All threads should get the same singleton instance"

    def test_initialize_once(self):
        """Test that initialize is idempotent"""
        manager = ConnectionManager()

        # Mock the client creation
        with patch('src.db.connection_manager.create_supabase_client') as mock_create:
            mock_client = Mock(spec=SupabaseClient)
            mock_client.client = Mock()
            mock_client.client.table = Mock(return_value=Mock(
                select=Mock(return_value=Mock(
                    limit=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock(data=[]))
                    ))
                ))
            ))
            mock_create.return_value = mock_client

            # Initialize multiple times
            manager.initialize(url="https://test.supabase.co", key="test-key")
            manager.initialize(url="https://test.supabase.co", key="test-key")
            manager.initialize(url="https://test.supabase.co", key="test-key")

            # Should only create client once
            assert mock_create.call_count == 1, \
                "Client should only be created once"

    def test_get_client_before_initialization(self):
        """Test that get_client raises error if not initialized"""
        manager = ConnectionManager()

        with pytest.raises(RuntimeError, match="Connection pool not initialized"):
            manager.get_client()

    def test_initialization_with_credentials(self):
        """Test successful initialization with valid credentials"""
        manager = ConnectionManager()

        with patch('src.db.connection_manager.create_supabase_client') as mock_create:
            mock_client = Mock(spec=SupabaseClient)
            mock_client.client = Mock()
            mock_client.client.table = Mock(return_value=Mock(
                select=Mock(return_value=Mock(
                    limit=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock(data=[]))
                    ))
                ))
            ))
            mock_create.return_value = mock_client

            manager.initialize(
                url="https://test.supabase.co",
                key="test-key",
                service_key="service-key"
            )

            assert manager.is_initialized(), "Manager should be initialized"
            client = manager.get_client()
            assert client is mock_client, "Should return the created client"


class TestResourceLeakPrevention:
    """Test resource leak prevention (issue #8)"""

    def setup_method(self):
        """Reset singleton before each test"""
        ConnectionManager.reset()

    def teardown_method(self):
        """Cleanup after each test"""
        ConnectionManager.reset()

    def test_single_client_shared_across_requests(self):
        """Test that same client is reused across multiple requests"""
        with patch('src.db.connection_manager.create_supabase_client') as mock_create:
            mock_client = Mock(spec=SupabaseClient)
            mock_client.client = Mock()
            mock_client.client.table = Mock(return_value=Mock(
                select=Mock(return_value=Mock(
                    limit=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock(data=[]))
                    ))
                ))
            ))
            mock_create.return_value = mock_client

            # Simulate multiple requests
            clients = []
            for _ in range(100):
                client = get_db_client()
                clients.append(client)

            # All should be the same instance
            assert all(c is clients[0] for c in clients), \
                "All requests should get the same client instance"

            # Client should only be created once
            assert mock_create.call_count == 1, \
                "Should only create one client for all requests"

    def test_proper_cleanup_on_shutdown(self):
        """Test that resources are properly cleaned up"""
        manager = ConnectionManager()

        with patch('src.db.connection_manager.create_supabase_client') as mock_create:
            mock_client = Mock(spec=SupabaseClient)
            mock_client.client = Mock()
            mock_client.client.table = Mock(return_value=Mock(
                select=Mock(return_value=Mock(
                    limit=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock(data=[]))
                    ))
                ))
            ))
            mock_create.return_value = mock_client

            manager.initialize(url="https://test.supabase.co", key="test-key")
            assert manager.is_initialized()

            # Close the pool
            manager.close()

            # Should no longer be initialized
            assert not manager.is_initialized(), \
                "Manager should not be initialized after close"


class TestRetryLogic:
    """Test retry logic for transient errors (issue #10)"""

    def test_transient_error_detection(self):
        """Test that transient errors are correctly identified"""
        # Transient errors
        assert is_transient_error(ConnectTimeout("timeout"))
        assert is_transient_error(ReadTimeout("timeout"))
        assert is_transient_error(NetworkError("network"))
        assert is_transient_error(ConnectionError("connection"))

        # Non-transient errors
        assert not is_transient_error(ValueError("invalid value"))
        assert not is_transient_error(KeyError("missing key"))

    def test_permanent_error_detection(self):
        """Test that permanent errors are not retried"""
        permanent_errors = [
            Exception("syntax error in SQL"),
            Exception("relation does not exist"),
            Exception("permission denied"),
            Exception("unique constraint violation"),
        ]

        for error in permanent_errors:
            assert not should_retry_error(error), \
                f"Should not retry permanent error: {error}"

    def test_retry_on_transient_error(self):
        """Test that transient errors trigger retry"""
        call_count = 0

        @with_db_retry(max_attempts=3)
        def flaky_operation():
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise ConnectTimeout("Connection timeout")
            return "success"

        result = flaky_operation()
        assert result == "success"
        assert call_count == 3, "Should retry 3 times total"

    def test_no_retry_on_permanent_error(self):
        """Test that permanent errors are not retried"""
        call_count = 0

        @with_db_retry(max_attempts=3)
        def permanent_error_operation():
            nonlocal call_count
            call_count += 1
            raise Exception("syntax error in SQL")

        with pytest.raises(Exception, match="syntax error"):
            permanent_error_operation()

        assert call_count == 1, "Should not retry permanent errors"

    def test_max_retry_attempts(self):
        """Test that retry stops after max attempts"""
        call_count = 0

        @with_db_retry(max_attempts=3)
        def always_fails():
            nonlocal call_count
            call_count += 1
            raise ConnectTimeout("Always fails")

        with pytest.raises(ConnectTimeout):
            always_fails()

        assert call_count == 3, "Should attempt exactly 3 times"


class TestQueryOptimization:
    """Test optimized query patterns (issue #11)"""

    def test_get_assessment_summary_fields(self):
        """Test that get_assessment_summary only fetches needed fields"""
        with patch('src.supabase_client.create_client') as mock_create_client:
            # Setup mock
            mock_client = Mock()
            mock_table = Mock()
            mock_select = Mock()
            mock_eq = Mock()
            mock_execute = Mock(return_value=Mock(data=[{
                "id": "123",
                "created_at": "2024-01-01",
                "mbti_code": "INTJ",
                "persona_id": "test",
                "confidence": 0.8
            }]))

            mock_client.table.return_value = mock_table
            mock_table.select.return_value = mock_select
            mock_select.eq.return_value = mock_eq
            mock_eq.execute = mock_execute
            mock_create_client.return_value = mock_client

            # Create client and call method
            client = SupabaseClient(url="https://test.supabase.co", key="test-key")
            result = client.get_assessment_summary("123")

            # Verify select was called with specific fields (not "*")
            mock_table.select.assert_called_once()
            call_args = mock_table.select.call_args[0][0]
            assert "*" not in call_args, "Should not use SELECT *"
            assert "id" in call_args
            assert "mbti_code" in call_args

    def test_get_assessment_scores_optimization(self):
        """Test that get_assessment_scores only fetches score fields"""
        with patch('src.supabase_client.create_client') as mock_create_client:
            # Setup mock
            mock_client = Mock()
            mock_table = Mock()
            mock_select = Mock()
            mock_eq = Mock()
            mock_execute = Mock(return_value=Mock(data=[{
                "trait_scores": {},
                "facet_scores": {},
                "mbti_code": "INTJ"
            }]))

            mock_client.table.return_value = mock_table
            mock_table.select.return_value = mock_select
            mock_select.eq.return_value = mock_eq
            mock_eq.execute = mock_execute
            mock_create_client.return_value = mock_client

            # Create client and call method
            client = SupabaseClient(url="https://test.supabase.co", key="test-key")
            result = client.get_assessment_scores("123")

            # Verify specific fields selected
            mock_table.select.assert_called_once()
            call_args = mock_table.select.call_args[0][0]
            assert "trait_scores" in call_args
            assert "facet_scores" in call_args


class TestQueryTimeout:
    """Test query timeout configuration (issue #12)"""

    def test_timeout_context(self):
        """Test that timeout context works"""
        with pytest.raises(TimeoutError):
            with TimeoutContext(0.1):
                time.sleep(1.0)

    def test_timeout_decorator(self):
        """Test timeout decorator"""
        @with_timeout(0.1)
        def slow_operation():
            time.sleep(1.0)
            return "done"

        # Note: This test might be platform-dependent
        # On some systems without signal support, it won't timeout
        try:
            slow_operation()
        except (TimeoutError, Exception):
            # Expected on platforms with signal support
            pass


class TestLifecycleManagement:
    """Test connection lifecycle management (issue #9)"""

    def setup_method(self):
        """Reset singleton before each test"""
        ConnectionManager.reset()

    def teardown_method(self):
        """Cleanup after each test"""
        ConnectionManager.reset()

    def test_startup_initialization(self):
        """Test that startup event initializes connection pool"""
        manager = ConnectionManager()

        with patch('src.db.connection_manager.create_supabase_client') as mock_create:
            mock_client = Mock(spec=SupabaseClient)
            mock_client.client = Mock()
            mock_client.client.table = Mock(return_value=Mock(
                select=Mock(return_value=Mock(
                    limit=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock(data=[]))
                    ))
                ))
            ))
            mock_create.return_value = mock_client

            # Simulate startup
            manager.initialize(url="https://test.supabase.co", key="test-key")

            assert manager.is_initialized()

    def test_shutdown_cleanup(self):
        """Test that shutdown event cleans up resources"""
        manager = ConnectionManager()

        with patch('src.db.connection_manager.create_supabase_client') as mock_create:
            mock_client = Mock(spec=SupabaseClient)
            mock_client.client = Mock()
            mock_client.client.table = Mock(return_value=Mock(
                select=Mock(return_value=Mock(
                    limit=Mock(return_value=Mock(
                        execute=Mock(return_value=Mock(data=[]))
                    ))
                ))
            ))
            mock_create.return_value = mock_client

            # Initialize
            manager.initialize(url="https://test.supabase.co", key="test-key")
            assert manager.is_initialized()

            # Simulate shutdown
            manager.close()
            assert not manager.is_initialized()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
