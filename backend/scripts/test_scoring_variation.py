"""
LifeSync Personality Engine - Scoring Variation Test Script

This script automatically generates N random quiz attempts to verify:
1. Scoring is NOT biased (produces varied results)
2. Outputs show variation across different responses
3. MBTI results vary
4. Big Five scores vary
5. Explanations are generated correctly

Usage:
    python -m scripts.test_scoring_variation
"""

import random
import requests
import time
import json
import sys
import uuid
from typing import Dict, List, Any

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_URL = "http://localhost:5174"

NUM_ATTEMPTS = 10          # Run 10 personality tests
QUESTIONS_COUNT = 30       # Use 30 questions (matching web app limit)


def get_question_ids() -> List[str]:
    """
    Get balanced question IDs from smart_quiz_30.json.
    This ensures all 5 traits are covered evenly (6 questions per trait).
    Returns list of question IDs like ["Q001", "Q007", ...]
    """
    import json
    from pathlib import Path
    
    # Try to load from smart_quiz_30.json for balanced coverage
    script_dir = Path(__file__).parent
    smart_quiz_path = script_dir.parent / "data" / "question_bank" / "smart_quiz_30.json"
    
    if smart_quiz_path.exists():
        try:
            with open(smart_quiz_path, 'r', encoding='utf-8') as f:
                smart_quiz = json.load(f)
            question_ids = smart_quiz.get("question_ids", [])
            if len(question_ids) > 0:
                print(f"[OK] Using balanced questions from smart_quiz_30.json ({len(question_ids)} questions)")
                # Use all available questions (should be 30, but handle if less)
                return question_ids[:min(QUESTIONS_COUNT, len(question_ids))]
        except Exception as e:
            print(f"[WARN] Failed to load smart_quiz_30.json: {e}")
    else:
        print(f"[WARN] smart_quiz_30.json not found at {smart_quiz_path}")
    
    # Fallback: fetch from API
    try:
        resp = requests.get(f"{API_URL}/v1/questions", timeout=10)
        if resp.status_code == 200:
            questions = resp.json()
            # Handle both array and wrapped object formats
            if isinstance(questions, dict) and "questions" in questions:
                questions = questions["questions"]
            # Get first N questions
            question_ids = [q["id"] for q in questions[:QUESTIONS_COUNT]]
            print(f"[OK] Fetched {len(question_ids)} question IDs from API")
            return question_ids
        else:
            print(f"[WARN] Failed to fetch questions: {resp.status_code}")
            # Fallback: generate question IDs
            return [f"Q{i:03d}" for i in range(1, QUESTIONS_COUNT + 1)]
    except Exception as e:
        print(f"[WARN] Error fetching questions: {e}")
        # Fallback: generate question IDs
        return [f"Q{i:03d}" for i in range(1, QUESTIONS_COUNT + 1)]


def random_responses(question_ids: List[str]) -> Dict[str, int]:
    """
    Generate random responses for given question IDs.
    
    Returns:
        Dictionary mapping question_id to response value (1-5)
        Example: {"Q001": 3, "Q002": 5, ...}
    """
    return {
        qid: random.randint(1, 5)
        for qid in question_ids
    }


def run_simulation(attempt_num: int) -> Dict[str, Any]:
    """
    Run a single assessment simulation.
    
    Returns:
        Dictionary with assessment results and explanation
    """
    print(f"\n{'='*60}")
    print(f"Attempt {attempt_num + 1}/{NUM_ATTEMPTS}")
    print(f"{'='*60}")
    
    # Get question IDs
    question_ids = get_question_ids()
    responses = random_responses(question_ids)
    
    # Step 1: Create assessment
    print("\n[1] Creating assessment...")
    try:
        resp = requests.post(
            f"{API_URL}/v1/assessments",
            json={
                "user_id": str(uuid.uuid4()),  # Generate proper UUID
                "responses": responses,
                "quiz_type": "full"
            },
            timeout=30
        )
        resp.raise_for_status()
        assessment_data = resp.json()
        assessment_id = assessment_data["assessment_id"]
        
        print(f"[OK] Assessment created: {assessment_id}")
        
        # Extract trait scores
        traits = assessment_data.get("traits", {})
        mbti = assessment_data.get("dominant", {}).get("mbti_proxy", "N/A")
        
        print(f"[OK] MBTI: {mbti}")
        print(f"[OK] Traits: {', '.join([f'{k}: {v:.2f}' for k, v in sorted(traits.items())])}")
        
    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                error_msg = error_detail.get("detail", error_msg)
            except:
                error_msg = e.response.text[:200] if hasattr(e.response, 'text') else error_msg
        print(f"[ERROR] Failed to create assessment: {error_msg}")
        return {"error": error_msg}
    
    # Step 2: Generate explanation
    print("\n[2] Generating explanation...")
    try:
        resp2 = requests.post(
            f"{API_URL}/v1/assessments/{assessment_id}/generate_explanation",
            json={},
            timeout=60  # LLM can take time
        )
        resp2.raise_for_status()
        explanation_data = resp2.json()
        
        summary = explanation_data.get("summary", "")
        strengths = explanation_data.get("strengths", [])
        challenges = explanation_data.get("challenges", [])
        
        # Fallback to steps if new format not available
        if not strengths and explanation_data.get("steps"):
            # Try to parse from steps format
            steps = explanation_data.get("steps", [])
            strengths = [s.replace("Strength: ", "") for s in steps if "Strength:" in s or "strength" in s.lower()]
            challenges = [s.replace("Challenge: ", "") for s in steps if "Challenge:" in s or "challenge" in s.lower()]
        
        summary_length = len(summary.split()) if summary else 0
        strengths_count = len(strengths)
        challenges_count = len(challenges)
        
        print(f"✓ Explanation generated")
        print(f"  Summary: {summary_length} words")
        print(f"  Strengths: {strengths_count} items")
        print(f"  Challenges: {challenges_count} items")
        
        return {
            "assessment_id": assessment_id,
            "mbti": mbti,
            "traits": traits,
            "summary_length": summary_length,
            "strengths_count": strengths_count,
            "challenges_count": challenges_count,
            "summary_preview": summary[:100] + "..." if len(summary) > 100 else summary
        }
        
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to generate explanation: {e}")
        return {
            "assessment_id": assessment_id,
            "mbti": mbti,
            "traits": traits,
            "error": f"Explanation failed: {str(e)}"
        }


