import os
import logging
from ..supabase_client import create_supabase_client, SupabaseClient
from .config import config

logger = logging.getLogger(__name__)

def get_supabase_client() -> SupabaseClient:
    """Dependency to get Supabase client"""
    try:
        url = config.get_supabase_url()
        key = config.get_supabase_key()
        service_key = os.getenv("SUPABASE_SERVICE_ROLE")
        
        if not url or not key or "your-project" in url or "your-anon-key" in key:
            raise ValueError(
                "Supabase credentials not configured. Please set valid SUPABASE_URL and SUPABASE_KEY in .env file. "
                "Current values appear to be placeholders."
            )
        return create_supabase_client(url=url, key=key, service_key=service_key)
    except Exception as e:
        logger.error(f"ERROR creating Supabase client: {e}")
        raise
