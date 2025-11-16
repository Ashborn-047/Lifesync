# LifeSync Personality Assessment - Test Suite Documentation

## Overview

This test suite validates all fixes implemented for the personality assessment bug where users were getting incorrect results (4 traits at 50%, MBTI showing "XNXX").

## Test Files

### 1. `test_scorer_validation.py`
**Purpose:** Tests validation logic that prevents unbalanced question sets.

**Tests:**
- ✅ Unbalanced questions detection (bug scenario)
- ✅ Balanced questions pass validation
- ✅ Low coverage warnings
- ✅ Invalid question IDs detection
- ✅ Empty responses handling

**Run:**
```bash
pytest tests/test_scorer_validation.py -v --log-cli-level=INFO
```

### 2. `test_null_handling.py`
**Purpose:** Tests that scorer returns null for insufficient data instead of defaulting to 0.5.

**Tests:**
- ✅ Insufficient data returns null
- ✅ Sufficient data returns score
- ✅ MBTI null with incomplete profile
- ✅ MBTI generated with complete profile
- ✅ Top facets exclude null values
- ✅ Facet scores handle null

**Run:**
```bash
pytest tests/test_null_handling.py -v --log-cli-level=INFO
```

### 3. `test_integration_fixes.py`
**Purpose:** Tests that all fixes work together end-to-end.

**Tests:**
- ✅ Questions endpoint returns balanced set
- ✅ Assessment validation rejects unbalanced responses
- ✅ Assessment accepts balanced responses
- ✅ Cache busting parameters accepted
- ✅ Full flow produces varied scores (no 50% defaults)

**Run:**
```bash
pytest tests/test_integration_fixes.py -v --log-cli-level=INFO
```

## Running All Tests

```bash
# Run all tests with verbose output and logging
pytest tests/ -v --log-cli-level=INFO

# Run specific test file
pytest tests/test_scorer_validation.py -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

## Test Logs

All tests include comprehensive logging for:
- Test execution flow
- Input data
- Validation results
- Trait scores and coverage
- Error messages
- Success confirmations

Logs are written to console with INFO level by default. Use `--log-cli-level=DEBUG` for more detailed output.

## Expected Results

After running all tests, you should see:
- ✅ All validation tests pass
- ✅ All null handling tests pass
- ✅ All integration tests pass
- ✅ No 50% default scores
- ✅ No "XNXX" MBTI types
- ✅ Balanced question sets returned

## Troubleshooting

### Tests fail with "Question bank not found"
- Ensure `data/question_bank/lifesync_180_questions.json` exists
- Check file path in test fixtures

### Integration tests fail with connection errors
- Ensure backend server is running (or use TestClient)
- Check API endpoint URLs in test configuration

### Validation tests fail
- Check that `validate_responses()` method is implemented
- Verify MIN_QUESTIONS_PER_TRAIT constant is set correctly (should be 3)

## Future Test Additions

Consider adding:
- Performance tests for large response sets
- Edge case tests for boundary values
- Stress tests for concurrent requests
- Frontend component tests (see `web/tests/`)

