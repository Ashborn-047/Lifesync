import requests
import sys

BASE_URL = "http://localhost:5174/v1/profiles/verify_script"

try:
    print(f"Fetching profile for user 'verify_script' from {BASE_URL}...")
    res = requests.get(BASE_URL)
    
    if res.status_code == 200:
        data = res.json()
        print("SUCCESS: Profile found!")
        print(f"Profile ID: {data.get('id')}")
        print(f"Current Assessment ID: {data.get('current_assessment_id')}")
        
        # Verify nested assessment data exists
        if data.get('current_assessment'):
            print("SUCCESS: Nested assessment data returned.")
        else:
            print("WARNING: Nested current_assessment missing (check join logic).")
            
        sys.exit(0)
    elif res.status_code == 404:
        print("ERROR: Profile not found. Upsert might have failed.")
        sys.exit(1)
    else:
        print(f"ERROR: Unexpected status code {res.status_code}")
        print(res.text)
        sys.exit(1)

except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
