"""
Database Connection Pool Manager
Implements singleton pattern for Supabase client to avoid per-request connection creation
Fixes issue #7: No database connection pooling
"""

import os
import logging
import threading
from typing import Optional
from ..supabase_client import SupabaseClient, create_supabase_client

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Singleton connection manager for database operations.

    This class ensures only one Supabase client instance is created and reused
    across all requests, preventing connection leaks and improving performance.

    Thread-safe implementation using double-checked locking pattern.
    """

    _instance: Optional['ConnectionManager'] = None
    _lock: threading.Lock = threading.Lock()
    _client: Optional[SupabaseClient] = None
    _initialized: bool = False

    def __new__(cls):
        """Ensure only one instance exists (singleton pattern)."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ConnectionManager, cls).__new__(cls)
        return cls._instance

    def initialize(
        self,
        url: Optional[str] = None,
        key: Optional[str] = None,
        service_key: Optional[str] = None
    ) -> None:
        """
        Initialize the database connection pool.

        This should be called once during application startup.
        Subsequent calls will be ignored if already initialized.

        Args:
            url: Supabase project URL
            key: Supabase anon key
            service_key: Supabase service role key (optional)

        Raises:
            ValueError: If credentials are missing or invalid
        """
        if self._initialized:
            logger.debug("Connection pool already initialized, skipping")
            return

        with self._lock:
            if self._initialized:
                return

            try:
                logger.info("Initializing database connection pool")

                # Create single shared client instance
                self._client = create_supabase_client(
                    url=url,
                    key=key,
                    service_key=service_key
                )

                # Verify connection by making a simple query
                # This helps catch configuration issues at startup
                try:
                    # Test query to verify connectivity
                    self._client.client.table("personality_assessments").select("id").limit(1).execute()
                    logger.info("Database connection pool initialized successfully")
                except Exception as e:
                    logger.warning(f"Database connectivity test failed: {e}")
                    # Don't fail initialization - connection might work for actual operations

                self._initialized = True

            except Exception as e:
                logger.error(f"Failed to initialize connection pool: {e}")
                raise

    def get_client(self) -> SupabaseClient:
        """
        Get the shared database client instance.

        Returns:
            SupabaseClient: Shared database client

        Raises:
            RuntimeError: If connection pool not initialized
        """
        if not self._initialized or self._client is None:
            raise RuntimeError(
                "Connection pool not initialized. "
                "Call ConnectionManager.initialize() during application startup."
            )
        return self._client

    def close(self) -> None:
        """
        Close the connection pool and cleanup resources.

        This should be called during application shutdown.
        """
        with self._lock:
            if self._client is not None:
                logger.info("Closing database connection pool")
                # Supabase client doesn't have explicit close method
                # but we clear the reference for garbage collection
                self._client = None
                self._initialized = False
                logger.info("Database connection pool closed")

    def is_initialized(self) -> bool:
        """Check if connection pool is initialized."""
        return self._initialized

    @classmethod
    def reset(cls) -> None:
        """
        Reset the singleton instance.

        This is primarily useful for testing to ensure clean state.
        Should NOT be used in production code.
        """
        with cls._lock:
            if cls._instance is not None:
                if cls._instance._client is not None:
                    cls._instance._client = None
                cls._instance._initialized = False
                cls._instance = None


# Global convenience function
def get_db_client() -> SupabaseClient:
    """
    Get the shared database client instance.

    This is a convenience function that wraps ConnectionManager.get_client()

    Returns:
        SupabaseClient: Shared database client

    Raises:
        RuntimeError: If connection pool not initialized
    """
    manager = ConnectionManager()
    return manager.get_client()
