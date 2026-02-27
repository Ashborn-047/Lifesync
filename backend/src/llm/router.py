"""
LifeSync Personality Engine - LLM Router
Production-ready router with automatic fallback between providers
"""

import logging
from typing import Dict, Any, Optional
from ..config.llm_provider import (
    get_gemini_key,
    get_provider,
    is_provider_available
)
from .gemini_provider import GeminiProvider
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
    Generate personality explanation using Gemini (Single Provider).
    
    Args:
        traits: OCEAN trait scores
        facets: Facet scores
        confidence: Confidence scores
        dominant: Dominant profile information
        provider: Ignored (now Gemini only)
        system_prompt: Optional custom system prompt
        tone_profile: Optional tone profile
        persona: Optional persona object
    
    Returns:
        Dictionary with explanation data OR error dict with "error" key
    """
    gemini_key = get_gemini_key()
    
    if not gemini_key or gemini_key.startswith("YOUR"):
        error_msg = "Gemini API key not configured. Please set GEMINI_API_KEY."
        logger.error(error_msg)
        return {
            "error": error_msg,
            "summary": "AI generation is unavailable because the API key is missing.",
            "steps": [],
            "confidence_note": ""
        }
    
    try:
        logger.info(f"[LLM] Using Gemini (gemini-2.0-flash)")
        provider_instance = GeminiProvider(model_name="gemini-2.0-flash", api_key=gemini_key)
        
        result = provider_instance.generate_explanation(
            traits=traits,
            facets=facets,
            confidence=confidence,
            dominant=dominant,
            system_prompt=system_prompt,
            tone_profile=tone_profile,
            persona=persona
        )
        
        return result
        
    except Exception as e:
        error_msg = f"Gemini generation failed: {str(e)}"
        logger.error(error_msg)
        return {
            "error": error_msg,
            "summary": "Unable to generate explanation due to an AI service error.",
            "steps": [],
            "confidence_note": "Please check your internet connection or try again later."
        }

