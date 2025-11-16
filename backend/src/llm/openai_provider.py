"""
LifeSync Personality Engine - OpenAI Provider
"""

import time
import logging
from typing import Optional
from .provider_base import LLMProviderBase
from ..utils.safe_json import safe_load_json
from .providers.provider_failure import ProviderFailure

logger = logging.getLogger(__name__)


class OpenAIProvider(LLMProviderBase):
    """OpenAI LLM provider with safe JSON handling"""
    
    def __init__(self, model_name: str = "gpt-4o-mini", api_key: Optional[str] = None):
        """
        Initialize OpenAI provider.
        
        Args:
            model_name: OpenAI model name (default: "gpt-4o-mini")
            api_key: OpenAI API key
        """
        if not api_key:
            raise ValueError("OpenAI API key required")
        
        try:
            import openai
            self.client = openai.OpenAI(api_key=api_key)
        except ImportError:
            raise ImportError(
                "openai package required. Install with: pip install openai"
            )
        
        super().__init__(model_name, api_key)
    
    def generate_content(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs
    ) -> str:
        """
        Generate content using OpenAI.
        
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
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            text = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise ProviderFailure("OpenAI", self.model_name, e, 0)
    
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
        Generate explanation with token usage tracking and safe JSON parsing.
        
        Overrides base method to include token usage.
        """
        from .templates import SYSTEM_PROMPT, get_personality_explanation_prompt
        import time
        
        system_prompt = system_prompt or SYSTEM_PROMPT
        user_prompt = get_personality_explanation_prompt(
            traits, facets, confidence, dominant, tone_profile=tone_profile
        )
        
        start_time = time.time()
        
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            generation_time_ms = int((time.time() - start_time) * 1000)
            
            content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            content = content.strip()
            
            # Use safe JSON parser from base class
            from .provider_base import safe_json_parse
            try:
                parsed_response = safe_json_parse(content)
            except ValueError as e:
                logger.error(f"Failed to parse OpenAI JSON: {e}")
                return {
                    "summary": "Unable to parse LLM response. Please try again.",
                    "strengths": [],
                    "challenges": [],
                    "steps": [],
                    "confidence_note": "Response parsing failed.",
                    "model_name": self.model_name,
                    "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None,
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
            
        except ProviderFailure:
            raise
        except Exception as e:
            raise ProviderFailure("OpenAI", self.model_name, e, 0)
