# Phase 4: Edge Functions — Scoring Migration

## 🎯 Goal
Port the personality scoring logic from the TypeScript package (`@lifesync/personality-engine`) to a **Supabase Edge Function** (Deno).

### Why?
- **Lower Latency**: Edge functions run closer to the user.
- **Perfect Logic Parity**: Uses the exact same TypeScript code as the frontend.
- **Serverless Stability**: Removes heavy computation from the Python backend.

---

## 🛠️ Proposed Changes

### 1. Supabase Edge Function [NEW]
Create `supabase/functions/score-assessment/index.ts`:
- **Input**: Raw answer array from the user.
- **Processing**: Imports `computeProfile` from `@lifesync/personality-engine`.
- **Output**: Full OCEAN profile + MBTI result.
- **Database**: Automatically updates the `personality_assessments` table with the new scores.

### 2. API SDK [MODIFY]
Update `packages/api-sdk/client.ts`:
- Change the `submitAssessment` flow to trigger the Supabase Edge Function instead of (or in addition to) the Python backend scoring route.

---

## ✅ Verification Plan

### Automated Tests
- Run `npm test --workspace @lifesync/personality-engine` to ensure the core logic is still valid before porting.
- Use `supabase functions serve` locally to test the new endpoint with mock data.

### Manual Verification
1. Submit a fresh assessment in the Web App.
2. Verify that `personality_assessments` in Supabase is updated with scores.
3. Check the "Results" page for correct trait bar rendering.

---
> [!IMPORTANT]
> This migration will make the scoring logic 100% consistent across Web, Backend, and Edge.
