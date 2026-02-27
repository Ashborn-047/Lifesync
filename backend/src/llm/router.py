"""
LifeSync Personality Engine - LLM Router
Production-ready router with automatic fallback between providers
"""

import logging
from typing import Any, Dict, Optional

from ..config.llm_provider import get_gemini_key
from .circuit_breaker import (
    CircuitBreaker,
    with_circuit_breaker,
)
from .gemini_provider import GeminiProvider

logger = logging.getLogger(__name__)

# Initialize circuit breaker for Gemini
# Open after 3 consecutive failures, retry after 60 seconds
gemini_circuit = CircuitBreaker(failure_threshold=3, recovery_timeout=60.0, name="gemini")

def get_fallback_explanation() -> Dict[str, Any]:
    """Return a graceful fallback response when AI is unavailable."""
    return {
        "error": "AI service temporarily unavailable",
        "summary": "Our AI insights engine is currently experiencing high load. Please check back in a few minutes.",
        "strengths": ["Resilience", "Patience"],
        "challenges": ["System Availability"],
        "steps": [],
        "confidence_note": "Fallback response due to service interruption."
    }

@with_circuit_breaker(gemini_circuit, fallback_function=lambda *args, **kwargs: get_fallback_explanation())
async def generate_explanation_async(
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
    Async wrapper for generation with circuit breaker.
    """
    # Note: Since the underlying provider might be sync, we might need to run it in threadpool
    # if we want true async non-blocking behavior.
    # For now, we assume the provider call is what we are wrapping.
    # However, existing generate_explanation is sync.
    # The circuit breaker decorator expects an async function.

    # We will call the sync function directly here
    return _generate_explanation_impl(
        traits, facets, confidence, dominant, provider, system_prompt, tone_profile, persona
    )

def _generate_explanation_impl(
    traits, facets, confidence, dominant, provider, system_prompt, tone_profile, persona
) -> Dict[str, Any]:
    """Internal implementation of generation logic."""
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
        logger.info("[LLM] Using Gemini (gemini-2.0-flash)")
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
        # Re-raise exception so circuit breaker can track it
        raise e

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
    # Check circuit state synchronously before proceeding
    if not gemini_circuit.allow_request():
         logger.warning("Gemini circuit is OPEN (fast fail)")
         return get_fallback_explanation()

    try:
        # Call the implementation directly.
        # Note: We are not using the async decorator here because this function is synchronous.
        # We manually manage the circuit state for sync calls.

        result = _generate_explanation_impl(
            traits, facets, confidence, dominant, provider, system_prompt, tone_profile, persona
        )
        gemini_circuit.record_success()
        return result

    except Exception as e:
        gemini_circuit.record_failure()
        error_msg = f"Gemini generation failed: {str(e)}"
        logger.error(error_msg)

        # If circuit just opened, return fallback
        if gemini_circuit.state.name == "OPEN":
             return get_fallback_explanation()

        return {
            "error": error_msg,
            "summary": "Unable to generate explanation due to an AI service error.",
            "steps": [],
            "confidence_note": "Please check your internet connection or try again later."
        }

# Keep the old implementation structure for reference but use the new logic
def _unused_generate_explanation_legacy_signature(
    traits: Dict[str, float],
    facets: Dict[str, float],
    confidence: Dict[str, Any],
    dominant: Dict[str, str],
    provider: Optional[str] = None,
    system_prompt: Optional[str] = None,
    tone_profile: Optional[Dict[str, Any]] = None,
    persona: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    # gemini_key = get_gemini_key()
    pass
