"""
Tests for Circuit Breaker Pattern (PR #60)
"""

import pytest
import asyncio
import time
from unittest.mock import MagicMock, patch
from src.llm.circuit_breaker import CircuitBreaker, CircuitState, with_circuit_breaker, CircuitBreakerOpenException

class TestCircuitBreaker:
    def test_initial_state(self):
        """Test circuit breaker initializes in CLOSED state."""
        cb = CircuitBreaker(failure_threshold=3, recovery_timeout=60.0)
        assert cb.state == CircuitState.CLOSED
        assert cb.failure_count == 0
        assert cb.allow_request() is True

    def test_failure_counting(self):
        """Test failures are counted correctly."""
        cb = CircuitBreaker(failure_threshold=3)

        cb.record_failure()
        assert cb.failure_count == 1
        assert cb.state == CircuitState.CLOSED

        cb.record_failure()
        assert cb.failure_count == 2
        assert cb.state == CircuitState.CLOSED

    def test_circuit_opens_on_threshold(self):
        """Test circuit opens when threshold is reached."""
        cb = CircuitBreaker(failure_threshold=3)

        cb.record_failure()
        cb.record_failure()
        cb.record_failure()

        assert cb.failure_count == 3
        assert cb.state == CircuitState.OPEN
        assert cb.allow_request() is False

    def test_circuit_recovery_timeout(self):
        """Test circuit enters HALF_OPEN after timeout."""
        cb = CircuitBreaker(failure_threshold=1, recovery_timeout=0.1)

        cb.record_failure()
        assert cb.state == CircuitState.OPEN

        # Wait for timeout
        time.sleep(0.2)

        # Should be allowed (transitions to HALF_OPEN)
        assert cb.allow_request() is True
        assert cb.state == CircuitState.HALF_OPEN

    def test_half_open_success_resets(self):
        """Test success in HALF_OPEN resets to CLOSED."""
        cb = CircuitBreaker(failure_threshold=1, recovery_timeout=0.0)

        cb.record_failure()
        cb.state = CircuitState.HALF_OPEN # Force state

        cb.record_success()
        assert cb.state == CircuitState.CLOSED
        assert cb.failure_count == 0

    def test_half_open_failure_reopens(self):
        """Test failure in HALF_OPEN re-opens circuit."""
        cb = CircuitBreaker(failure_threshold=1, recovery_timeout=0.0)

        cb.state = CircuitState.HALF_OPEN
        cb.record_failure()

        assert cb.state == CircuitState.OPEN

@pytest.mark.asyncio
async def test_decorator_logic():
    """Test the @with_circuit_breaker decorator."""
    cb = CircuitBreaker(failure_threshold=2)

    # Mock async function that fails
    mock_func = MagicMock(side_effect=ValueError("Service error"))

    @with_circuit_breaker(cb)
    async def risky_operation():
        mock_func()

    # 1. First failure
    with pytest.raises(ValueError):
        await risky_operation()
    assert cb.failure_count == 1

    # 2. Second failure (opens circuit)
    with pytest.raises(ValueError):
        await risky_operation()
    assert cb.state == CircuitState.OPEN

    # 3. Third call (blocked by circuit)
    with pytest.raises(CircuitBreakerOpenException):
        await risky_operation()

    # Verify mock was only called twice
    assert mock_func.call_count == 2

@pytest.mark.asyncio
async def test_decorator_fallback():
    """Test fallback function is called when circuit is open."""
    cb = CircuitBreaker(failure_threshold=1)
    cb.state = CircuitState.OPEN # Force open
    cb.last_failure_time = time.time() # Ensure timeout has NOT passed

    async def fallback():
        return "fallback"

    @with_circuit_breaker(cb, fallback_function=fallback)
    async def risky_operation():
        return "success"

    result = await risky_operation()
    assert result == "fallback"

def test_router_integration():
    """Test router integration (synchronous usage)."""
    from src.llm.router import generate_explanation, gemini_circuit

    # Reset circuit
    gemini_circuit.state = CircuitState.CLOSED
    gemini_circuit.failure_count = 0

    # Mock internal implementation to fail
    with patch("src.llm.router._generate_explanation_impl", side_effect=ValueError("API Error")):
        # 1. Call fails
        result = generate_explanation({}, {}, {}, {})
        assert "error" in result
        assert gemini_circuit.failure_count == 1

        # 2. Call fails
        generate_explanation({}, {}, {}, {})

        # 3. Call fails (Threshold 3)
        generate_explanation({}, {}, {}, {})
        assert gemini_circuit.state == CircuitState.OPEN

        # 4. Next call should use fallback immediately (no error log for API call)
        with patch("src.llm.router.logger") as mock_logger:
            result = generate_explanation({}, {}, {}, {})
            assert result["error"] == "AI service temporarily unavailable"
            assert "Resilience" in result["strengths"]
