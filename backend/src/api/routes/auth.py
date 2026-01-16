"""
LifeSync Auth System - API Router
Handles user authentication and account management.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field

from src.supabase_client import SupabaseClient
from src.api.dependencies import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter()

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
async def signup(request: SignupRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Register a new user and create their profile.
    """
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
async def login(request: LoginRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Authenticate user with email or profile_id.
    """
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
async def reset_password(request: ResetPasswordRequest, db: SupabaseClient = Depends(get_supabase_client)):
    """
    Request a password reset email.
    """
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
