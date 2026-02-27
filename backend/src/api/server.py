"""
LifeSync Personality Engine - FastAPI Server
REST API for personality assessment scoring and explanation generation
"""

import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

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
from .routes import questions as questions_router, assessments as assessments_router, profiles as profiles_router, auth as auth_router
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

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="LifeSync Personality Engine API",
    description="API for personality assessment scoring and explanation generation",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter

# Add rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors"""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": "Too many requests. Please try again later.",
            "retry_after": exc.detail if hasattr(exc, 'detail') else None
        }
    )

# CORS middleware - Use configured allowed origins
allowed_origins = config.get_allowed_origins()
logger.info(f"CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],  # Fallback to * only if no origins configured
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
app.include_router(auth_router.router, prefix="/v1/auth", tags=["auth"])
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


# Health check endpoint
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
    # Use port from config (which defaults to 8000 or the API_PORT/PORT env var)
    uvicorn.run(app, host=config.API_HOST, port=config.API_PORT)

