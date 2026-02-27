"""
LifeSync LLM Usage Quota Tracker
Simple in-memory tracking of LLM usage per user to prevent abuse.
"""

import time
import logging
from typing import Dict, Tuple
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class QuotaTracker:
    """
    In-memory quota tracker for LLM usage.

    Tracks:
    - Daily generation count per user
    - Hourly generation count per user

    Note: This is a simple in-memory tracker and will reset on server restart.
    For production, consider using Redis or a database for persistent tracking.
    """

    def __init__(self):
        # Structure: {user_id: {"daily": [(timestamp, count)], "hourly": [(timestamp, count)]}}
        self._usage: Dict[str, Dict[str, list]] = {}
        self._daily_limit = 10
        self._hourly_limit = 2

    def _cleanup_old_entries(self, user_id: str):
        """Remove expired entries from tracking."""
        if user_id not in self._usage:
            return

        now = time.time()
        one_day_ago = now - 86400  # 24 hours
        one_hour_ago = now - 3600  # 1 hour

        # Clean daily entries
        if "daily" in self._usage[user_id]:
            self._usage[user_id]["daily"] = [
                entry for entry in self._usage[user_id]["daily"]
                if entry[0] > one_day_ago
            ]

        # Clean hourly entries
        if "hourly" in self._usage[user_id]:
            self._usage[user_id]["hourly"] = [
                entry for entry in self._usage[user_id]["hourly"]
                if entry[0] > one_hour_ago
            ]

    def check_quota(self, user_id: str) -> Tuple[bool, str]:
        """
        Check if user has remaining quota for LLM generation.

        Args:
            user_id: User identifier (can be IP address for anonymous users)

        Returns:
            Tuple of (has_quota, error_message)
        """
        self._cleanup_old_entries(user_id)

        if user_id not in self._usage:
            self._usage[user_id] = {"daily": [], "hourly": []}

        # Check daily limit
        daily_count = len(self._usage[user_id]["daily"])
        if daily_count >= self._daily_limit:
            logger.warning(f"User {user_id} exceeded daily LLM quota ({daily_count}/{self._daily_limit})")
            return False, f"Daily limit of {self._daily_limit} generations exceeded. Try again tomorrow."

        # Check hourly limit
        hourly_count = len(self._usage[user_id]["hourly"])
        if hourly_count >= self._hourly_limit:
            logger.warning(f"User {user_id} exceeded hourly LLM quota ({hourly_count}/{self._hourly_limit})")
            return False, f"Hourly limit of {self._hourly_limit} generations exceeded. Try again later."

        return True, ""

    def record_usage(self, user_id: str):
        """
        Record an LLM generation for the user.

        Args:
            user_id: User identifier
        """
        if user_id not in self._usage:
            self._usage[user_id] = {"daily": [], "hourly": []}

        now = time.time()
        self._usage[user_id]["daily"].append((now, 1))
        self._usage[user_id]["hourly"].append((now, 1))

        logger.info(f"Recorded LLM usage for user {user_id}. Daily: {len(self._usage[user_id]['daily'])}, Hourly: {len(self._usage[user_id]['hourly'])}")

    def get_usage_stats(self, user_id: str) -> Dict[str, int]:
        """
        Get current usage statistics for a user.

        Args:
            user_id: User identifier

        Returns:
            Dictionary with daily and hourly counts
        """
        self._cleanup_old_entries(user_id)

        if user_id not in self._usage:
            return {"daily": 0, "hourly": 0, "daily_limit": self._daily_limit, "hourly_limit": self._hourly_limit}

        return {
            "daily": len(self._usage[user_id].get("daily", [])),
            "hourly": len(self._usage[user_id].get("hourly", [])),
            "daily_limit": self._daily_limit,
            "hourly_limit": self._hourly_limit
        }

    def reset_user_quota(self, user_id: str):
        """
        Reset quota for a specific user (admin function).

        Args:
            user_id: User identifier
        """
        if user_id in self._usage:
            del self._usage[user_id]
            logger.info(f"Reset quota for user {user_id}")


# Global quota tracker instance
quota_tracker = QuotaTracker()
