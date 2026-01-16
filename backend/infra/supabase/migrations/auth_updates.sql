-- LifeSync Auth System - Database Updates
-- Version: 1.1.0
-- Date: 2026-01-16
-- ==========================================
-- 1. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Profiles: Users can view own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can update own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
-- 2. Modify profiles table
-- We assume the table already exists from previous migrations.
-- We need: id (UUID, PK), profile_id (TEXT, UNIQUE), email (TEXT, UNIQUE)
-- Ensure profile_id and email columns exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_id TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT;
-- Move user_id data to id if it's currently used as the auth identifier
-- In previous migrations, user_id was TEXT. If it held auth.uid(), we might need alignment.
-- For this implementation, we will follow the requirement that 'id' is the primary link.
-- Add uniqueness and NOT NULL constraints
-- Note: If existing data violates these, the migration will fail.
-- In a real scenario, we'd handle data cleanup first.
-- 2.5 Clean up orphan profiles (those without matching auth.users row)
-- This is necessary to prevent foreign key violations during the next step.
DELETE FROM public.profiles
WHERE id NOT IN (
        SELECT id
        FROM auth.users
    );
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_profile_id_key UNIQUE (profile_id),
    ADD CONSTRAINT profiles_email_key UNIQUE (email);
-- Add lowercase constraint for profile_id
ALTER TABLE public.profiles
ADD CONSTRAINT profile_id_lowercase CHECK (profile_id = lower(profile_id));
-- Ensure 'id' references auth.users
-- This ensures data integrity between Auth and Profile
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_id_fkey'
) THEN
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
END $$;
-- 3. Row Level Security (STRICT)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Insert (own profile only)
CREATE POLICY "profiles_insert_own" ON public.profiles FOR
INSERT WITH CHECK (id = auth.uid());
-- Select (own profile only)
CREATE POLICY "profiles_select_own" ON public.profiles FOR
SELECT USING (id = auth.uid());
-- Update (own profile only)
CREATE POLICY "profiles_update_own" ON public.profiles FOR
UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- NO DELETE policy as per requirement.