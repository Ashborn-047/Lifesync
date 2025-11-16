"""
LifeSync Scoring Stress Test

Runs:
- 500 scoring tests (no LLM)
- 40 explanation tests (LLM)

Stores all results into Supabase table: scoring_stress_tests
Analyzes trait score variation and checks for biases
"""

import random
import time
import requests
import json
import sys
from uuid import uuid4
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

API_URL = "http://localhost:5174"
TOTAL_RUNS = 500
LLM_RUNS = 40  # Keep it low to avoid LLM quota issues
QUESTIONS_COUNT = 30  # Use balanced 30-question set

# Load Supabase credentials from environment
import os
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

# Results storage (in-memory for analysis)
results: List[Dict[str, Any]] = []


def get_balanced_question_ids() -> List[str]:
    """
    Get balanced question IDs from smart_quiz_30.json.
    This ensures all 5 traits are covered evenly (6 questions per trait).
    """
    script_dir = Path(__file__).parent
    smart_quiz_path = script_dir.parent / "data" / "question_bank" / "smart_quiz_30.json"
    
    if smart_quiz_path.exists():
        try:
            with open(smart_quiz_path, 'r', encoding='utf-8') as f:
                smart_quiz = json.load(f)
            question_ids = smart_quiz.get("question_ids", [])
            if len(question_ids) > 0:
                return question_ids[:QUESTIONS_COUNT]
        except Exception as e:
            print(f"[WARN] Failed to load smart_quiz_30.json: {e}")
    
    # Fallback: generate question IDs
    return [f"Q{i:03d}" for i in range(1, QUESTIONS_COUNT + 1)]


def random_responses(question_ids: List[str]) -> Dict[str, int]:
    """
    Generate random responses for given question IDs.
    
    Returns:
        Dictionary mapping question_id to response value (1-5)
    """
    return {
        qid: random.randint(1, 5)
        for qid in question_ids
    }


