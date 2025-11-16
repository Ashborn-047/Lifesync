"""
LifeSync Personality Engine - Integration Tests
Tests that all fixes work together end-to-end.

This test suite ensures that:
1. Questions endpoint returns balanced question sets
2. Assessment validation rejects unbalanced responses
3. Cache busting parameters work
4. Complete flow produces valid results with no 50% defaults
5. Null handling works throughout the pipeline

Run with: pytest tests/test_integration_fixes.py -v --log-cli-level=INFO
Note: Requires backend server to be running or use TestClient
"""

import pytest
import sys
import logging
import uuid
from pathlib import Path
from fastapi.testclient import TestClient

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.api.server import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

client = TestClient(app)


class TestIntegrationFixes:
    """Test that all fixes work together end-to-end"""
    
    def test_questions_endpoint_returns_balanced_set(self):
        """GET /v1/questions?limit=30 should return balanced questions"""
        logger.info("=" * 60)
        logger.info("TEST: Questions endpoint returns balanced set")
        logger.info("=" * 60)
        
        response = client.get("/v1/questions?limit=30")
        
        logger.info(f"Response status: {response.status_code}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        questions = data.get('questions', data) if isinstance(data, dict) else data
        
        logger.info(f"Total questions returned: {len(questions)}")
        
        # Count traits
        trait_counts = {}
        for q in questions:
            trait = q.get('trait', '')
            trait_counts[trait] = trait_counts.get(trait, 0) + 1
        
        logger.info("Trait distribution:")
        for trait, count in sorted(trait_counts.items()):
            logger.info(f"  {trait}: {count} questions")
        
        # Should have ~6 per trait (30 questions / 5 traits = 6 each)
        for trait in ['O', 'C', 'E', 'A', 'N']:
            count = trait_counts.get(trait, 0)
            logger.info(f"  Checking trait {trait}: {count} questions")
            assert 5 <= count <= 7, f"Trait {trait} has {count} questions (expected 5-7)"
        
        logger.info("✅ Test passed: Questions endpoint returns balanced set")
    
    def test_assessment_validation_rejects_unbalanced(self):
        """POST /v1/assessments should reject unbalanced question sets"""
        logger.info("=" * 60)
        logger.info("TEST: Assessment validation rejects unbalanced responses")
        logger.info("=" * 60)
        
        # Create unbalanced responses (only Openness questions - the bug scenario)
        unbalanced_responses = {f"Q{str(i).zfill(3)}": 4 for i in range(1, 31)}
        logger.info(f"Created unbalanced response set: {len(unbalanced_responses)} questions (all Openness)")
        
        request_body = {
            "user_id": str(uuid.uuid4()),
            "responses": unbalanced_responses,
            "quiz_type": "quick"
        }
        
        response = client.post("/v1/assessments", json=request_body)
        
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response body: {response.text[:200]}...")
        
        # Should reject with 400 Bad Request
        assert response.status_code == 400, f"Expected 400 (validation error), got {response.status_code}"
        
        response_data = response.json()
        detail = response_data.get('detail', '')
        logger.info(f"Error detail: {detail}")
        
        # Should mention unbalanced or validation
        assert 'unbalanced' in detail.lower() or 'validation' in detail.lower(), \
            f"Error should mention unbalanced/validation, got: {detail}"
        
        logger.info("✅ Test passed: Assessment validation correctly rejects unbalanced responses")
    
    def test_assessment_accepts_balanced_responses(self):
        """POST /v1/assessments should accept balanced question sets"""
        logger.info("=" * 60)
        logger.info("TEST: Assessment accepts balanced responses")
        logger.info("=" * 60)
        
        # First, get balanced questions
        questions_response = client.get("/v1/questions?limit=30")
        questions = questions_response.json()
        if isinstance(questions, dict) and 'questions' in questions:
            questions = questions['questions']
        
        logger.info(f"Got {len(questions)} balanced questions")
        
        # Create balanced responses
        balanced_responses = {q['id']: 4 for q in questions}
        logger.info(f"Created balanced response set: {len(balanced_responses)} questions")
        
        request_body = {
            "user_id": str(uuid.uuid4()),
            "responses": balanced_responses,
            "quiz_type": "quick"
        }
        
        response = client.post("/v1/assessments", json=request_body)
        
        logger.info(f"Response status: {response.status_code}")
        
        # Should accept and return results
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        result = response.json()
        logger.info(f"Assessment ID: {result.get('assessment_id')}")
        logger.info(f"MBTI: {result.get('dominant', {}).get('mbti_proxy')}")
        
        # Check traits
        traits = result.get('traits', {})
        logger.info("Trait scores:")
        for trait, score in traits.items():
            logger.info(f"  {trait}: {score}")
            assert score is not None, f"{trait} should not be null"
            assert 0 <= score <= 1, f"{trait} score should be between 0 and 1"
            # Should NOT be exactly 0.5 (the bug)
            assert abs(score - 0.5) > 0.01, f"{trait} should not be 0.5 (bug indicator), got {score}"
        
        # MBTI should be valid
        mbti = result.get('dominant', {}).get('mbti_proxy')
        assert mbti is not None, "MBTI should be generated"
        assert len(mbti) == 4, f"MBTI should be 4 letters, got {mbti}"
        assert 'X' not in mbti, f"MBTI should not contain 'X', got {mbti}"
        
        logger.info("✅ Test passed: Assessment correctly accepts balanced responses")
    
    def test_cache_busting_parameters_accepted(self):
        """Questions endpoint should accept cache-busting parameters"""
        logger.info("=" * 60)
        logger.info("TEST: Cache busting parameters")
        logger.info("=" * 60)
        
        # Request with cache-busting parameters
        response = client.get("/v1/questions?limit=30&v=2024-11-17-v2&t=1234567890")
        
        logger.info(f"Response status: {response.status_code}")
        assert response.status_code == 200, "Should accept cache-busting parameters"
        
        data = response.json()
        questions = data.get('questions', data) if isinstance(data, dict) else data
        logger.info(f"Questions returned: {len(questions)}")
        
        assert len(questions) > 0, "Should return questions"
        
        logger.info("✅ Test passed: Cache busting parameters accepted")
    
    def test_full_flow_no_50_percent_defaults(self):
        """Complete flow should produce varied scores (no 50% defaults)"""
        logger.info("=" * 60)
        logger.info("TEST: Full flow - no 50% defaults")
        logger.info("=" * 60)
        
        # Step 1: Get balanced questions
        questions_response = client.get("/v1/questions?limit=30")
        questions = questions_response.json()
        if isinstance(questions, dict) and 'questions' in questions:
            questions = questions['questions']
        
        logger.info(f"Step 1: Got {len(questions)} balanced questions")
        
        # Step 2: Create assessment with varied responses
        varied_responses = {}
        for i, q in enumerate(questions):
            # Vary responses: 1, 2, 3, 4, 5 in a pattern
            value = (i % 5) + 1
            varied_responses[q['id']] = value
        
        logger.info(f"Step 2: Created varied responses: {len(varied_responses)}")
        
        request_body = {
            "user_id": str(uuid.uuid4()),
            "responses": varied_responses,
            "quiz_type": "quick"
        }
        
        # Step 3: Submit assessment
        response = client.post("/v1/assessments", json=request_body)
        
        logger.info(f"Step 3: Assessment response status: {response.status_code}")
        assert response.status_code == 200, "Assessment should be accepted"
        
        result = response.json()
        traits = result.get('traits', {})
        
        logger.info("Step 4: Trait scores:")
        scores_list = []
        for trait, score in traits.items():
            logger.info(f"  {trait}: {score}")
            scores_list.append(score)
            assert score is not None, f"{trait} should not be null"
            assert 0 <= score <= 1, f"{trait} score should be between 0 and 1"
        
        # Check that we have variation (not all 0.5)
        unique_scores = set(round(s, 2) for s in scores_list)
        logger.info(f"Unique score values (rounded): {unique_scores}")
        
        # Should have at least 3 different score values (variation)
        assert len(unique_scores) >= 3, \
            f"Should have score variation, got only {len(unique_scores)} unique values: {unique_scores}"
        
        # Should NOT have 4 traits at exactly 0.5 (the bug)
        scores_at_50 = sum(1 for s in scores_list if abs(s - 0.5) < 0.01)
        logger.info(f"Scores at 50%: {scores_at_50}")
        assert scores_at_50 < 4, \
            f"Should not have 4 traits at 50% (bug indicator), got {scores_at_50}"
        
        logger.info("✅ Test passed: Full flow produces varied scores (no 50% defaults)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--log-cli-level=INFO"])

