import os
import sys
import httpx
import time
from datetime import datetime, timedelta

# Add the backend directory to sys.path to import local modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from src.supabase_client import create_supabase_client
    from src.api.config import config
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def send_discord_notification(webhook_url, status, stats=None, error_msg=None):
    """Send a rich notification to Discord via Webhook using httpx"""
    if not webhook_url:
        print("Discord Webhook URL not provided, skipping notification.")
        return

    is_success = status == "SUCCESS"
    color = 0x2ECC71 if is_success else 0xE74C3C  # Bright Green or Red
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    title = f"🟢 LifeSync System Health: OPERATIONAL" if is_success else f"🔴 LifeSync System Health: CRITICAL"
    
    # Base description
    description = "Daily database integrity and connectivity check completed."
    if not is_success:
        description = f"**System Alert**: {error_msg}"

    fields = [
        {"name": "Status", "value": "✅ Nominal" if is_success else "❌ Failed", "inline": True},
        {"name": "Timestamp (IST)", "value": timestamp, "inline": True},
    ]

    # Add stats fields if available
    if stats:
        # Spacer
        fields.append({"name": "", "value": "--- **Database Metrics** ---", "inline": False})
        
        if "latency" in stats:
             fields.append({"name": "⚡ API Latency", "value": f"`{stats['latency']}`", "inline": True})
        
        if "total_assessments" in stats:
            fields.append({"name": "📊 Total Assessments", "value": f"**{stats['total_assessments']:,}**", "inline": True})
            
        if "total_responses" in stats:
            fields.append({"name": "📝 Total Responses", "value": f"**{stats['total_responses']:,}**", "inline": True})
            
        if "recent_assessments" in stats:
            fields.append({"name": "📈 New (Last 24h)", "value": f"**+{stats['recent_assessments']}**", "inline": True})
            
    # Add footer
    footer = {
        "text": "LifeSync Backend Automation • Next check in 24h",
        "icon_url": "https://supabase.com/docs/img/supabase-logo.png"
    }

    payload = {
        "embeds": [
            {
                "title": title,
                "description": description,
                "color": color,
                "fields": fields,
                "footer": footer
            }
        ]
    }

    try:
        with httpx.Client() as client:
            response = client.post(webhook_url, json=payload)
            response.raise_for_status()
        print(f"Successfully sent Discord notification: {status}")
    except Exception as e:
        print(f"Failed to send Discord notification: {e}")

def run_health_check():
    """Execute the health check and report detailed results"""
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    supabase_url = os.getenv("SUPABASE_URL") or config.get_supabase_url()
    supabase_key = os.getenv("SUPABASE_KEY") or config.get_supabase_key()

    if not supabase_url or not supabase_key:
        error_msg = "Supabase credentials missing from environment."
        print(f"[ERROR] {error_msg}")
        send_discord_notification(webhook_url, "FAILURE", error_msg=error_msg)
        return

    print(f"Starting detailed health check for {supabase_url[:30]}...")
    start_time = time.time()
    stats = {}

    try:
        client = create_supabase_client(url=supabase_url, key=supabase_key)
        
        # 1. Basic Connectivity & Assessments Count
        res_assessments = client.client.table("personality_assessments").select("id", count="exact").limit(1).execute()
        stats["total_assessments"] = res_assessments.count
        
        # 2. Responses Count (Check Deep Data Connectivity)
        res_responses = client.client.table("personality_responses").select("id", count="exact").limit(1).execute()
        stats["total_responses"] = res_responses.count

        # 3. Activity Check (Last 24h)
        yesterday = (datetime.utcnow() - timedelta(days=1)).isoformat()
        res_recent = client.client.table("personality_assessments").select("id", count="exact").gte("created_at", yesterday).limit(1).execute()
        stats["recent_assessments"] = res_recent.count

        # 4. Latency Calculation
        duration = (time.time() - start_time) * 1000
        stats["latency"] = f"{duration:.1f}ms"
        
        success_msg = f"Health check passed. Latency: {stats['latency']}"
        print(f"[OK] {success_msg}")
        
        # Send detailed stats
        send_discord_notification(webhook_url, "SUCCESS", stats=stats)
        
    except Exception as e:
        error_msg = f"Health check probe failed: {str(e)}"
        print(f"[ERROR] {error_msg}")
        send_discord_notification(webhook_url, "FAILURE", error_msg=error_msg)

if __name__ == "__main__":
    run_health_check()
