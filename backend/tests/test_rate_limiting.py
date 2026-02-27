"""
Tests for rate limiting functionality across authentication and LLM endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import time


@pytest.fixture
def mock_supabase():
    """Mock Supabase client for testing."""
    mock_client = MagicMock()
    # Mock Auth methods
    mock_client.sign_up.return_value = {"user": MagicMock(id="test-user-123")}
    mock_client.sign_in.return_value = {"user": MagicMock(id="test-user-123"), "session": {"access_token": "test-token"}}
    mock_client.reset_password.return_value = None
    
    # Mock Database methods (connection pooling aware)
    mock_assessment = {
        "id": "test-123", 
        "trait_scores": {"O": 75, "C": 65, "E": 55, "A": 70, "N": 60}, 
        "facet_scores": {}, 
        "mbti_code": "INTJ", 
        "confidence": 0.85
    }
    mock_client.get_assessment.return_value = mock_assessment
    mock_client.get_assessment_full.return_value = mock_assessment
    mock_client.get_assessment_scores.return_value = mock_assessment
    mock_client.save_explanation.return_value = {"id": "expl-123"}
    
    # Mock for directly accessed clients
    mock_table = MagicMock()
    mock_client.client.table.return_value = mock_table
    mock_client.service_client.table.return_value = mock_table
    
    return mock_client


@pytest.fixture
def client(mock_supabase):
    """Create test client with mocked dependencies."""
    from src.api.server import app, limiter
    from src.api.dependencies import get_supabase_client

    # Override the dependency
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase

    # Clear rate limiter storage to avoid leakage between tests
    if hasattr(limiter, "_limiter") and hasattr(limiter._limiter, "storage"):
        limiter._limiter.storage.reset()

    # Use a fixed IP for standard tests, but we'll vary it if needed
    with TestClient(app) as test_client:
        yield test_client

    # Clean up
    app.dependency_overrides.clear()


class TestSignupRateLimit:
    """Test rate limiting on /signup endpoint - Issue #2."""

    def test_signup_rate_limit_enforcement(self, client):
        """Test that signup endpoint enforces 5/hour rate limit."""
        payload = {
            "email": "test@example.com",
            "password": "TestPass123!",
            "profile_id": "testuser"
        }

        # Make 5 requests (at the limit)
        for i in range(5):
            response = client.post("/v1/auth/signup", json=payload)
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 6th request should be rate limited
        response = client.post("/v1/auth/signup", json=payload)
        assert response.status_code == 429, "6th signup request should be rate limited"


class TestLoginRateLimit:
    """Test rate limiting on /login endpoint - Issue #3."""

    def test_login_minute_rate_limit(self, client):
        """Test that login endpoint enforces 3/minute rate limit."""
        payload = {
            "identifier": "test@example.com",
            "password": "TestPass123!"
        }

        # Make 3 requests within a minute
        for i in range(3):
            response = client.post("/v1/auth/login", json=payload)
            assert response.status_code != 429

        # 4th request should be rate limited
        response = client.post("/v1/auth/login", json=payload)
        assert response.status_code == 429


class TestResetPasswordRateLimit:
    """Test rate limiting on /reset-password endpoint - Issue #4."""

    def test_reset_password_consistent_response(self, client):
        """Test that reset-password returns 200 and enforces 3/hour rate limit."""
        payload = {"email": "missing@example.com"}
        
        # Make 3 requests (limit is 3/hour)
        for i in range(3):
            response = client.post("/v1/auth/reset-password", json=payload)
            assert response.status_code == 200
        
        # 4th request should be rate limited
        response = client.post("/v1/auth/reset-password", json=payload)
        assert response.status_code == 429


class TestLLMGenerationRateLimit:
    """Test rate limiting on LLM generation endpoint - Issue #5."""

    @patch('src.api.routes.assessments.generate_explanation_with_tone')
    def test_llm_generation_daily_limit(self, mock_generate, client):
        """Test that LLM generation enforces 10/day rate limit."""
        # Note: auth.py says 10/day and 2/hour. 
        # In this test, we hit the hourly limit (2/hour) first.
        mock_generate.return_value = {"persona_title": "Test", "vibe_summary": "test"}

        # 1st and 2nd should pass
        for i in range(2):
            response = client.post("/v1/assessments/test-123/generate_explanation")
            assert response.status_code == 200
            
        # 3rd should be rate limited (by 2/hour limit)
        response = client.post("/v1/assessments/test-123/generate_explanation")
        assert response.status_code == 429


class TestCORSConfiguration:
    """Test CORS configuration - Issue #6."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses."""
        # Many middlewares only add CORS headers if an Origin is present
        response = client.get("/health", headers={"Origin": "http://localhost:3000"})
        
        # Check case-insensitively
        headers = {k.lower(): v for k, v in response.headers.items()}
        assert "access-control-allow-origin" in headers

    def test_cors_allows_configured_origins(self, client):
        """Test that CORS allows configured origins."""
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code == 200


class TestRateLimitIntegration:
    """Integration tests for rate limiting across endpoints."""

    def test_different_endpoints_independent_limits(self, client):
        """Test that different endpoints have independent rate limits."""
        # 1. Signup limit (5/hour)
        for i in range(5):
            client.post("/v1/auth/signup", json={"email": f"t{i}@e.c", "password": "P!", "profile_id": f"u{i}"})
        assert client.post("/v1/auth/signup", json={"email": "x@e.c", "password": "P!", "profile_id": "x"}).status_code == 429
        
        # 2. Login should NOT be limited yet (it has its own bucket)
        login_response = client.post("/v1/auth/login", json={"identifier": "test@e.c", "password": "P!"})
        assert login_response.status_code != 429
        
        # 3. Reset password should NOT be limited yet (it has its own bucket)
        reset_response = client.post("/v1/auth/reset-password", json={"email": "test@e.c"})
        assert reset_response.status_code != 429
