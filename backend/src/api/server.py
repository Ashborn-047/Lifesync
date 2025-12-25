"""
LifeSync Personality Engine - FastAPI Server
REST API for personality assessment scoring and explanation generation
"""

import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging for local development
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from ..scorer import score_answers, validate_responses as validate_response_balance
from ..ai.explanation_generator import generate_explanation_with_tone
from ..ai.pdf_generator import generate_pdf
from ..supabase_client import create_supabase_client, SupabaseClient
from ..llm.router import generate_explanation as router_generate_explanation
from .routes import questions as questions_router, assessments as assessments_router, profiles as profiles_router
from typing import List

logger = logging.getLogger(__name__)
from ..utils import (
    validate_quiz_type,
    validate_answers,
    validate_user_id,
    validate_assessment_id,
    sanitize_answers,
    log_api_request,
    Timer,
    log_scoring_metrics,
    log_llm_metrics
)
from .config import config


# Initialize FastAPI app
app = FastAPI(
    title="LifeSync Personality Engine API",
    description="API for personality assessment scoring and explanation generation",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression middleware (performance optimization)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(questions_router.router, tags=["questions"])
app.include_router(assessments_router.router, tags=["assessments"])
app.include_router(profiles_router.router, tags=["profiles"])
 # Included assessments router

# Pydantic models for questions endpoint
class QuestionOut(BaseModel):
    id: str
    text: str
    trait: str
    facet: str
    reverse: bool

# Global supabase instance for direct access
try:
    url = config.get_supabase_url()
    key = config.get_supabase_key()
    if url and key and "your-project" not in url and "your-anon-key" not in key:
        supabase = create_supabase_client(url=url, key=key)
    else:
        supabase = None
        logger.warning("Supabase credentials not configured, GET /v1/questions will fail")
except Exception as e:
    logger.error(f"Failed to create global Supabase client: {e}")
    supabase = None


# Request/Response Models
class AssessmentRequest(BaseModel):
    """Request model for creating an assessment"""
    user_id: str = Field(..., description="User ID (UUID)")
    responses: Dict[str, int] = Field(..., description="Dictionary mapping question_id to response value (1-5). Example: {Q001: 5, Q002: 3, ...}")
    quiz_type: Optional[str] = Field(default="full", description="Type of quiz: quick, standard, or full")


class AssessmentResponse(BaseModel):
    """Response model for assessment results"""
    assessment_id: str
    traits: Dict[str, float]
    facets: Dict[str, float]
    confidence: Dict[str, Any]
    dominant: Dict[str, str]
    top_facets: list
    coverage: float
    responses_count: int
    is_complete: bool = True


class ExplanationRequest(BaseModel):
    """Request model for generating explanation"""
    provider: Optional[str] = Field(default=None, description="LLM provider: 'openai' or 'gemini'. Defaults to configured provider.")


class ExplanationResponse(BaseModel):
    """Response model for explanation (supports both new persona format and legacy format)"""
    assessment_id: str
    # New persona format fields
    persona_title: Optional[str] = None
    vibe_summary: Optional[str] = None
    strengths: Optional[list] = None
    growth_edges: Optional[list] = None
    how_you_show_up: Optional[str] = None
    tagline: Optional[str] = None
    # Legacy format fields (for backward compatibility)
    summary: str = ""
    steps: list = []
    challenges: Optional[list] = None
    confidence_note: str = ""
    model_name: str
    tokens_used: Optional[int] = None
    generation_time_ms: int


# Assessment History Models
class AssessmentHistoryItem(BaseModel):
    """Model for assessment history item"""
    assessment_id: str
    created_at: str
    traits: Dict[str, float]
    facets: Dict[str, float]
    mbti: str
    summary: Optional[str] = None


class ShareRequest(BaseModel):
    """Request model for sharing assessment"""
    pass  # No additional fields needed


class ShareResponse(BaseModel):
    """Response model for share link"""
    url: str
    share_id: str


class SharedAssessmentResponse(BaseModel):
    """Response model for shared assessment"""
    assessment_id: str
    traits: Dict[str, float]
    facets: Dict[str, float]
    mbti: str
    created_at: str
    explanation: Optional[str] = None


# Dependency functions
def get_supabase_client() -> SupabaseClient:
    """Dependency to get Supabase client"""
    try:
        url = config.get_supabase_url()
        key = config.get_supabase_key()
        if not url or not key or "your-project" in url or "your-anon-key" in key:
            raise ValueError(
                "Supabase credentials not configured. Please set valid SUPABASE_URL and SUPABASE_KEY in .env file. "
                "Current values appear to be placeholders."
            )
        return create_supabase_client(url=url, key=key)
    except Exception as e:
        print(f"ERROR creating Supabase client: {e}")
        import traceback
        traceback.print_exc()
        raise


# API Routes
@app.post("/v1/assessments", response_model=AssessmentResponse)
@log_api_request("/v1/assessments")
def create_assessment(
    request: AssessmentRequest,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Create a new personality assessment and score the answers.
    
    - Validates question IDs and response values
    - Creates assessment record in Supabase (status = "completed")
    - Stores responses in personality_responses table
    - Runs the scoring engine (personality_scorer)
    - Saves trait & facet scores to assessment record
    - Returns scored personality result
    """
    # Validate user_id
    is_valid, error_msg = validate_user_id(request.user_id)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Validate quiz type
    if request.quiz_type and not validate_quiz_type(request.quiz_type):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid quiz_type: {request.quiz_type}. Must be 'quick', 'standard', or 'full'"
        )
    
    # Validate and sanitize responses
    is_valid, error_msg = validate_answers(request.responses)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    sanitized_responses = sanitize_answers(request.responses)
    
    if len(sanitized_responses) == 0:
        raise HTTPException(
            status_code=400,
            detail="No valid responses provided. Responses must be between 1 and 5."
        )
    
    # Validate question balance (Solution B: prevent unbalanced question sets)
    validation_result = validate_response_balance(sanitized_responses)
    if not validation_result['is_valid']:
        # Build error message from warnings
        error_messages = [w['message'] for w in validation_result['warnings'] if w['severity'] == 'error']
        coverage_info = ", ".join([f"{trait}: {count}" for trait, count in validation_result['coverage'].items()])
        
        error_detail = (
            "Assessment validation failed: Unbalanced question set detected. "
            f"Coverage: {coverage_info}. "
            f"Errors: {'; '.join(error_messages[:3])}"  # Limit to first 3 errors
        )
        
        logger.warning(f"Unbalanced assessment rejected: {error_detail}")
        raise HTTPException(
            status_code=400,
            detail=error_detail
        )
    
    # Log validation warnings (non-fatal)
    if validation_result['warnings']:
        warnings = [w['message'] for w in validation_result['warnings'] if w['severity'] == 'warning']
        if warnings:
            logger.info(f"Assessment validation warnings: {'; '.join(warnings)}")
    
    try:
        # Step 1: Create assessment record in Supabase
        # Note: user_id is validated but not stored in current schema
        assessment = supabase.create_assessment(
            quiz_type=request.quiz_type or "full"
        )
        assessment_id = assessment["id"]
        
        # Step 2: Insert responses into personality_responses table
        supabase.save_responses(assessment_id, sanitized_responses)
        
        # Step 3: Run the scoring engine
        with Timer("Scoring"):
            scores = score_answers(sanitized_responses)
        
        # Step 4: Save final trait & facet outputs to assessment record
        supabase.save_scores(assessment_id, scores, sanitized_responses)
        
        # Log metrics
        confidence_avg = sum(scores["confidence"]["traits"].values()) / 5
        log_scoring_metrics(
            responses_count=scores["responses_count"],
            coverage=scores["coverage"],
            confidence_avg=confidence_avg,
            execution_time_ms=0  # Timer handles this
        )
        
        # Step 5: Return scored personality result
        return AssessmentResponse(
            assessment_id=assessment_id,
            traits=scores["traits"],
            facets=scores["facets"],
            confidence=scores["confidence"],
            dominant=scores["dominant"],
            top_facets=scores["top_facets"],
            coverage=scores["coverage"],
            responses_count=scores["responses_count"],
            is_complete=scores.get("has_complete_profile", True)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Validation error: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR in create_assessment: {str(e)}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create assessment: {str(e)}"
        )


@app.get("/v1/assessments/{assessment_id}", response_model=AssessmentResponse)
@log_api_request("/v1/assessments/{assessment_id}")
def get_assessment(
    assessment_id: str,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get assessment data by assessment_id.
    
    Returns:
        AssessmentResponse with traits, facets, MBTI, and other data
    """
    # Validate assessment_id
    is_valid, error_msg = validate_assessment_id(assessment_id)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:
        # Get assessment from database
        assessment = supabase.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(
                status_code=404,
                detail=f"Assessment {assessment_id} not found"
            )
        
        # Extract data
        traits = assessment.get("trait_scores", {})
        facets = assessment.get("facet_scores", {})
        mbti_code = assessment.get("mbti_code", "")
        
        # Reconstruct confidence (we don't store this, so use defaults)
        confidence = {
            "traits": {trait: 1.0 for trait in ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]},
            "facets": {facet: 1.0 for facet in facets.keys()} if facets else {}
        }
        
        # Reconstruct dominant profile
        neuroticism_score = float(traits.get("Neuroticism", 0.5))
        if neuroticism_score < 0.35:
            neuroticism_level = "Stable"
        elif neuroticism_score < 0.65:
            neuroticism_level = "Balanced"
        else:
            neuroticism_level = "Sensitive"
        
        dominant = {
            "mbti_proxy": mbti_code or "UNKNOWN",
            "neuroticism_level": neuroticism_level,
            "personality_code": f"{mbti_code}-{neuroticism_level[0]}" if mbti_code else f"UNKNOWN-{neuroticism_level[0]}"
        }
        
        # Get top facets (sort by score, take top 5)
        top_facets = []
        if facets:
            sorted_facets = sorted(facets.items(), key=lambda x: x[1], reverse=True)
            top_facets = [{"facet": k, "score": v} for k, v in sorted_facets[:5]]
        
        return AssessmentResponse(
            assessment_id=assessment_id,
            traits=traits,
            facets=facets,
            confidence=confidence,
            dominant=dominant,
            top_facets=top_facets,
            coverage=100.0,  # We don't store this, assume 100%
            responses_count=30,  # We don't store this, assume 30 for quick quiz
            is_complete=len(traits) == 5
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("GET /v1/assessments/{assessment_id} failed")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get assessment: {str(e)}"
        )


@app.post("/v1/assessments/{assessment_id}/generate_explanation", response_model=ExplanationResponse)
@log_api_request("/v1/assessments/{assessment_id}/generate_explanation")
def generate_explanation(
    assessment_id: str,
    request: ExplanationRequest,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Generate an LLM explanation for a completed assessment.
    
    - Retrieves assessment scores from database
    - Calls LLM to generate explanation
    - Stores explanation in database
    - Returns explanation text
    """
    # Validate assessment_id
    is_valid, error_msg = validate_assessment_id(assessment_id)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:
        # Step 1: Load trait + facet outputs from Supabase
        assessment_record = supabase.get_assessment(assessment_id)
        if not assessment_record:
            raise HTTPException(
                status_code=404,
                detail=f"Assessment {assessment_id} not found"
            )
        
        # Extract scores from assessment record (stored as JSONB)
        traits = assessment_record.get("trait_scores") or {}
        facets = assessment_record.get("facet_scores") or {}
        mbti_code = assessment_record.get("mbti_code") or ""
        
        # Handle missing data gracefully
        if not traits:
            raise HTTPException(
                status_code=400,
                detail="Assessment has not been scored yet. Trait scores are missing."
            )
        
        if not facets:
            raise HTTPException(
                status_code=400,
                detail="Assessment has not been scored yet. Facet scores are missing."
            )
        
        # Ensure all required OCEAN traits are present
        required_traits = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
        missing_traits = [t for t in required_traits if t not in traits]
        if missing_traits:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required trait scores: {', '.join(missing_traits)}"
            )
        
        # Calculate neuroticism level from Neuroticism trait score
        neuroticism_score = float(traits.get("Neuroticism", 0.5))
        if neuroticism_score < 0.35:
            neuroticism_level = "Stable"
        elif neuroticism_score < 0.65:
            neuroticism_level = "Balanced"
        else:
            neuroticism_level = "Sensitive"
        
        # Reconstruct dominant profile
        dominant = {
            "mbti_proxy": mbti_code or "UNKNOWN",
            "neuroticism_level": neuroticism_level,
            "personality_code": f"{mbti_code}-{neuroticism_level[0]}" if mbti_code else f"UNKNOWN-{neuroticism_level[0]}"
        }
        
        # Use default confidence scores (1.0 = high confidence)
        # In a full implementation, these would be stored with the scores
        confidence = {
            "traits": {trait: 1.0 for trait in required_traits},
            "facets": {facet: 1.0 for facet in facets.keys()} if facets else {}
        }
        
        # Step 2: Send to LLM with tone generation (using robust router)
        logger.info(f"Generating explanation for assessment {assessment_id}")
        
        try:
            with Timer("LLM Generation"):
                # Generate tone profile first
                from ..ai.tone_generator import generate_tone_safe
                from ..llm.templates import _convert_traits_to_codes
                
                trait_codes = _convert_traits_to_codes(traits)
                tone_profile = generate_tone_safe(trait_codes)
                
                # Use router with automatic fallback
                explanation = router_generate_explanation(
                    traits=traits,
                    facets=facets,
                    confidence=confidence,
                    dominant=dominant,
                    provider=None,  # Let router decide
                    system_prompt=None,
                    tone_profile=tone_profile
                )
            
            # Check if router returned an error
            if "error" in explanation:
                logger.error(f"LLM generation failed: {explanation.get('error')}")
                raise HTTPException(
                    status_code=503,
                    detail=f"LLM service unavailable: {explanation.get('error')}"
                )
            
            logger.info(f"Explanation generated successfully using {explanation.get('model_name', 'unknown')}")
            
            # Log metrics
            log_llm_metrics(
                model_name=explanation.get("model_name", "unknown"),
                tokens_used=explanation.get("tokens_used", 0),
                generation_time_ms=explanation.get("generation_time_ms", 0)
            )
            
            # Step 3: Save the explanation in supabase.explanations
            try:
                supabase.save_explanation(assessment_id, explanation)
            except Exception as e:
                logger.warning(f"Failed to save explanation to database: {e}")
                # Continue anyway - explanation generation succeeded
            
            # Step 4: Return the explanation (new persona format + backward compatibility)
            return ExplanationResponse(
                assessment_id=assessment_id,
                # New persona format
                persona_title=explanation.get("persona_title"),
                vibe_summary=explanation.get("vibe_summary"),
                strengths=explanation.get("strengths", []),
                growth_edges=explanation.get("growth_edges"),
                how_you_show_up=explanation.get("how_you_show_up"),
                tagline=explanation.get("tagline"),
                # Legacy format (for backward compatibility)
                summary=explanation.get("summary", explanation.get("vibe_summary", "")),
                steps=explanation.get("steps", []),
                challenges=explanation.get("challenges", explanation.get("growth_edges")),
                confidence_note=explanation.get("confidence_note", ""),
                model_name=explanation.get("model_name", "unknown"),
                tokens_used=explanation.get("tokens_used"),
                generation_time_ms=explanation.get("generation_time_ms", 0)
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in explanation generation: {e}", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail=f"Failed to generate explanation: {str(e)}"
            )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data: {str(e)}"
        )
    except RuntimeError as e:
        # LLM provider errors
        raise HTTPException(
            status_code=503,
            detail=f"LLM service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )


# REMOVED: Duplicate /v1/questions endpoint that was querying Supabase (slow)
# The router endpoint in routes/questions.py is used instead (loads from JSON file, fast, cached)
# If you need Supabase questions, use a different endpoint like /v1/questions/db




@app.post("/v1/assessments/{assessment_id}/share", response_model=ShareResponse)
@log_api_request("/v1/assessments/{assessment_id}/share")
def create_share_link(
    assessment_id: str,
    request: ShareRequest,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Create a shareable link for an assessment.
    
    Returns:
        ShareResponse with URL and share_id
    """
    import uuid
    
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        # Verify assessment exists
        assessment = supabase.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Generate unique share token
        share_id = str(uuid.uuid4())
        
        # Insert into shared_assessments table
        # Note: This table needs to be created in Supabase
        # For now, we'll use a simple approach
        share_data = {
            "share_id": share_id,
            "assessment_id": assessment_id,
            "created_at": datetime.now().isoformat()
        }
        
        # Try to insert, if table doesn't exist, we'll handle gracefully
        try:
            supabase.client.table("shared_assessments").insert(share_data).execute()
        except Exception as e:
            logger.warning(f"Could not insert into shared_assessments table: {e}")
            # Continue anyway - we can still return the share_id
        
        # Generate share URL (using localhost for now, replace with actual domain in production)
        base_url = os.getenv("SHARE_BASE_URL", "http://localhost:3000")
        share_url = f"{base_url}/share/{share_id}"
        
        return ShareResponse(url=share_url, share_id=share_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("POST /v1/assessments/{assessment_id}/share failed")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/v1/share/{share_id}", response_model=SharedAssessmentResponse)
@log_api_request("/v1/share/{share_id}")
def get_shared_assessment(
    share_id: str,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Get a shared assessment by share_id.
    
    Returns:
        SharedAssessmentResponse with assessment data
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        # Get share record
        try:
            share_resp = (
                supabase.client.table("shared_assessments")
                .select("assessment_id")
                .eq("share_id", share_id)
                .execute()
            )
            
            if not share_resp.data or len(share_resp.data) == 0:
                raise HTTPException(status_code=404, detail="Share link not found")
            
            assessment_id = share_resp.data[0]["assessment_id"]
        except Exception as e:
            logger.warning(f"Could not query shared_assessments: {e}")
            # Fallback: try using share_id as assessment_id directly
            assessment_id = share_id
        
        # Get assessment
        assessment = supabase.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Get explanation if available
        explanation = supabase.get_explanation(assessment_id)
        explanation_text = None
        if explanation:
            explanation_text = explanation.get("explanation", "")
        
        return SharedAssessmentResponse(
            assessment_id=assessment_id,
            traits=assessment.get("trait_scores", {}),
            facets=assessment.get("facet_scores", {}),
            mbti=assessment.get("mbti_code", "N/A"),
            created_at=assessment.get("created_at", ""),
            explanation=explanation_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("GET /v1/share/{share_id} failed")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/v1/assessments/{assessment_id}/pdf")
@log_api_request("/v1/assessments/{assessment_id}/pdf")
def get_assessment_pdf(
    assessment_id: str,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Generate and return a PDF report for an assessment.
    
    Returns:
        PDF file as application/pdf
    """
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
        # Get assessment
        assessment = supabase.get_assessment(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # Get explanation if available
        explanation = supabase.get_explanation(assessment_id)
        explanation_text = None
        if explanation:
            explanation_text = explanation.get("explanation", "")
        
        # Convert trait scores from full names to codes if needed
        trait_scores = assessment.get("trait_scores", {})
        if trait_scores:
            # Map full trait names to codes for PDF generator
            trait_mapping = {
                "Openness": "O",
                "Conscientiousness": "C",
                "Extraversion": "E",
                "Agreeableness": "A",
                "Neuroticism": "N"
            }
            # Convert if using full names, otherwise use as-is
            converted_traits = {}
            for key, value in trait_scores.items():
                if key in trait_mapping:
                    # Full name format - convert to code
                    converted_traits[trait_mapping[key]] = value
                else:
                    # Already in code format
                    converted_traits[key] = value
            trait_scores = converted_traits
        
        # Generate PDF
        pdf_bytes = generate_pdf(
            assessment_id=assessment_id,
            traits=trait_scores,
            facets=assessment.get("facet_scores", {}),
            mbti=assessment.get("mbti_code", "N/A"),
            explanation=explanation_text
        )
        
        # Return PDF as response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="lifesync-assessment-{assessment_id[:8]}.pdf"'
            }
        )
        
    except ImportError as e:
        raise HTTPException(
            status_code=503,
            detail=f"PDF generation not available: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("GET /v1/assessments/{assessment_id}/pdf failed")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "LifeSync Personality Engine"}


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "LifeSync Personality Engine API",
        "version": "1.0.0",
        "endpoints": {
            "POST /v1/assessments": "Create and score a personality assessment",
            "POST /v1/assessments/{id}/generate_explanation": "Generate LLM explanation for an assessment",
            "GET /health": "Health check"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

