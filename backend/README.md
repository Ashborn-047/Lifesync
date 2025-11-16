# LifeSync Personality Engine (MVP)

A comprehensive personality assessment system built on the Big Five (OCEAN) personality model, featuring automated scoring, AI-powered explanations, and Supabase integration.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [How Scoring Works](#how-scoring-works)
- [How LLM is Used](#how-llm-is-used)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running Locally](#running-locally)
- [Supabase Integration](#supabase-integration)
- [API Endpoints](#api-endpoints)
- [Future ML Roadmap](#future-ml-roadmap)

## 🎯 Overview

LifeSync Personality Engine is a production-ready MVP for personality assessment that:

- **Scores 180-question OCEAN assessments** with 30 facets
- **Generates AI-powered explanations** using LLM (GPT-4)
- **Stores results in Supabase** with full RLS security
- **Provides REST API** via FastAPI
- **Supports multiple quiz types** (quick, standard, full)

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │
       │ HTTP/REST
       ▼
┌─────────────────────────────────┐
│      FastAPI Server              │
│  (src/api/server.py)             │
└──────┬───────────────────────────┘
       │
       ├──► Personality Scorer
       │    (src/scorer/)
       │
       ├──► LLM Client
       │    (src/llm/)
       │
       └──► Supabase Client
            (src/supabase_client.py)
                   │
                   ▼
            ┌──────────────┐
            │   Supabase   │
            │  PostgreSQL  │
            └──────────────┘
```

### Components

1. **Scorer Module** (`src/scorer/`)
   - Loads question bank from JSON
   - Calculates OCEAN trait scores (0-1 scale)
   - Computes 30 facet scores
   - Generates confidence metrics
   - Derives MBTI proxy and personality codes

2. **LLM Module** (`src/llm/`)
   - OpenAI GPT-4 integration
   - Custom prompt templates
   - JSON-structured responses
   - Token usage tracking

3. **API Module** (`src/api/`)
   - FastAPI REST endpoints
   - Input validation
   - Error handling
   - Request/response models

4. **Supabase Client** (`src/supabase_client.py`)
   - Database operations
   - Assessment management
   - Response storage
   - Score persistence
   - Explanation storage

## 📊 Data Flow

### Assessment Flow

```
1. User submits answers
   ↓
2. API validates input
   ↓
3. Create assessment record in Supabase
   ↓
4. Save responses to database
   ↓
5. Score answers using PersonalityScorer
   ↓
6. Calculate traits, facets, confidence
   ↓
7. Save scores to personality_scores table
   ↓
8. Return results to client
```

### Explanation Flow

```
1. Client requests explanation for assessment
   ↓
2. Retrieve scores from database
   ↓
3. Format data for LLM prompt
   ↓
4. Call LLM API (GPT-4)
   ↓
5. Parse JSON response
   ↓
6. Save explanation to llm_explanations table
   ↓
7. Return explanation to client
```

## 🧮 How Scoring Works

### OCEAN Trait Calculation

1. **Question Mapping**: Each question maps to:
   - One OCEAN trait (O, C, E, A, N)
   - One facet (e.g., O1: Fantasy, C2: Order)
   - A weight (default: 1.0)
   - Reverse scoring flag

2. **Response Scaling**: 
   - Convert 1-5 Likert scale to 0-1 scale
   - Apply reverse scoring if needed: `scaled = 1.0 - scaled`

3. **Weighted Aggregation**:
   ```
   trait_score = Σ(scaled_response × weight) / Σ(weight)
   ```

4. **Confidence Calculation**:
   ```
   confidence = questions_answered_weight / max_possible_weight
   ```

### Facet Scores

- Each of the 30 facets has 6 questions
- Facet scores calculated same way as traits
- Top 5 facets identified for profile summary

### Derived Profiles

- **MBTI Proxy**: Derived from OCEAN scores
  - E/I from Extraversion
  - N/S from Openness
  - T/F from Agreeableness
  - J/P from Conscientiousness

- **Neuroticism Level**:
  - < 0.35: Stable
  - 0.35-0.65: Balanced
  - > 0.65: Sensitive

- **Personality Code**: `{MBTI}-{Neuroticism}` (e.g., "INFP-B")

## 🤖 How LLM is Used

### Purpose

Generate personalized, human-readable explanations of personality assessment results.

### Process

1. **Input Preparation**:
   - OCEAN trait scores
   - Top facets
   - Confidence scores
   - Dominant profile (MBTI proxy, neuroticism level)

2. **Prompt Engineering**:
   - System prompt: Defines role as personality psychologist
   - User prompt: Contains formatted assessment data
   - Response format: JSON with `summary`, `steps`, `confidence_note`

3. **LLM Call**:
   - Model: GPT-4 (configurable)
   - Temperature: 0.7 (balanced creativity/consistency)
   - Max tokens: 1000
   - Response format: JSON object

4. **Response Parsing**:
   - Extract summary (2-3 paragraphs)
   - Extract steps (3-5 key insights)
   - Extract confidence note
   - Store metadata (tokens, timing)

### Example Output

```json
{
  "summary": "Your personality profile shows high Openness and Agreeableness...",
  "steps": [
    "Your high Openness suggests you're creative and curious...",
    "Your balanced Neuroticism indicates emotional stability...",
    ...
  ],
  "confidence_note": "This assessment has high confidence (85% average)..."
}
```

## 📁 Project Structure

```
lifesync/
├── README.md
├── requirements.txt
├── infra/
│   ├── supabase/
│   │   ├── schemas/
│   │   │   └── 1_personality_questions.sql
│   │   └── sql_import/
│   └── edge_functions/
│       └── predict_personality/
├── src/
│   ├── scorer/
│   │   ├── __init__.py
│   │   ├── personality_scorer.py
│   │   └── create_scorer_wrapper.py
│   ├── llm/
│   │   ├── __init__.py
│   │   ├── llm_client.py
│   │   └── templates.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── server.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   └── metrics.py
│   └── supabase_client.py
├── data/
│   ├── question_bank/
│   │   ├── lifesync_180_questions.json
│   │   └── smart_quiz_30.json
│   └── samples/
├── scripts/
│   └── csv_export_supabase.py
└── tests/
    ├── __init__.py
    ├── test_scoring.py
    └── test_llm_responses.py
```

## 🚀 Setup & Installation

### Prerequisites

- Python 3.8+
- Supabase account and project
- OpenAI API key (for LLM explanations)

### Installation

1. **Clone the repository** (if applicable)

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_KEY="your-anon-key"
   export OPENAI_API_KEY="sk-..."
   ```

   Or create a `.env` file:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   OPENAI_API_KEY=sk-...
   ```

4. **Set up Supabase database**:
   - Run the SQL schema: `infra/supabase/schemas/1_personality_questions.sql`
   - Import questions from `data/question_bank/lifesync_180_questions.json`

## 🏃 Running Locally

### Start the API Server

```bash
# From project root
python -m src.api.server
```

Or using uvicorn directly:

```bash
uvicorn src.api.server:app --reload --host 0.0.0.0 --port 8000
```

### Test the API

```bash
# Health check
curl http://localhost:8000/health

# Create assessment
curl -X POST http://localhost:8000/v1/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_type": "full",
    "answers": {
      "Q001": 4,
      "Q007": 3,
      "Q013": 5,
      ...
    }
  }'

# Generate explanation
curl -X POST http://localhost:8000/v1/assessments/{assessment_id}/generate_explanation \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gpt-4"
  }'
```

### Run Tests

```bash
# Run all tests
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_scoring.py
python -m pytest tests/test_llm_responses.py
```

## 🔗 Supabase Integration

### Database Schema

The system uses 5 main tables:

1. **personality_questions**: Static question bank (180 questions)
2. **personality_assessments**: User assessment sessions
3. **personality_responses**: Individual question answers
4. **personality_scores**: Computed OCEAN scores and profiles
5. **llm_explanations**: AI-generated explanations

### Setup Steps

1. **Create tables**: Run `infra/supabase/schemas/1_personality_questions.sql` in Supabase SQL Editor

2. **Import questions**: Use the script in `scripts/csv_export_supabase.py` or import via Supabase Dashboard

3. **Configure RLS**: Row Level Security is enabled by default. Ensure your Supabase project has authentication set up.

4. **Test connection**: The API will automatically connect to Supabase using environment variables.

### Edge Functions (Future)

The `infra/edge_functions/predict_personality/` directory is reserved for Supabase Edge Functions that can:
- Run scoring serverless
- Generate explanations on-demand
- Handle real-time updates

## 📡 API Endpoints

### `POST /v1/assessments`

Create and score a personality assessment.

**Request**:
```json
{
  "quiz_type": "full",
  "answers": {
    "Q001": 4,
    "Q007": 3,
    ...
  },
  "user_id": "optional-uuid"
}
```

**Response**:
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
  "coverage": 16.7,
  "responses_count": 30
}
```

### `POST /v1/assessments/{id}/generate_explanation`

Generate LLM explanation for an assessment.

**Request**:
```json
{
  "model_name": "gpt-4"
}
```

**Response**:
```json
{
  "assessment_id": "uuid",
  "summary": "...",
  "steps": [...],
  "confidence_note": "...",
  "model_name": "gpt-4",
  "tokens_used": 450,
  "generation_time_ms": 1250
}
```

### `GET /health`

Health check endpoint.

## 🗺️ Future ML Roadmap

### Phase 1: Enhanced Scoring (Q1)
- [ ] Adaptive question selection based on partial responses
- [ ] Confidence-based question prioritization
- [ ] Multi-dimensional scoring (beyond OCEAN)

### Phase 2: ML-Powered Insights (Q2)
- [ ] Clustering similar personality profiles
- [ ] Recommendation engine for career/lifestyle matches
- [ ] Predictive modeling for personality changes over time

### Phase 3: Advanced Features (Q3-Q4)
- [ ] Fine-tuned LLM model for personality explanations
- [ ] Real-time personality tracking
- [ ] Integration with wearable data (mood, activity)
- [ ] Personality-based matching algorithms

### Phase 4: Production Scale (Q4+)
- [ ] Edge function deployment for serverless scoring
- [ ] Caching layer for common assessments
- [ ] A/B testing framework for scoring algorithms
- [ ] Analytics dashboard for assessment insights

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📧 Contact

[Add contact information here]

