# Supabase SQL Import Instructions

## File Location
`infra/supabase/sql_import/import_questions.sql`

## What This Script Does

1. **Creates 4 tables:**
   - `personality_questions` - Stores the 180-question bank
   - `personality_assessments` - Stores assessment sessions
   - `personality_responses` - Stores individual question answers
   - `llm_explanations` - Stores LLM-generated explanations

2. **Imports 180 questions** from the LifeSync question bank

3. **Validates the import** with row count checks

## How to Run in Supabase SQL Editor

### Step 1: Open Supabase SQL Editor
1. Log into your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"** button

### Step 2: Copy and Paste the SQL
1. Open the file: `infra/supabase/sql_import/import_questions.sql`
2. Copy **ALL** the contents (Ctrl+A, then Ctrl+C)
3. Paste into the Supabase SQL Editor

### Step 3: Execute the Script
1. Click the **"Run"** button (or press `Ctrl+Enter` on Windows / `Cmd+Enter` on Mac)
2. Wait for execution to complete (should take a few seconds)

### Step 4: Verify Results
After execution, scroll down to see the validation results:
- ✓ Total questions: Should show **180**
- ✓ Questions by trait: Should show **36** for each trait (O, C, E, A, N)
- ✓ Questions by facet: Should show **6** for each of the 30 facets
- ✓ Reverse-scored questions: Should show **~90** (approximately half)

## Expected Output

You should see validation results like:
```
table_name              | row_count | status
------------------------|-----------|--------
personality_questions   | 180       | ✓ PASS
```

And for traits:
```
trait | question_count | status
------|----------------|--------
A     | 36             | ✓ PASS
C     | 36             | ✓ PASS
E     | 36             | ✓ PASS
N     | 36             | ✓ PASS
O     | 36             | ✓ PASS
```

## Troubleshooting

### If you see errors:
- **"relation already exists"**: Tables already exist. The script uses `CREATE TABLE IF NOT EXISTS` so this is safe to ignore.
- **"duplicate key value"**: Questions already imported. The script uses `TRUNCATE ... CASCADE` to clear existing data, so just re-run the entire script.
- **"cannot truncate a table referenced in a foreign key constraint"**: This is fixed in the script by using `TRUNCATE ... CASCADE`. Make sure you're using the latest version of the script.
- **"syntax error"**: Make sure you copied the entire file, including all quotes and semicolons.

### To Re-import Questions:
If you need to re-import, the script automatically handles this with `TRUNCATE TABLE personality_questions CASCADE;` which will:
- Clear all questions
- Clear all responses (due to CASCADE)
- Then insert fresh questions

Just re-run the entire script - no manual cleanup needed.

## Next Steps

After successful import:
1. Verify all 180 questions are in the database
2. Test the API endpoints that query questions
3. Proceed with creating assessments and responses

