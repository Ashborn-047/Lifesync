"""Test Supabase connection"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.api.config import config
from src.supabase_client import create_supabase_client

print("Testing Supabase connection...")
print(f"URL: {config.get_supabase_url()[:50]}...")
print(f"Key: {config.get_supabase_key()[:30]}...")

try:
    client = create_supabase_client(
        url=config.get_supabase_url(),
        key=config.get_supabase_key()
    )
    print("[OK] Supabase client created")
    
    # Try to create a test assessment
    try:
        result = client.create_assessment(quiz_type="full")
        print(f"[OK] Test assessment created: {result.get('id')}")
        
        # Clean up - delete the test assessment
        if result.get('id'):
            client.client.table("personality_assessments").delete().eq("id", result.get('id')).execute()
            print("[OK] Test assessment cleaned up")
    except Exception as e:
        print(f"[ERROR] Failed to create test assessment: {e}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"[ERROR] Failed to create Supabase client: {e}")
    import traceback
    traceback.print_exc()

