# LifeSync - Testing & Verification Guide

This guide helps you verify that your LifeSync app is running correctly and the quiz functionality works properly.

---

## Quick Health Check

### 1. Backend Health Check

**Test if backend is running:**

1. Open your browser
2. Navigate to: `http://localhost:5174/health`
3. **Expected response:**
   ```json
   {
     "status": "healthy",
     "service": "LifeSync Personality Engine API"
   }
   ```
4. ✅ **If you see this**: Backend is running correctly
5. ❌ **If you see "Connection refused" or timeout**: Backend is not running

**Start backend if needed:**
```bash
cd backend
uvicorn src.api.server:app --reload --port 5174
```

---

### 2. Test Questions Endpoint

**Verify questions are loading from database:**

1. In browser, navigate to: `http://localhost:5174/v1/questions`
2. **Expected response:** JSON array with question objects:
   ```json
   [
     {
       "id": "Q001",
       "text": "I am the life of the party.",
       "trait": "E",
       "facet": "E1",
       "reverse": false
     },
     ...
   ]
   ```
3. ✅ **If you see questions array**: Questions endpoint is working
4. ❌ **If you see error or empty array**: Check Supabase connection and database

**Check question count:**
- Should see 180 questions (or however many you have in database)
- Each question should have: `id`, `text`, `trait`, `facet`, `reverse`

---

### 3. Mobile App Connection Test

**Test from mobile device browser:**

1. Find your LAN IP (see RUN_LOCAL.md section 3)
2. On your mobile device, open a browser
3. Navigate to: `http://YOUR_LAN_IP:5174/health`
   - Example: `http://192.168.1.15:5174/health`
4. **Expected:** Same JSON response as step 1
5. ✅ **If working**: Mobile can reach backend
6. ❌ **If not working**: Check LAN IP, firewall, same WiFi network

**Test questions endpoint from mobile:**
- Navigate to: `http://YOUR_LAN_IP:5174/v1/questions`
- Should see the same questions array

---

## Testing the Quiz Flow

### Step 1: Start Backend

```bash
cd backend
uvicorn src.api.server:app --reload --port 5174
```

**What to check:**
- ✅ Terminal shows: `Uvicorn running on http://127.0.0.1:5174`
- ✅ No error messages about missing dependencies
- ✅ No Supabase connection errors

---

### Step 2: Start Mobile App

```bash
cd mobile
npx expo start
```

**What to check:**
- ✅ QR code appears in terminal
- ✅ Expo DevTools opens in browser
- ✅ No error messages about missing dependencies
- ✅ Check terminal for any warnings about `.env` variables

**Verify .env is loaded:**
- Look for warnings like: `⚠️ Environment Configuration Warnings`
- If you see warnings, check `mobile/.env` file

---

### Step 3: Open App on Device

1. Scan QR code with Expo Go app
2. App should load on your device

**What to check:**
- ✅ App opens without crashes
- ✅ No red error screen
- ✅ Home screen or Onboarding screen appears
- ✅ No network errors in console

**If you see errors:**
- Shake device → "Show Dev Menu" → "Debug Remote JS"
- Check console for specific error messages

---

### Step 4: Navigate to Quiz

1. From home/onboarding screen, tap "Start Personality Quiz" or similar
2. Navigate through intro screens
3. Reach the Quiz Screen

**What to check:**
- ✅ Quiz screen loads
- ✅ Loading indicator appears briefly
- ✅ First question appears
- ✅ 5 choice buttons are visible (Strongly Disagree to Strongly Agree)
- ✅ Progress bar shows "1/30" or similar

**If questions don't load:**
- Check backend terminal for errors
- Verify `GET /v1/questions` works in browser
- Check mobile console for network errors
- Verify `EXPO_PUBLIC_API_URL` in `.env` uses LAN IP (not localhost)

---

### Step 5: Answer Questions

1. Tap a choice button (e.g., "Agree")
2. **Expected behavior:**
   - Button highlights/selects
   - Next question appears automatically
   - Progress bar updates

**What to check:**
- ✅ Button press is responsive (no lag)
- ✅ Selected button is visually highlighted
- ✅ Next question loads smoothly
- ✅ Progress bar updates correctly
- ✅ Question counter increments (1/30 → 2/30 → ...)

**Test all 5 choices:**
- Try each button: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree
- Verify all work correctly

---

### Step 6: Complete Quiz

1. Answer all 30 questions
2. On the last question, select an answer

**Expected behavior:**
- Loading indicator appears
- App navigates to Quiz Result Screen
- Explanation generation starts

**What to check:**
- ✅ No crashes when submitting
- ✅ Loading screen appears
- ✅ Backend terminal shows:
  - `POST /v1/assessments` request
  - Scoring calculation logs
  - `POST /v1/assessments/{id}/generate_explanation` request
  - LLM generation logs

**Backend logs to look for:**
```
INFO: POST /v1/assessments
INFO: Scoring completed
INFO: POST /v1/assessments/{id}/generate_explanation
INFO: [LLM] Using provider: gemini
INFO: Explanation generated successfully
```

---

### Step 7: View Results

**Expected:**
- Quiz Result Screen shows:
  - Personality summary
  - OCEAN trait scores
  - Facet scores
  - LLM-generated explanation

**What to check:**
- ✅ Results screen loads (not stuck on loading)
- ✅ Personality summary text appears
- ✅ Trait scores are displayed (O, C, E, A, N)
- ✅ Explanation text is present and readable
- ✅ No error messages

