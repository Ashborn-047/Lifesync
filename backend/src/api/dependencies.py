"""
API Dependencies
Provides shared resources for FastAPI routes

Updated to use connection pool manager (Fixes issue #7, #8, #9)
"""

import logging

from ..db.connection_manager import get_db_client
from ..supabase_client import SupabaseClient

logger = logging.getLogger(__name__)


def get_supabase_client() -> SupabaseClient:
    """
    Dependency to get shared Supabase client from connection pool.

    This replaces per-request client creation with a singleton pattern,
    improving performance and preventing connection leaks.

    Returns:
        SupabaseClient: Shared database client from connection pool

    Raises:
        RuntimeError: If connection pool not initialized
        ValueError: If credentials are invalid
    """
    try:
        # Get client from connection pool (singleton pattern)
        # This ensures we reuse the same client across all requests
        client = get_db_client()
        return client

    except RuntimeError as e:
        # Connection pool not initialized
        logger.error(f"Connection pool not initialized: {e}")
        raise

    except Exception as e:
        logger.error(f"ERROR getting Supabase client from pool: {e}")
        raise
