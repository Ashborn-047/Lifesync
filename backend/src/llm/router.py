"""
LifeSync Personality Engine - LLM Router
Production-ready router with automatic fallback between providers
"""

import logging
from typing import Dict, Any, Optional
from ..config.llm_provider import (
    get_gemini_key,
    get_openai_key,
    get_grok_key,
    get_provider,
    is_provider_available
)
from .gemini_provider import GeminiProvider
from .openai_provider import OpenAIProvider
from .providers.grok_provider import GrokProvider
from .providers.provider_failure import ProviderFailure

logger = logging.getLogger(__name__)


def generate_explanation(
    traits: Dict[str, float],
    facets: Dict[str, float],
    confidence: Dict[str, Any],
    dominant: Dict[str, str],
    provider: Optional[str] = None,
    system_prompt: Optional[str] = None,
    tone_profile: Optional[Dict[str, Any]] = None,
    persona: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate personality explanation with automatic provider fallback.
    
    Provider priority:
    A) Gemini 2.0 Flash (primary)
    B) Gemini Flash-EXP (fallback if Flash fails)
    C) OpenAI GPT-4o-mini (backup if both Gemini models fail AND OpenAI key exists)
    D) Grok Beta (backup if all above fail AND Grok key exists)
    
    Args:
        traits: OCEAN trait scores
        facets: Facet scores
        confidence: Confidence scores
        dominant: Dominant profile information
        provider: Optional provider name (ignored, we use automatic fallback)
        system_prompt: Optional custom system prompt
        tone_profile: Optional tone profile
        persona: Optional persona object
    
    Returns:
        Dictionary with explanation data OR error dict with "error" key
    
    Never raises exceptions - always returns a dict (may contain "error" key)
    """
    # Get API keys
    gemini_key = get_gemini_key()
    openai_key = get_openai_key()
    grok_key = get_grok_key()
    
    # Determine which provider to use (explicit or default from config)
    if provider is None:
        provider = get_provider()  # Use default from config
    
    # Build provider chain based on explicit provider or default fallback
    providers_to_try = []
    
    # If explicit provider is requested, prioritize it
    if provider and provider.lower() in ["gemini", "openai", "grok"]:
        explicit_provider = provider.lower()
        if explicit_provider == "gemini" and gemini_key and not gemini_key.startswith("YOUR"):
            providers_to_try.append(("gemini", "gemini-2.0-flash", None))
        elif explicit_provider == "openai" and openai_key and not openai_key.startswith("sk-YOUR"):
            providers_to_try.append(("openai", "gpt-4o-mini", openai_key))
        elif explicit_provider == "grok" and grok_key and not grok_key.startswith("YOUR"):
            providers_to_try.append(("grok", "grok-beta", grok_key))
        
        # Add fallbacks for explicit provider
        if explicit_provider != "gemini" and gemini_key and not gemini_key.startswith("YOUR"):
            providers_to_try.append(("gemini", "gemini-2.0-flash", None))
        if explicit_provider != "openai" and openai_key and not openai_key.startswith("sk-YOUR"):
            providers_to_try.append(("openai", "gpt-4o-mini", openai_key))
        if explicit_provider != "grok" and grok_key and not grok_key.startswith("YOUR"):
            providers_to_try.append(("grok", "grok-beta", grok_key))
    else:
        # Default fallback chain: Gemini Flash → Gemini Flash-EXP → OpenAI → Grok
        # A) Gemini 2.0 Flash (primary)
        if gemini_key and not gemini_key.startswith("YOUR"):
            providers_to_try.append(("gemini", "gemini-2.0-flash", None))
        
        # B) Gemini Flash-EXP (already handled by GeminiProvider's alternate models)
        # We'll let GeminiProvider handle this internally
        
        # C) OpenAI GPT-4o-mini (backup, only if key exists)
        if openai_key and not openai_key.startswith("sk-YOUR"):
            providers_to_try.append(("openai", "gpt-4o-mini", openai_key))
        
        # D) Grok Beta (backup, only if key exists)
        if grok_key and not grok_key.startswith("YOUR"):
            providers_to_try.append(("grok", "grok-beta", grok_key))
    
    if not providers_to_try:
        error_msg = "No LLM providers available. Configure GEMINI_API_KEY, OPENAI_API_KEY, or GROK_API_KEY."
        logger.error(error_msg)
        return {
            "error": error_msg,
            "summary": "",
            "steps": [],
            "confidence_note": ""
        }
    
    last_error = None
    providers_tried = []
    
    # Try providers in order
    for provider_type, model_name, api_key in providers_to_try:
        try:
            logger.info(f"[LLM] Using provider: {provider_type} ({model_name})")
            
            if provider_type == "gemini":
                provider_instance = GeminiProvider(model_name=model_name, api_key=gemini_key)
            elif provider_type == "openai":
                provider_instance = OpenAIProvider(model_name=model_name, api_key=api_key)
            elif provider_type == "grok":
                provider_instance = GrokProvider(model_name=model_name, api_key=api_key)
            else:
                continue
            
            result = provider_instance.generate_explanation(
                traits=traits,
                facets=facets,
                confidence=confidence,
                dominant=dominant,
                system_prompt=system_prompt,
                tone_profile=tone_profile,
                persona=persona
            )
            
            logger.info(f"Provider {provider_type} ({model_name}) returned response successfully")
            return result
            
        except ProviderFailure as e:
            last_error = e
            providers_tried.append(f"{provider_type} ({model_name})")
            logger.warning(f"Provider {provider_type} ({model_name}) failed: {e}")
            
            # Determine next provider
            if provider_type == "gemini":
                logger.info("Fallback → Trying OpenAI GPT-4o-mini")
            elif provider_type == "openai":
                logger.info("Fallback → Trying Grok Beta")
            else:
                logger.warning("All providers exhausted")
            
            continue
            
        except Exception as e:
            last_error = e
            providers_tried.append(f"{provider_type} ({model_name})")
            logger.error(f"Unexpected error with {provider_type} ({model_name}): {e}")
            continue
    
    # All providers failed
    error_msg = f"All LLM providers failed. Tried: {', '.join(providers_tried)}"
    if last_error:
        error_msg += f". Last error: {str(last_error)}"
    
    logger.error(error_msg)
    
    return {
        "error": error_msg,
        "summary": "Unable to generate explanation. All LLM providers failed.",
        "steps": [],
        "confidence_note": "Please try again later or check API configuration.",
        "providers_tried": providers_tried
    }