**If explanation is missing:**
- Check backend logs for LLM errors
- Verify `GEMINI_API_KEY` (or other LLM keys) in `backend/.env`
- Check if LLM provider is configured correctly

---

## Common Issues & Solutions

### Issue: Questions Not Loading

**Symptoms:**
- Quiz screen shows "Loading..." forever
- Error message: "Failed to fetch questions"
- Empty quiz screen

**Diagnosis:**
1. Check backend is running: `http://localhost:5174/health`
2. Test questions endpoint: `http://localhost:5174/v1/questions`
3. Check mobile `.env`: `EXPO_PUBLIC_API_URL` should use LAN IP
4. Check mobile console for network errors

**Solutions:**
- Restart backend
- Verify Supabase connection in backend
- Check `mobile/.env` has correct LAN IP
- Restart Expo (press `r` or kill Metro)

---

### Issue: Can't Submit Quiz

**Symptoms:**
- Answers don't save
- Stuck on last question
- Error when trying to submit

**Diagnosis:**
1. Check backend terminal for `POST /v1/assessments` request
2. Check mobile console for errors
3. Verify answers are being collected (check state)

**Solutions:**
- Check backend is running
- Verify network connectivity
- Check backend logs for validation errors
- Ensure all 30 questions are answered

---

### Issue: Explanation Not Generating

**Symptoms:**
- Results screen stuck on "Generating explanation..."
- No explanation text appears
- Error message about explanation

**Diagnosis:**
1. Check backend logs for LLM errors
2. Verify LLM API keys in `backend/.env`
3. Check if provider is available

**Solutions:**
- Verify `GEMINI_API_KEY` (or other LLM key) is set
- Check LLM provider configuration
- Check backend logs for specific error messages
- Try different LLM provider if one fails

---

### Issue: App Crashes

**Symptoms:**
- App closes unexpectedly
- Red error screen appears
- "Something went wrong" message

**Diagnosis:**
1. Check Expo terminal for error stack trace
2. Check mobile console (shake device → Debug Remote JS)
3. Look for specific error messages

**Common causes:**
- Missing environment variables
- Network connection issues
- Backend not running
- Invalid data format

**Solutions:**
- Check all `.env` variables are set
- Verify backend is running
- Check network connectivity
- Review error stack trace for specific issues

---

## Manual API Testing

### Test Assessment Creation

**Using curl or Postman:**

```bash
curl -X POST http://localhost:5174/v1/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "00000000-0000-0000-0000-000000000001",
    "responses": {
      "Q001": 5,
      "Q002": 4,
      "Q003": 3,
      "Q004": 2,
      "Q005": 1
    },
    "quiz_type": "full"
  }'
```

**Expected response:**
```json
{
  "assessment_id": "uuid-here",
  "traits": {
    "O": 0.65,
    "C": 0.72,
    ...
  },
  "facets": {
    "O1": 0.68,
    ...
  },
  ...
}
```

### Test Explanation Generation

```bash
curl -X POST http://localhost:5174/v1/assessments/{ASSESSMENT_ID}/generate_explanation \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "assessment_id": "uuid-here",
  "summary": "Your personality profile shows...",
  "steps": [...],
  "confidence_note": "...",
  "model_name": "gemini-2.0-flash",
  ...
}
```

---

## Checklist: Is Everything Working?

Use this checklist to verify your setup:

### Backend
- [ ] Backend starts without errors
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Questions endpoint returns array of questions
- [ ] Assessment creation works (test with curl/Postman)
- [ ] Explanation generation works
- [ ] No errors in backend terminal

### Mobile App
- [ ] Expo starts without errors
- [ ] App loads on device
- [ ] No red error screens
- [ ] Can navigate to quiz screen
- [ ] Questions load from backend
- [ ] Can select answers
- [ ] Quiz submits successfully
- [ ] Results screen shows explanation

### Network
- [ ] Backend accessible from laptop browser
- [ ] Backend accessible from mobile browser (using LAN IP)
- [ ] Mobile app can reach backend API
- [ ] No CORS errors
- [ ] No network timeout errors

### Data Flow
- [ ] Questions fetched from Supabase
- [ ] Answers saved to database
- [ ] Scores calculated correctly
- [ ] Explanation generated by LLM
- [ ] Results displayed in app

---

## Debugging Tips

### Enable Detailed Logging

**Backend:**
- Check terminal output for all requests
- Look for error stack traces
- Verify Supabase queries succeed

**Mobile:**
- Shake device → "Show Dev Menu" → "Debug Remote JS"
- Check browser console (if debugging in browser)
- Look for network request failures in Expo terminal

### Test Individual Components

1. **Test backend only:**
   - Use curl or Postman
   - Test each endpoint separately
   - Verify responses are correct

2. **Test mobile only:**
   - Use mock data
   - Test UI components
   - Verify navigation works

3. **Test integration:**
   - Connect mobile to backend
   - Test full flow
   - Check data flows correctly

---

## Success Indicators

✅ **Everything is working if:**
- Backend health check passes
- Questions load in app
- You can answer all questions
- Quiz submits successfully
- Results screen shows personality data
- Explanation text appears
- No errors in console or terminal

If all of these are true, your LifeSync quiz is working correctly! 🎉

---

## Need More Help?

- Check `RUN_LOCAL.md` for setup instructions
- Review backend logs for specific errors
- Check mobile console for client-side errors
- Verify all environment variables are set correctly
- Test API endpoints directly with curl/Postman

