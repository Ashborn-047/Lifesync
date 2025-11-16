# Local Testing Setup Guide

## Quick Start

1. **Start the server:**
   ```bash
   # Windows
   scripts\start_server.bat
   
   # Linux/Mac
   bash scripts/start_server.sh
   
   # Or manually:
   uvicorn src.api.server:app --reload --port 5174
   ```

2. **Run the test:**
   ```bash
   python scripts/test_local_personality_engine.py
   ```

## Supabase Configuration

The `.env` file currently has **placeholder credentials**. To test the full flow, you need to:

1. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy your Project URL and anon/public key

2. **Update `.env` file:**
   ```env
   SUPABASE_URL="https://your-actual-project.supabase.co"
   SUPABASE_KEY="your-actual-anon-key-here"
   SUPABASE_SERVICE_ROLE="your-actual-service-role-key-here"
   ```

3. **Make sure your Supabase database has the tables:**
   - Run the SQL schema from `infra/supabase/schemas/1_personality_questions.sql`
   - Import questions from `infra/supabase/sql_import/import_questions.sql`

## Testing Without Supabase (Scoring Only)

If you just want to test the scoring engine without database operations, you can modify the endpoint to skip Supabase calls. However, the full integration test requires Supabase.

## Port Configuration

- **Default port:** 5174 (to avoid conflicts with other projects)
- **Alternative ports:** 5175, 8000
- Change in `scripts/test_local_personality_engine.py` if needed

## Troubleshooting

### "Supabase credentials not configured"
- Check your `.env` file has real credentials (not placeholders)
- Make sure `.env` is in the project root

### "Port already in use"
- Use a different port: `--port 5175`
- Or stop the other service using that port

### "Assessment creation failed"
- Check Supabase connection
- Verify database tables exist
- Check server logs for detailed error messages

