"""
LifeSync Personality Engine - Assessments API Route
Handles assessment submission, scoring, and persistence

Updated to use optimized query methods (Fixes issue #11)
"""

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from src.ai.explanation_generator import generate_explanation_with_tone
from src.api.dependencies import get_supabase_client
from src.db.quota import quota_tracker
from src.supabase_client import SupabaseClient
from src.utils.validators import validate_assessment_id, sanitize_answers, validate_answers, sanitize_text
from src.llm.circuit_breaker import CircuitBreaker, with_circuit_breaker, CircuitBreakerOpenException

# Initialize Circuit Breaker for LLM calls
llm_circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60.0, name="llm_explanation")

logger = logging.getLogger(__name__)
router = APIRouter()

# Get limiter from app state - will be available at runtime
def get_limiter(request: Request):
    return request.app.state.limiter

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

class ExplanationRequest(BaseModel):
    """Request model for explanation generation"""
    provider: Optional[str] = None

    @field_validator('provider')
    @classmethod
    def sanitize_provider(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return sanitize_text(v)
        return v

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
async def get_assessment(assessment_id: str, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Get assessment data by assessment_id.

    Uses optimized query to fetch only needed fields (issue #11).
    """
    # Validate assessment_id format
    is_valid, error = validate_assessment_id(assessment_id)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    try:
        # Use optimized get_assessment method (fetches specific fields only)
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
async def generate_explanation(
    req: Request, 
    assessment_id: str, 
    payload: Optional[ExplanationRequest] = None,
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    Generate LLM explanation for an assessment.
    Rate limit: 10 generations per day and 2 per hour per IP address.
    """
    # Validate assessment_id
    is_valid, error = validate_assessment_id(assessment_id)
    if not is_valid:
        raise HTTPException(status_code=422, detail=error)

    # Apply rate limits (both day and hour limits)
    limiter = get_limiter(req)
    await limiter.check_for_limits(req, "10/day")
    await limiter.check_for_limits(req, "2/hour")

    # Check quota tracker (using IP address as identifier)
    user_identifier = req.client.host if req.client else "unknown"
    has_quota, error_msg = quota_tracker.check_quota(user_identifier)
    if not has_quota:
        raise HTTPException(status_code=429, detail=error_msg)

    try:
        # Use get_assessment_full to fetch all fields needed for explanation generation
        assessment = db.get_assessment_full(assessment_id)

        if not assessment:
            raise HTTPException(status_code=404, detail=f"Assessment {assessment_id} not found")
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
        
        provider = payload.provider if payload else None
        
        logger.info(f"Generating AI explanation for assessment {assessment_id} (Provider: {provider or 'default'})")
        
        
        # Call generator with circuit breaker protection
        @with_circuit_breaker(llm_circuit_breaker)
        async def protected_generate():
            return generate_explanation_with_tone(
                traits=traits,
                facets=facets,
                confidence=confidence_dict,
                dominant=dominant_dict,
                provider=provider
            )
        
        try:
            explanation = await protected_generate()
        except CircuitBreakerOpenException as e:
            logger.warning(f"Circuit breaker open for explanation: {e}")
            raise HTTPException(status_code=503, detail="AI service temporarily unavailable. Please try again later.")
        
        # Save generated explanation to DB
        db.save_explanation(assessment_id, explanation)

        # Record successful usage
        quota_tracker.record_usage(user_identifier)

        return explanation

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating explanation for {assessment_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insights: {str(e)}")

@router.get("/v1/assessments/{user_id}/history")
async def get_assessment_history(
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    db: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get assessment history for a user with pagination.

    Args:
        user_id: User ID
        page: Page number (default: 1)
        page_size: Items per page (default: 10)

    Returns:
        JSON object with data and pagination metadata
    """
    try:
        # Validate pagination params
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 10
        if page_size > 100:
            page_size = 100

        history = db.get_history(user_id, page=page, page_size=page_size)
        return history
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")
