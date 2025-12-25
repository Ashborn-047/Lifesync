# LifeSync Monorepo - Directory Tree Comparison

## 📁 CURRENT STATE (Before Restructure)

```
lifesync/
├── 📄 50+ Markdown files (CLUTTERED ROOT)
├── web/                                    # Next.js app
│   ├── app/quiz/
│   ├── lib/personas.ts                     # ❌ DUPLICATE
│   ├── lib/getPersonaData.ts               # ❌ DUPLICATE
│   ├── src/data/personas.ts                # ❌ DUPLICATE
│   └── src/utils/getPersonaData.ts         # ❌ DUPLICATE
├── mobile/                                 # Expo app
│   ├── app/screens/QuizScreen.tsx
│   ├── app/lib/personas.ts                 # ❌ DUPLICATE
│   ├── app/lib/api.ts                      # ❌ DUPLICATE
│   └── app/hooks/useQuestions.ts           # ❌ DUPLICATE
├── backend/
│   ├── data/question_bank/
│   │   ├── lifesync_180_questions.json     # ❌ WRONG LOCATION
│   │   └── smart_quiz_30.json              # ❌ WRONG LOCATION
│   └── src/scoring/                        # ❌ DUPLICATE LOGIC
└── LifeSync Design System/                 # ❌ WRONG LOCATION
    ├── ui/                                 # 48 components
    └── design-system/

❌ PROBLEMS:
- Duplicate persona files in web, mobile, backend
- Duplicate scoring logic
- Questions in backend (should be shared)
- Design system separate from packages
- 50+ markdown files cluttering root
```

---

## 📁 TARGET STATE (After Restructure)

```
lifesync/
├── 📄 README.md                            # Clean root
├── 📄 package.json                         # Workspace config
├── 📄 pnpm-workspace.yaml                  # Workspace definition
│
├── apps/                                   # ✨ APPLICATIONS
│   ├── web/                                # Next.js (moved from root)
│   │   ├── app/
│   │   │   ├── quiz/page.tsx               # Uses @lifesync/personality-engine
│   │   │   └── results/page.tsx            # Uses @lifesync/personality-engine
│   │   ├── components/
│   │   └── package.json
│   │
│   ├── mobile/                             # Expo (moved from root)
│   │   ├── app/
│   │   │   └── screens/
│   │   │       ├── QuizScreen.tsx          # Uses @lifesync/personality-engine
│   │   │       └── QuizResultScreen.tsx    # Uses @lifesync/personality-engine
│   │   └── package.json
│   │
│   └── admin/                              # (Future) Admin dashboard
│
├── packages/                               # ✨ SHARED PACKAGES
│   │
│   ├── personality-engine/                 # ✨ SINGLE SOURCE OF TRUTH
│   │   ├── data/
│   │   │   ├── questions_180.json          # ✅ Moved from backend
│   │   │   ├── smart_30.json               # ✅ Moved from backend
│   │   │   └── traits.json
│   │   ├── scoring/
│   │   │   ├── computeProfile.ts           # ✅ CANONICAL FUNCTION
│   │   │   ├── applyReverseScoring.ts      # ✅ Created
│   │   │   ├── normalizeScores.ts          # ✅ Created
│   │   │   ├── aggregateTraits.ts          # ✅ Created
│   │   │   └── index.ts
│   │   ├── mapping/
│   │   │   ├── personaMapping.ts           # ✅ Unified from web/mobile
│   │   │   ├── factorMapping.ts            # ✅ OCEAN → MBTI
│   │   │   └── reverseMapping.ts
│   │   ├── types/
│   │   │   ├── Question.ts                 # ✅ Created
│   │   │   ├── Answer.ts                   # ✅ Created
│   │   │   ├── Profile.ts                  # ✅ Created
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── ashborn/                            # ✨ UNIFIED DESIGN SYSTEM
│   │   ├── components/                     # Moved from LifeSync Design System
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ... (48 components)
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   └── radius.ts
│   │   ├── themes/
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── quiz/                           # Platform-specific quiz components
│   │   │   ├── QuestionCard.web.tsx        # Moved from web
│   │   │   ├── QuestionCard.native.tsx     # Moved from mobile
│   │   │   ├── LikertScale.web.tsx         # Moved from web
│   │   │   ├── LikertScale.native.tsx      # Created
│   │   │   └── ChoiceButton.tsx            # Moved from mobile
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── api-sdk/                            # ✨ SHARED API CLIENT
│   │   ├── client.ts                       # Unified from web/mobile
│   │   ├── endpoints.ts
│   │   ├── hooks/
│   │   │   ├── useQuestions.ts             # Unified hook
│   │   │   └── useAssessment.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── types/                              # ✨ SHARED TYPES
│   │   ├── assessment.ts                   # From web/lib/types.ts
│   │   ├── persona.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── utils/                              # ✨ SHARED UTILITIES
│   │   ├── storage.ts                      # From web/lib/storage.ts
│   │   ├── analytics.ts                    # From web/lib/analytics.ts
│   │   ├── cache.ts                        # From web/lib/cache.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   └── config/                             # ✨ SHARED CONFIG
│       ├── env.ts
│       ├── package.json
│       └── index.ts
│
├── backend/                                # Python FastAPI (unchanged location)
│   ├── src/
│   │   ├── api/
│   │   ├── ai/
│   │   └── scoring/                        # ⚠️ Reference only (not used)
│   ├── tests/
│   └── data/                               # ❌ question_bank/ REMOVED
│
├── infra/                                  # ✨ INFRASTRUCTURE
│   ├── supabase/
│   │   ├── schemas/
│   │   └── sql_import/
│   ├── edge/
│   └── ci/
│
├── docs/                                   # ✨ CLEAN DOCUMENTATION
│   ├── architecture.md
│   ├── setup.md
│   ├── design-system.md
│   ├── personality-engine.md
│   ├── quiz-flow.md
│   └── contribution-guide.md
│
└── archive/                                # ✨ ARCHIVED DOCS
    ├── historical/
    │   ├── DEPLOYMENT_GUIDE.md
    │   ├── GITHUB_PAGES_*.md
    │   └── RENDER_DEPLOYMENT_GUIDE.md
    ├── test-results/
    │   ├── ANSWER_VARIATION_TEST_RESULTS.md
    │   ├── PERSONA_VARIATION_TEST_RESULTS.md
    │   └── TEST_RESULTS_SUMMARY.md
    ├── migrations-notes/
    │   ├── MOBILE_MIGRATION_PLAN.md
    │   ├── LLM_EXPLANATION_UPDATE_COMPLETE.md
    │   └── PHASE3_COMPLETE.md
    └── misc/
        └── ... (other markdown files)

✅ BENEFITS:
- Single source of truth for scoring
- No duplicate code
- Clean separation of concerns
- Shared packages across web/mobile
- Clean root directory
- Proper monorepo structure
```

