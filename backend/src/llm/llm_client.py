"""
LifeSync Personality Engine - LLM Client
Handles communication with LLM providers for personality explanations
"""

import json
import os
import time
from typing import Dict, Any, Optional
from .templates import SYSTEM_PROMPT, get_personality_explanation_prompt


class LLMClient:
    """Client for interacting with LLM providers"""
    
    def __init__(self, model_name: str = "gpt-4", api_key: Optional[str] = None):
        """
        Initialize LLM client.
        
        Args:
            model_name: Name of the LLM model to use (default: "gpt-4")
            api_key: API key for the LLM provider (defaults to OPENAI_API_KEY env var)
        """
        self.model_name = model_name
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "API key required. Set OPENAI_API_KEY environment variable "
                "or pass api_key parameter."
            )
        
        # Initialize OpenAI client (default provider)
        try:
            import openai
            self.client = openai.OpenAI(api_key=self.api_key)
        except ImportError:
            raise ImportError(
                "openai package required. Install with: pip install openai"
            )
    
    def generate_explanation(
        self,
        traits: Dict[str, float],
        facets: Dict[str, float],
        confidence: Dict[str, Any],
        dominant: Dict[str, str],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate personality explanation using LLM.
        
        Args:
            traits: OCEAN trait scores
            facets: Facet scores
            confidence: Confidence scores
            dominant: Dominant profile information
            system_prompt: Optional custom system prompt
        
        Returns:
            Dictionary with:
            - summary: Overview of personality profile
            - steps: Array of key insights
            - confidence_note: Note about assessment reliability
            - model_name: Model used
            - tokens_used: Number of tokens consumed
            - generation_time_ms: Time taken in milliseconds
        """
        system_prompt = system_prompt or SYSTEM_PROMPT
        user_prompt = get_personality_explanation_prompt(
            traits, facets, confidence, dominant
        )
        
        start_time = time.time()
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=1000
            )
            
            generation_time_ms = int((time.time() - start_time) * 1000)
            
            # Parse JSON response
            content = response.choices[0].message.content
            parsed_response = json.loads(content)
            
            return {
                "summary": parsed_response.get("summary", ""),
                "steps": parsed_response.get("steps", []),
                "confidence_note": parsed_response.get("confidence_note", ""),
                "model_name": self.model_name,
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None,
                "generation_time_ms": generation_time_ms,
                "system_prompt": system_prompt,
                "user_payload": {
                    "traits": traits,
                    "facets": facets,
                    "confidence": confidence,
                    "dominant": dominant
                }
            }
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse LLM JSON response: {e}")
        except Exception as e:
            raise RuntimeError(f"LLM API call failed: {e}")


def create_llm_client(model_name: str = "gpt-4", api_key: Optional[str] = None) -> LLMClient:
    """
    Factory function to create an LLM client.
    
    Args:
        model_name: Name of the LLM model
        api_key: Optional API key (defaults to OPENAI_API_KEY env var)
    
    Returns:
        LLMClient instance
    """
    return LLMClient(model_name=model_name, api_key=api_key)

