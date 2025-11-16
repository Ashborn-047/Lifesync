"""
Generate CSV export and Supabase SQL schema for LifeSync questions
Run this to create: questions_180.csv and supabase_schema.sql
"""

import json
import csv

# Load the question bank
with open('questions_180_lifesync.json', 'r') as f:
    data = json.load(f)

# Generate CSV
with open('lifesync_questions_180.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    
    # Header
    writer.writerow([
        'question_id',
        'question_text',
        'trait',
        'trait_name',
        'facet',
        'facet_name',
        'reverse_scored',
        'weight',
        'min_value',
        'max_value'
    ])
    
    # Write questions
    for q in data['questions']:
        writer.writerow([
            q['id'],
            q['text'],
            q['trait'],
            data['traits'][q['trait']]['name'],
            q['facet'],
            data['facets'][q['facet']],
            'TRUE' if q['reverse'] else 'FALSE',
            q['weight'],
            data['scale']['min'],
            data['scale']['max']
        ])

print("✅ Created: lifesync_questions_180.csv")

# Generate Supabase SQL schema
sql_schema = """-- LifeSync Personality Questions Schema
-- Generated for Supabase PostgreSQL

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.personality_responses CASCADE;
DROP TABLE IF EXISTS public.personality_questions CASCADE;
DROP TABLE IF EXISTS public.personality_assessments CASCADE;

-- Questions table (static question bank)
CREATE TABLE public.personality_questions (
    id TEXT PRIMARY KEY,
    question_text TEXT NOT NULL,
    trait TEXT NOT NULL CHECK (trait IN ('O', 'C', 'E', 'A', 'N')),
    trait_name TEXT NOT NULL,
    facet TEXT NOT NULL,
    facet_name TEXT NOT NULL,
    reverse_scored BOOLEAN DEFAULT FALSE,
    weight NUMERIC DEFAULT 1.0,
    min_value INTEGER DEFAULT 1,
    max_value INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_questions_trait ON public.personality_questions(trait);
CREATE INDEX idx_questions_facet ON public.personality_questions(facet);

-- User assessments table (tracks each assessment session)
CREATE TABLE public.personality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    questions_answered INTEGER DEFAULT 0,
    assessment_type TEXT DEFAULT 'quick' CHECK (assessment_type IN ('quick', 'standard', 'full')),
    
    -- Computed scores (stored after completion)
    score_openness NUMERIC,
    score_conscientiousness NUMERIC,
    score_extraversion NUMERIC,
    score_agreeableness NUMERIC,
    score_neuroticism NUMERIC,
    
    -- Derived profiles
    mbti_proxy TEXT,
    neuroticism_level TEXT,
    personality_code TEXT,
    
    -- Metadata
    confidence_avg NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_assessments_user ON public.personality_assessments(user_id);
CREATE INDEX idx_assessments_completed ON public.personality_assessments(completed_at);

-- User responses table (individual question answers)
CREATE TABLE public.personality_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.personality_assessments(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.personality_questions(id),
    response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 5),
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate answers in same assessment
    UNIQUE(assessment_id, question_id)
);

-- Create indexes
CREATE INDEX idx_responses_assessment ON public.personality_responses(assessment_id);
CREATE INDEX idx_responses_question ON public.personality_responses(question_id);

-- Function to update assessment progress
CREATE OR REPLACE FUNCTION update_assessment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.personality_assessments
    SET 
        questions_answered = (
            SELECT COUNT(*) 
            FROM public.personality_responses 
            WHERE assessment_id = NEW.assessment_id
        ),
        updated_at = NOW()
    WHERE id = NEW.assessment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update assessment progress
CREATE TRIGGER trigger_update_assessment_progress
AFTER INSERT OR DELETE ON public.personality_responses
FOR EACH ROW
EXECUTE FUNCTION update_assessment_progress();

-- Row Level Security (RLS) policies
ALTER TABLE public.personality_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read questions
CREATE POLICY "Questions are publicly readable"
    ON public.personality_questions FOR SELECT
    TO authenticated, anon
    USING (true);

-- Policy: Users can only see their own assessments
CREATE POLICY "Users can view own assessments"
    ON public.personality_assessments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can create their own assessments
CREATE POLICY "Users can create own assessments"
    ON public.personality_assessments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own assessments
CREATE POLICY "Users can update own assessments"
    ON public.personality_assessments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can only see their own responses
CREATE POLICY "Users can view own responses"
    ON public.personality_responses FOR SELECT
    TO authenticated
    USING (
        assessment_id IN (
            SELECT id FROM public.personality_assessments 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create responses for their own assessments
CREATE POLICY "Users can create own responses"
    ON public.personality_responses FOR INSERT
    TO authenticated
    WITH CHECK (
        assessment_id IN (
            SELECT id FROM public.personality_assessments 
            WHERE user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT SELECT ON public.personality_questions TO authenticated, anon;
GRANT ALL ON public.personality_assessments TO authenticated;
GRANT ALL ON public.personality_responses TO authenticated;

-- ========================================
-- IMPORT THE QUESTIONS CSV
-- ========================================
-- After creating the schema, import the CSV:
-- Option 1: Using Supabase SQL Editor
--   1. Upload lifesync_questions_180.csv to Supabase Storage
--   2. Use the Supabase Dashboard to import CSV into personality_questions table
--
-- Option 2: Using psql command line
--   \\copy public.personality_questions(id, question_text, trait, trait_name, facet, facet_name, reverse_scored, weight, min_value, max_value) FROM 'lifesync_questions_180.csv' WITH (FORMAT CSV, HEADER true);
--
-- Option 3: Using Python (recommended for automation)
--   See import_questions.py script below

"""

with open('supabase_schema.sql', 'w', encoding='utf-8') as f:
    f.write(sql_schema)

print("✅ Created: supabase_schema.sql")

# Generate Python import script
import_script = '''"""
Import LifeSync questions into Supabase
Requires: pip install supabase
"""

import csv
from supabase import create_client, Client

# Supabase credentials (use environment variables in production!)
SUPABASE_URL = "your-project-url.supabase.co"
SUPABASE_KEY = "your-anon-key"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Read CSV and insert questions
with open('lifesync_questions_180.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    questions = []
    
    for row in reader:
        questions.append({
            'id': row['question_id'],
            'question_text': row['question_text'],
            'trait': row['trait'],
            'trait_name': row['trait_name'],
            'facet': row['facet'],
            'facet_name': row['facet_name'],
            'reverse_scored': row['reverse_scored'] == 'TRUE',
            'weight': float(row['weight']),
            'min_value': int(row['min_value']),
            'max_value': int(row['max_value'])
        })

# Batch insert (Supabase handles up to 1000 records per request)
try:
    result = supabase.table('personality_questions').insert(questions).execute()
    print(f"✅ Successfully imported {len(questions)} questions!")
except Exception as e:
    print(f"❌ Error importing questions: {e}")
'''

with open('import_questions.py', 'w', encoding='utf-8') as f:
    f.write(import_script)

print("✅ Created: import_questions.py")

# Generate README
readme = """# LifeSync Personality Assessment - Database Setup

## Files Generated

1. **lifesync_questions_180.csv** - Question bank (180 questions)
2. **supabase_schema.sql** - Complete database schema
3. **import_questions.py** - Python script to import questions

## Setup Instructions

### Step 1: Create Database Schema

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy contents of supabase_schema.sql and paste into Supabase SQL Editor
```

This creates:
- `personality_questions` table (question bank)
- `personality_assessments` table (user assessment sessions)
- `personality_responses` table (individual answers)
- Row Level Security policies
- Indexes and triggers

### Step 2: Import Questions

**Option A: Using Supabase Dashboard**
1. Go to Table Editor → personality_questions
2. Click "Insert" → "Import from CSV"
3. Upload `lifesync_questions_180.csv`

**Option B: Using Python Script (Recommended)**
```bash
pip install supabase
python import_questions.py
```

Edit `import_questions.py` to add your Supabase credentials.

### Step 3: Verify Import

```sql
SELECT 
    trait, 
    COUNT(*) as question_count,
    SUM(CASE WHEN reverse_scored THEN 1 ELSE 0 END) as reversed_count
FROM personality_questions
GROUP BY trait
ORDER BY trait;
```

Expected results:
- O, C, E, A, N: 36 questions each
- ~18 reversed per trait (50% balance)

## Using the API

### Create Assessment
```python
assessment = supabase.table('personality_assessments').insert({
    'user_id': user_id,
    'assessment_type': 'quick'  # or 'standard', 'full'
}).execute()
```

### Submit Response
```python
response = supabase.table('personality_responses').insert({
    'assessment_id': assessment_id,
    'question_id': 'Q001',
    'response_value': 4
}).execute()
```

### Get Questions for Quiz
```python
# Get 30 questions for quick assessment
questions = supabase.table('personality_questions')\\
    .select('*')\\
    .in_('id', ['Q001', 'Q007', 'Q013', ...])\\
    .execute()
```

### Complete Assessment
After scoring on backend:
```python
supabase.table('personality_assessments').update({
    'completed_at': 'now()',
    'score_openness': 0.72,
    'score_conscientiousness': 0.65,
    'score_extraversion': 0.42,
    'score_agreeableness': 0.71,
    'score_neuroticism': 0.48,
    'mbti_proxy': 'INFP',
    'neuroticism_level': 'Balanced',
    'personality_code': 'INFP-B'
}).eq('id', assessment_id).execute()
```

## Security Notes

- RLS policies ensure users only see their own data
- Questions table is publicly readable (no auth required)
- Use authenticated user context for all mutations
- Store Supabase keys as environment variables

## Next Steps

1. Import questions using one of the methods above
2. Test with sample user flow
3. Integrate scorer.py with your backend
4. Build frontend quiz UI
5. Connect to Supabase edge functions for real-time scoring

"""

with open('README_DATABASE.md', 'w', encoding='utf-8') as f:
    f.write(readme)

print("✅ Created: README_DATABASE.md")

print("\n🎉 All files generated successfully!")
print("\nGenerated files:")
print("  1. lifesync_questions_180.csv")
print("  2. supabase_schema.sql")
print("  3. import_questions.py")
print("  4. README_DATABASE.md")
print("\nNext: Follow README_DATABASE.md for setup instructions")
