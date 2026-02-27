-- LifeSync Supabase Backend Stabilization
-- Version: 1.0.0
-- Date: 2026-01-16
-- ==========================================
-- PHASE 2: SCHEMA CLEANUP
-- ==========================================
-- 1. Create internal schema for PARKed tables
CREATE SCHEMA IF NOT EXISTS internal;
-- 2. Move PARKed tables to internal schema
-- These are roadmap/future tables, not needed by the client v1
ALTER TABLE IF EXISTS public.datasets
SET SCHEMA internal;
ALTER TABLE IF EXISTS public.models
SET SCHEMA internal;
ALTER TABLE IF EXISTS public.training_runs
SET SCHEMA internal;
-- 3. KILL test-only tables
-- DROPing stress test data from production
DROP TABLE IF EXISTS public.scoring_stress_tests;
-- ==========================================
-- PHASE 3: ROW LEVEL SECURITY (KEEP TABLES)
-- ==========================================
-- 1. PROFILES
-- User can only read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Note: user_id is TEXT in current schema; casting auth.uid() to match.
CREATE POLICY "Profiles: Users can view own" ON public.profiles FOR
SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Profiles: Users can update own" ON public.profiles FOR
UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
-- 2. PERSONALITY_ASSESSMENTS
-- Owner-restricted access
ALTER TABLE public.personality_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assessments: Users can view own" ON public.personality_assessments FOR
SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Assessments: Users can insert own" ON public.personality_assessments FOR
INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Assessments: Users can update own" ON public.personality_assessments FOR
UPDATE USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);
-- 3. PERSONALITY_RESPONSES
-- Access controlled via parent assessment
ALTER TABLE public.personality_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Responses: Users can view via assessment" ON public.personality_responses FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.personality_assessments
            WHERE id = assessment_id
                AND user_id = auth.uid()::text
        )
    );
CREATE POLICY "Responses: Users can insert via assessment" ON public.personality_responses FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.personality_assessments
            WHERE id = assessment_id
                AND user_id = auth.uid()::text
        )
    );
-- 4. LLM_EXPLANATIONS
-- Access controlled via parent assessment
ALTER TABLE public.llm_explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Explanations: Users can view via assessment" ON public.llm_explanations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.personality_assessments
            WHERE id = assessment_id
                AND user_id = auth.uid()::text
        )
    );
-- 5. PERSONALITY_QUESTIONS
-- Reference data is read-only for all, write-denied (default)
ALTER TABLE public.personality_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions: Everyone can view" ON public.personality_questions FOR
SELECT USING (true);