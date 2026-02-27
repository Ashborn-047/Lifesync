"""
Tests for Monitoring and Observability (PR #64)
"""

import pytest
import time
from fastapi.testclient import TestClient
from src.api.server import app
from src.utils.metrics import metrics_collector

client = TestClient(app)

def test_metrics_endpoint():
    """Test /metrics endpoint returns valid JSON structure."""
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "uptime_seconds" in data
    assert "request_count" in data
    assert "error_count" in data
    assert "error_rate" in data
    assert "avg_response_time_ms" in data

def test_request_logging_and_counting():
    """Test that requests increment the metrics counter."""
    # Get initial count
    initial_response = client.get("/metrics")
    initial_count = initial_response.json()["request_count"]

    # Make a request
    client.get("/health")

    # Check updated count
    final_response = client.get("/metrics")
    final_count = final_response.json()["request_count"]

    # Note: accessing /metrics itself also counts as a request
    # so we expect at least +2 (one for /health, one for second /metrics)
    # But metrics_collector might have been updated before /metrics returned.

    assert final_count > initial_count

def test_error_tracking():
    """Test that errors are tracked."""
    # Force a 404 error
    client.get("/non-existent-route")

    response = client.get("/metrics")
    data = response.json()

    # Should have recorded at least one error (404 is error? Middleware treats >= 400 as error?
    # In middleware: record_request(..., status_code >= 400)
    # So yes, 404 is an error.

    assert data["error_count"] > 0
    assert data["error_rate"] > 0
