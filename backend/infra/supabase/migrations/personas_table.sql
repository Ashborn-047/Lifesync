-- backend/infra/supabase/migrations/personas_table.sql
-- Create internal schema if it doesn't exist (using internal for non-public authoritative data)
CREATE SCHEMA IF NOT EXISTS internal;
-- Create personas table
CREATE TABLE IF NOT EXISTS internal.personas (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    mbti TEXT,
    -- Optional MBTI mapping (e.g., 'INTP')
    tagline TEXT,
    ranges JSONB NOT NULL,
    -- OCEAN ranges: { openness: [0, 20], ... }
    strengths TEXT [] DEFAULT '{}',
    growth TEXT [] DEFAULT '{}',
    description TEXT,
    llm_template TEXT,
    llm_template_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Enable RLS (Internal schema should generally not be accessible via PostgREST anyway)
ALTER TABLE internal.personas ENABLE ROW LEVEL SECURITY;
-- No public policies - internal schema is for service_role / backend usage only
-- Add a trigger to update updated_at
CREATE OR REPLACE FUNCTION internal.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_personas_updated_at BEFORE
UPDATE ON internal.personas FOR EACH ROW EXECUTE PROCEDURE internal.update_updated_at_column();
-- Comment on table for documentation
COMMENT ON TABLE internal.personas IS 'Authoritative source for personality personas and LLM prompt templates.';