def analyze_results(results: List[Dict[str, Any]]) -> None:
    """
    Analyze and display variation statistics.
    """
    print(f"\n{'='*60}")
    print("ANALYSIS: Scoring Variation Test")
    print(f"{'='*60}\n")
    
    # Filter out errors
    valid_results = [r for r in results if "error" not in r]
    
    if not valid_results:
        print("[ERROR] No valid results to analyze!")
        return
    
    print(f"Valid assessments: {len(valid_results)}/{len(results)}\n")
    
    # MBTI Distribution
    mbti_counts = {}
    for r in valid_results:
        mbti = r.get("mbti", "N/A")
        mbti_counts[mbti] = mbti_counts.get(mbti, 0) + 1
    
    print("MBTI Distribution:")
    for mbti, count in sorted(mbti_counts.items(), key=lambda x: -x[1]):
        percentage = (count / len(valid_results)) * 100
        print(f"  {mbti}: {count} ({percentage:.1f}%)")
    
    # Trait Score Variation
    print("\nTrait Score Variation (min/max/avg):")
    trait_names = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
    
    for trait in trait_names:
        scores = [r.get("traits", {}).get(trait, 0) for r in valid_results if trait in r.get("traits", {})]
        if scores:
            min_score = min(scores)
            max_score = max(scores)
            avg_score = sum(scores) / len(scores)
            std_dev = (sum((s - avg_score) ** 2 for s in scores) / len(scores)) ** 0.5
            
            print(f"  {trait:20s}: min={min_score:.3f}, max={max_score:.3f}, avg={avg_score:.3f}, std={std_dev:.3f}")
    
    # Explanation Length Variation
    summary_lengths = [r.get("summary_length", 0) for r in valid_results if "summary_length" in r]
    if summary_lengths:
        print(f"\nExplanation Summary Length:")
        print(f"  Min: {min(summary_lengths)} words")
        print(f"  Max: {max(summary_lengths)} words")
        print(f"  Avg: {sum(summary_lengths) / len(summary_lengths):.1f} words")
    
    # Strengths/Challenges Count
    strengths_counts = [r.get("strengths_count", 0) for r in valid_results if "strengths_count" in r]
    challenges_counts = [r.get("challenges_count", 0) for r in valid_results if "challenges_count" in r]
    
    if strengths_counts:
        print(f"\nStrengths Count: min={min(strengths_counts)}, max={max(strengths_counts)}, avg={sum(strengths_counts)/len(strengths_counts):.1f}")
    if challenges_counts:
        print(f"Challenges Count: min={min(challenges_counts)}, max={max(challenges_counts)}, avg={sum(challenges_counts)/len(challenges_counts):.1f}")
    
    # Variation Check
    print(f"\n{'='*60}")
    print("VARIATION CHECK:")
    
    # Check if MBTI varies
    unique_mbti = len(set(r.get("mbti", "N/A") for r in valid_results))
    if unique_mbti > 1:
        print(f"[OK] MBTI varies: {unique_mbti} different types found")
    else:
        print(f"[WARN] MBTI shows no variation: all results are {valid_results[0].get('mbti', 'N/A')}")
    
    # Check if trait scores vary
    trait_variation = {}
    for trait in trait_names:
        scores = [r.get("traits", {}).get(trait, 0) for r in valid_results if trait in r.get("traits", {})]
        if scores:
            score_range = max(scores) - min(scores)
            trait_variation[trait] = score_range
    
    high_variation = [t for t, r in trait_variation.items() if r > 0.3]
    low_variation = [t for t, r in trait_variation.items() if r < 0.1]
    
    if high_variation:
        print(f"[OK] High trait variation: {', '.join(high_variation)} (range > 0.3)")
    if low_variation:
        print(f"[WARN] Low trait variation: {', '.join(low_variation)} (range < 0.1)")
    
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("="*60)
    print("LifeSync Personality Engine - Scoring Variation Test")
    print("="*60)
    print(f"\nRunning {NUM_ATTEMPTS} simulated assessments...")
    print(f"API URL: {API_URL}")
    print(f"Questions per assessment: {QUESTIONS_COUNT}\n")
    
    # Check if API is available
    try:
        health_resp = requests.get(f"{API_URL}/health", timeout=5)
        if health_resp.status_code == 200:
            print("[OK] API is available\n")
        else:
            print(f"[WARN] API health check returned {health_resp.status_code}\n")
    except Exception as e:
        print(f"[ERROR] Cannot connect to API: {e}")
        print("  Make sure the backend server is running on port 5174")
        exit(1)
    
    results = []
    
    for i in range(NUM_ATTEMPTS):
        result = run_simulation(i)
        results.append(result)
        
        # Small delay between requests
        if i < NUM_ATTEMPTS - 1:
            time.sleep(1)
    
    # Analyze results
    analyze_results(results)
    
    # Save results to file
    output_file = "scoring_variation_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"[OK] Results saved to {output_file}")

