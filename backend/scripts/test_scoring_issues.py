"""
Comprehensive test script to isolate scoring issues:
- MBTI showing XNXX
- All trait scores at 50%
- Radar chart always the same

Tests multiple scenarios to find the root cause.
"""

import requests
import json
import sys
import io
from uuid import uuid4
from pathlib import Path
from typing import Dict, List

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_URL = "http://localhost:5174"

def get_question_ids() -> List[str]:
    """Get question IDs from smart_quiz_30.json"""
    script_dir = Path(__file__).parent
    smart_quiz_path = script_dir.parent / "data" / "question_bank" / "smart_quiz_30.json"
    
    if smart_quiz_path.exists():
        with open(smart_quiz_path, 'r', encoding='utf-8') as f:
            smart_quiz = json.load(f)
        return smart_quiz.get("question_ids", [])
    return []

def test_scenario(name: str, responses_dict: Dict[str, int], expected_pattern: str):
    """Test a specific scenario and report results"""
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"Expected: {expected_pattern}")
    print(f"{'='*60}")
    
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
            return None
        
        data = resp.json()
        traits = data.get("traits", {})
        mbti = data.get("dominant", {}).get("mbti_proxy", "N/A")
        assessment_id = data.get("assessment_id")
        
        print(f"\nResults:")
        print(f"  MBTI: {mbti}")
        print(f"  Assessment ID: {assessment_id}")
        print(f"\n  Trait Scores:")
        all_50 = True
        for trait, score in traits.items():
            percentage = score * 100
            is_50 = abs(percentage - 50.0) < 0.1
            marker = "⚠️" if is_50 else "✓"
            print(f"    {marker} {trait}: {score:.3f} ({percentage:.1f}%)")
            if not is_50:
                all_50 = False
        
        # Check for issues
        issues = []
        if mbti == "XNXX" or "X" in mbti:
            issues.append(f"❌ MBTI has X: {mbti}")
        if all_50:
            issues.append("❌ All traits at 50% (neutral)")
        if len(set(traits.values())) == 1:
            issues.append("❌ All traits have identical scores")
        
        if issues:
            print(f"\n  ⚠️  ISSUES FOUND:")
            for issue in issues:
                print(f"    {issue}")
        else:
            print(f"\n  ✓ No issues detected")
        
        # Get assessment from database to check storage
        try:
            get_resp = requests.get(
                f"{API_URL}/v1/assessments/{assessment_id}",
                timeout=10
            )
            if get_resp.status_code == 200:
                stored_data = get_resp.json()
                stored_traits = stored_data.get("traits", {})
                stored_mbti = stored_data.get("dominant", {}).get("mbti_proxy", "N/A")
                
                # Check if stored matches returned
                traits_match = all(
                    abs(traits.get(k, 0) - stored_traits.get(k, 0)) < 0.001
                    for k in traits.keys()
                )
                mbti_match = mbti == stored_mbti
                
                if not traits_match:
                    print(f"\n  ⚠️  STORAGE MISMATCH: Traits don't match stored values")
                if not mbti_match:
                    print(f"\n  ⚠️  STORAGE MISMATCH: MBTI doesn't match (returned: {mbti}, stored: {stored_mbti})")
        except Exception as e:
            print(f"\n  ⚠️  Could not verify storage: {e}")
        
        return {
            "mbti": mbti,
            "traits": traits,
            "all_50": all_50,
            "issues": issues
        }
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Run comprehensive tests"""
    question_ids = get_question_ids()
    if not question_ids:
        print("ERROR: Could not load question IDs")
        return
    
    print(f"Loaded {len(question_ids)} question IDs")
    print(f"Testing against API: {API_URL}")
    
    # Test 1: All 5s (extremely agree) - should show HIGH scores
    all_5s = {q_id: 5 for q_id in question_ids}
    result1 = test_scenario(
        "All 5s (Extremely Agree)",
        all_5s,
        "High scores (70-100%)"
    )
    
    # Test 2: All 1s (extremely disagree) - should show LOW scores
    all_1s = {q_id: 1 for q_id in question_ids}
    result2 = test_scenario(
        "All 1s (Extremely Disagree)",
        all_1s,
        "Low scores (0-30%)"
    )
    
    # Test 3: All 3s (neutral) - should show MID scores
    all_3s = {q_id: 3 for q_id in question_ids}
    result3 = test_scenario(
        "All 3s (Neutral)",
        all_3s,
        "Mid scores (40-60%)"
    )
    
    # Test 4: Mixed pattern (high O, low E, mid C, high A, low N)
    mixed = {}
    for i, q_id in enumerate(question_ids):
        # Pattern: O=5, E=1, C=3, A=5, N=1 (cycling)
        pattern = [5, 1, 3, 5, 1]
        mixed[q_id] = pattern[i % 5]
    result4 = test_scenario(
        "Mixed Pattern (O=5, E=1, C=3, A=5, N=1)",
        mixed,
        "Varied scores"
    )
    
    # Test 5: Random pattern
    import random
    random_responses = {q_id: random.randint(1, 5) for q_id in question_ids}
    result5 = test_scenario(
        "Random Pattern",
        random_responses,
        "Varied scores"
    )
    
    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    
    results = [r for r in [result1, result2, result3, result4, result5] if r]
    
    mbti_issues = sum(1 for r in results if r.get("mbti", "").startswith("X") or "X" in r.get("mbti", ""))
    all_50_issues = sum(1 for r in results if r.get("all_50", False))
    
    print(f"\nTests run: {len(results)}")
    print(f"MBTI issues (X present): {mbti_issues}/{len(results)}")
    print(f"All-50% issues: {all_50_issues}/{len(results)}")
    
    if mbti_issues > 0:
        print(f"\n❌ ISSUE: MBTI generation is producing X values")
        print(f"   This suggests confidence thresholds are too high or scoring is defaulting")
    
    if all_50_issues > 0:
        print(f"\n❌ ISSUE: Trait scores are defaulting to 50%")
        print(f"   This suggests:")
        print(f"   - Questions might not be matching (IDs don't match)")
        print(f"   - Scoring logic might be defaulting to neutral")
        print(f"   - Responses might not be reaching the scorer")
    
    if mbti_issues == 0 and all_50_issues == 0:
        print(f"\n✓ All tests passed - no issues detected")
    else:
        print(f"\n⚠️  Issues detected - check individual test results above")

if __name__ == "__main__":
    main()

