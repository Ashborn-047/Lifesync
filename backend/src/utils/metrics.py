"""
LifeSync Personality Engine - Metrics and Logging Utilities
"""

import logging
import time
from functools import wraps
from typing import Callable

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def time_function(func: Callable) -> Callable:
    """
    Decorator to time function execution.
    
    Usage:
        @time_function
        def my_function():
            ...
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        elapsed_ms = (time.time() - start_time) * 1000
        logger.info(
            f"Function {func.__name__} executed in {elapsed_ms:.2f}ms"
        )
        return result
    return wrapper


def log_api_request(endpoint: str, method: str = "POST"):
    """
    Decorator to log API requests.
    
    Usage:
        @log_api_request("/v1/assessments")
        def create_assessment():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger.info(f"{method} {endpoint} - Request received")
            try:
                result = func(*args, **kwargs)
                logger.info(f"{method} {endpoint} - Request completed successfully")
                return result
            except Exception as e:
                logger.error(f"{method} {endpoint} - Request failed: {str(e)}")
                raise
        return wrapper
    return decorator


class Timer:
    """Context manager for timing code blocks"""
    
    def __init__(self, label: str = "Operation"):
        self.label = label
        self.start_time = None
        self.elapsed_ms = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed_ms = (time.time() - self.start_time) * 1000
        logger.info(f"{self.label} completed in {self.elapsed_ms:.2f}ms")
        return False
    
    def get_elapsed_ms(self) -> float:
        """Get elapsed time in milliseconds"""
        if self.elapsed_ms is None:
            return (time.time() - self.start_time) * 1000
        return self.elapsed_ms


def log_scoring_metrics(
    responses_count: int,
    coverage: float,
    confidence_avg: float,
    execution_time_ms: float
):
    """
    Log scoring operation metrics.
    
    Args:
        responses_count: Number of responses processed
        coverage: Coverage percentage
        confidence_avg: Average confidence score
        execution_time_ms: Execution time in milliseconds
    """
    logger.info(
        f"Scoring metrics - "
        f"Responses: {responses_count}, "
        f"Coverage: {coverage:.1f}%, "
        f"Confidence: {confidence_avg:.2f}, "
        f"Time: {execution_time_ms:.2f}ms"
    )


def log_llm_metrics(
    model_name: str,
    tokens_used: int,
    generation_time_ms: float
):
    """
    Log LLM operation metrics.
    
    Args:
        model_name: Name of the LLM model
        tokens_used: Number of tokens consumed
        generation_time_ms: Generation time in milliseconds
    """
    logger.info(
        f"LLM metrics - "
        f"Model: {model_name}, "
        f"Tokens: {tokens_used}, "
        f"Time: {generation_time_ms:.2f}ms"
    )

class MetricsCollector:
    """
    Singleton class to collect application metrics.
    """
    _instance = None

    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0
        self.total_duration_ms = 0.0

    @classmethod
    def get_instance(cls):
        if not cls._instance:
            cls._instance = MetricsCollector()
        return cls._instance

    def record_request(self, duration_ms: float, is_error: bool):
        self.request_count += 1
        self.total_duration_ms += duration_ms
        if is_error:
            self.error_count += 1

    def get_metrics(self):
        uptime = time.time() - self.start_time
        avg_response_time = (self.total_duration_ms / self.request_count) if self.request_count > 0 else 0
        error_rate = (self.error_count / self.request_count) if self.request_count > 0 else 0

        return {
            "uptime_seconds": round(uptime, 2),
            "request_count": self.request_count,
            "error_count": self.error_count,
            "error_rate": round(error_rate, 4),
            "avg_response_time_ms": round(avg_response_time, 2)
        }

metrics_collector = MetricsCollector.get_instance()