---

## 🔄 KEY CHANGES

### 1. Personality Engine (NEW)
**Before:** Scattered across web, mobile, backend  
**After:** `packages/personality-engine/` - Single canonical implementation

### 2. Design System
**Before:** `LifeSync Design System/` at root  
**After:** `packages/ashborn/` - Proper package structure

### 3. Applications
**Before:** `web/` and `mobile/` at root  
**After:** `apps/web/` and `apps/mobile/` - Clear app directory

### 4. Question Data
**Before:** `backend/data/question_bank/`  
**After:** `packages/personality-engine/data/` - Shared data

### 5. Documentation
**Before:** 50+ markdown files at root  
**After:** Clean `docs/` + `archive/` structure

---

## 📦 PACKAGE DEPENDENCIES

```
apps/web
  ├── @lifesync/personality-engine
  ├── @lifesync/ashborn
  ├── @lifesync/api-sdk
  ├── @lifesync/types
  └── @lifesync/utils

apps/mobile
  ├── @lifesync/personality-engine
  ├── @lifesync/ashborn
  ├── @lifesync/api-sdk
  ├── @lifesync/types
  └── @lifesync/utils

@lifesync/api-sdk
  └── @lifesync/types

@lifesync/ashborn
  └── @lifesync/types

@lifesync/personality-engine
  └── (no dependencies - pure logic)
```

---

## 🎯 IMPORT EXAMPLES

### Before (Web)
```typescript
// Scattered imports
import { PERSONA_PROFILES } from "@/lib/personas";
import { getPersonaData } from "../../lib/getPersonaData";
import { submitAssessment } from "@/lib/api";
import { useQuestions } from "@/hooks/useQuestions";
```

### After (Web)
```typescript
// Clean, unified imports
import { computeProfile, getPersona, PERSONA_PROFILES } from "@lifesync/personality-engine";
import { submitAssessment, useQuestions } from "@lifesync/api-sdk";
import { QuestionCard, LikertScale } from "@lifesync/ashborn/quiz";
```

### Before (Mobile)
```typescript
// Scattered imports
import { PERSONA_PROFILES } from "../lib/personas";
import { submitAssessment } from "../lib/api";
import { useQuestions } from "../hooks/useQuestions";
```

### After (Mobile)
```typescript
// Clean, unified imports
import { computeProfile, getPersona, PERSONA_PROFILES } from "@lifesync/personality-engine";
import { submitAssessment, useQuestions } from "@lifesync/api-sdk";
import { QuestionCard, ChoiceButton } from "@lifesync/ashborn/quiz";
```

---

## ✅ VALIDATION

After restructure, both web and mobile will:
1. Load questions from `@lifesync/personality-engine/data/questions_180.json`
2. Use `computeProfile()` from `@lifesync/personality-engine/scoring`
3. Produce **IDENTICAL** OCEAN scores for identical inputs
4. Share the same persona profiles
5. Use the same API client
6. Use the same design system components

**No more code drift. No more discrepancies.**
