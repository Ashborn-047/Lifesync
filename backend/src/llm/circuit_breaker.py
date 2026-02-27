"""
Circuit Breaker Implementation for LLM Calls
Prevents cascading failures when LLM providers are down or slow.
"""

import inspect
import logging
import time
from enum import Enum
from functools import wraps
from typing import Callable, Optional

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    CLOSED = "CLOSED"      # Normal operation, calls allowed
    OPEN = "OPEN"          # Failing, calls blocked
    HALF_OPEN = "HALF_OPEN"# Testing if service recovered

class CircuitBreakerOpenException(Exception):
    """Exception raised when circuit is OPEN"""
    pass

class CircuitBreaker:
    """
    Circuit Breaker pattern implementation.

    Tracks failures and opens circuit when threshold is reached.
    After a timeout, allows a single request (half-open) to check for recovery.
    """

    def __init__(
        self,
        failure_threshold: int = 3,
        recovery_timeout: float = 60.0,
        name: str = "default"
    ):
        """
        Initialize circuit breaker.

        Args:
            failure_threshold: Number of consecutive failures to open circuit
            recovery_timeout: Seconds to wait before attempting recovery (half-open)
            name: Name of the circuit breaker for logging
        """
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.name = name

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0.0

        # Lock for thread safety (though in async context simpler logic might suffice)
        # We'll use simple state management suitable for async

    def allow_request(self) -> bool:
        """Check if request should be allowed based on current state."""
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has passed
            if time.time() - self.last_failure_time > self.recovery_timeout:
                logger.info(f"Circuit '{self.name}' entering HALF_OPEN state")
                self.state = CircuitState.HALF_OPEN
                return True
            return False

        if self.state == CircuitState.HALF_OPEN:
            # In half-open, we allow one request at a time (simplified)
            # A more complex implementation might use a lock or semaphore
            return True

        return False

    def record_success(self):
        """Record a successful execution."""
        if self.state == CircuitState.HALF_OPEN:
            logger.info(f"Circuit '{self.name}' recovered, state CLOSED")
            self.state = CircuitState.CLOSED
            self.failure_count = 0
        elif self.state == CircuitState.CLOSED:
            # Reset failure count on success in closed state?
            # Usually yes, or keep it rolling. Simple reset is fine.
            self.failure_count = 0

    def record_failure(self):
        """Record a failed execution."""
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.state == CircuitState.HALF_OPEN:
            logger.warning(f"Circuit '{self.name}' check failed, reverting to OPEN")
            self.state = CircuitState.OPEN

        elif self.state == CircuitState.CLOSED:
            if self.failure_count >= self.failure_threshold:
                logger.warning(
                    f"Circuit '{self.name}' failure threshold reached ({self.failure_count}), opening circuit"
                )
                self.state = CircuitState.OPEN

def with_circuit_breaker(
    circuit_breaker: CircuitBreaker,
    fallback_function: Optional[Callable] = None
):
    """
    Decorator to apply circuit breaker to a function.

    Args:
        circuit_breaker: CircuitBreaker instance
        fallback_function: Optional function to call when circuit is open or call fails
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            async def call_fallback():
                res = fallback_function(*args, **kwargs)
                if inspect.isawaitable(res):
                    return await res
                return res

            if not circuit_breaker.allow_request():
                logger.warning(f"Circuit '{circuit_breaker.name}' is OPEN, rejecting request")
                if fallback_function:
                    return await call_fallback()
                raise CircuitBreakerOpenException(f"Circuit '{circuit_breaker.name}' is OPEN")

            try:
                result = await func(*args, **kwargs)
                circuit_breaker.record_success()
                return result
            except Exception as e:
                # We record failure for all exceptions wrapped here
                # In robust implementation, we might filter exception types
                circuit_breaker.record_failure()
                logger.error(f"Call failed in circuit '{circuit_breaker.name}': {e}")

                # If circuit just opened due to this failure, we might return fallback immediately
                if circuit_breaker.state == CircuitState.OPEN and fallback_function:
                    return await call_fallback()
                raise e

        return wrapper
    return decorator
