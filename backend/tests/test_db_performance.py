import threading
import pytest
from src.db.connection_manager import ConnectionManager, get_db_client

def test_singleton_pattern():
    """Verify that ConnectionManager follows the singleton pattern."""
    ConnectionManager.reset()
    instance1 = ConnectionManager()
    instance2 = ConnectionManager()
    assert instance1 is instance2

def test_thread_safe_singleton():
    """Verify that ConnectionManager is thread-safe during instantiation."""
    ConnectionManager.reset()
    instances = []
    
    def get_instance():
        instances.append(ConnectionManager())
        
    threads = [threading.Thread(target=get_instance) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
        
    # All instances should be the same object
    for i in range(1, len(instances)):
        assert instances[i] is instances[0]

def test_client_reuse():
    """Verify that get_db_client returns the same client instance."""
    ConnectionManager.reset()
    manager = ConnectionManager()
    
    # Mocking create_supabase_client will be needed if we don't have real creds
    # but here we can just test the initialization logic
    from unittest.mock import MagicMock, patch
    
    with patch("src.db.connection_manager.create_supabase_client") as mock_create:
        mock_client = MagicMock()
        mock_create.return_value = mock_client
        
        manager.initialize(url="http://test.com", key="test-key")
        
        client1 = get_db_client()
        client2 = get_db_client()
        
        assert client1 is client2
        assert client1 is mock_client
        assert mock_create.call_count == 1

def test_initialization_state():
    """Verify that manager correctly tracks initialization state."""
    ConnectionManager.reset()
    manager = ConnectionManager()
    assert not manager.is_initialized()
    
    from unittest.mock import MagicMock, patch
    with patch("src.db.connection_manager.create_supabase_client") as mock_create:
        mock_client = MagicMock()
        mock_create.return_value = mock_client
        
        manager.initialize(url="http://test.com", key="test-key")
        assert manager.is_initialized()
        
        # Second initialize should do nothing
        manager.initialize(url="http://other.com", key="other-key")
        assert mock_create.call_count == 1

def test_runtime_error_if_not_initialized():
    """Verify that get_client raises RuntimeError if not initialized."""
    ConnectionManager.reset()
    manager = ConnectionManager()
    
    with pytest.raises(RuntimeError, match="Connection pool not initialized"):
        manager.get_client()
