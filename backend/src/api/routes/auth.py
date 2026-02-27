"""
LifeSync Auth System - API Router
Handles user authentication and account management.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, Field

from src.supabase_client import SupabaseClient
from src.api.dependencies import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter()

# Get limiter from app state - will be available at runtime
def get_limiter(request: Request):
    return request.app.state.limiter

# --- Request Models ---

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    profile_id: str = Field(..., description="Lowercase username/handle")

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or profile_id")
    password: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    redirect_to: Optional[str] = None

class UpdatePasswordRequest(BaseModel):
    new_password: str

# --- Routes ---

@router.post("/signup")
async def signup(req: Request, request: SignupRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Register a new user and create their profile.
    Rate limit: 5 signups per hour per IP address.
    """
    # Apply rate limit
    limiter = get_limiter(req)
    await limiter.check_for_limits(req, "5/hour")
    try:
        result = db.sign_up(request.email, request.password, request.profile_id)
        return {
            "message": "User created successfully", 
            "user_id": result["user"].id
        }
    except ValueError as e:
        # All failures return the same generic error message
        raise HTTPException(status_code=400, detail="Invalid credentials")
    except Exception as e:
        logger.error(f"Signup unexpected error: {e}")
        raise HTTPException(status_code=400, detail="Invalid credentials")

@router.post("/login")
async def login(req: Request, request: LoginRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Authenticate user with email or profile_id.
    Rate limit: 10 attempts per hour and 3 per minute per IP address.
    """
    # Apply rate limits (both hour and minute limits)
    limiter = get_limiter(req)
    await limiter.check_for_limits(req, "10/hour")
    await limiter.check_for_limits(req, "3/minute")
    try:
        result = db.sign_in(request.identifier, request.password)
        return {
            "message": "Login successful", 
            "session": result["session"]
        }
    except ValueError:
        # Strict security: 401 Unauthorized with generic message
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        logger.error(f"Login unexpected error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/logout")
async def logout(db: SupabaseClient = Depends(get_supabase_client)):
    """
    End current session.
    """
    try:
        db.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        # Return success regardless of error to be silent on session issues
        return {"message": "Logged out successfully"}

@router.post("/reset-password")
async def reset_password(req: Request, request: ResetPasswordRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Request a password reset email.
    Rate limit: 3 attempts per hour per IP address.
    """
    # Apply rate limit
    limiter = get_limiter(req)
    await limiter.check_for_limits(req, "3/hour")
    try:
        db.reset_password(request.email, request.redirect_to)
    except Exception as e:
        logger.error(f"Reset password error: {e}")
    
    # ALWAYS return the same message to prevent email enumeration
    return {"message": "If an account exists, a password reset link has been sent"}

@router.post("/update-password")
async def update_password(request: UpdatePasswordRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Update password for the currently authenticated user.
    """
    try:
        # Note: This requires an active session in the 'db' client
        db.update_password(request.new_password)
        return {"message": "Password updated successfully"}
    except Exception as e:
        logger.error(f"Update password error: {e}")
        raise HTTPException(status_code=400, detail="Failed to update password")
