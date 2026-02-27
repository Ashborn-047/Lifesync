"""
LifeSync Personality Engine - Input Validators
"""

import re
from typing import Dict, Tuple


def validate_quiz_type(quiz_type: str) -> bool:
    """
    Validate quiz type.
    
    Args:
        quiz_type: Type of quiz ('quick', 'standard', 'full')
    
    Returns:
        True if valid, False otherwise
    """
    return quiz_type in ['quick', 'standard', 'full']


def validate_answers(answers: Dict[str, int]) -> Tuple[bool, str]:
    """
    Validate answer dictionary.
    
    Args:
        answers: Dictionary mapping question_id to response_value
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(answers, dict):
        return False, "Answers must be a dictionary"
    
    if len(answers) == 0:
        return False, "Answers dictionary cannot be empty"
    
    # Validate question IDs format (Q001, Q002, etc.)
    question_id_pattern = re.compile(r'^Q\d{3}$')
    
    for q_id, value in answers.items():
        # Validate question ID format
        if not question_id_pattern.match(q_id):
            return False, f"Invalid question ID format: {q_id}. Expected format: Q001, Q002, etc."
        
        # Validate response value range
        if not isinstance(value, int):
            return False, f"Response value for {q_id} must be an integer"
        
        if not (1 <= value <= 5):
            return False, f"Response value for {q_id} must be between 1 and 5, got {value}"
    
    return True, ""


def validate_user_id(user_id: str) -> Tuple[bool, str]:
    """
    Validate user ID (UUID format).
    
    Args:
        user_id: User ID string
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not user_id:
        return False, "User ID cannot be empty"
    
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    
    if not uuid_pattern.match(user_id):
        return False, f"Invalid user ID format: {user_id}. Expected UUID format."
    
    return True, ""


def validate_assessment_id(assessment_id: str) -> Tuple[bool, str]:
    """
    Validate assessment ID (UUID format).
    
    Args:
        assessment_id: Assessment ID string
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    return validate_user_id(assessment_id)  # Same format as user ID


def sanitize_text(text: str) -> str:
    """
    Sanitize text input by removing HTML tags and trimming whitespace.

    Args:
        text: Input text

    Returns:
        Sanitized text
    """
    if not text:
        return ""

    # Remove HTML tags using regex
    clean_text = re.sub(r'<[^>]+>', '', text)

    # Trim whitespace
    return clean_text.strip()


def sanitize_answers(answers: Dict[str, int]) -> Dict[str, int]:
    """
    Sanitize and normalize answer dictionary.
    
    Args:
        answers: Raw answer dictionary
    
    Returns:
        Sanitized answer dictionary
    """
    sanitized = {}
    
    for q_id, value in answers.items():
        # Normalize question ID format
        q_id_upper = q_id.upper().strip()
        
        # Ensure value is integer and in valid range
        try:
            int_value = int(value)
            if 1 <= int_value <= 5:
                sanitized[q_id_upper] = int_value
        except (ValueError, TypeError):
            continue  # Skip invalid values
    
    return sanitized

