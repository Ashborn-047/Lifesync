# Scoring Engine Parity Rules

**Last Updated:** 2025-11-30

## Core Invariant
The TypeScript scoring engine (Mobile/Web) **MUST** produce identical results to the Python scoring engine (Backend) for any given input.

## Tie-Break Rule (MBTI)
For Openness (O) scores of exactly 50/100:
- **Rule:** Use the confidence score to break the tie.
- **Logic:**
  - `O > 50` → **N** (Intuitive)
  - `O < 50` → **S** (Sensing)
  - `O == 50` AND `Confidence > 0.5` → **N**
  - `O == 50` AND `Confidence <= 0.5` → **S**

> [!IMPORTANT]
> This rule is **deterministic** and matches the Python backend's behavior. Do not modify this logic without verifying against the Python engine.

## Verification
Any changes to `computeProfile.ts`, `factorMapping.ts`, or `aggregateTraits.ts` must be verified using:
1.  **Sanity Tests:** `scripts/verify-scoring-parity/sanity_tests.ts`
2.  **Parity Tests:** Full parity suite (if available) or `mini_parity_test.ts`.

## Confidence Calculation
Confidence is calculated as:
`Confidence = (Sum of Weights of Answered Questions) / (Sum of Weights of All Questions for Trait)`
