# MBTI Tie-Break Parity Fix
**Date:** 2025-11-30
**Fix ID:** mbti_tiebreak_fix

## Issue Description
The TypeScript scoring engine (used in Mobile/Web) and the Python scoring engine (Backend) had a parity mismatch for Openness scores of exactly 50.
- **Python:** Used a confidence-based tie-break (if confidence > 0.5 then 'N', else 'S').
- **TypeScript:** Used a hardcoded default (always 'N' or 'S' depending on implementation).

This caused a mismatch for users with exactly 50/100 Openness.

## The Fix
Backported the deterministic tie-break logic from the verified Sandbox to the Production codebase.

### Logic
```typescript
if (openness > 50) return "N";
if (openness < 50) return "S";
// Tie-break for exactly 50
return confidence > 0.5 ? "N" : "S";
```

## Files Modified
- `packages/personality-engine/scoring/computeProfile.ts`: Calculates confidence and passes it to mapping.
- `packages/personality-engine/mapping/factorMapping.ts`: Implements the tie-break logic.
- `packages/personality-engine/scoring/aggregateTraits.ts`: Returns `traitCounts` needed for confidence calculation.

## Verification
- **Sanity Tests:** Passed (4/4 vectors).
- **Mini Parity Test:** Passed (End-to-end flow).
- **Batch 2 Verification:** 20,000 runs with 100% parity (performed in Sandbox).

## Drift Analysis
Zero drift observed in Batch 2 verification (Centroid Shift: 0.0000).
