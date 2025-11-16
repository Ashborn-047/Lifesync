"""
LifeSync Personality Engine - Grok Provider
X.AI Grok LLM provider with HTTP API integration
"""

import time
import logging
import json
from typing import Optional
import httpx
from ..provider_base import LLMProviderBase
from ...utils.safe_json import safe_load_json
from .provider_failure import ProviderFailure

logger = logging.getLogger(__name__)


class GrokProvider(LLMProviderBase):
    """X.AI Grok LLM provider with safe JSON handling"""
    
    API_BASE_URL = "https://api.x.ai/v1"
    
    def __init__(self, model_name: str = "grok-beta", api_key: Optional[str] = None):
        """
        Initialize Grok provider.
        
        Args:
            model_name: Grok model name (default: "grok-beta")
            api_key: Grok API key
        """
        if not api_key:
            raise ValueError("Grok API key required")
        
        super().__init__(model_name, api_key)
        self.api_key = api_key
        self.client = httpx.Client(
            base_url=self.API_BASE_URL,
            timeout=60.0,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
        )
    
    def generate_content(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> str:
        """
        Generate content using Grok API.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters
        
        Returns:
            Generated text content
        """
        messages = [
            {"role": "system", "content": system_prompt or "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            **kwargs
        }
        
        try:
            response = self.client.post(
                "/chat/completions",
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            text = result["choices"][0]["message"]["content"].strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            return text.strip()
            
        except httpx.HTTPStatusError as e:
            error_msg = f"Grok API HTTP error: {e.response.status_code} - {e.response.text}"
            logger.error(error_msg)
            raise ProviderFailure("Grok", self.model_name, e, 0)
        except httpx.RequestError as e:
            error_msg = f"Grok API request error: {e}"
            logger.error(error_msg)
            raise ProviderFailure("Grok", self.model_name, e, 0)
        except Exception as e:
            logger.error(f"Grok API call failed: {e}")
            raise ProviderFailure("Grok", self.model_name, e, 0)
    
    def generate_explanation(
        self,
        traits: dict,
        facets: dict,
        confidence: dict,
        dominant: dict,
        system_prompt: Optional[str] = None,
        tone_profile: Optional[dict] = None
    ) -> dict:
        """
        Generate explanation with safe JSON parsing.
        
        Overrides base method for Grok-specific handling.
        """
        from ..templates import SYSTEM_PROMPT, get_personality_explanation_prompt
        
        system_prompt = system_prompt or SYSTEM_PROMPT
        user_prompt = get_personality_explanation_prompt(
            traits, facets, confidence, dominant, tone_profile=tone_profile
        )
        
        start_time = time.time()
        
        try:
            content = self.generate_content(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=2000
            )
            
            generation_time_ms = int((time.time() - start_time) * 1000)
            
            # Use safe JSON loader
            parsed_response = safe_load_json(content)
            
            # If safe_load_json returned an error dict, handle it
            if "error" in parsed_response:
                logger.error(f"Failed to parse Grok JSON: {parsed_response.get('error')}")
                return {
                    "summary": "Unable to parse LLM response. Please try again.",
                    "steps": [],
                    "confidence_note": "Response parsing failed.",
                    "model_name": self.model_name,
                    "tokens_used": None,
                    "generation_time_ms": generation_time_ms,
                    "error": parsed_response.get("error"),
                    "raw_response": parsed_response.get("raw", "")[:500]
                }
            
            return {
                "summary": parsed_response.get("summary", ""),
                "steps": parsed_response.get("steps", []),
                "confidence_note": parsed_response.get("confidence_note", ""),
                "model_name": self.model_name,
                "tokens_used": None,  # Grok API doesn't provide token count in response
                "generation_time_ms": generation_time_ms,
                "system_prompt": system_prompt,
                "user_payload": {
                    "traits": traits,
                    "facets": facets,
                    "confidence": confidence,
                    "dominant": dominant
                }
            }
            
        except ProviderFailure:
            raise
        except Exception as e:
            raise ProviderFailure("Grok", self.model_name, e, 0)
    
    def __del__(self):
        """Clean up HTTP client"""
        if hasattr(self, 'client'):
            try:
                self.client.close()
            except:
                pass

