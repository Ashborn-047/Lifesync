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
    uvicorn.run(app, host="0.0.0.0", port=8000)

