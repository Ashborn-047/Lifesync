"""
LifeSync Personality Scorer Wrapper
Provides a simple interface to score personality assessments
"""

import json
import os
from pathlib import Path
from typing import Dict, Any
from .personality_scorer import PersonalityScorer


# Get the path to the question bank
_QUESTIONS_PATH = Path(__file__).parent.parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"

# Global scorer instance (lazy-loaded)
_scorer_instance = None


def _get_scorer() -> PersonalityScorer:
    """Get or create the scorer instance"""
    global _scorer_instance
    if _scorer_instance is None:
        if not _QUESTIONS_PATH.exists():
            raise FileNotFoundError(
                f"Question bank not found at {_QUESTIONS_PATH}. "
                "Please ensure lifesync_180_questions.json exists in data/question_bank/"
            )
        _scorer_instance = PersonalityScorer(str(_QUESTIONS_PATH))
    return _scorer_instance


def score_answers(answers: Dict[str, int]) -> Dict[str, Any]:
    """
    Score personality assessment answers and return traits, facets, confidence, and dominant profile.
    
    Args:
        answers: Dictionary mapping question_id to response value (1-5)
                Example: {"Q001": 4, "Q014": 2, "Q025": 5, ...}
    
    Returns:
        Dictionary containing:
        - traits: OCEAN trait scores (0-1 scale)
        - facets: 30 facet scores (0-1 scale)
        - confidence: Confidence scores for traits and facets
        - dominant: Dominant personality profile (MBTI proxy, neuroticism level, personality code)
        - top_facets: Top 5 highest-scoring facets
        - coverage: Percentage of questions answered
        - responses_count: Number of responses provided
    
    Example:
        >>> answers = {"Q001": 4, "Q007": 2, "Q013": 5}
        >>> result = score_answers(answers)
        >>> print(result['traits']['Openness'])
        0.72
    """
    scorer = _get_scorer()
    result = scorer.score(answers)
    
    # Format the response to match expected structure
    return {
        "traits": result["traits"],
        "facets": result["facets"],
        "confidence": {
            "traits": result["trait_confidence"],
            "facets": result["facet_confidence"]
        },
        "dominant": {
            "mbti_proxy": result["mbti_proxy"],
            "neuroticism_level": result["neuroticism_level"],
            "personality_code": result["personality_code"]
        },
        "top_facets": result["top_facets"],
        "coverage": result["coverage"],
        "responses_count": result["responses_count"]
    }


def validate_responses(answers: Dict[str, int]) -> Dict[str, Any]:
    """
    Validate that responses cover all traits evenly.
    
    Detects unbalanced question sets (e.g., all Openness questions).
    
    Args:
        answers: Dictionary mapping question_id to response value (1-5)
    
    Returns:
        Dictionary with validation results:
        {
            'is_valid': bool,
            'warnings': List[Dict],  # List of warning/error objects
            'coverage': Dict[str, int],  # Question count per trait
            'missing_traits': List[str]  # Traits with no questions
        }
    """
    scorer = _get_scorer()
    return scorer.validate_responses(answers)


def get_question_metadata() -> Dict[str, Any]:
    """
    Get metadata about the question bank (traits, facets, scale info).
    
    Returns:
        Dictionary with question bank metadata
    """
    scorer = _get_scorer()
    return {
        "traits": scorer.traits,
        "facets": scorer.facets,
        "scale": scorer.scale,
        "total_questions": len(scorer.questions)
    }

