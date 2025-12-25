
import sys
import json
import requests
import time

BASE_URL = "http://localhost:5174/v1/assessments"

def log(msg, type="INFO"):
    print(f"[{type}] {msg}")

def test_canonical_scoring():
    log("Testing Canonical Scoring Contract...")
    
    # Valid Request
    payload = {
        "user_id": "verify_script",
        "quiz_type": "full",
        "responses": {"Q001": 5, "Q002": 5, "Q003": 5} # Truncated for brevity, scorer handles it
    }
    
    try:
        res = requests.post(BASE_URL, json=payload)
        if res.status_code != 200:
            log(f"Failed to submit assessment: {res.text}", "ERROR")
            sys.exit(1)
            
        data = res.json()
        
        # Verify Contract Fields
        required_fields = ['ocean', 'persona_id', 'mbti_proxy', 'confidence', 'metadata']
        for field in required_fields:
            if field not in data:
                log(f"Missing required field: {field}", "ERROR")
                sys.exit(1)
        
        # Verify Metadata
        meta = data['metadata']
        if 'scoring_version' not in meta:
            log("Missing scoring_version in metadata", "ERROR")
            sys.exit(1)
            
        log(f"Success! Scored as {data['mbti_proxy']} (v{meta['scoring_version']})", "SUCCESS")
        
    except Exception as e:
        log(f"Connection failed: {e}", "ERROR")
        sys.exit(1)

def test_strict_failures():
    log("Testing Strict 422 Validations...")
    # This requires mocking or forcing invalid DATA return, which is hard via API unless we send invalid responses that result in invalid scores?
    # Actually, the backend VALIDATES the RESULT of scoring.
    # If scorer is robust, it produces valid scores.
    # To trigger valid_scoring_result failure, we'd need to mock scorer or have a bug.
    # However, we CAN test schema validation of the INPUT (pydantic).
    
    # Invalid Input (Missing responses)
    res = requests.post(BASE_URL, json={"user_id": "bad"})
    if res.status_code == 422:
        log("Correctly rejected missing responses", "SUCCESS")
    else:
        log(f"Failed to reject invalid input: {res.status_code}", "ERROR")

    # TODO: Advanced sanity check injection if test-mode enabled
    
if __name__ == "__main__":
    log("Starting Contract Verification...")
    test_canonical_scoring()
    test_strict_failures()
    log("Verification Complete.", "SUCCESS")
