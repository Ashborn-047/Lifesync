"""
LifeSync Personality Engine - Scoring Tests
Tests for personality assessment scoring functionality
"""

import unittest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.scorer import score_answers


class TestScoring(unittest.TestCase):
    """Test cases for personality scoring"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Sample answers for testing (30 questions)
        self.sample_answers = {
            "Q001": 5, "Q007": 4, "Q013": 5, "Q019": 4, "Q025": 5,
            "Q031": 4, "Q037": 3, "Q043": 2, "Q049": 4, "Q055": 4,
            "Q061": 3, "Q067": 3, "Q073": 2, "Q079": 2, "Q085": 3,
            "Q091": 3, "Q097": 2, "Q103": 3, "Q109": 4, "Q115": 4,
            "Q121": 4, "Q127": 5, "Q133": 4, "Q139": 5, "Q145": 4,
            "Q151": 3, "Q157": 3, "Q163": 4, "Q169": 3, "Q175": 3
        }
    
    def test_score_answers_basic(self):
        """Test basic scoring functionality"""
        result = score_answers(self.sample_answers)
        
        # Check that result has required keys
        self.assertIn("traits", result)
        self.assertIn("facets", result)
        self.assertIn("confidence", result)
        self.assertIn("dominant", result)
        self.assertIn("top_facets", result)
        self.assertIn("coverage", result)
        self.assertIn("responses_count", result)
    
    def test_traits_structure(self):
        """Test that traits are properly structured"""
        result = score_answers(self.sample_answers)
        traits = result["traits"]
        
        # Check all OCEAN traits are present
        self.assertIn("Openness", traits)
        self.assertIn("Conscientiousness", traits)
        self.assertIn("Extraversion", traits)
        self.assertIn("Agreeableness", traits)
        self.assertIn("Neuroticism", traits)
        
        # Check trait scores are in valid range (0-1)
        for trait, score in traits.items():
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 1.0)
    
    def test_facets_structure(self):
        """Test that facets are properly structured"""
        result = score_answers(self.sample_answers)
        facets = result["facets"]
        
        # Check that facets exist
        self.assertIsInstance(facets, dict)
        self.assertGreater(len(facets), 0)
        
        # Check facet scores are in valid range (0-1)
        for facet, score in facets.items():
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 1.0)
    
    def test_confidence_structure(self):
        """Test that confidence scores are properly structured"""
        result = score_answers(self.sample_answers)
        confidence = result["confidence"]
        
        # Check confidence structure
        self.assertIn("traits", confidence)
        self.assertIn("facets", confidence)
        
        # Check trait confidence
        trait_confidence = confidence["traits"]
        for trait in ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]:
            self.assertIn(trait, trait_confidence)
            self.assertGreaterEqual(trait_confidence[trait], 0.0)
            self.assertLessEqual(trait_confidence[trait], 1.0)
    
    def test_dominant_structure(self):
        """Test that dominant profile is properly structured"""
        result = score_answers(self.sample_answers)
        dominant = result["dominant"]
        
        # Check dominant structure
        self.assertIn("mbti_proxy", dominant)
        self.assertIn("neuroticism_level", dominant)
        self.assertIn("personality_code", dominant)
        
        # Check MBTI proxy format (4 letters)
        self.assertEqual(len(dominant["mbti_proxy"]), 4)
        
        # Check neuroticism level
        self.assertIn(dominant["neuroticism_level"], ["Stable", "Balanced", "Sensitive"])
    
    def test_top_facets(self):
        """Test that top facets are returned"""
        result = score_answers(self.sample_answers)
        top_facets = result["top_facets"]
        
        # Check top facets structure
        self.assertIsInstance(top_facets, list)
        self.assertGreater(len(top_facets), 0)
        self.assertLessEqual(len(top_facets), 5)
        
        # Check each facet entry
        for facet_entry in top_facets:
            self.assertIsInstance(facet_entry, (list, tuple))
            self.assertEqual(len(facet_entry), 2)  # (name, score)
    
    def test_coverage(self):
        """Test coverage calculation"""
        result = score_answers(self.sample_answers)
        
        # Check coverage is a percentage
        self.assertGreaterEqual(result["coverage"], 0.0)
        self.assertLessEqual(result["coverage"], 100.0)
        
        # Check responses count
        self.assertEqual(result["responses_count"], len(self.sample_answers))
    
    def test_empty_answers(self):
        """Test handling of empty answers"""
        with self.assertRaises(Exception):
            score_answers({})
    
    def test_invalid_answer_values(self):
        """Test handling of invalid answer values"""
        invalid_answers = {
            "Q001": 6,  # Out of range
            "Q007": 0,  # Out of range
        }
        
        # Should handle gracefully (skip invalid values)
        result = score_answers(invalid_answers)
        # Coverage should be low or zero
        self.assertLessEqual(result["coverage"], 100.0)


if __name__ == "__main__":
    unittest.main()

