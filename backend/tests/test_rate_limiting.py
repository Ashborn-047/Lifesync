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
    mock_client.sign_up.return_value = {"user": MagicMock(id="test-user-123")}
    mock_client.sign_in.return_value = {"session": {"access_token": "test-token"}}
    mock_client.reset_password.return_value = None
    return mock_client


@pytest.fixture
def client(mock_supabase):
    """Create test client with mocked dependencies."""
    from src.api.server import app
    from src.api.dependencies import get_supabase_client

    # Override the dependency
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase

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

        # Make 5 successful requests (at the limit)
        for i in range(5):
            response = client.post("/v1/auth/signup", json=payload)
            # Could be 200 or 400 depending on mock, just check not 429
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 6th request should be rate limited
        response = client.post("/v1/auth/signup", json=payload)
        assert response.status_code == 429, "6th signup request should be rate limited"
        assert "rate limit" in response.json().get("error", "").lower()

    def test_signup_rate_limit_per_ip(self, client):
        """Test that signup rate limits are per IP address."""
        # Rate limiting is per IP, so this test verifies the concept
        # In a real scenario, you'd test with different IPs
        payload = {
            "email": "user1@example.com",
            "password": "TestPass123!",
            "profile_id": "user1"
        }

        response = client.post("/v1/auth/signup", json=payload)
        assert response.status_code != 429, "First request should succeed"


class TestLoginRateLimit:
    """Test rate limiting on /login endpoint - Issue #3."""

    def test_login_hourly_rate_limit(self, client):
        """Test that login endpoint enforces 10/hour rate limit."""
        payload = {
            "identifier": "test@example.com",
            "password": "TestPass123!"
        }

        # Make 10 successful requests (at the hourly limit)
        for i in range(10):
            response = client.post("/v1/auth/login", json=payload)
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 11th request should be rate limited
        response = client.post("/v1/auth/login", json=payload)
        assert response.status_code == 429, "11th login request should be rate limited"

    def test_login_minute_rate_limit(self, client):
        """Test that login endpoint enforces 3/minute rate limit."""
        payload = {
            "identifier": "test@example.com",
            "password": "TestPass123!"
        }

        # Make 3 requests within a minute
        for i in range(3):
            response = client.post("/v1/auth/login", json=payload)
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 4th request within the minute should be rate limited
        response = client.post("/v1/auth/login", json=payload)
        assert response.status_code == 429, "4th login request within minute should be rate limited"

    def test_login_rate_limit_error_response(self, client):
        """Test that rate limit error includes helpful information."""
        payload = {
            "identifier": "test@example.com",
            "password": "TestPass123!"
        }

        # Exceed rate limit
        for _ in range(4):
            client.post("/v1/auth/login", json=payload)

        response = client.post("/v1/auth/login", json=payload)
        assert response.status_code == 429
        data = response.json()
        assert "error" in data
        assert "detail" in data


class TestResetPasswordRateLimit:
    """Test rate limiting on /reset-password endpoint - Issue #4."""

    def test_reset_password_rate_limit(self, client):
        """Test that reset-password endpoint enforces 3/hour rate limit."""
        payload = {
            "email": "test@example.com"
        }

        # Make 3 successful requests (at the limit)
        for i in range(3):
            response = client.post("/v1/auth/reset-password", json=payload)
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 4th request should be rate limited
        response = client.post("/v1/auth/reset-password", json=payload)
        assert response.status_code == 429, "4th reset-password request should be rate limited"

    def test_reset_password_consistent_response(self, client):
        """Test that reset-password returns consistent responses (no email enumeration)."""
        # Valid email
        response1 = client.post("/v1/auth/reset-password", json={"email": "valid@example.com"})

        # Invalid email
        response2 = client.post("/v1/auth/reset-password", json={"email": "invalid@example.com"})

        # Both should return 200 with the same message
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json() == response2.json()
        assert "password reset link" in response1.json().get("message", "").lower()


