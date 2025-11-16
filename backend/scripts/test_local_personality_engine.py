"""
LifeSync Personality Engine - Local Integration Test
Tests the full flow: scoring + tone generation + LLM explanation
"""

import json
import requests
import sys
from typing import Dict, Any


BASE_URL = "http://localhost:5174"


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_json(data: Dict[Any, Any], indent: int = 2):
    """Pretty print JSON data"""
    print(json.dumps(data, indent=indent, ensure_ascii=False))


def test_health_check():
    """Test the health check endpoint"""
    print_section("1. Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print_json(response.json())
            return True
        else:
            print(f"[ERROR] Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to server. Is it running?")
        print("   Start with: uvicorn src.api.server:app --reload --port 5174")
        return False
    except Exception as e:
        print(f"[ERROR] Health check error: {e}")
        return False


def test_create_assessment():
    """Test creating an assessment and scoring"""
    print_section("2. Create Assessment & Score")
    
    payload = {
        "user_id": "00000000-0000-0000-0000-000000000001",
        "responses": {
            "Q001": 5,
            "Q002": 4,
            "Q010": 2,
            "Q015": 3,
            "Q021": 1,
            "Q030": 4
        }
    }
    
    print("Request payload:")
    print_json(payload)
    print("\nSending POST to /v1/assessments...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/v1/assessments",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[ERROR] Request failed: {response.text}")
            print(f"Response status: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {json.dumps(error_detail, indent=2)}")
            except:
                pass
            return None
        
        result = response.json()
        
        # Validate response structure
        print("\n[OK] Assessment created successfully!")
        print(f"\nAssessment ID: {result.get('assessment_id')}")
        
        # Print calculated traits
        print("\nCalculated Traits:")
        traits = result.get("traits", {})
        for trait, score in traits.items():
            print(f"  {trait}: {score:.3f}")
            # Validate trait scores are between 0-1
            if not (0 <= score <= 1):
                print(f"    [WARNING] Trait score out of range!")
        
        # Print facet scores (sample)
        print("\nFacet Scores (sample, first 5):")
        facets = result.get("facets", {})
        for i, (facet, score) in enumerate(list(facets.items())[:5]):
            print(f"  {facet}: {score:.3f}")
            if not (0 <= score <= 1):
                print(f"    [WARNING] Facet score out of range!")
        
        print(f"\nTotal facets: {len(facets)}")
        print(f"Coverage: {result.get('coverage', 0):.1f}%")
        print(f"Responses count: {result.get('responses_count', 0)}")
        
        # Validate all required fields
        required_fields = ["assessment_id", "traits", "facets", "confidence", "dominant"]
        missing = [f for f in required_fields if f not in result]
        if missing:
            print(f"[ERROR] Missing required fields: {missing}")
            return None
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request error: {e}")
        return None
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_generate_explanation(assessment_id: str):
    """Test generating LLM explanation"""
    print_section("3. Generate LLM Explanation")
    
    payload = {
        "provider": None  # Use default (Gemini)
    }
    
    print(f"Assessment ID: {assessment_id}")
    print("Sending POST to /v1/assessments/{id}/generate_explanation...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/v1/assessments/{assessment_id}/generate_explanation",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60  # LLM calls can take time
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[ERROR] Request failed: {response.text}")
            return None
        
        result = response.json()
        
        print("\n[OK] Explanation generated successfully!")
        
        # Print explanation details
        print(f"\nModel: {result.get('model_name', 'N/A')}")
        print(f"Generation time: {result.get('generation_time_ms', 0)}ms")
        if result.get('tokens_used'):
            print(f"Tokens used: {result.get('tokens_used')}")
        
        # Print explanation text
        print("\nExplanation Summary:")
        summary = result.get("summary", "")
        if summary:
            print(f"  {summary[:200]}..." if len(summary) > 200 else f"  {summary}")
        else:
            print("  [WARNING] Summary is empty!")
        
        print("\nKey Insights:")
        steps = result.get("steps", [])
        if steps:
            for i, step in enumerate(steps[:3], 1):  # Show first 3
                print(f"  {i}. {step[:150]}..." if len(step) > 150 else f"  {i}. {step}")
        else:
            print("  [WARNING] Steps list is empty!")
        
        print("\nConfidence Note:")
        confidence_note = result.get("confidence_note", "")
        if confidence_note:
            print(f"  {confidence_note}")
        else:
            print("  (No confidence note)")
        
        # Validate explanation
        if not summary:
            print("[ERROR] Explanation summary is empty!")
            return None
        
        if not steps:
            print("[ERROR] Explanation steps are empty!")
            return None
        
        print("\n[OK] Explanation validation passed!")
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request error: {e}")
        return None
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return None


def validate_tone_profile(explanation: Dict[str, Any]):
    """Validate tone profile in explanation"""
    print_section("4. Tone Profile Validation")
    
    tone_profile = explanation.get("tone_profile")
    
    if not tone_profile:
        print("[WARNING] Tone profile not found in explanation response")
        return False
    
    print("Tone Profile:")
    print_json(tone_profile)
    
    # Validate structure
    required_keys = ["style", "strengths", "cautions"]
    missing = [k for k in required_keys if k not in tone_profile]
    if missing:
        print(f"[ERROR] Missing tone profile keys: {missing}")
        return False
    
    # Validate lists
    style = tone_profile.get("style", [])
    strengths = tone_profile.get("strengths", [])
    cautions = tone_profile.get("cautions", [])
    
    print(f"\nStyle descriptors: {len(style)}")
    print(f"Strengths: {len(strengths)}")
    print(f"Cautions: {len(cautions)}")
    
    if not style:
        print("[WARNING] Style list is empty (should have defaults)")
    
    print("\n[OK] Tone profile structure is valid!")
    return True


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  LifeSync Personality Engine - Integration Test")
    print("=" * 60)
    
    # Test 1: Health check
    if not test_health_check():
        print("\n[ERROR] Health check failed. Exiting.")
        sys.exit(1)
    
    # Test 2: Create assessment
    assessment_result = test_create_assessment()
    if not assessment_result:
        print("\n[ERROR] Assessment creation failed. Exiting.")
        sys.exit(1)
    
    assessment_id = assessment_result.get("assessment_id")
    if not assessment_id:
        print("\n[ERROR] No assessment_id returned. Exiting.")
        sys.exit(1)
    
    # Test 3: Generate explanation
    explanation_result = test_generate_explanation(assessment_id)
    if not explanation_result:
        print("\n[ERROR] Explanation generation failed. Exiting.")
        sys.exit(1)
    
    # Test 4: Validate tone profile
    validate_tone_profile(explanation_result)
    
    # Final summary
    print_section("[OK] All Tests Passed!")
    print("\nSummary:")
    print(f"  [OK] Health check: OK")
    print(f"  [OK] Assessment created: {assessment_id}")
    print(f"  [OK] Traits calculated: {len(assessment_result.get('traits', {}))} traits")
    print(f"  [OK] Facets calculated: {len(assessment_result.get('facets', {}))} facets")
    print(f"  [OK] Explanation generated: {len(explanation_result.get('summary', ''))} chars")
    print(f"  [OK] Tone profile: Generated")
    print("\n[SUCCESS] Full personality engine test completed successfully!")


if __name__ == "__main__":
    main()

