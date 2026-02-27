-- Migration to add indexes for performance optimization
-- Part of PR #59

-- Index on personality_assessments(user_id) for history lookups
CREATE INDEX IF NOT EXISTS idx_personality_assessments_user_id
ON personality_assessments(user_id);

-- Index on personality_assessments(created_at) for sorting
CREATE INDEX IF NOT EXISTS idx_personality_assessments_created_at
ON personality_assessments(created_at DESC);

-- Composite index for user history queries (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_personality_assessments_user_history
ON personality_assessments(user_id, created_at DESC);

-- Index on profiles(email) for faster auth resolution (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON profiles(email);

-- Index on profiles(profile_id) for faster auth resolution
CREATE INDEX IF NOT EXISTS idx_profiles_profile_id
ON profiles(profile_id);
