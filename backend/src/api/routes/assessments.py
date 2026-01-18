"""
LifeSync Personality Engine - Assessments API Route
Handles assessment submission, scoring, and persistence
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import logging

from src.supabase_client import create_supabase_client
from src.ai.explanation_generator import generate_explanation_with_tone

logger = logging.getLogger(__name__)
router = APIRouter()

class OceanScores(BaseModel):
    O: float
    C: float
    E: float
    A: float
    N: float

class AssessmentMetadata(BaseModel):
    quiz_type: str
    engine_version: str
    scoring_version: str
    timestamp: float
    is_fallback: bool = False
    platform: Optional[str] = None

class AssessmentResponse(BaseModel):
    """Response model for scored assessment - Canonical Contract"""
    ocean: OceanScores
    persona_id: str
    mbti_proxy: str
    confidence: float
    metadata: AssessmentMetadata
    
    # Optional detailed data
    assessment_id: str # Keep at top level for convenience
    traits: Optional[Dict[str, Optional[float]]] = None
    facets: Optional[Dict[str, Optional[float]]] = None
    dominant: Dict[str, Any] = Field(default_factory=dict)
    is_complete: bool = False
    needs_retake: bool = False
    needs_retake_reason: Optional[str] = None
    traits_with_data: list = []
@router.get("/v1/assessments/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: str):
    """
    Get assessment data by assessment_id.
    """
    try:
        db = create_supabase_client()
        # Fetch with full details
        assessment = db.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail=f"Assessment {assessment_id} not found")
        
        # 🟢 Map trait_scores/facet_scores from DB (jsonb) to the expected response fields
        traits = assessment.get("trait_scores", {}) or {}
        facets = assessment.get("facet_scores", {}) or {}
        
        # Determine completion
        is_complete = assessment.get("is_complete") or (len(traits) >= 5)
        
        # 🟢 Reconstruct OCEAN for the canonical model
        # The DB now stores short keys {"O": 50.0}, previously {"Openness": 0.8}
        # Model expects {"O": 0.8} (0-1 scale)
        def get_trait(short, long):
            val = traits.get(short)
            if val is not None:
                return float(val) / 100.0 if val > 1.0 else float(val)
            return float(traits.get(long, 0.0))

        ocean = {
            "O": get_trait("O", "Openness"),
            "C": get_trait("C", "Conscientiousness"),
            "E": get_trait("E", "Extraversion"),
            "A": get_trait("A", "Agreeableness"),
            "N": get_trait("N", "Neuroticism")
        }
        
        # Reconstruct metadata
        metadata_raw = assessment.get("metadata", {}) or {}
        metadata = {
            "quiz_type": metadata_raw.get("quiz_type") or assessment.get("quiz_type", "full"),
            "engine_version": metadata_raw.get("engine_version", "2.0.0"),
            "scoring_version": assessment.get("scoring_version") or metadata_raw.get("scoring_version", "v1"),
            "timestamp": metadata_raw.get("timestamp") or 0.0
        }

        # 🟢 Construct Response (Canonical)
        response_model = {
            "ocean": ocean,
            "persona_id": assessment.get("persona_id", "unknown"),
            "mbti_proxy": assessment.get("mbti_code") or "UNKN",
            "confidence": assessment.get("confidence") or 0.0,
            "metadata": metadata,
            
            # Additional Context for SDK
            "assessment_id": assessment_id,
            "traits": traits,
            "facets": facets,
            "dominant": {
                "mbti_proxy": assessment.get("mbti_code"),
                "personality_code": f"{assessment.get('mbti_code')}-X" if assessment.get('mbti_code') else "UNKN-X"
            },
            "is_complete": is_complete,
            "traits_with_data": list(traits.keys()) if traits else []
        }
        
        return response_model

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching assessment {assessment_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve assessment data")

@router.post("/v1/assessments/{assessment_id}/generate_explanation")
async def generate_explanation(assessment_id: str, payload: Optional[Dict[str, Any]] = None):
    """
    Generate LLM explanation for an assessment.
    """
    try:
        db = create_supabase_client()
        # Fetch assessment data with full detail for generator (use service role)
        client = db.service_client or db.client
        assessment_resp = client.table("personality_assessments").select("*").eq("id", assessment_id).execute()
        
        if not assessment_resp.data:
            raise HTTPException(status_code=404, detail=f"Assessment {assessment_id} not found")
        
        assessment = assessment_resp.data[0]
        trait_scores = assessment.get("trait_scores", {}) or {}
        facets = assessment.get("facet_scores", {}) or {}
        confidence_val = assessment.get("confidence") or 0.0
        mbti_code = assessment.get("mbti_code") or "UNKN"

        # 🟢 Map short trait keys (0-100) to full names (0-1) for AI generator
        def map_trait(val):
            if val is None: return 0.0
            return float(val) / 100.0 if val > 1.0 else float(val)

        traits = {
            "Openness": map_trait(trait_scores.get("O") or trait_scores.get("Openness")),
            "Conscientiousness": map_trait(trait_scores.get("C") or trait_scores.get("Conscientiousness")),
            "Extraversion": map_trait(trait_scores.get("E") or trait_scores.get("Extraversion")),
            "Agreeableness": map_trait(trait_scores.get("A") or trait_scores.get("Agreeableness")),
            "Neuroticism": map_trait(trait_scores.get("N") or trait_scores.get("Neuroticism"))
        }
        
        # Prepare context for generator
        confidence_dict = {"global": confidence_val}
        dominant_dict = {
            "mbti_proxy": mbti_code,
            "personality_code": assessment.get("personality_code") or f"{mbti_code}-X"
        }
        
        provider = payload.get("provider") if payload else None
        
        logger.info(f"Generating AI explanation for assessment {assessment_id} (Provider: {provider or 'default'})")
        
        # Call generator
        explanation = generate_explanation_with_tone(
            traits=traits,
            facets=facets,
            confidence=confidence_dict,
            dominant=dominant_dict,
            provider=provider
        )
        
        # Save generated explanation to DB
        db.save_explanation(assessment_id, explanation)
        
        return explanation

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating explanation for {assessment_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insights: {str(e)}")

@router.get("/v1/assessments/{user_id}/history")
async def get_assessment_history(user_id: str):
    """
    Get assessment history for a user.
    """
    try:
        db = create_supabase_client()
        history = db.get_history(user_id)
        return history
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")
