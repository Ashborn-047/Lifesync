# LifeSync Backend Documentation

FastAPI backend service for the LifeSync Personality Engine.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip
- Supabase account
- Gemini API key (or OpenAI/Grok)

### Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Start the server:
   ```bash
   uvicorn src.api.server:app --reload --port 8000
   ```

Server will be available at `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### Create Assessment
```
POST /v1/assessments
```
Creates a new personality assessment and scores responses.

**Request Body:**
```json
{
  "user_id": "uuid-string",
  "responses": {
    "Q001": 5,
    "Q002": 3,
    "Q010": 4
  },
  "quiz_type": "full"
}
```

**Response:**
```json
{
  "assessment_id": "uuid",
  "traits": {
    "Openness": 0.72,
    "Conscientiousness": 0.65,
    ...
  },
  "facets": {...},
  "confidence": {...},
  "dominant": {
    "mbti_proxy": "INFP",
    "neuroticism_level": "Balanced",
    "personality_code": "INFP-B"
  },
  "top_facets": [...],
  "coverage": 0.85,
  "responses_count": 30
}
```

### Generate Explanation
```
POST /v1/assessments/{assessment_id}/generate_explanation
```
Generates an AI-powered personality explanation.

**Request Body:**
```json
{
  "provider": "gemini"  // optional: gemini, openai, or grok
}
```

**Response:**
```json
{
  "assessment_id": "uuid",
  "summary": "Personality overview...",
  "steps": ["Insight 1", "Insight 2", ...],
  "confidence_note": "Assessment reliability note",
  "model_name": "gemini-2.0-flash",
  "tokens_used": 1500,
  "generation_time_ms": 6500
}
```

## 🧠 LLM Providers

### Primary: Gemini
- Model: `gemini-2.0-flash`
- Automatic fallback to alternate models
- 5 retry attempts with exponential backoff

### Backup Providers
- **OpenAI**: GPT-4o-mini (if key configured)
- **Grok**: Grok Beta (if key configured)

### Fallback Chain
```
Gemini Flash → Gemini Flash-EXP → OpenAI → Grok
```

## 🎨 Tone Generation

The system automatically generates communication tone profiles based on OCEAN traits:
- **Style**: Writing style recommendations
- **Strengths**: Positive reinforcement points
- **Cautions**: Emotional sensitivity warnings

## 🗄️ Database Schema

### Tables
- `personality_questions` - Question bank (180 questions)
- `personality_assessments` - Assessment records
- `personality_responses` - Individual responses
- `llm_explanations` - Generated explanations

## 🔧 Configuration

### Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE` - Service role key
- `GEMINI_API_KEY` - Gemini API key (required)
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `GROK_API_KEY` - Grok API key (optional)
- `LLM_PROVIDER` - Default provider (default: "gemini")

## 🧪 Testing

Run integration tests:
```bash
python scripts/test_local_personality_engine.py
```

Test Grok provider:
```bash
python scripts/test_grok_llm.py
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/          # FastAPI routes
│   ├── ai/           # AI features (tone, explanations)
│   ├── llm/          # LLM providers
│   ├── scorer/       # Personality scoring
│   ├── config/       # Configuration
│   └── utils/        # Utilities
├── scripts/          # Test scripts
├── tests/            # Unit tests
├── data/             # Question banks
└── infra/            # Infrastructure configs
```

## 🐛 Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify `.env` has correct `SUPABASE_URL` and `SUPABASE_KEY`
   - Check Supabase project is active

2. **LLM API errors**
   - Verify API keys are set correctly
   - Check API quota/credits
   - System will automatically fallback to available providers

3. **Import errors**
   - Ensure all dependencies installed: `pip install -r requirements.txt`
   - Check Python version (3.10+)

## 📝 License

(To be added)

