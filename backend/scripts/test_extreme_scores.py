"""
Test script to verify scoring with extreme values (all 1s = extremely disagree)
This will help identify if scoring is working correctly.
"""

import requests
import json
import sys
import io
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_URL = "http://localhost:5174"

def get_question_ids():
    """Get question IDs from smart_quiz_30.json"""
    script_dir = Path(__file__).parent
    smart_quiz_path = script_dir.parent / "data" / "question_bank" / "smart_quiz_30.json"
    
    if smart_quiz_path.exists():
        with open(smart_quiz_path, 'r', encoding='utf-8') as f:
            smart_quiz = json.load(f)
        return smart_quiz.get("question_ids", [])
    return []

def test_all_ones():
    """Test with all responses = 1 (extremely disagree)"""
    question_ids = get_question_ids()
    if not question_ids:
        print("ERROR: Could not load question IDs")
        return
    
    # Create responses as dict: {"Q001": 1, "Q002": 1, ...}
    from uuid import uuid4
    responses_dict = {q_id: 1 for q_id in question_ids}
    
    print(f"Testing with {len(responses_dict)} questions, all answered '1' (extremely disagree)")
    print(f"Question IDs: {list(question_ids[:5])}... (showing first 5)")
    
    try:
        # Submit assessment
        resp = requests.post(
            f"{API_URL}/v1/assessments",
            json={
                "user_id": str(uuid4()),
                "responses": responses_dict,
                "quiz_type": "quick"
            },
            timeout=30
        )
        
        if resp.status_code != 200:
            print(f"ERROR: API returned {resp.status_code}")
            print(resp.text)
            return
        
        data = resp.json()
        assessment_id = data.get("assessment_id")
        traits = data.get("traits", {})
        dominant = data.get("dominant", {})
        
        print("\n=== TRAIT SCORES (should be LOW, not 0.5) ===")
        for trait, score in traits.items():
            percentage = score * 100
            print(f"  {trait}: {score:.3f} ({percentage:.1f}%)")
        
        print(f"\n=== MBTI INFO ===")
        print(f"MBTI Proxy: {dominant.get('mbti_proxy', 'N/A')}")
        print(f"Personality Code: {dominant.get('personality_code', 'N/A')}")
        print(f"Neuroticism Level: {dominant.get('neuroticism_level', 'N/A')}")
        print(f"Assessment ID: {assessment_id}")
        
        # Check if all scores are 0.5 (which would indicate a problem)
        all_50 = all(abs(score - 0.5) < 0.01 for score in traits.values())
        if all_50:
            print("\n⚠️  WARNING: All trait scores are ~0.5! This suggests:")
            print("   - Questions might not be matching (IDs don't match)")
            print("   - Or scoring is defaulting to neutral values")
        else:
            print("\n[OK] Trait scores show variation (not all 0.5)")
        
        # Test explanation generation
        print("\n=== TESTING EXPLANATION GENERATION ===")
        resp2 = requests.post(
            f"{API_URL}/v1/assessments/{assessment_id}/generate_explanation",
            json={},
            timeout=60
        )
        
        if resp2.status_code == 200:
            explanation = resp2.json()
            print("\n=== EXPLANATION FORMAT CHECK ===")
            print(f"Has persona_title: {bool(explanation.get('persona_title'))}")
            print(f"Has vibe_summary: {bool(explanation.get('vibe_summary'))}")
            print(f"Has strengths: {bool(explanation.get('strengths'))}")
            print(f"Has growth_edges: {bool(explanation.get('growth_edges'))}")
            print(f"Has how_you_show_up: {bool(explanation.get('how_you_show_up'))}")
            print(f"Has tagline: {bool(explanation.get('tagline'))}")
            
            if explanation.get('persona_title'):
                print(f"\nPersona: {explanation.get('persona_title')}")
                print(f"Tagline: {explanation.get('tagline', 'N/A')}")
            else:
                print("\n⚠️  WARNING: New persona format not found! Using old format.")
                print(f"Summary: {explanation.get('summary', 'N/A')[:100]}...")
        else:
            print(f"ERROR: Explanation generation failed: {resp2.status_code}")
            print(resp2.text)
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_all_ones()

