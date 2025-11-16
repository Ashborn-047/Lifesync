"""
LifeSync Personality Engine - Tone Generator
Generates communication tone guidelines based on OCEAN personality traits
"""

from typing import Dict, List


def generate_tone(traits: Dict[str, float]) -> Dict[str, List[str]]:
    """
    Generate communication tone profile based on OCEAN personality traits.
    
    Args:
        traits: Dictionary with OCEAN trait scores (0-1 scale)
                Expected keys: "O", "C", "E", "A", "N"
                Example: {"O": 0.72, "C": 0.65, "E": 0.42, "A": 0.71, "N": 0.48}
    
    Returns:
        Dictionary containing:
        - style: List of writing style adjectives
        - strengths: List of positive reinforcement messages
        - cautions: List of emotional sensitivity warnings
    
    Raises:
        ValueError: If required trait keys are missing
    
    Example:
        >>> traits = {"O": 0.72, "C": 0.65, "E": 0.42, "A": 0.71, "N": 0.48}
        >>> tone = generate_tone(traits)
        >>> print(tone["style"])
        ['creative', 'metaphorical', 'structured', 'calm', 'warm']
    """
    # Validate required trait keys
    required_traits = ["O", "C", "E", "A", "N"]
    missing_traits = [t for t in required_traits if t not in traits]
    if missing_traits:
        raise ValueError(
            f"Missing required trait keys: {', '.join(missing_traits)}. "
            f"Expected keys: {', '.join(required_traits)}"
        )
    
    # Thresholds
    LOW_THRESHOLD = 0.35
    HIGH_THRESHOLD = 0.65
    
    # Initialize tone profile
    style = []
    strengths = []
    cautions = []
    
    # Openness (O)
    o_score = float(traits.get("O", 0.5))
    if o_score > HIGH_THRESHOLD:
        style.extend(["creative", "metaphorical", "imaginative"])
        strengths.append("highly creative and open to new ideas")
    elif o_score < LOW_THRESHOLD:
        style.extend(["practical", "grounded", "literal"])
        strengths.append("practical and focused on real-world applications")
    else:
        style.append("balanced")
    
    # Conscientiousness (C)
    c_score = float(traits.get("C", 0.5))
    if c_score > HIGH_THRESHOLD:
        style.extend(["structured", "organized", "action-oriented"])
        strengths.append("highly organized and goal-driven")
    elif c_score < LOW_THRESHOLD:
        style.extend(["easygoing", "flexible", "non-judgmental"])
        strengths.append("adaptable and open to spontaneity")
    else:
        style.append("moderately organized")
    
    # Extraversion (E)
    e_score = float(traits.get("E", 0.5))
    if e_score > HIGH_THRESHOLD:
        style.extend(["energetic", "enthusiastic", "encouraging"])
        strengths.append("naturally energetic and socially engaging")
    elif e_score < LOW_THRESHOLD:
        style.extend(["calm", "introspective", "soft-spoken"])
        strengths.append("thoughtful and comfortable with reflection")
    else:
        style.append("socially balanced")
    
    # Agreeableness (A)
    a_score = float(traits.get("A", 0.5))
    if a_score > HIGH_THRESHOLD:
        style.extend(["warm", "gentle", "supportive"])
        strengths.append("empathetic and considerate of others")
    elif a_score < LOW_THRESHOLD:
        style.extend(["direct", "honest", "straightforward"])
        strengths.append("clear and direct in communication")
    else:
        style.append("balanced in social interactions")
    
    # Neuroticism (N)
    n_score = float(traits.get("N", 0.5))
    if n_score > HIGH_THRESHOLD:
        cautions.extend([
            "may need reassurance",
            "emotionally sensitive",
            "may experience stress more intensely"
        ])
    elif n_score < LOW_THRESHOLD:
        strengths.append("emotionally stable and resilient")
        strengths.append("handles stress and setbacks well")
    else:
        strengths.append("generally emotionally balanced")
    
    # Remove duplicates while preserving order
    style = list(dict.fromkeys(style))
    strengths = list(dict.fromkeys(strengths))
    cautions = list(dict.fromkeys(cautions))
    
    # Fallback: Ensure at least basic style descriptors
    if not style:
        style = ["friendly", "clear"]
    
    return {
        "style": style,
        "strengths": strengths,
        "cautions": cautions
    }


def generate_tone_safe(traits: Dict[str, float]) -> Dict[str, List[str]]:
    """
    Safe wrapper for generate_tone with fallback defaults.
    
    Args:
        traits: Dictionary with OCEAN trait scores
    
    Returns:
        Tone profile dictionary with guaranteed non-empty lists
    """
    try:
        tone_profile = generate_tone(traits)
        
        # Ensure all lists are non-empty with fallbacks
        if not tone_profile.get("style"):
            tone_profile["style"] = ["friendly", "clear"]
        
        if not tone_profile.get("strengths"):
            tone_profile["strengths"] = []
        
        if not tone_profile.get("cautions"):
            tone_profile["cautions"] = []
        
        return tone_profile
        
    except ValueError:
        # If traits are invalid, return safe defaults
        return {
            "style": ["friendly", "clear"],
            "strengths": [],
            "cautions": []
        }
    except Exception:
        # Any other error, return safe defaults
        return {
            "style": ["friendly", "clear"],
            "strengths": [],
            "cautions": []
        }

