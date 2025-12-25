"""
LifeSync Personality Scorer - Validation Tests
Tests for validation logic that prevents unbalanced question sets.

This test suite ensures that:
1. Unbalanced question sets (e.g., all Openness questions) are detected
2. Balanced question sets pass validation
3. Low coverage warnings are generated appropriately
4. Invalid question IDs are caught

Run with: pytest tests/test_scorer_validation.py -v --log-cli-level=INFO
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


class TestScorerValidation:
    """Test validation logic prevents unbalanced question sets"""
    
    def test_unbalanced_questions_detected(self, scorer):
        """Should detect when only one trait has questions (the bug scenario)"""
        logger.info("=" * 60)
        logger.info("TEST: Unbalanced questions detection (bug scenario)")
        logger.info("=" * 60)
        
        # Only Openness questions (the bug scenario - Q001-Q030 are all Openness)
        unbalanced = {f"Q{str(i).zfill(3)}": 4 for i in range(1, 31)}
        logger.info(f"Created unbalanced response set: {len(unbalanced)} questions, all Openness")
        
        validation = scorer.validate_responses(unbalanced)
        
        logger.info(f"Validation result: is_valid={validation['is_valid']}")
        logger.info(f"Coverage: {validation['coverage']}")
        logger.info(f"Warnings count: {len(validation['warnings'])}")
        for warning in validation['warnings']:
            logger.info(f"  - {warning['severity']}: {warning['message']}")
        
        assert validation['is_valid'] == False, "Unbalanced set should be invalid"
        assert len(validation['warnings']) >= 4, "Should have warnings for 4 missing traits"
        assert validation['coverage']['O'] == 30, "Openness should have 30 questions"
        assert validation['coverage'].get('C', 0) == 0, "Conscientiousness should have 0 questions"
        assert validation['coverage'].get('E', 0) == 0, "Extraversion should have 0 questions"
        assert validation['coverage'].get('A', 0) == 0, "Agreeableness should have 0 questions"
        assert validation['coverage'].get('N', 0) == 0, "Neuroticism should have 0 questions"
        
        logger.info("✅ Test passed: Unbalanced questions correctly detected")
    
    def test_balanced_questions_pass_validation(self, scorer):
        """Should pass validation with balanced questions from smart_30.json"""
        logger.info("=" * 60)
        logger.info("TEST: Balanced questions validation")
        logger.info("=" * 60)
        
        # Balanced set from smart_quiz_30.json (6 questions per trait)
        balanced = {
            'Q001': 4, 'Q007': 3, 'Q013': 5, 'Q019': 4, 'Q025': 5, 'Q031': 3,
            'Q037': 4, 'Q043': 3, 'Q049': 4, 'Q055': 5, 'Q061': 3, 'Q067': 4,
            'Q073': 2, 'Q079': 2, 'Q085': 3, 'Q091': 3, 'Q097': 2, 'Q103': 3,
            'Q109': 4, 'Q115': 4, 'Q121': 4, 'Q127': 5, 'Q133': 4, 'Q139': 5,
            'Q145': 4, 'Q151': 3, 'Q157': 3, 'Q163': 4, 'Q169': 3, 'Q175': 3
        }
        logger.info(f"Created balanced response set: {len(balanced)} questions")
        
        validation = scorer.validate_responses(balanced)
        
        logger.info(f"Validation result: is_valid={validation['is_valid']}")
        logger.info(f"Coverage: {validation['coverage']}")
        logger.info(f"Warnings count: {len(validation['warnings'])}")
        
        assert validation['is_valid'] == True, "Balanced set should be valid"
        assert len([w for w in validation['warnings'] if w['severity'] == 'error']) == 0, "Should have no errors"
        
        # Each trait should have 6 questions
        for trait in ['O', 'C', 'E', 'A', 'N']:
            count = validation['coverage'].get(trait, 0)
            logger.info(f"  Trait {trait}: {count} questions")
            assert count == 6, f"Trait {trait} should have 6 questions, got {count}"
        
        logger.info("✅ Test passed: Balanced questions correctly validated")
    
    def test_low_coverage_warning(self, scorer):
        """Should warn when trait has < 3 questions (below minimum threshold)"""
        logger.info("=" * 60)
        logger.info("TEST: Low coverage warning")
        logger.info("=" * 60)
        
        # 2 questions for Openness (below threshold of 3)
        low_coverage = {'Q001': 4, 'Q002': 3}
        logger.info(f"Created low coverage set: {len(low_coverage)} questions")
        
        validation = scorer.validate_responses(low_coverage)
        
        logger.info(f"Validation result: is_valid={validation['is_valid']}")
        logger.info(f"Coverage: {validation['coverage']}")
        
        warnings = [w for w in validation['warnings'] if w['type'] == 'low_coverage']
        logger.info(f"Low coverage warnings: {len(warnings)}")
        for warning in warnings:
            logger.info(f"  - {warning['message']}")
        
        assert len(warnings) > 0, "Should have low coverage warnings"
        assert warnings[0]['count'] == 2, "Should report 2 questions for Openness"
        assert warnings[0]['trait'] == 'O', "Warning should be for Openness"
        
        logger.info("✅ Test passed: Low coverage correctly warned")
    
    def test_invalid_question_ids(self, scorer):
        """Should detect invalid question IDs"""
        logger.info("=" * 60)
        logger.info("TEST: Invalid question IDs detection")
        logger.info("=" * 60)
        
        invalid = {'Q999': 4, 'INVALID': 3, 'Q001': 5}  # Mix of invalid and valid
        logger.info(f"Created response set with invalid IDs: {list(invalid.keys())}")
        
        validation = scorer.validate_responses(invalid)
        
        logger.info(f"Validation result: is_valid={validation['is_valid']}")
        logger.info(f"Valid responses: {validation['valid_responses']}/{validation['total_responses']}")
        
        errors = [w for w in validation['warnings'] if w['type'] == 'invalid_question_ids']
        logger.info(f"Invalid question ID errors: {len(errors)}")
        for error in errors:
            logger.info(f"  - {error['message']}")
        
        assert validation['is_valid'] == False, "Should be invalid due to invalid question IDs"
        assert len(errors) > 0, "Should have errors for invalid question IDs"
        assert validation['valid_responses'] == 1, "Only Q001 should be valid"
        
        logger.info("✅ Test passed: Invalid question IDs correctly detected")
    
    def test_empty_responses(self, scorer):
        """Should handle empty response set"""
        logger.info("=" * 60)
        logger.info("TEST: Empty responses")
        logger.info("=" * 60)
        
        empty = {}
        logger.info("Created empty response set")
        
        validation = scorer.validate_responses(empty)
        
        logger.info(f"Validation result: is_valid={validation['is_valid']}")
        logger.info(f"Coverage: {validation['coverage']}")
        logger.info(f"Missing traits: {validation['missing_traits']}")
        
        assert validation['is_valid'] == False, "Empty set should be invalid"
        assert len(validation['missing_traits']) == 5, "All 5 traits should be missing"
        assert sum(validation['coverage'].values()) == 0, "Total coverage should be 0"
        
        logger.info("✅ Test passed: Empty responses correctly handled")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--log-cli-level=INFO"])

