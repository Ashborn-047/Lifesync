"""Quick debug test to see actual error"""
import requests
import json

try:
    r = requests.post(
        'http://localhost:5174/v1/assessments',
        json={
            'user_id': '00000000-0000-0000-0000-000000000001',
            'responses': {'Q001': 5, 'Q002': 4}
        },
        timeout=10
    )
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    try:
        err = r.json()
        print(f"Error JSON: {json.dumps(err, indent=2)}")
    except:
        pass
except Exception as e:
    print(f"Request failed: {e}")

