"""
LifeSync Personality Engine - Assessments API Route
Handles assessment submission, scoring, and persistence
"""

import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from src.supabase_client import create_supabase_client
from src.scorer.personality_scorer import PersonalityScorer
from src.api.routes.questions import _load_questions  # Helper to resolve data path implicitly

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Scorer
# We use the same path resolution logic as questions.py
from pathlib import Path
backend_dir = Path(__file__).parent.parent.parent.parent
questions_file = backend_dir / "data" / "question_bank" / "lifesync_180_questions.json"
scorer = PersonalityScorer(str(questions_file))

class AssessmentRequest(BaseModel):
    """Request model for submitting an assessment"""
    responses: Dict[str, int] = Field(..., description="Map of Question ID to Answer (1-5)")
    quiz_type: str = Field("full", description="Type of quiz: 'quick', 'standard', 'full'")
    user_id: Optional[str] = Field(None, description="Optional User ID to link assessment")

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

def validate_scoring_result(scores: Dict[str, Any], quiz_type: str):
    """
    Enforce STRICT sanity guardrails on scoring results.
    Reject invalid data with 422. Never auto-correct.
    """
    # 1. OCEAN Scores Range [0.0, 1.0]
    ocean = scores.get('ocean', {})
    if not ocean:
        raise HTTPException(status_code=422, detail="Missing OCEAN scores")
    
    for trait in ['O', 'C', 'E', 'A', 'N']:
        val = ocean.get(trait)
        # check explicit None or out of bounds
        if val is None or not (0.0 <= val <= 1.0):
            logger.error(f"Validation Failure: Invalid OCEAN for {trait}: {val}")
            raise HTTPException(status_code=422, detail=f"Invalid OCEAN score for {trait}: {val}")

    # 2. Confidence Range [0.0, 1.0]
    confidence = scores.get('confidence')
    if confidence is None or not (0.0 <= confidence <= 1.0):
        logger.error(f"Validation Failure: Invalid confidence: {confidence}")
        raise HTTPException(status_code=422, detail=f"Invalid confidence score: {confidence}")

    # 3. Persona ID (Must be present/string)
    persona_id = scores.get('persona_id')
    if not persona_id or not isinstance(persona_id, str) or not persona_id.strip():
        logger.error(f"Validation Failure: Invalid persona_id: {persona_id}")
        raise HTTPException(status_code=422, detail="Invalid or missing persona_id")

    # 4. Metadata Existence
    if 'metadata' not in scores:
        raise HTTPException(status_code=422, detail="Missing scoring metadata")
        
    # Check Version Compatibility
    from src.config.constants import SCORING_VERSION
    ver = scores['metadata'].get('scoring_version')
    if ver != SCORING_VERSION:
        logger.warning(f"Scoring Version Mismatch: Expected {SCORING_VERSION}, got {ver}")

    # 5. Soft Check: Answer Count (Log only)
    # This is a heuristic, distinct from the strict schema rules
    response_count = scores.get('metadata', {}).get('response_count', 0) 
    # logic depends on if scorer populates response_count in metadata. 
    # If not readily available in scores['metadata'], we skip or pass responses to validator.
    # For now, we focus on the strict schema validation requested.

@router.post("/v1/assessments", response_model=AssessmentResponse)
async def submit_assessment(payload: AssessmentRequest, background_tasks: BackgroundTasks):
    """
    Submit and score a personality assessment.
    """
    try:
        # ... (DB Init and Record Creation - Keep existing logic) ...
        # 1. Initialize DB Client
        db = create_supabase_client()
        
        # 2. Create Assessment Record
        assessment_record = db.create_assessment(quiz_type=payload.quiz_type, user_id=payload.user_id)
        assessment_id = assessment_record.get('id')
        
        if not assessment_id:
            raise HTTPException(status_code=500, detail="Failed to create assessment record")

        # 3. Save Responses
        db.save_responses(assessment_id, payload.responses)
        
        # 4. Calculate Scores (Gold Standard)
        scores = scorer.score(payload.responses)
        
        # Update timestamp in metadata
        scores['metadata']['timestamp'] =  __import__('time').time()
        
        # STRICT SANITY CHECK
        validate_scoring_result(scores, payload.quiz_type)
        
        # 5. Save Scores
        db.save_scores(assessment_id, scores, payload.responses)
        
        # 6. Update Profile (Latest Assessment)
        if payload.user_id:
            db.upsert_profile(payload.user_id, assessment_id)
        
        # 6. Construct Response (Canonical)
        response_model = {
            "ocean": scores['ocean'],
            "persona_id": scores['persona_id'],
            "mbti_proxy": scores['mbti_proxy'] or "UNKN", # Fallback for safety
            "confidence": scores['confidence'],
            "metadata": scores['metadata'],
            
            # Additional Context
            "assessment_id": assessment_id,
            "traits": scores.get("traits", {}),
            "facets": scores.get("facets", {}),
            "dominant": {
                "mbti_proxy": scores.get("mbti_proxy"),
                "personality_code": scores.get("personality_code"),
                "neuroticism_level": scores.get("neuroticism_level")
            },
            "is_complete": scores.get("has_complete_profile", False),
            "traits_with_data": scores.get("traits_with_data", []),
            "needs_retake": False,
            "needs_retake_reason": None
        }
        
        logger.info(f"Assessment {assessment_id} scored successfully. MBTI: {scores.get('mbti_proxy')}")
        
        return response_model

    except Exception as e:
        logger.error(f"Error processing assessment: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class SyncRequest(BaseModel):
    offline_id: str
    responses: Dict[str, int]
    timestamp: float
    user_id: Optional[str] = None
    quiz_type: str = "full"

@router.post("/v1/assessments/sync")
async def sync_assessments(payload: list[SyncRequest]):
    """
    Sync offline assessments.
    Re-scores and persists them with original timestamps.
    """
    results = []
    
    # 1. Initialize DB Client
    db = create_supabase_client()
    
    for item in payload:
        try:
            # 2. Create Record (New ID)
            record = db.create_assessment(quiz_type=item.quiz_type, user_id=item.user_id)
            new_id = record.get('id')
            
            if not new_id:
                raise Exception("Failed to generate ID")
            
            # 3. Save Responses
            db.save_responses(new_id, item.responses)
            
            # 4. Score (Gold Standard)
            scores = scorer.score(item.responses)
            
            # 5. Restore Metadata
            scores['metadata']['timestamp'] = item.timestamp
            scores['metadata']['is_fallback'] = False 
            scores['metadata']['synced_from'] = item.offline_id
            
            # STRICT SANITY CHECK
            validate_scoring_result(scores, item.quiz_type)
            
            # 6. Save Scores
            db.save_scores(new_id, scores, item.responses)
            
            # 7. Update Profile
            if item.user_id:
                db.upsert_profile(item.user_id, new_id)
            
            results.append({"offline_id": item.offline_id, "new_id": new_id, "status": "synced"})
            
        except Exception as e:
            logger.error(f"Sync failed for {item.offline_id}: {e}")
            results.append({"offline_id": item.offline_id, "status": "failed", "error": str(e)})
            
    return {"synced": results}

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
