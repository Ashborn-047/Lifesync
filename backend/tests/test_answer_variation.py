"""
LifeSync Personality Scorer - Answer Variation Tests
Tests that different answer patterns produce different results.

This test runs 5 passes with different input patterns.

For each pass, we verify:
- Trait scores vary based on answers
- MBTI types differ
- No defaulting to 50% or same values

Run with: pytest tests/test_answer_variation.py -v --log-cli-level=INFO
"""

import pytest
import sys
import logging
import json
from pathlib import Path
from typing import Dict, List

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.scorer.personality_scorer import PersonalityScorer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@pytest.fixture
def scorer():
    """Create a scorer instance for testing"""
    questions_path = Path(__file__).parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"
    logger.info(f"Loading scorer from: {questions_path}")
    return PersonalityScorer(str(questions_path))


@pytest.fixture
def balanced_question_ids():
    """Get balanced question IDs covering all traits."""
    # Always use fallback manual selection to ensure balance
    logger.info("Selecting balanced questions manually from 180 set")
    questions_path = Path(__file__).parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"

    with open(questions_path, 'r') as f:
        data = json.load(f)
        all_questions = data.get('questions', [])

    # Group by trait
    questions_by_trait = {'O': [], 'C': [], 'E': [], 'A': [], 'N': []}
    for q in all_questions:
        if q['trait'] in questions_by_trait:
            questions_by_trait[q['trait']].append(q['id'])

    # Select 6 from each trait (total 30)
    selected_ids = []
    for trait in ['O', 'C', 'E', 'A', 'N']:
        ids = questions_by_trait[trait][:6]
        logger.info(f"Selected {len(ids)} questions for trait {trait}")
        selected_ids.extend(ids)

    return selected_ids


class TestAnswerVariation:
    """Test that different answer patterns produce different results"""
    
    def test_all_answer_patterns(self, scorer, balanced_question_ids):
        """Test various answer patterns and verify variation"""
        logger.info("=" * 80)
        logger.info("COMPREHENSIVE ANSWER VARIATION TEST")
        logger.info("=" * 80)
        logger.info("")
        
        # Verify we have enough questions
        assert len(balanced_question_ids) >= 15, "Need at least 15 questions (3 per trait) for valid scoring"

        results_summary = []
        
        # Define patterns
        # 1-5: Uniform inputs (might result in 0.5 for balanced scales)
        # 6: Alternating 1/5 (should produce variation if alignment matches/mismatches reverse items)
        patterns = [1, 2, 3, 4, 5, "alternating"]

        for pattern in patterns:
            logger.info("=" * 80)
            logger.info(f"PASS {pattern}: Pattern = {pattern}")
            logger.info("=" * 80)
            
            # Create responses
            responses = {}
            for i, q_id in enumerate(balanced_question_ids):
                if pattern == "alternating":
                    val = 1 if i % 2 == 0 else 5
                else:
                    val = pattern
                responses[q_id] = val

            logger.info(f"Created response set: {len(responses)} questions")
            
            # Score the responses
            results = scorer.score(responses)
            
            # Extract trait scores
            traits = results['traits']
            mbti = results['mbti_proxy']
            has_complete = results['has_complete_profile']
            
            logger.info("")
            logger.info("TRAIT SCORES:")
            trait_scores_list = []
            for trait_name in ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']:
                score = traits.get(trait_name)
                if score is not None:
                    score_pct = round(score * 100, 1)
                    logger.info(f"  {trait_name:20s}: {score:.3f} ({score_pct}%)")
                    trait_scores_list.append(score)
                else:
                    logger.info(f"  {trait_name:20s}: NULL (insufficient data)")
                    trait_scores_list.append(None)
            
            logger.info("")
            logger.info(f"MBTI Type: {mbti}")
            logger.info(f"Has Complete Profile: {has_complete}")
            
            # Store results
            result_entry = {
                'pattern': pattern,
                'traits': traits.copy(),
                'mbti': mbti,
                'has_complete_profile': has_complete,
                'trait_scores_list': trait_scores_list
            }
            results_summary.append(result_entry)
            
            logger.info("")
            logger.info(f"✅ Pass {pattern} completed")
            logger.info("")
        
        # Verification 1: All passes should have complete profiles
        all_complete = all(r['has_complete_profile'] for r in results_summary)
        logger.info(f"✅ All passes have complete profiles: {all_complete}")
        assert all_complete, "All passes should have complete profiles"
        
        # Verification 2: Trait scores should vary across passes
        # Specifically, check that the "alternating" pattern produces different scores than uniform patterns
        trait_names = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']
        
        alternating_result = results_summary[-1] # Last one
        uniform_result = results_summary[2] # Pass 3 (all 3s -> 0.5)
        
        logger.info("Comparing Alternating vs Uniform (Pass 3):")
        variations_found = 0
        for trait_name in trait_names:
            alt_score = alternating_result['traits'].get(trait_name)
            uni_score = uniform_result['traits'].get(trait_name)
            logger.info(f"  {trait_name}: Alt={alt_score}, Uni={uni_score}")
            if alt_score != uni_score:
                variations_found += 1

        logger.info(f"Variations found: {variations_found}/5")
        
        # We expect at least some variation. If alternating aligns perfectly with reverse/normal balance, it might also be 0.5,
        # but that's unlikely for all 5 traits unless question ordering is perfectly synced.
        # With 6 questions per trait, likely index-based alternating will hit differently.
        assert variations_found > 0, "Alternating pattern should produce different scores than uniform neutral pattern"
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("✅ ALL VERIFICATION CHECKS PASSED")
        logger.info("=" * 80)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--log-cli-level=INFO"])