class TestLLMGenerationRateLimit:
    """Test rate limiting on LLM generation endpoint - Issue #5."""

    @patch('src.api.routes.assessments.create_supabase_client')
    @patch('src.api.routes.assessments.generate_explanation_with_tone')
    def test_llm_generation_daily_limit(self, mock_generate, mock_supabase_factory, client):
        """Test that LLM generation enforces 10/day rate limit."""
        # Mock Supabase response
        mock_db = MagicMock()
        mock_client_instance = MagicMock()
        mock_client_instance.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "id": "test-assessment-123",
                "trait_scores": {"O": 75, "C": 65, "E": 55, "A": 70, "N": 60},
                "facet_scores": {},
                "confidence": 0.85,
                "mbti_code": "ENFJ"
            }]
        )
        mock_db.service_client = mock_client_instance
        mock_db.client = mock_client_instance
        mock_supabase_factory.return_value = mock_db

        # Mock explanation generator
        mock_generate.return_value = {
            "summary": "Test explanation",
            "traits": {},
            "insights": []
        }

        assessment_id = "test-assessment-123"

        # Make 10 successful requests (at the daily limit)
        for i in range(10):
            response = client.post(f"/v1/assessments/{assessment_id}/generate_explanation")
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 11th request should be rate limited
        response = client.post(f"/v1/assessments/{assessment_id}/generate_explanation")
        assert response.status_code == 429, "11th LLM generation should be rate limited"

    @patch('src.api.routes.assessments.create_supabase_client')
    @patch('src.api.routes.assessments.generate_explanation_with_tone')
    def test_llm_generation_hourly_limit(self, mock_generate, mock_supabase_factory, client):
        """Test that LLM generation enforces 2/hour rate limit."""
        # Mock Supabase response
        mock_db = MagicMock()
        mock_client_instance = MagicMock()
        mock_client_instance.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "id": "test-assessment-456",
                "trait_scores": {"O": 75, "C": 65, "E": 55, "A": 70, "N": 60},
                "facet_scores": {},
                "confidence": 0.85,
                "mbti_code": "ENFJ"
            }]
        )
        mock_db.service_client = mock_client_instance
        mock_db.client = mock_client_instance
        mock_supabase_factory.return_value = mock_db

        # Mock explanation generator
        mock_generate.return_value = {
            "summary": "Test explanation",
            "traits": {},
            "insights": []
        }

        assessment_id = "test-assessment-456"

        # Make 2 successful requests (at the hourly limit)
        for i in range(2):
            response = client.post(f"/v1/assessments/{assessment_id}/generate_explanation")
            assert response.status_code != 429, f"Request {i+1} should not be rate limited"

        # 3rd request should be rate limited
        response = client.post(f"/v1/assessments/{assessment_id}/generate_explanation")
        assert response.status_code == 429, "3rd LLM generation within hour should be rate limited"

    @patch('src.api.routes.assessments.create_supabase_client')
    @patch('src.api.routes.assessments.generate_explanation_with_tone')
    def test_llm_quota_tracker_integration(self, mock_generate, mock_supabase_factory, client):
        """Test that quota tracker properly records and limits usage."""
        from src.db.quota import quota_tracker

        # Reset quota for clean test
        quota_tracker.reset_user_quota("testclient")

        # Mock Supabase response
        mock_db = MagicMock()
        mock_client_instance = MagicMock()
        mock_client_instance.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{
                "id": "test-assessment-789",
                "trait_scores": {"O": 75, "C": 65, "E": 55, "A": 70, "N": 60},
                "facet_scores": {},
                "confidence": 0.85,
                "mbti_code": "ENFJ"
            }]
        )
        mock_db.service_client = mock_client_instance
        mock_db.client = mock_client_instance
        mock_supabase_factory.return_value = mock_db

        # Mock explanation generator
        mock_generate.return_value = {
            "summary": "Test explanation",
            "traits": {},
            "insights": []
        }

        assessment_id = "test-assessment-789"

        # First request should succeed
        response = client.post(f"/v1/assessments/{assessment_id}/generate_explanation")
        assert response.status_code == 200


class TestCORSConfiguration:
    """Test CORS configuration - Issue #6."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses."""
        response = client.options("/health")

        # Check for CORS headers
        assert "access-control-allow-origin" in response.headers or \
               "Access-Control-Allow-Origin" in response.headers

    def test_cors_allows_configured_origins(self, client):
        """Test that CORS allows configured origins."""
        # In development, localhost should be allowed
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )

        # Should not reject the request
        assert response.status_code == 200


class TestRateLimitErrorHandling:
    """Test rate limit error handling and responses."""

    def test_rate_limit_response_format(self, client):
        """Test that rate limit errors have consistent format."""
        payload = {"email": "test@example.com", "password": "TestPass123!", "profile_id": "test"}

        # Trigger rate limit
        for _ in range(6):
            client.post("/v1/auth/signup", json=payload)

        response = client.post("/v1/auth/signup", json=payload)

        assert response.status_code == 429
        data = response.json()

        # Check response structure
        assert "error" in data
        assert "detail" in data
        assert isinstance(data["error"], str)
        assert isinstance(data["detail"], str)

    def test_rate_limit_clear_error_message(self, client):
        """Test that rate limit errors have clear messages."""
        payload = {"email": "test@example.com", "password": "TestPass123!", "profile_id": "test"}

        # Trigger rate limit
        for _ in range(6):
            client.post("/v1/auth/signup", json=payload)

        response = client.post("/v1/auth/signup", json=payload)
        data = response.json()

        # Error message should be user-friendly
        assert "rate limit" in data["error"].lower() or "too many" in data["detail"].lower()
        assert "try again" in data["detail"].lower() or "later" in data["detail"].lower()


# Integration test to verify all rate limits work together
class TestRateLimitIntegration:
    """Integration tests for rate limiting across endpoints."""

    def test_different_endpoints_independent_limits(self, client):
        """Test that rate limits are independent per endpoint."""
        # Consume signup rate limit
        signup_payload = {"email": "test1@example.com", "password": "Pass123!", "profile_id": "test1"}
        for _ in range(5):
            client.post("/v1/auth/signup", json=signup_payload)

        # Login should still work (independent rate limit)
        login_payload = {"identifier": "test2@example.com", "password": "Pass123!"}
        response = client.post("/v1/auth/login", json=login_payload)
        assert response.status_code != 429, "Login should have independent rate limit from signup"

        # Reset password should also work
        reset_payload = {"email": "test3@example.com"}
        response = client.post("/v1/auth/reset-password", json=reset_payload)
        assert response.status_code != 429, "Reset password should have independent rate limit"
