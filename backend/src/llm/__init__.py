"""
LifeSync Personality Engine - LLM Module
"""

# Legacy imports for backward compatibility
from .llm_client import LLMClient, create_llm_client
from .templates import SYSTEM_PROMPT, get_personality_explanation_prompt

# New provider-based imports
from .explanations import generate_personality_explanation
from .router import generate_explanation
from .gemini_provider import GeminiProvider
from .provider_base import LLMProviderBase

__all__ = [
    # Legacy
    'LLMClient',
    'create_llm_client',
    'SYSTEM_PROMPT',
    'get_personality_explanation_prompt',
    # New provider-based
    'generate_personality_explanation',
    'generate_explanation',
    'GeminiProvider',
    'LLMProviderBase'
]

