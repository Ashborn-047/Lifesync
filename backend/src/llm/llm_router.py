"""
LifeSync Personality Engine - LLM Router
Routes requests to the appropriate LLM provider with fallback support
"""

from typing import Any, Dict, Optional

from ..config.llm_provider import (
    DEFAULT_GEMINI_MODEL,
    DEFAULT_OPENAI_MODEL,
    get_gemini_key,
    get_openai_key,
    get_provider,
    is_provider_available,
)
from .gemini_provider import GeminiProvider
from .openai_provider import OpenAIProvider


def get_provider_instance(provider: Optional[str] = None) -> any:
    """
    Get an instance of the specified LLM provider.
    
    Args:
        provider: Provider name ("openai" or "gemini"). If None, uses configured default.
    
    Returns:
        Provider instance
    
    Raises:
        ValueError: If provider is not available
    """
    if provider is None:
        provider = get_provider()
    
    provider = provider.lower()
    
    if provider == "openai":
        api_key = get_openai_key()
        if not api_key or api_key.startswith("sk-YOUR"):
            raise ValueError("OpenAI API key not configured")
        return OpenAIProvider(model_name=DEFAULT_OPENAI_MODEL, api_key=api_key)
    
    elif provider == "gemini":
        api_key = get_gemini_key()
        if not api_key or api_key.startswith("YOUR"):
            raise ValueError("Gemini API key not configured")
        return GeminiProvider(model_name=DEFAULT_GEMINI_MODEL, api_key=api_key)
    
    else:
        raise ValueError(f"Unknown provider: {provider}. Must be 'openai' or 'gemini'")


def generate_explanation(
    traits: Dict[str, float],
    facets: Dict[str, float],
    confidence: Dict[str, Any],
    dominant: Dict[str, str],
    provider: Optional[str] = None,
    system_prompt: Optional[str] = None,
    tone_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate personality explanation using the configured or specified provider.
    Implements fallback: Gemini → OpenAI → Error
    
    Args:
        traits: OCEAN trait scores
        facets: Facet scores
        confidence: Confidence scores
        dominant: Dominant profile information
        provider: Optional provider name. If None, uses configured default.
        system_prompt: Optional custom system prompt
    
    Returns:
        Dictionary with explanation data
    
    Raises:
        RuntimeError: If all providers fail
    """
    # Determine provider order (try specified/default first, then fallback)
    if provider is None:
        provider = get_provider()
    
    providers_to_try = [provider]
    
    # Add fallback if primary is not OpenAI
    if provider != "openai" and is_provider_available("openai"):
        providers_to_try.append("openai")
    
    last_error = None
    
    for provider_name in providers_to_try:
        try:
            provider_instance = get_provider_instance(provider_name)
            return provider_instance.generate_explanation(
                traits=traits,
                facets=facets,
                confidence=confidence,
                dominant=dominant,
                system_prompt=system_prompt,
                tone_profile=tone_profile
            )
        except ValueError as e:
            # Provider not configured, try next
            last_error = e
            continue
        except Exception as e:
            # Provider failed, try fallback
            last_error = e
            continue
    
    # All providers failed
    error_msg = f"Failed to generate explanation. Tried providers: {', '.join(providers_to_try)}"
    if last_error:
        error_msg += f". Last error: {str(last_error)}"
    
    raise RuntimeError(error_msg)

