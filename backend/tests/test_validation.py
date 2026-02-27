"""
Tests for Input Validation and Sanitization (PR #62)
"""

import pytest
from pydantic import ValidationError
from src.utils.validators import sanitize_text, validate_user_id
from src.api.routes.auth import SignupRequest, LoginRequest
from src.api.routes.assessments import ExplanationRequest

def test_sanitize_text_strips_html():
    """Test that sanitize_text removes HTML tags."""
    input_text = "<script>alert('xss')</script>Hello <b>World</b>"
    expected = "alert('xss')Hello World"
    assert sanitize_text(input_text) == expected

def test_sanitize_text_trims_whitespace():
    """Test that sanitize_text trims whitespace."""
    input_text = "  Hello World  "
    expected = "Hello World"
    assert sanitize_text(input_text) == expected

def test_validate_user_id_uuid_format():
    """Test UUID validation."""
    valid_uuid = "123e4567-e89b-12d3-a456-426614174000"
    is_valid, _ = validate_user_id(valid_uuid)
    assert is_valid is True

    invalid_uuid = "123-invalid"
    is_valid, _ = validate_user_id(invalid_uuid)
    assert is_valid is False

def test_signup_request_sanitization():
    """Test SignupRequest sanitizes profile_id."""
    request = SignupRequest(
        email="test@example.com",
        password="Pass123!",
        profile_id="<b>user1</b>"
    )
    assert request.profile_id == "user1"

def test_login_request_sanitization():
    """Test LoginRequest sanitizes identifier."""
    request = LoginRequest(
        identifier="<script>alert(1)</script>user1",
        password="password"
    )
    assert request.identifier == "alert(1)user1"

def test_explanation_request_validation():
    """Test ExplanationRequest validation."""
    # Valid
    req = ExplanationRequest(provider="gemini")
    assert req.provider == "gemini"

    # Sanitization
    req = ExplanationRequest(provider="<b>gemini</b>")
    assert req.provider == "gemini"
