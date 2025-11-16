"""
LifeSync Personality Scorer - Null Handling Tests
Tests that scorer returns null for insufficient data instead of defaulting to 0.5.

This test suite ensures that:
1. Traits with < 3 questions return null (not 0.5)
2. Traits with >= 3 questions return actual scores
3. MBTI is null when profile is incomplete
4. MBTI is generated when all traits have data
5. Top facets exclude null values

Run with: pytest tests/test_null_handling.py -v --log-cli-level=INFO
"""

import pytest
import sys
import logging
from pathlib import Path

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


class TestNullHandling:
    """Test that scorer returns null for insufficient data"""
    
    def test_insufficient_data_returns_null(self, scorer):
        """Traits with < 3 questions should return null (not 0.5)"""
        logger.info("=" * 60)
        logger.info("TEST: Insufficient data returns null")
        logger.info("=" * 60)
        
        # Only 2 Openness questions (below minimum of 3)
        responses = {'Q001': 4, 'Q002': 3}
        logger.info(f"Created response set: {len(responses)} questions (insufficient)")
        
        results = scorer.score(responses)
        
        logger.info("Trait scores:")
        for trait, score in results['traits'].items():
            logger.info(f"  {trait}: {score} (null={score is None})")
        
        logger.info(f"Has complete profile: {results['has_complete_profile']}")
        logger.info(f"Traits with data: {results['traits_with_data']}")
        
        # Openness should be null (only 2 questions, need 3)
        assert results['traits']['Openness'] is None, "Openness should be null with < 3 questions"
        assert results['traits']['Conscientiousness'] is None, "Conscientiousness should be null"
        assert results['traits']['Extraversion'] is None, "Extraversion should be null"
        assert results['traits']['Agreeableness'] is None, "Agreeableness should be null"
        assert results['traits']['Neuroticism'] is None, "Neuroticism should be null"
        assert results['has_complete_profile'] == False, "Profile should be incomplete"
        assert len(results['traits_with_data']) == 0, "No traits should have sufficient data"
        
        logger.info("✅ Test passed: Null returned for insufficient data")
    
    def test_sufficient_data_returns_score(self, scorer):
        """Traits with >= 3 questions should return actual score"""
        logger.info("=" * 60)
        logger.info("TEST: Sufficient data returns score")
        logger.info("=" * 60)
        
        # 3 Openness questions (meets minimum)
        responses = {'Q001': 5, 'Q002': 5, 'Q003': 5}
        logger.info(f"Created response set: {len(responses)} questions (sufficient for Openness)")
        
        results = scorer.score(responses)
        
        logger.info("Trait scores:")
        for trait, score in results['traits'].items():
            logger.info(f"  {trait}: {score} (null={score is None})")
        
        # Openness should have a score (should be > 0 since all answers are 5)
        assert results['traits']['Openness'] is not None, "Openness should have a score"
        assert 0 < results['traits']['Openness'] <= 1.0, f"Openness should be positive, got {results['traits']['Openness']}"
        
        # Other traits should be null
        assert results['traits']['Conscientiousness'] is None, "Conscientiousness should be null"
        assert results['traits']['Extraversion'] is None, "Extraversion should be null"
        assert results['traits']['Agreeableness'] is None, "Agreeableness should be null"
        assert results['traits']['Neuroticism'] is None, "Neuroticism should be null"
        
        logger.info("✅ Test passed: Score returned for sufficient data")
    
    def test_mbti_null_without_complete_profile(self, scorer):
        """MBTI should be null if any trait is null"""
        logger.info("=" * 60)
        logger.info("TEST: MBTI null with incomplete profile")
        logger.info("=" * 60)
        
        # Partial data (only Openness)
        responses = {
            'Q001': 4, 'Q002': 4, 'Q003': 4,  # Openness only (3 questions)
        }
        logger.info(f"Created partial response set: {len(responses)} questions")
        
        results = scorer.score(responses)
        
        logger.info(f"MBTI proxy: {results['mbti_proxy']}")
        logger.info(f"Personality code: {results['personality_code']}")
        logger.info(f"Neuroticism level: {results['neuroticism_level']}")
        logger.info(f"Has complete profile: {results['has_complete_profile']}")
        
        assert results['mbti_proxy'] is None, "MBTI should be null with incomplete profile"
        assert results['personality_code'] is None, "Personality code should be null"
        assert results['neuroticism_level'] is None, "Neuroticism level should be null"
        assert results['has_complete_profile'] == False, "Profile should be incomplete"
        
        logger.info("✅ Test passed: MBTI correctly null for incomplete profile")
    
    def test_mbti_generated_with_complete_profile(self, scorer):
        """MBTI should be generated when all traits have sufficient data"""
        logger.info("=" * 60)
        logger.info("TEST: MBTI generated with complete profile")
        logger.info("=" * 60)
        
        # Balanced complete set (6 questions per trait)
        responses = {
            # Openness (6 questions)
            'Q001': 5, 'Q002': 5, 'Q003': 5, 'Q004': 5, 'Q005': 5, 'Q006': 5,
            # Conscientiousness (6 questions)
            'Q037': 4, 'Q038': 4, 'Q039': 4, 'Q040': 4, 'Q041': 4, 'Q042': 4,
            # Extraversion (6 questions)
            'Q073': 5, 'Q074': 5, 'Q075': 5, 'Q076': 5, 'Q077': 5, 'Q078': 5,
            # Agreeableness (6 questions)
            'Q109': 5, 'Q110': 5, 'Q111': 5, 'Q112': 5, 'Q113': 5, 'Q114': 5,
            # Neuroticism (6 questions, low scores)
            'Q145': 2, 'Q146': 2, 'Q147': 2, 'Q148': 2, 'Q149': 2, 'Q150': 2,
        }
        logger.info(f"Created complete balanced set: {len(responses)} questions (6 per trait)")
        
        results = scorer.score(responses)
        
        logger.info("Trait scores:")
        for trait, score in results['traits'].items():
            logger.info(f"  {trait}: {score}")
        
        logger.info(f"MBTI proxy: {results['mbti_proxy']}")
        logger.info(f"Personality code: {results['personality_code']}")
        logger.info(f"Neuroticism level: {results['neuroticism_level']}")
        logger.info(f"Has complete profile: {results['has_complete_profile']}")
        logger.info(f"Traits with data: {results['traits_with_data']}")
        
        assert results['has_complete_profile'] == True, "Profile should be complete"
        assert results['mbti_proxy'] is not None, "MBTI should be generated"
        assert len(results['mbti_proxy']) == 4, f"MBTI should be 4 letters, got {results['mbti_proxy']}"
        assert 'X' not in results['mbti_proxy'], f"MBTI should not contain 'X', got {results['mbti_proxy']}"
        assert results['personality_code'] is not None, "Personality code should be generated"
        assert results['neuroticism_level'] is not None, "Neuroticism level should be generated"
        
        # All traits should have scores
        for trait, score in results['traits'].items():
            assert score is not None, f"{trait} should have a score"
            assert 0 <= score <= 1, f"{trait} score should be between 0 and 1"
        
        logger.info("✅ Test passed: MBTI correctly generated for complete profile")
    
    def test_top_facets_exclude_null(self, scorer):
        """Top facets should only include facets with data (exclude null)"""
        logger.info("=" * 60)
        logger.info("TEST: Top facets exclude null values")
        logger.info("=" * 60)
        
        # Only Openness questions (3 questions)
        responses = {'Q001': 5, 'Q002': 5, 'Q003': 5}
        logger.info(f"Created response set: {len(responses)} questions (Openness only)")
        
        results = scorer.score(responses)
        
        logger.info(f"Top facets count: {len(results['top_facets'])}")
        for facet_name, score in results['top_facets']:
            logger.info(f"  {facet_name}: {score}")
        
        # Should only show Openness facets (no null values)
        assert len(results['top_facets']) > 0, "Should have some top facets"
        for facet_name, score in results['top_facets']:
            assert score is not None, f"Facet {facet_name} should not be null"
            assert 0 <= score <= 1, f"Facet {facet_name} score should be between 0 and 1"
        
        logger.info("✅ Test passed: Top facets correctly exclude null values")
    
    def test_facet_scores_handle_null(self, scorer):
        """Facet scores should be null when no questions answered for that facet"""
        logger.info("=" * 60)
        logger.info("TEST: Facet scores handle null")
        logger.info("=" * 60)
        
        # Only 3 Openness questions (limited facet coverage)
        responses = {'Q001': 4, 'Q002': 4, 'Q003': 4}
        logger.info(f"Created response set: {len(responses)} questions")
        
        results = scorer.score(responses)
        
        # Count null vs non-null facets
        null_facets = [k for k, v in results['facets'].items() if v is None]
        non_null_facets = [k for k, v in results['facets'].items() if v is not None]
        
        logger.info(f"Total facets: {len(results['facets'])}")
        logger.info(f"Non-null facets: {len(non_null_facets)}")
        logger.info(f"Null facets: {len(null_facets)}")
        
        # Should have some null facets (facets not covered by the 3 questions)
        assert len(null_facets) > 0, "Should have some null facets"
        assert len(non_null_facets) > 0, "Should have some non-null facets (Openness facets)"
        
        # All non-null facets should have valid scores
        for facet, score in results['facets'].items():
            if score is not None:
                assert 0 <= score <= 1, f"Facet {facet} score should be between 0 and 1"
        
        logger.info("✅ Test passed: Facet scores correctly handle null")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--log-cli-level=INFO"])

