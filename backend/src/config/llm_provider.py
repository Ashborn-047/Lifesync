"""
LifeSync Personality Engine - LLM Provider Configuration
"""

import os
from typing import Literal

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supported providers
LLMProvider = Literal["openai", "gemini", "grok"]

# Default provider (Gemini only)
DEFAULT_PROVIDER: LLMProvider = "gemini"

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Model names
DEFAULT_GEMINI_MODEL = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-2.0-flash")


def get_provider() -> LLMProvider:
    """Get the configured LLM provider"""
    return "gemini"


def get_gemini_key() -> str:
    """Get Gemini API key"""
    return GEMINI_API_KEY


def is_provider_available(provider: LLMProvider) -> bool:
    """
    Check if a provider is available (has API key).
    
    Args:
        provider: Provider name to check
    
    Returns:
        True if provider has API key configured
    """
    if provider == "gemini":
        return bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("YOUR"))
    return False

