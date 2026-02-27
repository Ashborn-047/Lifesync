"""
LifeSync Personality Engine - Questions API Route
Returns personality questions from question bank
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Cache for questions (loaded at startup)
_questions_cache: List[Dict[str, Any]] = []
_questions_loaded = False


class QuestionResponse(BaseModel):
    """Response model for a single question"""
    id: str = Field(..., description="Question ID (e.g., Q001)")
    text: str = Field(..., description="Question text")
    trait: str = Field(..., description="OCEAN trait (O, C, E, A, N)")
    facet: str = Field(..., description="Facet identifier")
    reverse: bool = Field(..., description="Whether question is reverse-scored")


class QuestionsListResponse(BaseModel):
    """Response model for questions list"""
    count: int = Field(..., description="Total number of questions")
    questions: List[QuestionResponse] = Field(..., description="List of questions")


def _load_questions() -> List[Dict[str, Any]]:
    """
    Load questions from JSON file and cache them.
    
    Returns:
        List of question dictionaries
    
    Raises:
        FileNotFoundError: If question file doesn't exist
        json.JSONDecodeError: If JSON is invalid
    """
    global _questions_cache, _questions_loaded
    
    if _questions_loaded:
        return _questions_cache
    
    # Get project root (backend directory)
    backend_dir = Path(__file__).parent.parent.parent.parent
    questions_file = backend_dir / "data" / "question_bank" / "lifesync_180_questions.json"
    
    if not questions_file.exists():
        error_msg = f"Questions file not found: {questions_file}"
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    
    try:
        with open(questions_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle different JSON structures
        if isinstance(data, list):
            questions = data
        elif isinstance(data, dict) and 'questions' in data:
            questions = data['questions']
        else:
            questions = []
        
        # Cache the questions
        _questions_cache = questions
        _questions_loaded = True
        
        logger.info(f"Loaded {len(questions)} questions from {questions_file}")
        return questions
        
    except json.JSONDecodeError as e:
        error_msg = f"Failed to parse questions JSON: {e}"
        logger.error(error_msg)
        raise json.JSONDecodeError(error_msg, e.doc, e.pos)
    except Exception as e:
        error_msg = f"Unexpected error loading questions: {e}"
        logger.error(error_msg, exc_info=True)
        raise

def _get_balanced_question_ids(limit: int = 30) -> List[str]:
    """
    Get balanced question IDs from smart_quiz_30.json.
    This ensures all 5 traits are covered evenly.
    """
    backend_dir = Path(__file__).parent.parent.parent.parent
    smart_quiz_file = backend_dir / "data" / "question_bank" / "smart_30.json"
    
    if smart_quiz_file.exists():
        try:
            with open(smart_quiz_file, 'r', encoding='utf-8') as f:
                smart_quiz = json.load(f)
            question_ids = smart_quiz.get("question_ids", [])
            
            # Strict check: if we want 30, and we have 30, return them ALL.
            # If we have more, slice. If we have fewer, log warning.
            if len(question_ids) > 0:
                logger.info(f"Loaded {len(question_ids)} IDs from smart_quiz_30.json")
                return question_ids[:limit]
        except Exception as e:
            logger.warning(f"Failed to load smart_quiz_30.json: {e}")
    
    # Fallback: return first N question IDs (not balanced, but works)
    logger.warning("Smart quiz file not found or failed to load. Falling back to default order.")
    all_questions = _load_questions()
    return [q.get('id', '') for q in all_questions[:limit] if q.get('id')]


@router.get("/v1/questions", response_model=QuestionsListResponse)
async def get_questions(limit: Optional[int] = Query(None, description="Limit number of questions returned")):
    """
    Get personality questions from the question bank.
    
    Args:
        limit: Optional limit on number of questions to return (default: all)
    
    Returns:
        QuestionsListResponse with count and list of questions
    
    Raises:
        HTTPException: If questions cannot be loaded
    """
    try:
        all_questions = _load_questions()
        
        # If limit is specified, use balanced question set (ensures all traits are covered)
        if limit and limit > 0:
            # SPECIAL CASE: If limit is 30, we MUST use the smart_quiz_30.json set
            if limit == 30:
                logger.info("Request for Smart Quiz (limit=30) detected. Enforcing smart_quiz_30.json.")
                balanced_ids = _get_balanced_question_ids(30)
            else:
                balanced_ids = _get_balanced_question_ids(limit)
            
            # Create a lookup for fast access
            questions_dict = {q.get('id'): q for q in all_questions}
            
            # Get questions in the balanced order
            questions = []
            missing_ids = []
            for q_id in balanced_ids:
                q = questions_dict.get(q_id)
                if q:
                    questions.append(q)
                else:
                    missing_ids.append(q_id)
            
            if missing_ids:
                logger.warning(f"Missing question IDs from balanced set: {missing_ids}")

            # If balanced set failed, fall back
            if len(questions) < limit:
                logger.warning(f"Balanced set incomplete ({len(questions)}/{limit}). Falling back to first {limit} questions.")
                questions = all_questions[:limit]
            else:
                logger.info(f"Successfully loaded balanced set of {len(questions)} questions.")
        else:
            questions = all_questions
        
        # Convert to response models
        question_responses = [
            QuestionResponse(
                id=q.get('id', ''),
                text=q.get('text', ''),
                trait=q.get('trait', ''),
                facet=q.get('facet', ''),
                reverse=q.get('reverse', False)
            )
            for q in questions
        ]
        
        return QuestionsListResponse(
            count=len(question_responses),
            questions=question_responses
        )
        
    except FileNotFoundError as e:
        logger.error(f"Questions file not found: {e}")
        raise HTTPException(
            status_code=404,
            detail=f"Questions file not found: {str(e)}"
        )
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse questions file: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_questions: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# Pre-load questions at module import time (startup) for instant responses
def _preload_questions():
    """Pre-load questions at startup to avoid first-request delay"""
    try:
        _load_questions()
        logger.info("Questions pre-loaded at startup")
    except Exception as e:
        logger.warning(f"Failed to pre-load questions at startup: {e}. Will load on first request.")

# Call pre-load function when module is imported
_preload_questions()
