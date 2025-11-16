"""
Test scorer directly to see what's happening
"""

import sys
import io
from pathlib import Path

# Fix encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from src.scorer import score_answers

# Test with Q001-Q030 (what API returns)
question_ids = [f"Q{i:03d}" for i in range(1, 31)]
responses = {q_id: 5 for q_id in question_ids}

print("="*60)
print("Testing scorer directly with Q001-Q030 (all 5s)")
print("="*60)
print(f"Question IDs: {question_ids[:5]}... (showing first 5)")
print(f"Responses: All 5s")

result = score_answers(responses)

print(f"\nResults:")
print(f"  MBTI: {result['dominant']['mbti_proxy']}")
print(f"  Responses processed: {result['responses_count']}")
print(f"  Coverage: {result['coverage']}%")
print(f"\n  Trait Scores:")
all_50 = True
for trait, score in result['traits'].items():
    pct = score * 100
    is_50 = abs(pct - 50.0) < 0.1
    marker = "[ERROR]" if is_50 else "[OK]"
    print(f"    {marker} {trait}: {score:.3f} ({pct:.1f}%)")
    if not is_50:
        all_50 = False

print(f"\n  Trait Confidence:")
for trait, conf in result['confidence']['traits'].items():
    print(f"    {trait}: {conf:.3f}")

if all_50:
    print("\n[ERROR] All traits at 50% - scorer is not processing questions!")
    print("   This suggests questions are being skipped in the scorer")
else:
    print("\n[OK] Scoring works correctly")

