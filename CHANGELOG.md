# Changelog

## [2025-11-30] MBTI Tie-Break Parity Fix (Scoring Engine)
- Backported deterministic tie-break rule from sandbox.
- Synced TypeScript engine with Python scoring behavior.
- Verified with:
  - Sanity tests (4 vectors)
  - Mini parity test (edge-case vectors)
  - Batch 2 (20,000 run verification)
- Result: 100% parity, drift = 0.0000
- Added `archive/scoring_fixes/mbti_tiebreak_fix_2025-11-30/`
