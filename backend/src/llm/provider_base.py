"""
LifeSync Personality Engine - LLM Provider Base Class
Abstract base class for LLM providers
"""

import json
import re
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


def safe_json_parse(content: str) -> Dict[str, Any]:
    """
    Safely parse JSON from LLM response, extracting JSON from text if needed.
    
    Args:
        content: Raw content from LLM (may contain extra text before/after JSON)
    
    Returns:
        Parsed JSON dictionary
    
    Raises:
        ValueError: If no valid JSON can be found
    """
    # Try direct JSON parse first
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    
    # Try to extract JSON from text using regex
    # Look for JSON object pattern: { ... }
    json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
    matches = re.findall(json_pattern, content, re.DOTALL)
    
    for match in matches:
        try:
            parsed = json.loads(match)
            # Validate it has the expected structure (new or old format)
            if isinstance(parsed, dict) and (
                "persona_title" in parsed or 
                "vibe_summary" in parsed or 
                "summary" in parsed or 
                "strengths" in parsed or 
                "challenges" in parsed or
                "growth_edges" in parsed
            ):
                return parsed
        except json.JSONDecodeError:
            continue
    
    # Try to find JSON array pattern if object not found
    array_pattern = r'\[[^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*\]'
    matches = re.findall(array_pattern, content, re.DOTALL)
    
    for match in matches:
        try:
            parsed = json.loads(match)
            if isinstance(parsed, (dict, list)):
                return parsed if isinstance(parsed, dict) else {"data": parsed}
        except json.JSONDecodeError:
            continue
    
    # Last resort: try to extract anything that looks like JSON
    # Remove common markdown code blocks
    content_clean = re.sub(r'```json\s*', '', content)
    content_clean = re.sub(r'```\s*', '', content_clean)
    content_clean = content_clean.strip()
    
    # Try to find the first { and last }
    first_brace = content_clean.find('{')
    last_brace = content_clean.rfind('}')
    
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        json_str = content_clean[first_brace:last_brace + 1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass
    
    raise ValueError(f"Could not extract valid JSON from LLM response: {content[:200]}")


class LLMProviderBase(ABC):
    """Base class for LLM providers"""
    
    def __init__(self, model_name: str, api_key: str):
        """
        Initialize provider.
        
        Args:
            model_name: Model name to use
            api_key: API key for the provider
        """
        self.model_name = model_name
        self.api_key = api_key
        
        if not self.api_key:
            raise ValueError(f"API key required for {self.__class__.__name__}")
    
    @abstractmethod
    def generate_content(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """
        Generate content from prompt.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            **kwargs: Additional provider-specific parameters
        
        Returns:
            Generated text content
        """
        pass
    
    def generate_explanation(
        self,
        traits: Dict[str, float],
        facets: Dict[str, float],
        confidence: Dict[str, Any],
        dominant: Dict[str, str],
        system_prompt: Optional[str] = None,
        tone_profile: Optional[Dict[str, Any]] = None,
        persona: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate personality explanation.
        
        Args:
            traits: OCEAN trait scores
            facets: Facet scores
            confidence: Confidence scores
            dominant: Dominant profile information
            system_prompt: Optional custom system prompt
            tone_profile: Optional tone profile for communication style
            persona: Optional persona object
        
        Returns:
            Dictionary with explanation data
        """
        from .templates import SYSTEM_PROMPT, get_personality_explanation_prompt
        
        system_prompt = system_prompt or SYSTEM_PROMPT
        user_prompt = get_personality_explanation_prompt(
            traits, facets, confidence, dominant, tone_profile=tone_profile, persona=persona
        )
        
        start_time = time.time()
        
        try:
            # Generate content
            content = self.generate_content(
                prompt=user_prompt,
                system_prompt=system_prompt
            )
            
            generation_time_ms = int((time.time() - start_time) * 1000)
            
            # Parse JSON response - extract JSON from text if needed
            parsed_response = safe_json_parse(content)
            
            # New persona-based format
            persona_title = parsed_response.get("persona_title", "")
            vibe_summary = parsed_response.get("vibe_summary", "")
            strengths = parsed_response.get("strengths", [])
            growth_edges = parsed_response.get("growth_edges", [])
            how_you_show_up = parsed_response.get("how_you_show_up", "")
            tagline = parsed_response.get("tagline", "")
            
            # Backward compatibility: handle old format if new format not present
            if not persona_title and not vibe_summary:
                # Old format: {summary, strengths, challenges}
                summary = parsed_response.get("summary", "")
                old_strengths = parsed_response.get("strengths", [])
                old_challenges = parsed_response.get("challenges", [])
                
                # Convert old format to new format
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
                "challenges": growth_edges,  # Map growth_edges to challenges for old code
                "steps": steps,
                "confidence_note": "",
                "model_name": self.model_name,
                "tokens_used": None,  # Provider-specific
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

