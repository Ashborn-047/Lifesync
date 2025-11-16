-- Create table for storing stress test results
CREATE TABLE IF NOT EXISTS scoring_stress_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_index INTEGER NOT NULL,
    assessment_id UUID,
    openness NUMERIC(5, 3) NOT NULL,
    conscientiousness NUMERIC(5, 3) NOT NULL,
    extraversion NUMERIC(5, 3) NOT NULL,
    agreeableness NUMERIC(5, 3) NOT NULL,
    neuroticism NUMERIC(5, 3) NOT NULL,
    mbti TEXT,
    explanation_summary TEXT,
    strengths_count INTEGER DEFAULT 0,
    challenges_count INTEGER DEFAULT 0,
    raw_responses JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_stress_tests_run_index ON scoring_stress_tests(run_index);
CREATE INDEX IF NOT EXISTS idx_stress_tests_mbti ON scoring_stress_tests(mbti);
CREATE INDEX IF NOT EXISTS idx_stress_tests_created_at ON scoring_stress_tests(created_at);

-- Grant permissions (adjust based on your RLS policies)
-- ALTER TABLE scoring_stress_tests ENABLE ROW LEVEL SECURITY;

