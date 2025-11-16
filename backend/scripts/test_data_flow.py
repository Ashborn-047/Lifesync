"""
Test data flow: POST vs GET to find where data gets corrupted
"""

import requests
import json
from uuid import uuid4

API_URL = "http://localhost:5174"

# Get question IDs
question_ids = [f"Q{i:03d}" for i in range(1, 31)]

# Test: Submit with all 5s
print("="*60)
print("TEST: Submit assessment with all 5s")
print("="*60)

responses = {q_id: 5 for q_id in question_ids}

resp = requests.post(
    f"{API_URL}/v1/assessments",
    json={
        "user_id": str(uuid4()),
        "responses": responses,
        "quiz_type": "quick"
    },
    timeout=30
)

if resp.status_code != 200:
    print(f"ERROR: {resp.status_code}")
    print(resp.text)
    exit(1)

post_data = resp.json()
assessment_id = post_data["assessment_id"]

print(f"\nPOST /v1/assessments returns:")
print(f"  Assessment ID: {assessment_id}")
print(f"  MBTI: {post_data.get('dominant', {}).get('mbti_proxy', 'N/A')}")
print(f"  Traits:")
for trait, score in post_data.get("traits", {}).items():
    print(f"    {trait}: {score:.3f} ({score*100:.1f}%)")

# Now GET the same assessment
print(f"\n{'='*60}")
print("TEST: GET the same assessment")
print("="*60)

get_resp = requests.get(
    f"{API_URL}/v1/assessments/{assessment_id}",
    timeout=10
)

if get_resp.status_code != 200:
    print(f"ERROR: {get_resp.status_code}")
    print(get_resp.text)
    exit(1)

get_data = get_resp.json()

print(f"\nGET /v1/assessments/{assessment_id} returns:")
print(f"  Assessment ID: {get_data.get('assessment_id', 'N/A')}")
print(f"  MBTI: {get_data.get('dominant', {}).get('mbti_proxy', 'N/A')}")
print(f"  Traits:")
for trait, score in get_data.get("traits", {}).items():
    print(f"    {trait}: {score:.3f} ({score*100:.1f}%)")

# Compare
print(f"\n{'='*60}")
print("COMPARISON")
print("="*60)

post_traits = post_data.get("traits", {})
get_traits = get_data.get("traits", {})

mismatches = []
for trait in post_traits.keys():
    post_score = post_traits.get(trait, 0)
    get_score = get_traits.get(trait, 0)
    if abs(post_score - get_score) > 0.001:
        mismatches.append(f"{trait}: POST={post_score:.3f}, GET={get_score:.3f}")

post_mbti = post_data.get("dominant", {}).get("mbti_proxy", "N/A")
get_mbti = get_data.get("dominant", {}).get("mbti_proxy", "N/A")

if mismatches:
    print("❌ TRAIT SCORE MISMATCHES:")
    for m in mismatches:
        print(f"  {m}")
else:
    print("✓ Trait scores match between POST and GET")

if post_mbti != get_mbti:
    print(f"❌ MBTI MISMATCH: POST={post_mbti}, GET={get_mbti}")
else:
    print(f"✓ MBTI matches: {post_mbti}")

