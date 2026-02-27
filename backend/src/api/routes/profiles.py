"""
LifeSync Personality Engine - Profiles API Route
Handles fetching user profiles (latest state)
"""

import logging

from fastapi import APIRouter, HTTPException

from src.supabase_client import create_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/v1/profiles/{user_id}")
async def get_profile(user_id: str):
    """
    Get current user profile (latest assessment).
    """
    try:
        db = create_supabase_client()
        profile = db.get_profile(user_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
            
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")
