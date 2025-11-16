"""
Generate formatted table output from scoring variation test results
"""

import json
from typing import List, Dict, Any

def load_results() -> List[Dict[str, Any]]:
    """Load results from JSON file"""
    with open("scoring_variation_results.json", "r", encoding="utf-8") as f:
        return json.load(f)

def format_table(results: List[Dict[str, Any]]) -> str:
    """Generate formatted table output"""
    
    # Filter out errors
    valid_results = [r for r in results if "error" not in r]
    
    if not valid_results:
        return "No valid results to display."
    
    output = []
    output.append("=" * 120)
    output.append("SCORING VARIATION TEST - DETAILED RESULTS TABLE")
    output.append("=" * 120)
    output.append("")
    
    # Header
    header = f"{'#':<4} {'Assessment ID':<38} {'MBTI':<6} {'Open':<6} {'Cons':<6} {'Extra':<6} {'Agree':<6} {'Neuro':<6} {'Summary':<8} {'Str':<4} {'Chal':<4}"
    output.append(header)
    output.append("-" * 120)
    
    # Data rows
    for i, result in enumerate(valid_results, 1):
        assessment_id = result.get("assessment_id", "N/A")[:36]
        mbti = result.get("mbti", "N/A")
        traits = result.get("traits", {})
        
        open_score = f"{traits.get('Openness', 0):.3f}"
        cons_score = f"{traits.get('Conscientiousness', 0):.3f}"
        extra_score = f"{traits.get('Extraversion', 0):.3f}"
        agree_score = f"{traits.get('Agreeableness', 0):.3f}"
        neuro_score = f"{traits.get('Neuroticism', 0):.3f}"
        
        summary_len = result.get("summary_length", 0)
        strengths_count = result.get("strengths_count", 0)
        challenges_count = result.get("challenges_count", 0)
        
        row = f"{i:<4} {assessment_id:<38} {mbti:<6} {open_score:<6} {cons_score:<6} {extra_score:<6} {agree_score:<6} {neuro_score:<6} {summary_len:<8} {strengths_count:<4} {challenges_count:<4}"
        output.append(row)
    
    output.append("-" * 120)
    output.append("")
    
    # Statistics Summary
    output.append("=" * 120)
    output.append("STATISTICAL SUMMARY")
    output.append("=" * 120)
    output.append("")
    
    # MBTI Distribution
    mbti_counts = {}
    for r in valid_results:
        mbti = r.get("mbti", "N/A")
        mbti_counts[mbti] = mbti_counts.get(mbti, 0) + 1
    
    output.append("MBTI Distribution:")
    for mbti, count in sorted(mbti_counts.items(), key=lambda x: -x[1]):
        percentage = (count / len(valid_results)) * 100
        output.append(f"  {mbti}: {count} occurrence(s) ({percentage:.1f}%)")
    output.append("")
    
    # Trait Statistics
    trait_names = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
    output.append("Trait Score Statistics:")
    output.append(f"{'Trait':<20} {'Min':<8} {'Max':<8} {'Average':<8} {'Std Dev':<8} {'Range':<8}")
    output.append("-" * 60)
    
    for trait in trait_names:
        scores = [r.get("traits", {}).get(trait, 0) for r in valid_results if trait in r.get("traits", {})]
        if scores:
            min_score = min(scores)
            max_score = max(scores)
            avg_score = sum(scores) / len(scores)
            std_dev = (sum((s - avg_score) ** 2 for s in scores) / len(scores)) ** 0.5
            score_range = max_score - min_score
            
            output.append(f"{trait:<20} {min_score:<8.3f} {max_score:<8.3f} {avg_score:<8.3f} {std_dev:<8.3f} {score_range:<8.3f}")
    
    output.append("")
    
    # Explanation Statistics
    summary_lengths = [r.get("summary_length", 0) for r in valid_results if "summary_length" in r]
    strengths_counts = [r.get("strengths_count", 0) for r in valid_results if "strengths_count" in r]
    challenges_counts = [r.get("challenges_count", 0) for r in valid_results if "challenges_count" in r]
    
    if summary_lengths:
        output.append("Explanation Summary Length:")
        output.append(f"  Min: {min(summary_lengths)} words")
        output.append(f"  Max: {max(summary_lengths)} words")
        output.append(f"  Average: {sum(summary_lengths) / len(summary_lengths):.1f} words")
        output.append("")
    
    if strengths_counts:
        output.append("Strengths Count:")
        output.append(f"  Min: {min(strengths_counts)}")
        output.append(f"  Max: {max(strengths_counts)}")
        output.append(f"  Average: {sum(strengths_counts) / len(strengths_counts):.1f}")
        output.append("")
    
    if challenges_counts:
        output.append("Challenges Count:")
        output.append(f"  Min: {min(challenges_counts)}")
        output.append(f"  Max: {max(challenges_counts)}")
        output.append(f"  Average: {sum(challenges_counts) / len(challenges_counts):.1f}")
        output.append("")
    
    # Variation Check
    output.append("=" * 120)
    output.append("VARIATION ANALYSIS")
    output.append("=" * 120)
    output.append("")
    
    unique_mbti = len(set(r.get("mbti", "N/A") for r in valid_results))
    if unique_mbti > 1:
        output.append(f"[OK] MBTI Variation: {unique_mbti} different types found (GOOD)")
    else:
        output.append(f"[WARN] MBTI Variation: All results are {valid_results[0].get('mbti', 'N/A')} (WARNING)")
    output.append("")
    
    # Trait variation check
    trait_variation = {}
    for trait in trait_names:
        scores = [r.get("traits", {}).get(trait, 0) for r in valid_results if trait in r.get("traits", {})]
        if scores:
            score_range = max(scores) - min(scores)
            trait_variation[trait] = score_range
    
    high_variation = [t for t, r in trait_variation.items() if r > 0.3]
    medium_variation = [t for t, r in trait_variation.items() if 0.1 <= r <= 0.3]
    low_variation = [t for t, r in trait_variation.items() if r < 0.1]
    
    if high_variation:
        output.append(f"[OK] High Trait Variation (>0.3): {', '.join(high_variation)}")
    if medium_variation:
        output.append(f"[INFO] Medium Trait Variation (0.1-0.3): {', '.join(medium_variation)}")
    if low_variation:
        output.append(f"[WARN] Low/No Trait Variation (<0.1): {', '.join(low_variation)}")
        output.append("  Note: Low variation may indicate insufficient question coverage for these traits")
    
    output.append("")
    output.append("=" * 120)
    
    return "\n".join(output)

if __name__ == "__main__":
    try:
        results = load_results()
        table = format_table(results)
        print(table)
        
        # Also save to file
        with open("scoring_analysis_table.txt", "w", encoding="utf-8") as f:
            f.write(table)
        print("\n[OK] Table saved to scoring_analysis_table.txt")
        
    except FileNotFoundError:
        print("[ERROR] scoring_variation_results.json not found. Run test_scoring_variation.py first.")
    except Exception as e:
        print(f"[ERROR] Failed to generate table: {e}")

