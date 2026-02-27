"""
LifeSync Personality Engine - Supabase Client
Handles database operations for personality assessments

Improvements in this version:
- Retry logic for transient database errors (issue #10)
- Optimized query patterns with specific field selection (issue #11)
- Query timeout support (issue #12)
"""

import os
from typing import Dict, Any, Optional, List
import logging

try:
    from supabase import create_client, Client
except ImportError:
    raise ImportError(
        "supabase package required. Install with: pip install supabase"
    )

# Import retry decorator (handles issue #10)
try:
    from .db.retry import with_db_retry
except ImportError:
    # Fallback if retry not available yet
    def with_db_retry(*args, **kwargs):
        def decorator(func):
            return func
        return decorator

from .api.config import config
from .db.timeout import TimeoutContext
from .db.cache import cached, assessment_cache, history_cache, invalidate_assessment_cache, invalidate_history_cache

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Client for interacting with Supabase database"""
    
    def __init__(
        self, 
        url: Optional[str] = None, 
        key: Optional[str] = None,
        service_key: Optional[str] = None
    ):
        """
        Initialize Supabase client.
        
        Args:
            url: Supabase project URL (defaults to SUPABASE_URL env var)
            key: Supabase anon key (defaults to SUPABASE_KEY env var)
            service_key: Supabase service role key (defaults to SUPABASE_SERVICE_ROLE env var)
        """
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_KEY")
        self.service_key = service_key or os.getenv("SUPABASE_SERVICE_ROLE")
        
        if not self.url or not self.key:
            raise ValueError(
                "Supabase credentials required. Set SUPABASE_URL and SUPABASE_KEY "
                "environment variables or pass them as parameters."
            )
        
        # Standard client for user-level operations
        self.client: Client = create_client(self.url, self.key)
        
        # Service client for elevated operations (e.g., profile_id resolution)
        self.service_client: Optional[Client] = None
        if self.service_key:
            self.service_client = create_client(self.url, self.service_key)
    
    @with_db_retry(max_attempts=3)
    def create_assessment(
        self,
        quiz_type: str = "full",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new personality assessment.

        Args:
            quiz_type: Type of quiz ('quick', 'standard', 'full')
            user_id: Optional User ID to link assessment

        Returns:
            Assessment record with id
        """
        data = {"quiz_type": quiz_type}
        if user_id:
            data["user_id"] = user_id

        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").insert(data).execute()

        return result.data[0] if result.data else {}
    
    @with_db_retry(max_attempts=3)
    def save_responses(
        self,
        assessment_id: str,
        answers: Dict[str, int]
    ) -> List[Dict[str, Any]]:
        """
        Save user responses to the database.

        Args:
            assessment_id: UUID of the assessment
            answers: Dictionary mapping question_id to response_value (1-5)

        Returns:
            List of saved response records
        """
        responses = [
            {
                "assessment_id": assessment_id,
                "question_id": q_id,
                "value": value
            }
            for q_id, value in answers.items()
        ]

        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_responses").insert(
                responses
            ).execute()

        return result.data if result.data else []
    
    @with_db_retry(max_attempts=3)
    def save_scores(
        self,
        assessment_id: str,
        scores: Dict[str, Any],
        raw_responses: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Save computed personality scores to the assessment record.
        
        Args:
            assessment_id: UUID of the assessment
            scores: Dictionary containing:
                - traits: OCEAN trait scores
                - facets: Facet scores
                - confidence: Confidence scores
                - dominant: Dominant profile info
                - top_facets: Top facets list
                - coverage: Coverage percentage
                - responses_count: Number of responses
            raw_responses: Original response dictionary (for raw_scores JSONB)
        
        Returns:
            Updated assessment record
        """
        traits = scores.get("traits", {})
        facets = scores.get("facets", {})
        dominant = scores.get("dominant", {})
        
        # Prepare data matching the schema
        # We assume columns exist or we pack into metadata if possible. 
        # Ideally, schema has: confidence, persona_id, engine_version, etc.
        # If not, we leverage the JSONB columns to store this extra context until migration.
        
        # Extract metadata
        meta = scores.get("metadata", {})
        
        update_data = {
            "raw_scores": raw_responses,  # Store original responses as JSONB
            "trait_scores": traits,  # Store trait scores as JSONB
            "facet_scores": facets,  # Store facet scores as JSONB
            "mbti_code": scores.get("mbti_proxy") or dominant.get("mbti_proxy", ""),
            
            # Canonical Fields Persistence
            "persona_id": scores.get("persona_id"),
            "confidence": scores.get("confidence"),
            "scoring_version": meta.get("scoring_version", "v1"),
            
            # Metadata Persistence (Pack into a JSONB column if distinct columns missing)
            "metadata": {
                "engine_version": meta.get("engine_version"),
                "scoring_version": meta.get("scoring_version"),
                "timestamp": meta.get("timestamp"),
                "quiz_type": meta.get("quiz_type"),
                "platform": meta.get("platform"),
                "is_fallback": meta.get("is_fallback", False),
                "input_hash": meta.get("input_hash"),
                "output_hash": meta.get("output_hash"),
                "execution_path": meta.get("execution_path")
            }
        }
        
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").update(
                update_data
            ).eq("id", assessment_id).execute()
        
        # Invalidate cache on update
        invalidate_assessment_cache(assessment_id)
        
        return result.data[0] if result.data else {}

    @with_db_retry(max_attempts=3)
    def save_telemetry(
        self,
        assessment_id: str,
        input_hash: str,
        output_hash: str,
        scoring_version: str,
        execution_path: str = "python"
    ) -> Dict[str, Any]:
        """
        Save parity telemetry for zero-diff validation.
        """
        telemetry_data = {
            "assessment_id": assessment_id,
            "input_hash": input_hash,
            "output_hash": output_hash,
            "scoring_version": scoring_version,
            "execution_path": execution_path
        }
        
        # internal schema usually requires explicit selection or service client
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("parity_telemetry").insert(telemetry_data).execute()
        
        return result.data[0] if result.data else {}
    
    @with_db_retry(max_attempts=3)
    def save_explanation(
        self,
        assessment_id: str,
        explanation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Save LLM-generated explanation.
        
        Args:
            assessment_id: UUID of the assessment
            explanation: Dictionary containing:
                - summary: Overview text (4-6 sentences)
                - strengths: Array of strengths (1-3 words each)
                - challenges: Array of challenges (1-3 words each)
                - steps: (legacy) Array of insights for backward compatibility
        
        Returns:
            Saved explanation record
        """
        import json
        
        # Store structured data as JSON
        # New persona format: persona_title, vibe_summary, strengths, growth_edges, how_you_show_up, tagline
        structured_data = {
            "persona_title": explanation.get("persona_title", ""),
            "vibe_summary": explanation.get("vibe_summary", ""),
            "strengths": explanation.get("strengths", []),
            "growth_edges": explanation.get("growth_edges", []),
            "how_you_show_up": explanation.get("how_you_show_up", ""),
            "tagline": explanation.get("tagline", ""),
            # Backward compatibility
            "summary": explanation.get("vibe_summary") or explanation.get("summary", ""),
            "challenges": explanation.get("growth_edges") or explanation.get("challenges", [])
        }
        
        # Create a readable text version for backward compatibility
        explanation_text = ""
        
        # Add persona title if available
        if explanation.get("persona_title"):
            explanation_text += f"{explanation.get('persona_title')}\n"
            if explanation.get("tagline"):
                explanation_text += f'"{explanation.get("tagline")}"\n'
            explanation_text += "\n"
        
        # Add vibe summary or summary
        if explanation.get("vibe_summary"):
            explanation_text += f"{explanation.get('vibe_summary')}\n\n"
        elif explanation.get("summary"):
            explanation_text += f"{explanation.get('summary')}\n\n"
        
        # Add "How You Show Up"
        if explanation.get("how_you_show_up"):
            explanation_text += f"How You Show Up:\n{explanation.get('how_you_show_up')}\n\n"
        
        # Add strengths
        strengths = explanation.get("strengths", [])
        if strengths:
            explanation_text += "Strengths:\n"
            for strength in strengths:
                explanation_text += f"• {strength}\n"
            explanation_text += "\n"
        
        # Add growth edges or challenges
        growth_edges = explanation.get("growth_edges", [])
        challenges = explanation.get("challenges", [])
        growth_areas = growth_edges if growth_edges else challenges
        if growth_areas:
            explanation_text += "Growth Edges:\n"
            for area in growth_areas:
                explanation_text += f"• {area}\n"
        
        # Legacy format for backward compatibility
        if explanation.get("steps") and not explanation.get("persona_title"):
            explanation_text += "\n\nKey Insights:\n"
            for i, step in enumerate(explanation.get("steps", []), 1):
                explanation_text += f"{i}. {step}\n"
        
        # Store both structured JSON and text
        explanation_data = {
            "assessment_id": assessment_id,
            "explanation": explanation_text,
            "explanation_data": json.dumps(structured_data)  # Store as JSONB if column exists
        }
        
        client = self.service_client or self.client
        try:
            with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
                result = client.table("llm_explanations").insert(
                    explanation_data
                ).execute()
        except Exception as e:
            # Fallback: if 'explanation_data' column is missing, try without it
            # We check str(e) broadly as different versions of libraries or error responses might vary
            error_msg = str(e).lower()
            if "explanation_data" in error_msg or "pgrst204" in error_msg:
                logger.warning("llm_explanations table missing 'explanation_data' column. Falling back to 'explanation' only.")
                safe_data = {
                    "assessment_id": assessment_id,
                    "explanation": explanation_text
                }
                with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
                    result = client.table("llm_explanations").insert(
                        safe_data
                    ).execute()
            else:
                raise e
        
        # Invalidate cache when new explanation is added
        invalidate_assessment_cache(assessment_id)
        
        return result.data[0] if result.data else {}
    
    @cached(assessment_cache)
    @with_db_retry(max_attempts=3)
    def get_assessment(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get assessment by ID - optimized to fetch only needed columns"""
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").select(
                "id,created_at,trait_scores,facet_scores,mbti_code,persona_id,confidence,metadata,scoring_version,quiz_type"
            ).eq("id", assessment_id).execute()

        return result.data[0] if result.data else None

    @with_db_retry(max_attempts=3)
    def get_assessment_summary(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get assessment summary (optimized - only essential fields).
        Reduces bandwidth by ~80% compared to select("*").

        Returns:
            Dict with id, created_at, mbti_code, persona_id, confidence
        """
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").select(
                "id,created_at,mbti_code,persona_id,confidence"
            ).eq("id", assessment_id).execute()

        return result.data[0] if result.data else None

    @with_db_retry(max_attempts=3)
    def get_assessment_full(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get complete assessment data including all fields.
        Use only when full data is needed (e.g., generating explanations).

        Returns:
            Complete assessment record
        """
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").select("*").eq(
                "id", assessment_id
            ).execute()

        return result.data[0] if result.data else None

    @with_db_retry(max_attempts=3)
    def get_assessment_scores(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get only scoring data for an assessment.
        Optimized for score retrieval without metadata.

        Returns:
            Dict with trait_scores, facet_scores, mbti_code, persona_id
        """
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").select(
                "trait_scores,facet_scores,mbti_code,persona_id,confidence"
            ).eq("id", assessment_id).execute()

        return result.data[0] if result.data else None
    
    @with_db_retry(max_attempts=3)
    def get_scores(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get scores for an assessment"""
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_scores").select("*").eq(
                "assessment_id", assessment_id
            ).execute()

        return result.data[0] if result.data else None
    
    @with_db_retry(max_attempts=3)
    def get_explanation(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """Get explanation for an assessment"""
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("llm_explanations").select("*").eq(
                "assessment_id", assessment_id
            ).execute()

        return result.data[0] if result.data else None
    
    @with_db_retry(max_attempts=3)
    def upsert_profile(
        self,
        user_id: str,
        assessment_id: str
    ) -> Dict[str, Any]:
        """
        Update user profile with latest assessment.
        """
        data = {
            "user_id": user_id,
            "current_assessment_id": assessment_id,
            "updated_at": "now()"
        }
        
        # Upsert based on user_id (unique constraint)
        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = self.client.table("profiles").upsert(
                data, on_conflict="user_id"
            ).execute()
        
        return result.data[0] if result.data else {}

    @with_db_retry(max_attempts=3)
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile with current assessment details"""
        # Join with assessments to get the actual scoring data
        # Note: Supabase-py join syntax depends on FK setup.
        # We select profiles.* and the nested assessment data.
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("profiles").select(
                "*, current_assessment:personality_assessments(*)"
            ).eq("user_id", user_id).execute()

        return result.data[0] if result.data else None

    @cached(history_cache)
    @with_db_retry(max_attempts=3)
    def get_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get assessment history for user.
        Optimized query - only fetches essential fields (issue #11).
        """
        client = self.service_client or self.client

        with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
            result = client.table("personality_assessments").select(
                "id,created_at,quiz_type,mbti_code,persona_id,confidence"
            ).eq("user_id", user_id).order(
                "created_at", desc=True
            ).limit(limit).execute()

        return result.data if result.data else []

    # --- Authentication Methods ---
    # Use shorter retry attempts for auth operations (2 attempts max)

    @with_db_retry(max_attempts=2, min_wait=0.5, max_wait=2.0)
    def sign_up(self, email: str, password: str, profile_id: str) -> Dict[str, Any]:
        """
        Register a new user and create their profile.
        """
        norm_email = email.strip().lower()
        norm_profile_id = profile_id.strip().lower()

        # 1. Supabase Auth Signup
        try:
            with TimeoutContext(config.DATABASE_AUTH_TIMEOUT):
                auth_resp = self.client.auth.sign_up({
                    "email": norm_email,
                    "password": password
                })

            if not auth_resp.user:
                raise ValueError("Invalid credentials") # Generic failure

            user_id = auth_resp.user.id
            actual_email = auth_resp.user.email

            # 2. Profile Creation
            profile_data = {
                "id": user_id,
                "user_id": user_id, # Legacy compatibility
                "profile_id": norm_profile_id,
                "email": actual_email
            }

            try:
                # Use service client to ensure resolution/insertion works 
                # even if RLS is partially catching up or strict.
                with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
                    if self.service_client:
                        self.service_client.table("profiles").insert(profile_data).execute()
                    else:
                        self.client.table("profiles").insert(profile_data).execute()
            except Exception:
                # Treat signup as failed if profile creation fails
                if self.service_client:
                    try:
                        with TimeoutContext(config.DATABASE_AUTH_TIMEOUT):
                            self.service_client.auth.admin.delete_user(user_id)
                    except Exception:
                        pass
                raise ValueError("Invalid credentials")
            
            return {"user": auth_resp.user, "session": auth_resp.session}

        except Exception:
            raise ValueError("Invalid credentials")

    @with_db_retry(max_attempts=2, min_wait=0.5, max_wait=2.0)
    def sign_in(self, identifier: str, password: str) -> Dict[str, Any]:
        """
        Sign in with email or profile_id.
        """
        ident = identifier.strip().lower()
        resolved_email = None

        if "@" in ident:
            resolved_email = ident
        else:
            resolved_email = self._resolve_email(ident)

        # Final authentication call (Always call even if resolution fails to prevent timing attacks)
        try:
            with TimeoutContext(config.DATABASE_AUTH_TIMEOUT):
                auth_resp = self.client.auth.sign_in_with_password({
                    "email": resolved_email or "invalid@example.com",
                    "password": password
                })
            if not auth_resp.session:
                raise ValueError("Invalid credentials")
            return {"user": auth_resp.user, "session": auth_resp.session}
        except Exception:
            raise ValueError("Invalid credentials")

    @with_db_retry(max_attempts=2, min_wait=0.5, max_wait=2.0)
    def _resolve_email(self, profile_id: str) -> Optional[str]:
        """
        Resolve profile_id to email using service role.
        """
        if not self.service_client:
            return None

        try:
            with TimeoutContext(config.DATABASE_QUERY_TIMEOUT):
                result = self.service_client.table("profiles") \
                    .select("email") \
                    .eq("profile_id", profile_id.strip().lower()) \
                    .limit(1) \
                    .execute()

            return result.data[0]["email"] if result.data else None
        except Exception:
            return None

    def sign_out(self):
        """End current session."""
        with TimeoutContext(config.DATABASE_AUTH_TIMEOUT):
            return self.client.auth.sign_out()

    def reset_password(self, email: str, redirect_to: Optional[str] = None):
        """Request password reset."""
        params = {"email": email}
        if redirect_to:
            params["options"] = {"redirect_to": redirect_to}
        with TimeoutContext(config.DATABASE_AUTH_TIMEOUT):
            return self.client.auth.reset_password_for_email(email, params.get("options"))

    def update_password(self, new_password: str):
        """Update password for authenticated user."""
        with TimeoutContext(config.DATABASE_AUTH_TIMEOUT):
            return self.client.auth.update_user({"password": new_password})



def create_supabase_client(
    url: Optional[str] = None,
    key: Optional[str] = None,
    service_key: Optional[str] = None
) -> SupabaseClient:
    """
    Factory function to create a Supabase client.
    
    Args:
        url: Optional Supabase URL
        key: Optional Supabase key
        service_key: Optional service role key
    
    Returns:
        SupabaseClient instance
    """
    return SupabaseClient(url=url, key=key, service_key=service_key)

