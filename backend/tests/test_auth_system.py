import os
import sys
from pathlib import Path
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.ERROR)

# Add backend directory to sys.path
# File is in backend/tests/test_auth_system.py
# Root should be backend/
current_dir = Path(__file__).parent.parent
sys.path.append(str(current_dir))

from src.supabase_client import create_supabase_client
from dotenv import load_dotenv

def run_verification():
    load_dotenv()
    
    # Check for credentials
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_ROLE"):
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE environment variables are required.")
        return

    # Use a random profile_id and email for each test run to avoid conflicts
    test_id = str(uuid.uuid4())[:8]
    email = f"test_{test_id}@lifesync.internal"
    password = "StrongPassword123!"
    profile_id = f"user_{test_id}"
    
    print(f"--- LifeSync Auth System Verification ---")
    print(f"Target: {email} / {profile_id}")
    
    db = create_supabase_client()
    
    # 1. Test Signup
    # Expected: Success, creates auth user and public.profile record
    # 1. Test Signup / User Creation
    # We use the admin client to create the user directly with email_confirm: True
    # This avoids triggering transactional emails that result in bounces.
    print("\n[STEP 1] Creating Test User (Admin/Bypass Email)...")
    try:
        # Create user via admin
        admin_res = db.service_client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        user_id = admin_res.user.id
        print(f"  ✓ Admin create success. User ID: {user_id}")
        
        # Manually insert profile (simulating the behavior of our sign_up method)
        db.service_client.table("profiles").insert({
            "id": user_id,
            "user_id": user_id,
            "profile_id": profile_id,
            "email": email
        }).execute()
        print("  ✓ Profile record created")
        
    except Exception as e:
        print(f"  ✗ User creation failed: {e}")
        return

    # 2. Test Login with Email
    # Expected: Success
    print("\n[STEP 2] Testing Login with Email...")
    try:
        login_res = db.sign_in(email, password)
        print("  ✓ Email login success")
        if not login_res.get("session"):
            print("  ✗ ERROR: No session returned")
    except Exception as e:
        print(f"  ✗ Email login failed: {e}")

    # 3. Test Login with Profile ID (Identifier Resolution)
    # Expected: Success (Resolved via service role internally)
    print("\n[STEP 3] Testing Login with Profile ID (Aliasing)...")
    try:
        login_res_pid = db.sign_in(profile_id, password)
        print("  ✓ Profile ID login success (Resolution working)")
        if not login_res_pid.get("session"):
            print("  ✗ ERROR: No session returned")
    except Exception as e:
        print(f"  ✗ Profile ID login failed: {e}")

    # 4. Test Login with Wrong Password (Security Rule)
    # Expected: Generic "Invalid credentials" error
    print("\n[STEP 4] Verifying Security Rules (Wrong Password)...")
    try:
        db.sign_in(email, "WrongPassword123!") # One character off or different
        # Note: If password matches by coincidence, this test fails. 
        # Using a definitely wrong one.
        db.sign_in(email, "NotTheRightPass")
        print("  ✗ SECURITY FAILURE: Authenticated with wrong password")
    except ValueError as e:
        if str(e) == "Invalid credentials":
            print("  ✓ Correctly rejected with generic error: 'Invalid credentials'")
        else:
            print(f"  ! Rejected but with non-generic error: '{e}'")
    except Exception as e:
        print(f"  ✗ Unexpected error type: {type(e).__name__}: {e}")

    # 5. Test Login with Non-existent Profile ID
    # Expected: Generic "Invalid credentials" error
    print("\n[STEP 5] Verifying Security Rules (Non-existent ID)...")
    try:
        db.sign_in("ghost_user_9999", password)
        print("  ✗ SECURITY FAILURE: Authenticated with non-existent user")
    except ValueError as e:
        if str(e) == "Invalid credentials":
            print("  ✓ Correctly rejected with generic error: 'Invalid credentials'")
        else:
            print(f"  ! Rejected but with non-generic error: '{e}'")

    # 6. Cleanup
    print("\n[STEP 6] Cleaning up test data...")
    if db.service_client:
        try:
            # Delete from auth.users (cascades to public.profiles if foreign key is set correctly)
            db.service_client.auth.admin.delete_user(user_id)
            print("  ✓ Auth user deleted")
            
            # Verify profile is gone (testing CASCADE)
            prof_check = db.service_client.table("profiles").select("id").eq("id", user_id).execute()
            if not prof_check.data:
                print("  ✓ Profile record automatically cascaded/deleted")
            else:
                print("  ! Profile record still exists (Check FK CASCADE constraint)")
        except Exception as e:
            print(f"  ✗ Cleanup error: {e}")
    else:
        print("  ! Service client not available for cleanup")

    print(f"\n--- Verification Complete ---")

if __name__ == "__main__":
    run_verification()
