"""
LifeSync Personality Engine - Explanation Engine
Provider-agnostic explanation generation
"""

from typing import Dict, Any, Optional
from .router import generate_explanation as router_generate_explanation


def generate_personality_explanation(
    traits: Dict[str, float],
    facets: Dict[str, float],
    confidence: Dict[str, Any],
    dominant: Dict[str, str],
    provider: Optional[str] = None,
    system_prompt: Optional[str] = None,
    tone_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate personality explanation using the configured LLM provider.
    
    This is the main entry point for explanation generation. It uses the
    LLM router to automatically select the appropriate provider (Gemini or OpenAI)
    with fallback support.
    
    Args:
        traits: OCEAN trait scores (0-1 scale)
        facets: Facet scores (0-1 scale)
        confidence: Confidence scores for traits and facets
        dominant: Dominant profile information (MBTI proxy, neuroticism level, etc.)
        provider: Optional provider name ("openai" or "gemini"). If None, uses configured default.
        system_prompt: Optional custom system prompt
    
    Returns:
        Dictionary containing:
        - summary: Overview of personality profile (2-3 paragraphs)
        - steps: Array of key insights (3-5 items)
        - confidence_note: Note about assessment reliability
        - model_name: Model used for generation
        - tokens_used: Number of tokens consumed (if available)
        - generation_time_ms: Time taken in milliseconds
        - system_prompt: System prompt used
        - user_payload: Input data sent to LLM
    
    Raises:
        RuntimeError: If all available providers fail
        ValueError: If input data is invalid
    
    Example:
        >>> traits = {"Openness": 0.72, "Conscientiousness": 0.65, ...}
        >>> facets = {"Fantasy": 0.75, "Aesthetics": 0.68, ...}
        >>> confidence = {"traits": {...}, "facets": {...}}
        >>> dominant = {"mbti_proxy": "INFP", "neuroticism_level": "Balanced", ...}
        >>> explanation = generate_personality_explanation(traits, facets, confidence, dominant)
        >>> print(explanation["summary"])
    """
    return router_generate_explanation(
        traits=traits,
        facets=facets,
        confidence=confidence,
        dominant=dominant,
        provider=provider,
        system_prompt=system_prompt,
        tone_profile=tone_profile
    )

