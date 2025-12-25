# Tomorrow's Plan: Debugging OCEAN Score Discrepancies

## 1. Captured Logs (Mobile Submission)
**Date:** 2025-11-27
**Assessment ID:** `cd0f164c-f19c-46b3-bd88-62018e270a39`
**User ID:** `b1d2eb9c-7137-479b-a71b-1ecf8eb0d6d6`

**Submission Payload:**
```json
{
  "user_id": "b1d2eb9c-7137-479b-a71b-1ecf8eb0d6d6",
  "responses": {
    "Q025": 1, "Q079": 2, "Q067": 3, "Q109": 4, "Q145": 5,
    "Q097": 5, "Q139": 4, "Q169": 3, "Q055": 2, "Q085": 1,
    "Q127": 1, "Q043": 2, "Q031": 3, "Q133": 4, "Q061": 5,
    "Q157": 5, "Q151": 4, "Q001": 3, "Q121": 2, "Q115": 1,
    "Q049": 1, "Q013": 2, "Q163": 3, "Q007": 4, "Q103": 5,
    "Q073": 5, "Q091": 4, "Q019": 3, "Q037": 2, "Q175": 1
  },
  "quiz_type": "full"
}
```

## 2. Investigation Steps

### A. Verify Backend Processing
1.  **Check Supabase**: Look up Assessment ID `cd0f164c-f19c-46b3-bd88-62018e270a39` in the `personality_assessments` table.
2.  **Verify Scores**: Compare the stored trait scores for this ID with the scores displayed on the mobile app.
3.  **Verify Responses**: Check the `personality_responses` table for this assessment ID to ensure the backend received exactly what was sent (e.g., Q025=1, Q079=2).

### B. Compare with Web App
1.  **Perform Identical Submission**:
    *   Open the Web App.
    *   Manually force the *exact same answers* for the *exact same Question IDs*.
    *   *Note*: Since the web app shuffles questions, we cannot just click "1, 2, 3..." in order. We must map the Question Text to the ID.
    *   **Action Item**: Create a "Debug Mode" or script for the web app that allows submitting a specific JSON payload directly to `/v1/assessments` to bypass the UI shuffling for testing.

### C. Analyze Scoring Logic
1.  **Question IDs**:
    *   `Q025` (Openness)
    *   `Q079` (Extraversion)
    *   ...and so on.
2.  **Manual Calculation**: Manually calculate the expected score for one trait (e.g., Extraversion) based on the payload above and the `smart_quiz_30.json` scoring rules (forward vs reverse).
3.  **Compare**: Does Manual Calculation == Backend Score?

## 3. Goal
Confirm that **Payload X** always results in **Score Y**, regardless of whether it comes from Mobile or Web.

## 4. Current Status
*   **Backend**: Enforced `smart_quiz_30.json` for limit=30.
*   **Mobile**: Sending correct `quiz_type='full'` and `limit=30`.
*   **Data**: We have a concrete data point (the payload above) to debug with.
