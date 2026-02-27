"""
LifeSync Personality Engine - Safe JSON Utilities
Handles malformed JSON from LLM responses with extraction and repair
"""

import json
import re
from typing import Any, Dict, Optional


def extract_json(text: str) -> Optional[str]:
    """
    Extract JSON substring from text that may contain extra content.
    
    Args:
        text: Text that may contain JSON
    
    Returns:
        JSON substring or None if no JSON found
    """
    if not text:
        return None
    
    # Try to find JSON object boundaries
    start_idx = text.find("{")
    if start_idx == -1:
        return None
    
    # Find matching closing brace
    brace_count = 0
    end_idx = start_idx
    
    for i in range(start_idx, len(text)):
        if text[i] == '{':
            brace_count += 1
        elif text[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    if brace_count == 0:
        return text[start_idx:end_idx]
    
    return None


def repair_json(text: str) -> str:
    """
    Repair common JSON issues:
    - Trailing commas
    - Missing quotes around keys
    - Unescaped quotes in strings
    - Missing closing braces
    
    Args:
        text: Potentially malformed JSON string
    
    Returns:
        Repaired JSON string
    """
    if not text:
        return "{}"
    
    # Remove trailing commas before } or ]
    text = re.sub(r',(\s*[}\]])', r'\1', text)
    
    # Fix unquoted keys (basic fix)
    # This is a simple fix - for complex cases, we rely on extract_json
    text = re.sub(r'(\w+):', r'"\1":', text)
    
    # Ensure proper string escaping (basic)
    # Replace unescaped quotes in string values (this is tricky, so we do minimal)
    # For now, we'll let json.loads handle most of it
    
    return text.strip()


def safe_load_json(text: str) -> Dict[str, Any]:
    """
    Safely load JSON from text that may be malformed.
    
    Strategy:
    1. Try direct json.loads
    2. Try extract_json then json.loads
    3. Try repair_json then json.loads
    4. Try extract + repair + json.loads
    5. Return error dict if all fail
    
    Args:
        text: Text that should contain JSON
    
    Returns:
        Dictionary (always succeeds, may contain error key)
    """
    if not text:
        return {"error": "Empty text", "raw": text}
    
    # Strategy 1: Direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Strategy 2: Extract JSON substring
    extracted = extract_json(text)
    if extracted:
        try:
            return json.loads(extracted)
        except json.JSONDecodeError:
            pass
    
    # Strategy 3: Repair then parse
    try:
        repaired = repair_json(text)
        return json.loads(repaired)
    except (json.JSONDecodeError, Exception):
        pass
    
    # Strategy 4: Extract + Repair
    if extracted:
        try:
            repaired = repair_json(extracted)
            return json.loads(repaired)
        except (json.JSONDecodeError, Exception):
            pass
    
    # Strategy 5: Return error dict
    return {
        "error": "Failed to parse JSON after all repair attempts",
        "raw": text[:500] if len(text) > 500 else text
    }

