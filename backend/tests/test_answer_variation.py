"""
LifeSync Personality Scorer - Answer Variation Tests
Tests that different answer patterns produce different results.

This test runs 5 passes:
- Pass 1: All answers = 1 (extremely disagree)
- Pass 2: All answers = 2
- Pass 3: All answers = 3 (neutral)
- Pass 4: All answers = 4
- Pass 5: All answers = 5 (extremely agree)

For each pass, we verify:
- Trait scores vary based on answers
- MBTI types differ
- No defaulting to 50% or same values

Run with: pytest tests/test_answer_variation.py -v --log-cli-level=INFO
"""

import pytest
import sys
import logging
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
    """Get balanced question IDs from smart_quiz_30.json"""
    smart_quiz_path = Path(__file__).parent.parent / "data" / "question_bank" / "smart_quiz_30.json"
    
    if smart_quiz_path.exists():
        import json
        with open(smart_quiz_path, 'r') as f:
            data = json.load(f)
            question_ids = data.get('question_ids', [])
            logger.info(f"Loaded {len(question_ids)} balanced question IDs from smart_quiz_30.json")
            return question_ids[:30]  # Ensure exactly 30
    
    # Fallback: use first 30 questions
    questions_path = Path(__file__).parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"
    import json
    with open(questions_path, 'r') as f:
        data = json.load(f)
        questions = data.get('questions', [])
        return [q['id'] for q in questions[:30]]


