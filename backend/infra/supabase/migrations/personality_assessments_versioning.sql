-- backend/infra/supabase/migrations/personality_assessments_versioning.sql
-- 1. Add scoring_version to personality_assessments
ALTER TABLE public.personality_assessments
ADD COLUMN IF NOT EXISTS scoring_version TEXT NOT NULL DEFAULT 'v1';
-- Comment for clarity
COMMENT ON COLUMN public.personality_assessments.scoring_version IS 'Version of the scoring logic used (e.g., v1). Immutable after insertion.';
-- 2. Create internal parity_telemetry table
-- This table is for zero-diff validation between Edge and Python
CREATE TABLE IF NOT EXISTS internal.parity_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id TEXT,
    -- Optional link to assessment if success
    input_hash TEXT NOT NULL,
    -- Deterministic hash of answers
    output_hash TEXT NOT NULL,
    -- Deterministic hash of (OCEAN + MBTI + Version)
    scoring_version TEXT NOT NULL,
    execution_path TEXT NOT NULL CHECK (execution_path IN ('edge', 'python')),
    timestamp TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS (internal schema, service_role only)
ALTER TABLE internal.parity_telemetry ENABLE ROW LEVEL SECURITY;
-- Index for hash matching analysis
CREATE INDEX IF NOT EXISTS idx_parity_hashes ON internal.parity_telemetry (input_hash, output_hash);
COMMENT ON TABLE internal.parity_telemetry IS 'Telemetry for zero-diff parity validation between scoring engines.';