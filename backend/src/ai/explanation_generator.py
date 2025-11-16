"""
LifeSync Personality Engine - Explanation Generator
Integrates tone generation with LLM explanation workflow
"""

import logging
from typing import Dict, Any, Optional
from ..llm.router import generate_explanation as router_generate_explanation
from ..config.llm_provider import get_provider
from .tone_generator import generate_tone_safe
from ..llm.templates import _convert_traits_to_codes

logger = logging.getLogger(__name__)


def generate_explanation_with_tone(
    traits: Dict[str, float],
    facets: Dict[str, float],
    confidence: Dict[str, Any],
    dominant: Dict[str, str],
    provider: Optional[str] = None,
    system_prompt: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate personality explanation with automatic tone generation.
    
    This function:
    1. Generates tone profile from traits
    2. Injects tone guidance into LLM prompt
    3. Generates explanation using configured LLM provider
    4. Returns structured explanation
    
    Args:
        traits: OCEAN trait scores (0-1 scale) with full names
                Example: {"Openness": 0.72, "Conscientiousness": 0.65, ...}
        facets: Facet scores (0-1 scale)
        confidence: Confidence scores for traits and facets
        dominant: Dominant profile information
        provider: Optional LLM provider ("openai", "gemini", or "grok")
        system_prompt: Optional custom system prompt
    
    Returns:
        Dictionary containing explanation data with tone-aware content
    
    Raises:
        RuntimeError: If LLM generation fails
        ValueError: If input data is invalid
    """
    # Determine which provider to use
    selected_provider = provider or get_provider()
    logger.info(f"[LLM] Using provider: {selected_provider}")
    
    # Step 1: Generate tone profile from traits
    # Convert full trait names to OCEAN codes for tone generator
    trait_codes = _convert_traits_to_codes(traits)
    
    # Generate tone profile with safe fallbacks
    tone_profile = generate_tone_safe(trait_codes)
    logger.debug(f"[LLM] Generated tone profile: {len(tone_profile.get('style', []))} style descriptors")
    
    # Step 2: Generate explanation with tone profile injected
    # The router handles provider selection, fallback, and error handling
    explanation = router_generate_explanation(
        traits=traits,
        facets=facets,
        confidence=confidence,
        dominant=dominant,
        provider=provider,  # Pass through to router
        system_prompt=system_prompt,
        tone_profile=tone_profile
    )
    
    # Check if router returned an error
    if "error" in explanation:
        logger.error(f"[LLM] Explanation generation failed: {explanation.get('error')}")
        # Still return the explanation (with error) so caller can handle it
    else:
        logger.info(f"[LLM] Explanation generated successfully using {explanation.get('model_name', 'unknown')}")
    
    # Add tone profile to explanation metadata
    explanation["tone_profile"] = tone_profile
    
    return explanation

