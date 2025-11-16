"""
LifeSync Personality Engine - Supabase Client
Handles database operations for personality assessments
"""

import os
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    raise ImportError(
        "supabase package required. Install with: pip install supabase"
    )


class SupabaseClient:
    """Client for interacting with Supabase database"""
    
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        """
        Initialize Supabase client.
        
        Args:
            url: Supabase project URL (defaults to SUPABASE_URL env var)
            key: Supabase anon key (defaults to SUPABASE_KEY env var)
        """
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_KEY")
        
        if not self.url or not self.key:
            raise ValueError(
                "Supabase credentials required. Set SUPABASE_URL and SUPABASE_KEY "
                "environment variables or pass them as parameters."
            )
        
        self.client: Client = create_client(self.url, self.key)
    
    def create_assessment(
        self,
        quiz_type: str = "full"
    ) -> Dict[str, Any]:
        """
        Create a new personality assessment.
        
        Args:
            quiz_type: Type of quiz ('quick', 'standard', 'full')
        
        Returns:
            Assessment record with id
        """
        result = self.client.table("personality_assessments").insert({
            "quiz_type": quiz_type
        }).execute()
        
        return result.data[0] if result.data else {}
    
    def save_responses(
        self,
        assessment_id: str,
        answers: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """
        Save user responses to the database.
        
        Args:
            assessment_id: UUID of the assessment
            answers: Dictionary mapping question_id to response_value (1-5)
        
        Returns:
            List of saved response records
        """
        responses = [
            {
                "assessment_id": assessment_id,
                "question_id": q_id,
                "value": value
            }
            for q_id, value in answers.items()
        ]
        
        result = self.client.table("personality_responses").insert(
            responses
        ).execute()
        
        return result.data if result.data else []
    
    def save_scores(
        self,
        assessment_id: str,
        scores: Dict[str, Any],
        raw_responses: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Save computed personality scores to the assessment record.
        
        Args:
            assessment_id: UUID of the assessment
            scores: Dictionary containing:
                - traits: OCEAN trait scores
                - facets: Facet scores
                - confidence: Confidence scores
                - dominant: Dominant profile info
                - top_facets: Top facets list
                - coverage: Coverage percentage
                - responses_count: Number of responses
            raw_responses: Original response dictionary (for raw_scores JSONB)
        
        Returns:
            Updated assessment record
        """
        traits = scores.get("traits", {})
        facets = scores.get("facets", {})
        dominant = scores.get("dominant", {})
        
        # Prepare data matching the schema
        update_data = {
            "raw_scores": raw_responses,  # Store original responses as JSONB
            "trait_scores": traits,  # Store trait scores as JSONB
            "facet_scores": facets,  # Store facet scores as JSONB
            "mbti_code": dominant.get("mbti_proxy", "")  # Store MBTI code
        }
        
        result = self.client.table("personality_assessments").update(
            update_data
        ).eq("id", assessment_id).execute()
        
        return result.data[0] if result.data else {}
    
    def save_explanation(
        self,
        assessment_id: str,
        explanation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Save LLM-generated explanation.
        
        Args:
            assessment_id: UUID of the assessment
            explanation: Dictionary containing:
                - summary: Overview text (4-6 sentences)
                - strengths: Array of strengths (1-3 words each)
                - challenges: Array of challenges (1-3 words each)
                - steps: (legacy) Array of insights for backward compatibility
        
        Returns:
            Saved explanation record
        """
        import json
        
        # Store structured data as JSON
        # New persona format: persona_title, vibe_summary, strengths, growth_edges, how_you_show_up, tagline
        structured_data = {
            "persona_title": explanation.get("persona_title", ""),
            "vibe_summary": explanation.get("vibe_summary", ""),
            "strengths": explanation.get("strengths", []),
            "growth_edges": explanation.get("growth_edges", []),
            "how_you_show_up": explanation.get("how_you_show_up", ""),
            "tagline": explanation.get("tagline", ""),
            # Backward compatibility
            "summary": explanation.get("vibe_summary") or explanation.get("summary", ""),
            "challenges": explanation.get("growth_edges") or explanation.get("challenges", [])
        }
        
        # Create a readable text version for backward compatibility
        explanation_text = ""
        
        # Add persona title if available
        if explanation.get("persona_title"):
            explanation_text += f"{explanation.get('persona_title')}\n"
            if explanation.get("tagline"):
                explanation_text += f'"{explanation.get("tagline")}"\n'
            explanation_text += "\n"
        
        # Add vibe summary or summary
        if explanation.get("vibe_summary"):
            explanation_text += f"{explanation.get('vibe_summary')}\n\n"
        elif explanation.get("summary"):
            explanation_text += f"{explanation.get('summary')}\n\n"
        
        # Add "How You Show Up"
        if explanation.get("how_you_show_up"):
            explanation_text += f"How You Show Up:\n{explanation.get('how_you_show_up')}\n\n"
        
        # Add strengths
        strengths = explanation.get("strengths", [])
        if strengths:
            explanation_text += "Strengths:\n"
            for strength in strengths:
                explanation_text += f"• {strength}\n"
            explanation_text += "\n"
        
        # Add growth edges or challenges
        growth_edges = explanation.get("growth_edges", [])
        challenges = explanation.get("challenges", [])
        growth_areas = growth_edges if growth_edges else challenges
        if growth_areas:
            explanation_text += "Growth Edges:\n"
            for area in growth_areas:
                explanation_text += f"• {area}\n"
        
        # Legacy format for backward compatibility
        if explanation.get("steps") and not explanation.get("persona_title"):
            explanation_text += "\n\nKey Insights:\n"
            for i, step in enumerate(explanation.get("steps", []), 1):
                explanation_text += f"{i}. {step}\n"
        
        # Store both structured JSON and text
        explanation_data = {
            "assessment_id": assessment_id,
            "explanation": explanation_text,
            "explanation_data": json.dumps(structured_data)  # Store as JSONB if column exists
        }
        
        result = self.client.table("llm_explanations").insert(
            explanation_data
        ).execute()
        
        return result.data[0] if result.data else {}
    
    def get_assessment(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get assessment by ID - optimized to fetch only needed columns"""
        result = self.client.table("personality_assessments").select(
            "id,created_at,trait_scores,facet_scores,mbti_code"
        ).eq("id", assessment_id).execute()
        
        return result.data[0] if result.data else None
    
    def get_scores(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get scores for an assessment"""
        result = self.client.table("personality_scores").select("*").eq(
            "assessment_id", assessment_id
        ).execute()
        
        return result.data[0] if result.data else None
    
    def get_explanation(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get explanation for an assessment"""
        result = self.client.table("llm_explanations").select("*").eq(
            "assessment_id", assessment_id
        ).execute()
        
        return result.data[0] if result.data else None


def create_supabase_client(
    url: Optional[str] = None,
    key: Optional[str] = None
) -> SupabaseClient:
    """
    Factory function to create a Supabase client.
    
    Args:
        url: Optional Supabase URL
        key: Optional Supabase key
    
    Returns:
        SupabaseClient instance
    """
    return SupabaseClient(url=url, key=key)

