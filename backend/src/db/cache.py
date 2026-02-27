"""
Cache Implementation for LifeSync
Provides LRU/TTL caching strategies to optimize database access.
"""

import time
import functools
import logging
from typing import Any, Optional, Dict, Tuple, Callable
from cachetools import TTLCache, LRUCache

logger = logging.getLogger(__name__)

# Global caches
# Persona cache: Stores persona definitions (rarely change)
# Size: 100 items, TTL: 1 hour
persona_cache = TTLCache(maxsize=100, ttl=3600)

# Assessment cache: Stores assessment results
# Size: 500 items, TTL: 5 minutes (as per requirements)
assessment_cache = TTLCache(maxsize=500, ttl=300)

# History cache: Stores user history summaries
# Size: 200 users, TTL: 1 minute (frequently updated)
history_cache = TTLCache(maxsize=200, ttl=60)

def get_cache_stats() -> Dict[str, Any]:
    """Return cache statistics."""
    return {
        "persona": {
            "size": len(persona_cache),
            "maxsize": persona_cache.maxsize,
            "hits": getattr(persona_cache, "hits", 0),
            "misses": getattr(persona_cache, "misses", 0)
        },
        "assessment": {
            "size": len(assessment_cache),
            "maxsize": assessment_cache.maxsize,
            "hits": getattr(assessment_cache, "hits", 0),
            "misses": getattr(assessment_cache, "misses", 0)
        },
        "history": {
            "size": len(history_cache),
            "maxsize": history_cache.maxsize,
            "hits": getattr(history_cache, "hits", 0),
            "misses": getattr(history_cache, "misses", 0)
        }
    }

def cached(cache: TTLCache, key_builder: Callable = None):
    """
    Decorator to cache function results.

    Args:
        cache: The cache object to use
        key_builder: Optional function to build cache key from args.
                     Default uses string representation of args.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Generate key
            if key_builder:
                key = key_builder(*args, **kwargs)
            else:
                # Simple default key generation
                # We include all args (including self) to be safe.
                # Since SupabaseClient is effectively a singleton via ConnectionManager,
                # including self in the key is acceptable and prevents issues with non-method functions.
                key = f"{func.__name__}:{str(args)}:{str(kwargs)}"

            # Check cache
            try:
                if key in cache:
                    logger.debug(f"Cache hit for {key}")
                    return cache[key]
            except KeyError:
                pass

            # Call function
            result = func(*args, **kwargs)

            # Store result
            if result is not None:
                cache[key] = result
                logger.debug(f"Cache set for {key}")

            return result
        return wrapper
    return decorator

def invalidate_assessment_cache(assessment_id: str):
    """Invalidate cache for a specific assessment."""
    # We need to find keys containing the assessment_id
    # This is O(N) but cache size is small (500)
    keys_to_remove = [k for k in assessment_cache.keys() if assessment_id in str(k)]
    for k in keys_to_remove:
        try:
            del assessment_cache[k]
        except KeyError:
            pass
    logger.debug(f"Invalidated {len(keys_to_remove)} cache entries for assessment {assessment_id}")

def invalidate_history_cache(user_id: str):
    """Invalidate history cache for a user."""
    keys_to_remove = [k for k in history_cache.keys() if user_id in str(k)]
    for k in keys_to_remove:
        try:
            del history_cache[k]
        except KeyError:
            pass
    logger.debug(f"Invalidated {len(keys_to_remove)} history cache entries for user {user_id}")
