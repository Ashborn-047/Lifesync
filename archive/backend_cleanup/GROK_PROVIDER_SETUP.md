# Grok Provider Setup Guide

## Overview

Grok has been added as a full LLM provider to the LifeSync Personality Engine, working exactly like OpenAI and Gemini providers.

## Files Created/Modified

### New Files
- `src/llm/providers/grok_provider.py` - Grok provider implementation
- `scripts/test_grok_provider.py` - Test script for Grok provider

### Modified Files
- `src/config/llm_provider.py` - Added Grok support
- `src/llm/router.py` - Registered Grok in provider chain
- `src/api/config.py` - Added GROK_API_KEY configuration
- `src/llm/providers/__init__.py` - Exported GrokProvider

## Environment Variables

Add to your `.env` file:

```env
# Grok Configuration
GROK_API_KEY="your-grok-api-key-here"

# Optional: Set Grok as default provider
LLM_PROVIDER="grok"

# Optional: Override default model
DEFAULT_GROK_MODEL="grok-beta"
```

## Usage

### 1. Set Grok as Default Provider

In `.env`:
```env
LLM_PROVIDER="grok"
```

### 2. Use via API

The router will automatically use Grok if:
- `LLM_PROVIDER="grok"` is set, OR
- Grok is in the fallback chain (after Gemini and OpenAI)

### 3. Provider Fallback Chain

Current order:
1. Gemini 2.0 Flash (primary)
2. Gemini Flash-EXP (auto-fallback)
3. OpenAI GPT-4o-mini (backup)
4. **Grok Beta (backup)** ← NEW

## API Endpoint

Grok works with the same endpoint:

```
POST /v1/assessments/{assessment_id}/generate_explanation
```

The router automatically selects Grok based on:
- `LLM_PROVIDER` setting
- API key availability
- Fallback chain position

## Testing

Run the test script:

```bash
python scripts/test_grok_provider.py
```

Or test via API:

```bash
# Set LLM_PROVIDER=grok in .env
uvicorn src.api.server:app --reload --port 5174

# Then call the explanation endpoint
curl -X POST http://localhost:5174/v1/assessments/{id}/generate_explanation
```

## Implementation Details

### Grok Provider Features

- ✅ HTTP-based API (uses httpx)
- ✅ Same prompt structure as OpenAI/Gemini
- ✅ Safe JSON parsing
- ✅ Error handling with ProviderFailure
- ✅ Logging support
- ✅ Automatic cleanup (closes HTTP client)

### API Integration

- **Endpoint**: `https://api.x.ai/v1/chat/completions`
- **Method**: POST
- **Headers**: 
  - `Authorization: Bearer {GROK_API_KEY}`
  - `Content-Type: application/json`
- **Model**: `grok-beta` (default)

### Response Format

Grok returns the same structured response as other providers:

```json
{
  "summary": "...",
  "steps": [...],
  "confidence_note": "...",
  "model_name": "grok-beta",
  "tokens_used": null,
  "generation_time_ms": 1234
}
```

## Notes

- Grok is added to the fallback chain, so it will be used if Gemini and OpenAI fail
- All existing providers (Gemini, OpenAI) remain unchanged
- Grok uses the same prompt templates and JSON schema as other providers
- Safe JSON parsing ensures malformed responses are handled gracefully

