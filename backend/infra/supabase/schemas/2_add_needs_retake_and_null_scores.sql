-- Migration: Add needs_retake flag and allow null scores
-- Solution C: Add needs_retake flag to flag invalid assessments
-- Solution D: Ensure trait_scores JSONB can handle null values (already supported by JSONB)

-- Add needs_retake column to personality_assessments
ALTER TABLE personality_assessments 
ADD COLUMN IF NOT EXISTS needs_retake BOOLEAN DEFAULT FALSE;

-- Add reason column for tracking why retake is needed
ALTER TABLE personality_assessments 
ADD COLUMN IF NOT EXISTS needs_retake_reason TEXT;

-- Create index for filtering assessments that need retake
CREATE INDEX IF NOT EXISTS idx_personality_assessments_needs_retake 
ON personality_assessments(needs_retake);

-- Note: trait_scores and facet_scores are JSONB columns, which already support null values
-- No migration needed for Solution D - JSONB natively supports null in JSON structure
-- The backend code now returns null for insufficient data, which will be stored as null in JSONB