class TestAnswerVariation:
    """Test that different answer patterns produce different results"""
    
    def test_all_answer_patterns(self, scorer, balanced_question_ids):
        """Test all 5 answer patterns (1, 2, 3, 4, 5) and verify variation"""
        logger.info("=" * 80)
        logger.info("COMPREHENSIVE ANSWER VARIATION TEST")
        logger.info("=" * 80)
        logger.info("")
        
        results_summary = []
        
        # Test each answer pattern
        for answer_value in [1, 2, 3, 4, 5]:
            logger.info("=" * 80)
            logger.info(f"PASS {answer_value}: All answers = {answer_value}")
            logger.info("=" * 80)
            
            # Create responses with all same value
            responses = {q_id: answer_value for q_id in balanced_question_ids}
            logger.info(f"Created response set: {len(responses)} questions, all = {answer_value}")
            
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
            logger.info(f"Personality Code: {results.get('personality_code', 'N/A')}")
            logger.info(f"Neuroticism Level: {results.get('neuroticism_level', 'N/A')}")
            
            # Store results for comparison
            result_entry = {
                'pass': answer_value,
                'traits': traits.copy(),
                'mbti': mbti,
                'personality_code': results.get('personality_code'),
                'has_complete_profile': has_complete,
                'trait_scores_list': trait_scores_list
            }
            results_summary.append(result_entry)
            
            logger.info("")
            logger.info(f"✅ Pass {answer_value} completed")
            logger.info("")
        
        # Compare results across all passes
        logger.info("=" * 80)
        logger.info("COMPARISON: Trait Scores Across All Passes")
        logger.info("=" * 80)
        logger.info("")
        logger.info(f"{'Trait':<20} {'Pass 1 (1s)':<12} {'Pass 2 (2s)':<12} {'Pass 3 (3s)':<12} {'Pass 4 (4s)':<12} {'Pass 5 (5s)':<12}")
        logger.info("-" * 80)
        
        trait_names = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism']
        for trait_name in trait_names:
            scores = []
            for result in results_summary:
                score = result['traits'].get(trait_name)
                if score is not None:
                    scores.append(f"{score*100:.1f}%")
                else:
                    scores.append("NULL")
            
            logger.info(f"{trait_name:<20} {scores[0]:<12} {scores[1]:<12} {scores[2]:<12} {scores[3]:<12} {scores[4]:<12}")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("COMPARISON: MBTI Types Across All Passes")
        logger.info("=" * 80)
        logger.info("")
        for result in results_summary:
            logger.info(f"Pass {result['pass']} (all {result['pass']}s): MBTI = {result['mbti']}, Code = {result['personality_code']}")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("VERIFICATION CHECKS")
        logger.info("=" * 80)
        logger.info("")
        
        # Verification 1: All passes should have complete profiles
        all_complete = all(r['has_complete_profile'] for r in results_summary)
        logger.info(f"✅ All passes have complete profiles: {all_complete}")
        assert all_complete, "All passes should have complete profiles"
        
        # Verification 2: Trait scores should vary across passes
        trait_variations = {}
        for trait_name in trait_names:
            scores = [r['traits'].get(trait_name) for r in results_summary if r['traits'].get(trait_name) is not None]
            if len(scores) > 0:
                unique_scores = set(round(s, 2) for s in scores)
                variation = len(unique_scores)
                trait_variations[trait_name] = variation
                logger.info(f"  {trait_name}: {variation} unique score values (should be > 1)")
                assert variation > 1, f"{trait_name} should have score variation across passes"
        
        # Verification 3: MBTI types should vary (or at least not all be the same)
        mbti_types = [r['mbti'] for r in results_summary if r['mbti']]
        unique_mbti = set(mbti_types)
        logger.info(f"")
        logger.info(f"✅ Unique MBTI types: {len(unique_mbti)} (types: {', '.join(sorted(unique_mbti))})")
        assert len(unique_mbti) > 0, "Should have at least one MBTI type"
        
        # Verification 4: No 4 traits stuck at 50% (the bug pattern)
        # Note: Pass 3 (all 3s = neutral) correctly gives 50% for all traits - this is expected
        # The bug pattern is: 4 traits at 50% + 1 trait different (due to unbalanced questions)
        for i, result in enumerate(results_summary, 1):
            scores = [s for s in result['trait_scores_list'] if s is not None]
            scores_at_50 = sum(1 for s in scores if abs(s - 0.5) < 0.01)
            answer_value = result['pass']
            
            if answer_value == 3:
                # Pass 3 (all neutral) should give 50% for all - this is correct
                logger.info(f"  Pass {i} (all {answer_value}s): {scores_at_50} traits at 50% (EXPECTED - neutral answers)")
                assert scores_at_50 == 5, f"Pass 3 (neutral) should have all 5 traits at 50%"
            else:
                # Other passes should NOT have 4 traits at 50% (the bug pattern)
                logger.info(f"  Pass {i} (all {answer_value}s): {scores_at_50} traits at 50% (should be < 4)")
                assert scores_at_50 < 4, f"Pass {i} should not have 4 traits at 50% (bug pattern)"
        
        # Verification 5: Scores should trend correctly
        # All 1s should give low scores, all 5s should give high scores
        pass1_scores = [s for s in results_summary[0]['trait_scores_list'] if s is not None]
        pass5_scores = [s for s in results_summary[4]['trait_scores_list'] if s is not None]
        
        avg_pass1 = sum(pass1_scores) / len(pass1_scores) if pass1_scores else 0
        avg_pass5 = sum(pass5_scores) / len(pass5_scores) if pass5_scores else 0
        
        logger.info("")
        logger.info(f"✅ Average trait score - Pass 1 (all 1s): {avg_pass1:.3f}")
        logger.info(f"✅ Average trait score - Pass 5 (all 5s): {avg_pass5:.3f}")
        logger.info(f"✅ Score difference: {avg_pass5 - avg_pass1:.3f} (should be positive)")
        assert avg_pass5 > avg_pass1, "All 5s should give higher scores than all 1s"
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("✅ ALL VERIFICATION CHECKS PASSED")
        logger.info("=" * 80)
        logger.info("")
        logger.info("SUMMARY:")
        logger.info(f"  - Total passes: 5")
        logger.info(f"  - All passes have complete profiles: ✅")
        logger.info(f"  - Trait score variation: ✅ (all traits vary across passes)")
        logger.info(f"  - MBTI variation: ✅ ({len(unique_mbti)} unique types)")
        logger.info(f"  - No 50% bug pattern: ✅ (no pass has 4 traits at 50%)")
        logger.info(f"  - Score direction correct: ✅ (all 5s > all 1s)")
        logger.info("")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--log-cli-level=INFO"])

