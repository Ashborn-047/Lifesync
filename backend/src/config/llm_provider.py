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

# Default provider (Gemini as per requirements)
DEFAULT_PROVIDER: LLMProvider = os.getenv("LLM_PROVIDER", "gemini").lower()

# Validate provider
if DEFAULT_PROVIDER not in ["openai", "gemini", "grok"]:
    raise ValueError(f"Invalid LLM_PROVIDER: {DEFAULT_PROVIDER}. Must be 'openai', 'gemini', or 'grok'")

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROK_API_KEY = os.getenv("GROK_API_KEY", "")

# Model names
DEFAULT_OPENAI_MODEL = os.getenv("DEFAULT_OPENAI_MODEL", "gpt-4o-mini")
DEFAULT_GEMINI_MODEL = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-2.0-flash")
DEFAULT_GROK_MODEL = os.getenv("DEFAULT_GROK_MODEL", "grok-beta")


def get_provider() -> LLMProvider:
    """Get the configured LLM provider"""
    return DEFAULT_PROVIDER


def get_openai_key() -> str:
    """Get OpenAI API key"""
    return OPENAI_API_KEY


def get_gemini_key() -> str:
    """Get Gemini API key"""
    return GEMINI_API_KEY


def get_grok_key() -> str:
    """Get Grok API key"""
    return GROK_API_KEY


def is_provider_available(provider: LLMProvider) -> bool:
    """
    Check if a provider is available (has API key).
    
    Args:
        provider: Provider name to check
    
    Returns:
        True if provider has API key configured
    """
    if provider == "openai":
        return bool(OPENAI_API_KEY and not OPENAI_API_KEY.startswith("sk-YOUR"))
    elif provider == "gemini":
        return bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("YOUR"))
    elif provider == "grok":
        return bool(GROK_API_KEY and not GROK_API_KEY.startswith("YOUR"))
    return False

