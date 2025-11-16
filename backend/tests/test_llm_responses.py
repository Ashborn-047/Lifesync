"""
LifeSync Personality Engine - LLM Response Tests
Tests for LLM explanation generation (mocked)
"""

import unittest
import sys
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.llm import LLMClient, create_llm_client


class TestLLMResponses(unittest.TestCase):
    """Test cases for LLM explanation generation"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.sample_traits = {
            "Openness": 0.72,
            "Conscientiousness": 0.65,
            "Extraversion": 0.42,
            "Agreeableness": 0.71,
            "Neuroticism": 0.48
        }
        
        self.sample_facets = {
            "Fantasy": 0.75,
            "Aesthetics": 0.68,
            "Feelings": 0.70,
            "Actions": 0.65,
            "Ideas": 0.72
        }
        
        self.sample_confidence = {
            "traits": {
                "Openness": 0.85,
                "Conscientiousness": 0.80,
                "Extraversion": 0.75,
                "Agreeableness": 0.82,
                "Neuroticism": 0.78
            },
            "facets": {
                "Fantasy": 0.80,
                "Aesthetics": 0.75
            }
        }
        
        self.sample_dominant = {
            "mbti_proxy": "INFP",
            "neuroticism_level": "Balanced",
            "personality_code": "INFP-B"
        }
    
    @patch('src.llm.llm_client.openai.OpenAI')
    def test_llm_client_initialization(self, mock_openai):
        """Test LLM client initialization"""
        mock_client_instance = MagicMock()
        mock_openai.return_value = mock_client_instance
        
        client = create_llm_client(
            model_name="gpt-4",
            api_key="test-key"
        )
        
        self.assertIsInstance(client, LLMClient)
        self.assertEqual(client.model_name, "gpt-4")
        self.assertEqual(client.api_key, "test-key")
    
    @patch('src.llm.llm_client.openai.OpenAI')
    def test_generate_explanation_mock(self, mock_openai):
        """Test explanation generation with mocked LLM response"""
        # Mock OpenAI client
        mock_client_instance = MagicMock()
        mock_openai.return_value = mock_client_instance
        
        # Mock API response
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"summary": "Test summary", "steps": ["Step 1", "Step 2"], "confidence_note": "High confidence"}'
        mock_response.usage = MagicMock()
        mock_response.usage.total_tokens = 150
        
        mock_client_instance.chat.completions.create.return_value = mock_response
        
        # Create client
        client = create_llm_client(
            model_name="gpt-4",
            api_key="test-key"
        )
        
        # Generate explanation
        result = client.generate_explanation(
            traits=self.sample_traits,
            facets=self.sample_facets,
            confidence=self.sample_confidence,
            dominant=self.sample_dominant
        )
        
        # Verify result structure
        self.assertIn("summary", result)
        self.assertIn("steps", result)
        self.assertIn("confidence_note", result)
        self.assertIn("model_name", result)
        self.assertIn("tokens_used", result)
        self.assertIn("generation_time_ms", result)
        
        # Verify content
        self.assertEqual(result["summary"], "Test summary")
        self.assertEqual(result["steps"], ["Step 1", "Step 2"])
        self.assertEqual(result["confidence_note"], "High confidence")
        self.assertEqual(result["model_name"], "gpt-4")
        self.assertEqual(result["tokens_used"], 150)
        
        # Verify API was called correctly
        mock_client_instance.chat.completions.create.assert_called_once()
        call_args = mock_client_instance.chat.completions.create.call_args
        self.assertEqual(call_args.kwargs["model"], "gpt-4")
        self.assertEqual(call_args.kwargs["response_format"]["type"], "json_object")
    
    @patch('src.llm.llm_client.openai.OpenAI')
    def test_generate_explanation_invalid_json(self, mock_openai):
        """Test handling of invalid JSON response"""
        # Mock OpenAI client
        mock_client_instance = MagicMock()
        mock_openai.return_value = mock_client_instance
        
        # Mock API response with invalid JSON
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Not valid JSON"
        
        mock_client_instance.chat.completions.create.return_value = mock_response
        
        # Create client
        client = create_llm_client(
            model_name="gpt-4",
            api_key="test-key"
        )
        
        # Should raise ValueError for invalid JSON
        with self.assertRaises(ValueError):
            client.generate_explanation(
                traits=self.sample_traits,
                facets=self.sample_facets,
                confidence=self.sample_confidence,
                dominant=self.sample_dominant
            )
    
    @patch('src.llm.llm_client.openai.OpenAI')
    def test_generate_explanation_api_error(self, mock_openai):
        """Test handling of API errors"""
        # Mock OpenAI client
        mock_client_instance = MagicMock()
        mock_openai.return_value = mock_client_instance
        
        # Mock API error
        mock_client_instance.chat.completions.create.side_effect = Exception("API Error")
        
        # Create client
        client = create_llm_client(
            model_name="gpt-4",
            api_key="test-key"
        )
        
        # Should raise RuntimeError for API errors
        with self.assertRaises(RuntimeError):
            client.generate_explanation(
                traits=self.sample_traits,
                facets=self.sample_facets,
                confidence=self.sample_confidence,
                dominant=self.sample_dominant
            )
    
    def test_missing_api_key(self):
        """Test handling of missing API key"""
        import os
        original_key = os.environ.get("OPENAI_API_KEY")
        
        try:
            # Remove API key
            if "OPENAI_API_KEY" in os.environ:
                del os.environ["OPENAI_API_KEY"]
            
            # Should raise ValueError
            with self.assertRaises(ValueError):
                create_llm_client(api_key=None)
        finally:
            # Restore original key
            if original_key:
                os.environ["OPENAI_API_KEY"] = original_key


if __name__ == "__main__":
    unittest.main()

