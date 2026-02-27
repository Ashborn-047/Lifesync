"""
LifeSync Personality Engine - Explanation Generator
Integrates tone generation with LLM explanation workflow
"""

import logging
from typing import Any, Dict, Optional

from ..llm.router import generate_explanation as router_generate_explanation
from ..llm.templates import _convert_traits_to_codes
from ..personas.persona_registry import map_profile_to_persona
from .tone_generator import generate_tone_safe

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
    2. Maps profile to Persona
    3. Injects tone and persona guidance into LLM prompt
    4. Generates explanation using configured LLM provider
    5. Returns structured explanation
    
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
    # Step 0: Logging
    logger.info("[LLM] Generating explanation using Gemini")
    
    # Step 1: Generate tone profile from traits
    # Convert full trait names to OCEAN codes for tone generator
    trait_codes = _convert_traits_to_codes(traits)
    
    # Generate tone profile with safe fallbacks
    tone_profile = generate_tone_safe(trait_codes)
    logger.debug(f"[LLM] Generated tone profile: {len(tone_profile.get('style', []))} style descriptors")
    
    # Step 2: Map to Persona
    # Convert 0-1 traits to 0-100 for mapping
    ocean_profile = {
        "openness": traits.get("Openness", 0) * 100,
        "conscientiousness": traits.get("Conscientiousness", 0) * 100,
        "extraversion": traits.get("Extraversion", 0) * 100,
        "agreeableness": traits.get("Agreeableness", 0) * 100,
        "neuroticism": traits.get("Neuroticism", 0) * 100
    }
    
    persona_result = map_profile_to_persona(ocean_profile)
    persona = persona_result.get("persona")
    logger.info(f"[LLM] Mapped to persona: {persona.get('title')} (confidence: {persona_result.get('confidence')}%)")

    # Step 3: Generate explanation with tone profile and persona injected
    try:
        explanation = router_generate_explanation(
            traits=traits,
            facets=facets,
            confidence=confidence,
            dominant=dominant,
            provider=None,  # Standardize on Gemini
            system_prompt=system_prompt,
            tone_profile=tone_profile,
            persona=persona
        )
    except Exception as e:
        logger.error(f"[LLM] Unexpected error in router: {e}")
        explanation = {"error": str(e)}
    
    # Check if router returned an error or failed
    if "error" in explanation:
        logger.warning(f"[LLM] AI generation failed, using static fallback for persona: {persona.get('title')}")
        
        # Build a static fallback from persona data
        fallback = {
            "persona_title": persona.get("title", "Personality Profile"),
            "vibe_summary": persona.get("description", "A unique blend of personality traits."),
            "strengths": persona.get("strengths", []),
            "growth_edges": persona.get("growth", []),
            "how_you_show_up": f"As {persona.get('title')}, your behavior is guided by {persona.get('tagline', 'your unique perspective')}.",
            "tagline": persona.get("tagline", ""),
            "is_fallback": True,
            "error_note": explanation.get("error")
        }
        
        # Preserve original error for debugging but return the fallback content
        fallback["original_error"] = explanation.get("error")
        explanation = fallback
    else:
        logger.info(f"[LLM] Explanation generated successfully using {explanation.get('model_name', 'unknown')}")
    
    # Add tone profile and persona to explanation metadata
    explanation["tone_profile"] = tone_profile
    explanation["persona"] = persona
    
    return explanation

