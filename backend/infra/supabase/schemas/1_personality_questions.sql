-- Create table for personality questions
CREATE TABLE IF NOT EXISTS personality_questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    trait TEXT NOT NULL,
    facet TEXT NOT NULL,
    reverse BOOLEAN DEFAULT FALSE
);

-- Table for assessments
CREATE TABLE IF NOT EXISTS personality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    quiz_type TEXT NOT NULL,
    raw_scores JSONB,
    facet_scores JSONB,
    trait_scores JSONB,
    mbti_code TEXT
);

-- Table for storing responses
CREATE TABLE IF NOT EXISTS personality_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES personality_assessments(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES personality_questions(id),
    value INTEGER CHECK (value BETWEEN 1 AND 5)
);

-- Table for storing LLM explanations
CREATE TABLE IF NOT EXISTS llm_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES personality_assessments(id) ON DELETE CASCADE,
    explanation TEXT,
    generated_at TIMESTAMP DEFAULT NOW()
);
