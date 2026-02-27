"""
Database Retry Logic with Exponential Backoff
Fixes issue #10: No retry logic for transient database errors
"""

import functools
import logging
from typing import Any, Callable

from httpx import (
    ConnectError,
    ConnectTimeout,
    NetworkError,
    ReadTimeout,
    RemoteProtocolError,
)
from tenacity import (
    after_log,
    before_sleep_log,
    retry,
    retry_if_exception,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)


# Define transient errors that should be retried
TRANSIENT_ERRORS = (
    ConnectTimeout,
    ReadTimeout,
    NetworkError,
    RemoteProtocolError,
    ConnectError,
    ConnectionError,
    TimeoutError,
)


def is_transient_error(exception: Exception) -> bool:
    """
    Check if an exception is a transient error that should be retried.

    Args:
        exception: The exception to check

    Returns:
        True if the error is transient, False otherwise
    """
    # Check if it's a known transient error type
    if isinstance(exception, TRANSIENT_ERRORS):
        return True

    # Check error message for common transient patterns
    error_msg = str(exception).lower()
    transient_patterns = [
        "connection",
        "timeout",
        "network",
        "temporarily unavailable",
        "service unavailable",
        "too many requests",
        "rate limit",
        "deadlock",
    ]

    return any(pattern in error_msg for pattern in transient_patterns)


def should_retry_error(exception: Exception) -> bool:
    """
    Determine if an exception should trigger a retry.

    Permanent errors (SQL errors, missing tables, etc.) should NOT be retried.

    Args:
        exception: The exception to evaluate

    Returns:
        True if should retry, False otherwise
    """
    # Don't retry permanent errors
    error_msg = str(exception).lower()
    permanent_patterns = [
        "syntax error",
        "invalid sql",
        "relation does not exist",
        "column does not exist",
        "permission denied",
        "authentication failed",
        "invalid credentials",
        "unique constraint",
        "foreign key constraint",
        "not null constraint",
        "check constraint",
    ]

    if any(pattern in error_msg for pattern in permanent_patterns):
        logger.debug(f"Permanent error detected, not retrying: {exception}")
        return False

    # Check if it's a transient error
    if is_transient_error(exception):
        logger.debug(f"Transient error detected, will retry: {exception}")
        return True

    # For unknown errors, don't retry (fail fast)
    logger.debug(f"Unknown error type, not retrying: {exception}")
    return False


def with_db_retry(
    max_attempts: int = 3,
    min_wait: float = 1.0,
    max_wait: float = 10.0,
    multiplier: float = 2.0
) -> Callable:
    """
    Decorator to add retry logic with exponential backoff to database operations.

    This decorator will retry transient database errors (connection timeouts,
    network issues) but will NOT retry permanent errors (SQL syntax errors,
    missing tables, constraint violations).

    Args:
        max_attempts: Maximum number of retry attempts (default: 3)
        min_wait: Minimum wait time in seconds between retries (default: 1.0)
        max_wait: Maximum wait time in seconds between retries (default: 10.0)
        multiplier: Multiplier for exponential backoff (default: 2.0)

    Returns:
        Decorated function with retry logic

    Example:
        @with_db_retry(max_attempts=3)
        def save_data(self, data):
            return self.client.table("data").insert(data).execute()
    """
    def decorator(func: Callable) -> Callable:
        @retry(
            stop=stop_after_attempt(max_attempts),
            wait=wait_exponential(
                multiplier=multiplier,
                min=min_wait,
                max=max_wait
            ),
            retry=retry_if_exception_type(Exception) & retry_if_exception(should_retry_error),
            before_sleep=before_sleep_log(logger, logging.WARNING),
            after=after_log(logger, logging.DEBUG),
            reraise=True
        )
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # Log the error with context
                logger.error(
                    f"Database operation '{func.__name__}' failed: {e}",
                    exc_info=True
                )
                raise

        return wrapper
    return decorator


def with_db_retry_async(
    max_attempts: int = 3,
    min_wait: float = 1.0,
    max_wait: float = 10.0,
    multiplier: float = 2.0
) -> Callable:
    """
    Async version of with_db_retry decorator.

    Use this for async database operations.

    Args:
        max_attempts: Maximum number of retry attempts (default: 3)
        min_wait: Minimum wait time in seconds between retries (default: 1.0)
        max_wait: Maximum wait time in seconds between retries (default: 10.0)
        multiplier: Multiplier for exponential backoff (default: 2.0)

    Returns:
        Decorated async function with retry logic

    Example:
        @with_db_retry_async(max_attempts=3)
        async def save_data_async(self, data):
            return await self.client.table("data").insert(data).execute()
    """
    def decorator(func: Callable) -> Callable:
        @retry(
            stop=stop_after_attempt(max_attempts),
            wait=wait_exponential(
                multiplier=multiplier,
                min=min_wait,
                max=max_wait
            ),
            retry=retry_if_exception_type(Exception) & retry_if_exception(should_retry_error),
            before_sleep=before_sleep_log(logger, logging.WARNING),
            after=after_log(logger, logging.DEBUG),
            reraise=True
        )
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                # Log the error with context
                logger.error(
                    f"Async database operation '{func.__name__}' failed: {e}",
                    exc_info=True
                )
                raise

        return wrapper
    return decorator
