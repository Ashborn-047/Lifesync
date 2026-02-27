"""
LifeSync Personality Engine - Explanation Route Tests
Integration tests for the generate_explanation endpoint
"""

import unittest
import sys
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
from fastapi.testclient import TestClient

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.api.server import app

class TestExplanationRoute(unittest.TestCase):
    """Test cases for the explanation route"""
    
    def setUp(self):
        self.client = TestClient(app)
        # Use a valid UUID for validation passing
        self.assessment_id = "123e4567-e89b-12d3-a456-426614174000"
        
    @patch("src.api.dependencies.get_db_client")
    @patch("src.api.routes.assessments.generate_explanation_with_tone")
    def test_generate_explanation_success(self, mock_generate, mock_get_db):
        # 1. Mock DB
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock assessment data returned by get_assessment_full
        mock_db.get_assessment_full.return_value = {
            "id": self.assessment_id,
            "trait_scores": {"Openness": 0.8},
            "facet_scores": {"Imagination": 0.7},
            "confidence": 0.9,
            "mbti_code": "INTJ",
            "personality_code": "INTJ-A"
        }
        
        # 2. Mock Generator
        mock_generate.return_value = {
            "summary": "You are a visionary...",
            "persona_title": "The Architect",
            "vibe_summary": "Cool and calculated",
            "strengths": ["Strategic thinking"],
            "growth_edges": ["Social spontaneity"],
            "how_you_show_up": "You show up as a leader.",
            "tagline": "Planning the future."
        }
        
        # 3. Call endpoint
        response = self.client.post(f"/v1/assessments/{self.assessment_id}/generate_explanation", json={"provider": "gemini"})
        
        # 4. Assertions
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["persona_title"], "The Architect")
        
        # Verify DB save was called
        mock_db.save_explanation.assert_called_once()
        
    @patch("src.api.dependencies.get_db_client")
    def test_generate_explanation_not_found(self, mock_get_db):
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock assessment not found (return None)
        mock_db.get_assessment_full.return_value = None
        
        # Use valid UUID but one that doesn't exist in DB
        valid_uuid_not_found = "123e4567-e89b-12d3-a456-426614174999"
        response = self.client.post(f"/v1/assessments/{valid_uuid_not_found}/generate_explanation")
        
        self.assertEqual(response.status_code, 404)

if __name__ == "__main__":
    unittest.main()
