# LLM System Update - Production-Ready Implementation

## Summary

The LifeSync Personality Engine LLM subsystem has been updated to be fully production-ready with robust error handling, automatic fallback, and safe JSON parsing.

## Changes Made

### 1. Safe JSON Utilities (`src/utils/safe_json.py`)
- **`extract_json(text)`**: Extracts JSON substring from text with extra content
- **`repair_json(text)`**: Fixes common JSON issues (trailing commas, missing quotes)
- **`safe_load_json(text)`**: Combines extraction + repair + parsing
- **Guarantee**: Always returns a dict (may contain "error" key if parsing fails)

### 2. Updated Gemini Provider (`src/llm/gemini_provider.py`)
- **Default model**: `gemini-2.0-flash`
- **Alternate models**: `["gemini-2.0-flash-exp"]` (automatic fallback)
- **Retry strategy**: 5 retries with exponential backoff
  - Backoff schedule: 0.5s → 1s → 2s → 4s → 8s
  - Rate limit handling: 2x backoff for quota errors
- **Safe JSON**: All responses routed through `safe_load_json`
- **Error handling**: Raises `ProviderFailure` exception after all retries
- **Logging**: Clear log messages for each attempt and fallback

### 3. Updated OpenAI Provider (`src/llm/openai_provider.py`)
- **Default model**: `gpt-4o-mini` (cost-effective)
- **Safe JSON**: Uses `safe_load_json` for parsing
- **Error handling**: Raises `ProviderFailure` on errors
- **Logging**: Error logging for debugging

### 4. New LLM Router (`src/llm/router.py`)
- **Provider priority chain**:
  1. Gemini 2.0 Flash (primary)
  2. Gemini Flash-EXP (automatic fallback via GeminiProvider)
  3. OpenAI GPT-4o-mini (backup, only if OPENAI_API_KEY exists)
- **Automatic fallback**: Tries next provider if current fails
- **Never crashes**: Always returns a dict (may contain "error" key)
- **Logging**: Clear messages for provider selection and fallbacks

### 5. Updated API Server (`src/api/server.py`)
- **Error handling**: Wrapped in try/catch, never crashes
- **HTTP 503**: Returns 503 if LLM service unavailable
- **Logging**: 
  - "Generating explanation for assessment {id}"
  - "Using provider: X"
  - "Provider failed: reason"
  - "Fallback triggered"
  - "Explanation generated successfully using {model}"
- **Graceful degradation**: Continues even if database save fails

### 6. Provider Failure Exception (`src/llm/providers/provider_failure.py`)
- Custom exception for provider failures
- Includes provider name, model name, original error, and retry count

## Provider Fallback Flow

```
1. Try Gemini 2.0 Flash
   ├─ Success → Return result
   └─ Failure → Log "Fallback → Flash-EXP"
   
2. Try Gemini Flash-EXP (automatic via GeminiProvider)
   ├─ Success → Return result
   └─ Failure → Log "Fallback → OpenAI"
   
3. Try OpenAI GPT-4o-mini (if key exists)
   ├─ Success → Return result
   └─ Failure → Return error dict
```

## Error Handling Strategy

1. **Provider Level**: Retries with backoff, raises `ProviderFailure`
2. **Router Level**: Catches `ProviderFailure`, tries next provider
3. **API Level**: Catches all errors, returns HTTP 503 with error message
4. **JSON Parsing**: Always succeeds (returns error dict if parsing fails)

## Local Development Features

- ✅ No infinite retries (max 5 per provider)
- ✅ No model spam (exponential backoff)
- ✅ No silent failures (all errors logged)
- ✅ Clear console logs
- ✅ Non-blocking (uses time.sleep, not async)

## Testing

After changes, the system should:
- ✅ Use Gemini-2.0-Flash by default
- ✅ Automatically switch to Flash-EXP if rate-limited
- ✅ Fall back to GPT-4o-mini if both Gemini models fail
- ✅ Return valid JSON explanations
- ✅ Handle malformed JSON gracefully
- ✅ Never crash the server
- ✅ Log provider chain clearly

## Files Modified

- `src/utils/safe_json.py` (NEW)
- `src/llm/gemini_provider.py` (UPDATED)
- `src/llm/openai_provider.py` (UPDATED)
- `src/llm/router.py` (NEW - replaces llm_router.py logic)
- `src/llm/providers/provider_failure.py` (NEW)
- `src/api/server.py` (UPDATED)
- `src/ai/explanation_generator.py` (UPDATED)
- `src/llm/explanations.py` (UPDATED)
- `src/config/llm_provider.py` (UPDATED - default models)

## Backward Compatibility

- All existing API endpoints work unchanged
- Response format unchanged
- Only internal implementation improved

