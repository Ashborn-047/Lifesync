#!/bin/bash

# LifeSync Personality Engine - API Test Script
# Tests the API endpoints using curl

BASE_URL="http://localhost:5174"

echo "=========================================="
echo "LifeSync Personality Engine - API Tests"
echo "=========================================="
echo ""

# Health check
echo "1. Testing Health Check..."
curl -X GET "${BASE_URL}/health"
echo -e "\n\n"

# Create assessment
echo "2. Creating Assessment..."
ASSESSMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/assessments" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000001",
    "responses": {
      "Q001": 3,
      "Q002": 4,
      "Q050": 1,
      "Q120": 5
    }
  }')

echo "$ASSESSMENT_RESPONSE" | python -m json.tool
echo ""

# Extract assessment_id (requires jq or python)
ASSESSMENT_ID=$(echo "$ASSESSMENT_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin).get('assessment_id', ''))" 2>/dev/null)

if [ -z "$ASSESSMENT_ID" ]; then
    echo "❌ Failed to extract assessment_id"
    echo "Please replace {REPLACE_ID} in the next command manually"
    ASSESSMENT_ID="{REPLACE_ID}"
fi

echo "Assessment ID: $ASSESSMENT_ID"
echo ""

# Generate explanation
echo "3. Generating Explanation..."
curl -X POST "${BASE_URL}/v1/assessments/${ASSESSMENT_ID}/generate_explanation" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": null
  }' | python -m json.tool

echo ""
echo "=========================================="
echo "Tests Complete"
echo "=========================================="

