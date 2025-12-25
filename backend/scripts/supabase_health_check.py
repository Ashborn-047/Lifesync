import os
import sys
import httpx
import json
from datetime import datetime

# Add the backend directory to sys.path to import local modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from src.supabase_client import create_supabase_client
    from src.api.config import config
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def send_discord_notification(webhook_url, status, message, details=None):
    """Send a notification to Discord via Webhook using httpx"""
    if not webhook_url:
        print("Discord Webhook URL not provided, skipping notification.")
        return

    color = 0x00FF00 if status == "SUCCESS" else 0xFF0000
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    payload = {
        "embeds": [
            {
                "title": f"Supabase Health Check: {status}",
                "description": message,
                "color": color,
                "fields": [
                    {"name": "Timestamp", "value": timestamp, "inline": True},
                ],
                "footer": {"text": "LifeSync backend Automation"}
            }
        ]
    }
    
    if details:
        payload["embeds"][0]["fields"].append({"name": "Details", "value": str(details)[:1024], "inline": False})

    try:
        with httpx.Client() as client:
            response = client.post(webhook_url, json=payload)
            response.raise_for_status()
        print(f"Successfully sent Discord notification: {status}")
    except Exception as e:
        print(f"Failed to send Discord notification: {e}")

def run_health_check():
    """Execute the health check and report results"""
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    supabase_url = os.getenv("SUPABASE_URL") or config.get_supabase_url()
    supabase_key = os.getenv("SUPABASE_KEY") or config.get_supabase_key()

    if not supabase_url or not supabase_key:
        error_msg = "Supabase credentials missing from environment."
        print(f"[ERROR] {error_msg}")
        send_discord_notification(webhook_url, "FAILURE", error_msg)
        return

    try:
        print(f"Starting health check for Supabase project at {supabase_url[:30]}...")
        client = create_supabase_client(url=supabase_url, key=supabase_key)
        
        # Perform a simple query to keep the project active
        # We'll just select count from personality_assessments
        result = client.client.table("personality_assessments").select("id", count="exact").limit(1).execute()
        
        count = getattr(result, 'count', 0)
        success_msg = f"Database connection successful. Active session maintained."
        print(f"[OK] {success_msg}")
        
        # Send positive notification
        send_discord_notification(webhook_url, "SUCCESS", success_msg, details=f"Found assessments in DB.")
        
    except Exception as e:
        error_msg = f"Supabase health check failed."
        print(f"[ERROR] {error_msg}: {e}")
        send_discord_notification(webhook_url, "FAILURE", error_msg, details=str(e))

if __name__ == "__main__":
    run_health_check()
