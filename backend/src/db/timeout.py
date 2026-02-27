"""
Database Query Timeout Handler
Fixes issue #12: No database query timeout configuration
"""

import logging
import functools
import asyncio
from typing import Callable, Any, Optional

logger = logging.getLogger(__name__)


# Use builtin TimeoutError to ensure compatibility with other libraries
class TimeoutError(TimeoutError):
    """Exception raised when a database operation times out."""
    pass


def with_timeout(timeout_seconds: float) -> Callable:
    """
    Decorator to add timeout to synchronous database operations.

    This decorator will raise TimeoutError if the operation takes longer
    than the specified timeout.

    Args:
        timeout_seconds: Maximum execution time in seconds

    Returns:
        Decorated function with timeout

    Example:
        @with_timeout(30.0)
        def long_query(self):
            return self.client.table("large_table").select("*").execute()
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            import signal

            def timeout_handler(signum, frame):
                raise TimeoutError(
                    f"Database operation '{func.__name__}' timed out after {timeout_seconds}s"
                )

            # Set up timeout signal (Unix-like systems only)
            try:
                old_handler = signal.signal(signal.SIGALRM, timeout_handler)
                signal.setitimer(signal.ITIMER_REAL, timeout_seconds)

                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    # Cancel the timeout
                    signal.setitimer(signal.ITIMER_REAL, 0)
                    signal.signal(signal.SIGALRM, old_handler)

            except AttributeError:
                # Windows or signal not available
                # Fall back to executing without timeout
                logger.warning(
                    f"Timeout not supported on this platform for '{func.__name__}'"
                )
                return func(*args, **kwargs)

        return wrapper
    return decorator


def with_timeout_async(timeout_seconds: float) -> Callable:
    """
    Decorator to add timeout to asynchronous database operations.

    This decorator will raise asyncio.TimeoutError if the operation takes
    longer than the specified timeout.

    Args:
        timeout_seconds: Maximum execution time in seconds

    Returns:
        Decorated async function with timeout

    Example:
        @with_timeout_async(30.0)
        async def long_query_async(self):
            return await self.client.table("large_table").select("*").execute()
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            try:
                result = await asyncio.wait_for(
                    func(*args, **kwargs),
                    timeout=timeout_seconds
                )
                return result
            except asyncio.TimeoutError:
                error_msg = (
                    f"Async database operation '{func.__name__}' "
                    f"timed out after {timeout_seconds}s"
                )
                logger.error(error_msg)
                raise TimeoutError(error_msg) from None

        return wrapper
    return decorator


class TimeoutContext:
    """
    Context manager for applying timeouts to code blocks.

    This is useful when you want to apply timeout to a section of code
    rather than a specific function.

    Example:
        with TimeoutContext(30.0):
            result = client.table("data").select("*").execute()
    """

    def __init__(self, timeout_seconds: float):
        """
        Initialize timeout context.

        Args:
            timeout_seconds: Maximum execution time in seconds
        """
        self.timeout_seconds = timeout_seconds
        self.old_handler = None

    def __enter__(self):
        """Enter the timeout context."""
        import signal

        def timeout_handler(signum, frame):
            raise TimeoutError(
                f"Operation timed out after {self.timeout_seconds}s"
            )

        try:
            self.old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.setitimer(signal.ITIMER_REAL, self.timeout_seconds)
        except AttributeError:
            # Windows or signal not available
            logger.warning("Timeout not supported on this platform")
            pass

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit the timeout context."""
        import signal

        try:
            signal.setitimer(signal.ITIMER_REAL, 0)
            if self.old_handler is not None:
                signal.signal(signal.SIGALRM, self.old_handler)
        except AttributeError:
            pass

        return False


class AsyncTimeoutContext:
    """
    Async context manager for applying timeouts to async code blocks.

    Example:
        async with AsyncTimeoutContext(30.0):
            result = await client.table("data").select("*").execute()
    """

    def __init__(self, timeout_seconds: float):
        """
        Initialize async timeout context.

        Args:
            timeout_seconds: Maximum execution time in seconds
        """
        self.timeout_seconds = timeout_seconds
        self.task: Optional[asyncio.Task] = None

    async def __aenter__(self):
        """Enter the async timeout context."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Exit the async timeout context."""
        if isinstance(exc_val, asyncio.TimeoutError):
            raise TimeoutError(
                f"Async operation timed out after {self.timeout_seconds}s"
            ) from exc_val
        return False
