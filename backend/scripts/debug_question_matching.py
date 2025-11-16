"""
Debug script to check if question IDs from API match question bank
"""

import requests
import json
from pathlib import Path

API_URL = "http://localhost:5174"

# Get question IDs from API
print("Fetching questions from API...")
api_resp = requests.get(f"{API_URL}/v1/questions?limit=30")
api_data = api_resp.json()
api_questions = api_data.get("questions", api_data) if isinstance(api_data, dict) else api_data
api_ids = [q["id"] for q in api_questions[:10]]  # First 10
print(f"API returns {len(api_questions)} questions")
print(f"First 10 IDs from API: {api_ids}")

# Get question IDs from question bank
print("\nLoading question bank...")
bank_path = Path(__file__).parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"
with open(bank_path, 'r') as f:
    bank_data = json.load(f)
bank_questions = bank_data["questions"]
bank_ids = [q["id"] for q in bank_questions[:10]]  # First 10
print(f"Question bank has {len(bank_questions)} questions")
print(f"First 10 IDs from bank: {bank_ids}")

# Check if API IDs exist in bank
print("\nChecking if API IDs exist in question bank...")
missing = []
for api_id in api_ids:
    found = any(q["id"] == api_id for q in bank_questions)
    if not found:
        missing.append(api_id)
        print(f"  ❌ {api_id} NOT FOUND in question bank")

if not missing:
    print("  [OK] All API question IDs exist in question bank")

# Test scoring with API question IDs
print("\n" + "="*60)
print("Testing scoring with API question IDs...")
print("="*60)

test_responses = {q["id"]: 5 for q in api_questions[:30]}
print(f"Submitting {len(test_responses)} responses (all 5s)")

import uuid
resp = requests.post(
    f"{API_URL}/v1/assessments",
    json={
        "user_id": str(uuid.uuid4()),
        "responses": test_responses,
        "quiz_type": "quick"
    },
    timeout=30
)

if resp.status_code == 200:
    data = resp.json()
    traits = data.get("traits", {})
    mbti = data.get("dominant", {}).get("mbti_proxy", "N/A")
    
    print(f"\nResults:")
    print(f"  MBTI: {mbti}")
    all_50 = True
    for trait, score in traits.items():
        pct = score * 100
        is_50 = abs(pct - 50.0) < 0.1
        marker = "⚠️" if is_50 else "✓"
        print(f"  {marker} {trait}: {score:.3f} ({pct:.1f}%)")
        if not is_50:
            all_50 = False
    
    if all_50:
        print("\n[ERROR] All traits at 50% - questions are NOT matching!")
        print("   This means the question IDs from API don't match the question bank")
    else:
        print("\n[OK] Scoring works - questions are matching correctly")
else:
    print(f"ERROR: {resp.status_code}")
    print(resp.text)