def store_in_supabase(payload: Dict[str, Any]) -> bool:
    """
    Store test result in Supabase.
    
    Returns:
        True if successful, False otherwise
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
        return False
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/scoring_stress_tests"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=5)
        return resp.status_code in [200, 201]
    except Exception as e:
        print(f"[WARN] Failed to store in Supabase: {e}")
        return False


def run_once(run_index: int, question_ids: List[str], with_llm: bool = False) -> Dict[str, Any]:
    """
    Run a single assessment test.
    
    Returns:
        Dictionary with test results
    """
    responses = random_responses(question_ids)
    
    # Convert to backend format: {question_id: response_value}
    responses_dict = {qid: val for qid, val in responses.items()}
    
    # 1. Scoring
    try:
        req = requests.post(
            f"{API_URL}/v1/assessments",
            json={
                "user_id": str(uuid4()),
                "responses": responses_dict,
                "quiz_type": "full"
            },
            timeout=30
        )
        req.raise_for_status()
        data = req.json()
        
        assessment_id = data.get("assessment_id")
        traits = data.get("traits", {})
        mbti = data.get("dominant", {}).get("mbti_proxy", "UNKNOWN")
        
    except Exception as e:
        print(f"[ERROR] Run {run_index}: Scoring failed: {e}")
        return None
    
    summary_text = None
    strengths_count = 0
    challenges_count = 0
    
    # 2. Optional LLM call
    if with_llm:
        try:
            req2 = requests.post(
                f"{API_URL}/v1/assessments/{assessment_id}/generate_explanation",
                json={},
                timeout=60
            )
            req2.raise_for_status()
            ex = req2.json()
            
            summary_text = ex.get("summary", "")
            strengths = ex.get("strengths", [])
            challenges = ex.get("challenges", [])
            strengths_count = len(strengths) if strengths else 0
            challenges_count = len(challenges) if challenges else 0
            
            time.sleep(2)  # Protect LLM quota
        except Exception as e:
            print(f"[WARN] Run {run_index}: LLM generation failed: {e}")
    
    # 3. Build result record
    record = {
        "id": str(uuid4()),
        "run_index": run_index,
        "assessment_id": assessment_id,
        "openness": traits.get("Openness", 0.0),
        "conscientiousness": traits.get("Conscientiousness", 0.0),
        "extraversion": traits.get("Extraversion", 0.0),
        "agreeableness": traits.get("Agreeableness", 0.0),
        "neuroticism": traits.get("Neuroticism", 0.0),
        "mbti": mbti,
        "explanation_summary": summary_text,
        "strengths_count": strengths_count,
        "challenges_count": challenges_count,
        "raw_responses": json.dumps(responses_dict)  # Store as JSON string
    }
    
    # Store in Supabase (if configured)
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE:
        store_in_supabase(record)
    
    # Store in memory for analysis
    results.append(record)
    
    # Print progress
    print(f"[{run_index:3d}/{TOTAL_RUNS}] MBTI={mbti:4s} | "
          f"O={traits.get('Openness', 0):.3f} C={traits.get('Conscientiousness', 0):.3f} "
          f"E={traits.get('Extraversion', 0):.3f} A={traits.get('Agreeableness', 0):.3f} "
          f"N={traits.get('Neuroticism', 0):.3f}")
    
    return record


def analyze_results() -> None:
    """
    Analyze results for biases and trait variation.
    """
    if not results:
        print("[ERROR] No results to analyze!")
        return
    
    print("\n" + "=" * 80)
    print("BIAS ANALYSIS - TRAIT SCORE VARIATION")
    print("=" * 80)
    
    # Filter valid results
    valid_results = [r for r in results if r is not None]
    
    if not valid_results:
        print("[ERROR] No valid results!")
        return
    
    print(f"\nTotal valid assessments: {len(valid_results)}")
    print(f"With LLM explanations: {sum(1 for r in valid_results if r.get('explanation_summary'))}")
    
    # MBTI Distribution
    print("\n" + "-" * 80)
    print("MBTI DISTRIBUTION")
    print("-" * 80)
    mbti_counts = defaultdict(int)
    for r in valid_results:
        mbti = r.get("mbti", "UNKNOWN")
        mbti_counts[mbti] += 1
    
    for mbti, count in sorted(mbti_counts.items(), key=lambda x: -x[1]):
        percentage = (count / len(valid_results)) * 100
        print(f"  {mbti:4s}: {count:3d} ({percentage:5.1f}%)")
    
    # Trait Score Statistics
    print("\n" + "-" * 80)
    print("TRAIT SCORE VARIATION (min/max/avg/std dev/range)")
    print("-" * 80)
    
    trait_names = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
    trait_keys = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]
    
    print(f"{'Trait':<20} {'Min':<8} {'Max':<8} {'Average':<10} {'Std Dev':<10} {'Range':<8}")
    print("-" * 80)
    
    trait_stats = {}
    for trait_name, trait_key in zip(trait_names, trait_keys):
        scores = [r.get(trait_key, 0.0) for r in valid_results if trait_key in r]
        
        if scores:
            min_score = min(scores)
            max_score = max(scores)
            avg_score = sum(scores) / len(scores)
            std_dev = (sum((s - avg_score) ** 2 for s in scores) / len(scores)) ** 0.5
            score_range = max_score - min_score
            
            trait_stats[trait_name] = {
                "min": min_score,
                "max": max_score,
                "avg": avg_score,
                "std": std_dev,
                "range": score_range
            }
            
            print(f"{trait_name:<20} {min_score:<8.3f} {max_score:<8.3f} {avg_score:<10.3f} "
                  f"{std_dev:<10.3f} {score_range:<8.3f}")
    
    # Variation Check
    print("\n" + "-" * 80)
    print("VARIATION CHECK")
    print("-" * 80)
    
    # Check MBTI variation
    unique_mbti = len(set(r.get("mbti", "UNKNOWN") for r in valid_results))
    print(f"MBTI Types Found: {unique_mbti} different types")
    if unique_mbti >= 8:
        print("  [OK] Good MBTI variation (8+ types)")
    elif unique_mbti >= 4:
        print("  [WARN] Moderate MBTI variation (4-7 types)")
    else:
        print("  [ERROR] Low MBTI variation (<4 types) - Possible bias!")
    
    # Check trait variation
    high_variation = []
    medium_variation = []
    low_variation = []
    
    for trait_name, stats in trait_stats.items():
        if stats["range"] > 0.3:
            high_variation.append(trait_name)
        elif stats["range"] >= 0.1:
            medium_variation.append(trait_name)
        else:
            low_variation.append(trait_name)
    
    if high_variation:
        print(f"\n[OK] High Trait Variation (>0.3): {', '.join(high_variation)}")
    if medium_variation:
        print(f"[INFO] Medium Trait Variation (0.1-0.3): {', '.join(medium_variation)}")
    if low_variation:
        print(f"[WARN] Low Trait Variation (<0.1): {', '.join(low_variation)} - Possible bias!")
    
    # Check for default values (0.5 bias)
    print("\n" + "-" * 80)
    print("DEFAULT VALUE CHECK (0.5 bias detection)")
    print("-" * 80)
    
    for trait_name, trait_key in zip(trait_names, trait_keys):
        scores = [r.get(trait_key, 0.0) for r in valid_results if trait_key in r]
        exactly_0_5 = sum(1 for s in scores if abs(s - 0.5) < 0.001)
        percentage = (exactly_0_5 / len(scores)) * 100 if scores else 0
        
        if percentage > 50:
            print(f"  [WARN] {trait_name}: {exactly_0_5}/{len(scores)} ({percentage:.1f}%) are exactly 0.5 - Possible default bias!")
        elif percentage > 20:
            print(f"  [INFO] {trait_name}: {exactly_0_5}/{len(scores)} ({percentage:.1f}%) are exactly 0.5")
        else:
            print(f"  [OK] {trait_name}: {exactly_0_5}/{len(scores)} ({percentage:.1f}%) are exactly 0.5")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    all_high_variation = len(low_variation) == 0
    good_mbti = unique_mbti >= 8
    no_default_bias = all(
        sum(1 for r in valid_results if abs(r.get(trait_key, 0) - 0.5) < 0.001) / len(valid_results) < 0.2
        for trait_key in trait_keys
    )
    
    if all_high_variation and good_mbti and no_default_bias:
        print("[OK] No significant biases detected. System appears unbiased.")
    elif all_high_variation:
        print("[WARN] Trait variation is good, but MBTI or default value issues detected.")
    else:
        print("[ERROR] Biases detected! Review trait variation and scoring logic.")
    
    print("=" * 80)


if __name__ == "__main__":
    print("=" * 80)
    print("LifeSync Scoring Stress Test")
    print("=" * 80)
    print(f"Running {TOTAL_RUNS} scoring tests...")
    print(f"Running {LLM_RUNS} explanation tests (with LLM)...")
    print(f"API URL: {API_URL}")
    print(f"Questions per assessment: {QUESTIONS_COUNT}")
    print()
    
    # Check API availability
    try:
        health_resp = requests.get(f"{API_URL}/health", timeout=5)
        if health_resp.status_code == 200:
            print("[OK] API is available\n")
        else:
            print(f"[WARN] API health check returned {health_resp.status_code}\n")
    except Exception as e:
        print(f"[ERROR] Cannot connect to API: {e}")
        print("  Make sure the backend server is running on port 5174")
        sys.exit(1)
    
    # Get balanced question IDs
    question_ids = get_balanced_question_ids()
    print(f"[OK] Using {len(question_ids)} balanced questions\n")
    
    # Run tests
    start_time = time.time()
    
    for i in range(1, TOTAL_RUNS + 1):
        with_llm = (i <= LLM_RUNS)
        run_once(i, question_ids, with_llm)
        
        # Small delay to maintain API sanity
        if i < TOTAL_RUNS:
            time.sleep(0.3)
    
    elapsed_time = time.time() - start_time
    
    print(f"\n[OK] Stress test complete in {elapsed_time:.1f} seconds")
    print(f"[OK] Results stored: {len(results)} records")
    
    # Analyze results
    analyze_results()
    
    # Save results to JSON file
    output_file = "stress_test_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\n[OK] Results saved to {output_file}")

