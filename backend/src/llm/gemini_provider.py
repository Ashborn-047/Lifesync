"""
LifeSync Personality Engine - Gemini Provider
Production-ready with retry, backoff, and safe JSON handling
"""

import time
import logging
from typing import Optional, List
from .provider_base import LLMProviderBase
from ..utils.safe_json import safe_load_json
from .providers.provider_failure import ProviderFailure

logger = logging.getLogger(__name__)


class GeminiProvider(LLMProviderBase):
    """Google Gemini LLM provider with robust error handling"""
    
    # Default model and alternates
    DEFAULT_MODEL = "gemini-2.0-flash"
    ALTERNATE_MODELS = ["gemini-2.0-flash-exp"]
    
    # Retry configuration
    MAX_RETRIES = 5
    BACKOFF_SCHEDULE = [0.5, 1.0, 2.0, 4.0, 8.0]  # seconds
    
    def __init__(self, model_name: str = None, api_key: Optional[str] = None, alternate_models: Optional[List[str]] = None):
        """
        Initialize Gemini provider.
        
        Args:
            model_name: Primary Gemini model name (default: "gemini-2.0-flash")
            api_key: Gemini API key
            alternate_models: List of alternate models to try if primary fails
        """
        if not api_key:
            raise ValueError("Gemini API key required")
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self.genai = genai
        except ImportError:
            raise ImportError(
                "google-generativeai package required. Install with: pip install google-generativeai"
            )
        
        # Set model name
        model_name = model_name or self.DEFAULT_MODEL
        self.alternate_models = alternate_models or self.ALTERNATE_MODELS
        
        super().__init__(model_name, api_key)
        self.model = self.genai.GenerativeModel(model_name)
        self.models_tried = []
    
    def _try_model(self, model_name: str, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7, **kwargs) -> str:
        """
        Try generating content with a specific model.
        
        Args:
            model_name: Model to try
            prompt: User prompt
            system_prompt: System prompt
            temperature: Sampling temperature
            **kwargs: Additional parameters
        
        Returns:
            Generated text content
        
        Raises:
            ProviderFailure: If all retries fail
        """
        # Create model instance
        model = self.genai.GenerativeModel(model_name)
        
        # Combine prompts
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        last_error = None
        
        # Retry with exponential backoff
        for attempt in range(self.MAX_RETRIES):
            try:
                logger.debug(f"Gemini {model_name} attempt {attempt + 1}/{self.MAX_RETRIES}")
                
                response = model.generate_content(
                    full_prompt,
                    generation_config={
                        "temperature": temperature,
                        **kwargs
                    }
                )
                
                # Extract and sanitize text
                text = response.text.strip()
                
                # Remove markdown code blocks
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                
                text = text.strip()
                
                # Use safe JSON loader to validate
                parsed = safe_load_json(text)
                if "error" in parsed:
                    # JSON is malformed, but we got a response - log and continue
                    logger.warning(f"Gemini {model_name} returned malformed JSON, but got response")
                    # Still return the text, safe_load_json will have extracted what it could
                
                return text
                
            except Exception as e:
                last_error = e
                error_msg = str(e)
                
                # Log the error
                logger.warning(f"Gemini {model_name} attempt {attempt + 1} failed: {error_msg[:200]}")
                
                # Check if it's a quota/rate limit error
                if "429" in error_msg or "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
                    # For rate limits, wait longer
                    wait_time = self.BACKOFF_SCHEDULE[attempt] * 2
                    logger.info(f"Rate limit detected, waiting {wait_time}s before retry")
                    time.sleep(wait_time)
                else:
                    # Regular backoff
                    if attempt < self.MAX_RETRIES - 1:
                        wait_time = self.BACKOFF_SCHEDULE[attempt]
                        logger.debug(f"Waiting {wait_time}s before retry")
                        time.sleep(wait_time)
        
        # All retries failed
        raise ProviderFailure("Gemini", model_name, last_error, self.MAX_RETRIES)
    
    def generate_content(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_retries: int = None,  # Ignored, we use our own retry logic
        **kwargs
    ) -> str:
        """
        Generate content using Gemini with automatic model fallback.
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (combined with user prompt for Gemini)
            temperature: Sampling temperature
            max_retries: Ignored (we use internal retry logic)
            **kwargs: Additional parameters
        
        Returns:
            Generated text content (sanitized and trimmed)
        """
        models_to_try = [self.model_name] + self.alternate_models
        
        last_error = None
        
        for model_name in models_to_try:
            try:
                if model_name != self.model_name:
                    logger.info(f"Trying alternate Gemini model: {model_name}")
                
                result = self._try_model(model_name, prompt, system_prompt, temperature, **kwargs)
                self.models_tried.append(model_name)
                return result
                
            except ProviderFailure as e:
                last_error = e
                self.models_tried.append(model_name)
                logger.warning(f"Gemini model {model_name} failed: {e}")
                # Try next model
                continue
        
        # All models failed
        error_msg = f"All Gemini models failed. Tried: {', '.join(self.models_tried)}"
        if last_error:
            error_msg += f". Last error: {str(last_error)}"
        
        raise ProviderFailure("Gemini", "all models", last_error or Exception(error_msg), self.MAX_RETRIES)
    
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
        Generate explanation with proper error handling and safe JSON parsing.
        
        Overrides base method for Gemini-specific handling.
        """
        from .templates import SYSTEM_PROMPT, get_personality_explanation_prompt
        
        system_prompt = system_prompt or SYSTEM_PROMPT
        user_prompt = get_personality_explanation_prompt(
            traits, facets, confidence, dominant, tone_profile=tone_profile
        )
        
        start_time = time.time()
        
        try:
            content = self.generate_content(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7
            )
            
            generation_time_ms = int((time.time() - start_time) * 1000)
            
            # Use safe JSON parser from base class
            from .provider_base import safe_json_parse
            try:
                parsed_response = safe_json_parse(content)
            except ValueError as e:
                logger.error(f"Failed to parse Gemini JSON: {e}")
                # Return a structured response even if JSON is broken
                return {
                    "summary": "Unable to parse LLM response. Please try again.",
                    "strengths": [],
                    "challenges": [],
                    "steps": [],
                    "confidence_note": "Response parsing failed.",
                    "model_name": self.model_name,
                    "tokens_used": None,
                    "generation_time_ms": generation_time_ms,
                    "error": str(e),
                    "raw_response": content[:500]
                }
            
            # New persona-based format
            persona_title = parsed_response.get("persona_title", "")
            vibe_summary = parsed_response.get("vibe_summary", "")
            strengths = parsed_response.get("strengths", [])
            growth_edges = parsed_response.get("growth_edges", [])
            how_you_show_up = parsed_response.get("how_you_show_up", "")
            tagline = parsed_response.get("tagline", "")
            
            # Backward compatibility: handle old format if new format not present
            if not persona_title and not vibe_summary:
                summary = parsed_response.get("summary", "")
                old_strengths = parsed_response.get("strengths", [])
                old_challenges = parsed_response.get("challenges", [])
                
                if summary:
                    vibe_summary = summary
                if old_strengths:
                    strengths = old_strengths
                if old_challenges:
                    growth_edges = old_challenges
            
            # Convert to steps format for backward compatibility
            steps = []
            if strengths:
                steps.extend([f"Strength: {s}" for s in strengths])
            if growth_edges:
                steps.extend([f"Growth Edge: {g}" for g in growth_edges])
            
            # Build summary from new format for backward compatibility
            summary = vibe_summary or ""
            if how_you_show_up:
                summary += f"\n\n{how_you_show_up}"
            
            return {
                # New persona format
                "persona_title": persona_title,
                "vibe_summary": vibe_summary,
                "strengths": strengths,
                "growth_edges": growth_edges,
                "how_you_show_up": how_you_show_up,
                "tagline": tagline,
                # Backward compatibility fields
                "summary": summary,
                "challenges": growth_edges,
                "steps": steps,
                "confidence_note": "",
                "model_name": self.model_name,
                "tokens_used": None,  # Gemini doesn't provide token count in same way
                "generation_time_ms": generation_time_ms,
                "system_prompt": system_prompt,
                "user_payload": {
                    "traits": traits,
                    "facets": facets,
                    "confidence": confidence,
                    "dominant": dominant
                }
            }
            
        except ProviderFailure as e:
            raise e
        except Exception as e:
            raise ProviderFailure("Gemini", self.model_name, e, 0)
