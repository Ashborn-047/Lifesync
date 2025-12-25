# LifeSync Monorepo Restructure Plan

> **Status**: Ready for Execution  
> **Date**: 2025-11-28  
> **Objective**: Eliminate code drift, centralize personality engine, unify design system

---

## 🎯 Goals

1. **Single Source of Truth**: All scoring logic in one package
2. **Identical Results**: Web and Mobile produce identical OCEAN scores
3. **Shared Components**: Unified design system with platform-specific implementations
4. **Clean Architecture**: Proper monorepo structure with clear boundaries
5. **No Duplication**: Delete all duplicated scoring/persona logic

---

## 📁 New Directory Structure

```
lifesync/
├── apps/
│   ├── web/                          # Next.js web app
│   ├── mobile/                       # Expo mobile app
│   └── admin/                        # (future) Admin dashboard
│
├── packages/
│   ├── personality-engine/           # ✨ CANONICAL SCORING ENGINE
│   │   ├── data/
│   │   │   ├── questions_180.json
│   │   │   ├── smart_30.json
│   │   │   └── traits.json
│   │   ├── scoring/
│   │   │   ├── computeProfile.ts
│   │   │   ├── applyReverseScoring.ts
│   │   │   ├── normalizeScores.ts
│   │   │   └── index.ts
│   │   ├── mapping/
│   │   │   ├── reverseMapping.ts
│   │   │   ├── factorMapping.ts
│   │   │   └── personaMapping.ts
│   │   ├── types/
│   │   │   ├── Question.ts
│   │   │   ├── Answer.ts
│   │   │   ├── Profile.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── ashborn/                      # ✨ UNIFIED DESIGN SYSTEM
│   │   ├── components/
│   │   ├── tokens/
│   │   ├── themes/
│   │   ├── quiz/
│   │   │   ├── QuestionCard.web.tsx
│   │   │   ├── QuestionCard.native.tsx
│   │   │   ├── LikertScale.web.tsx
│   │   │   ├── LikertScale.native.tsx
│   │   │   └── ChoiceButton.tsx
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── api-sdk/                      # Shared API client
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── types/                        # Shared TypeScript types
│   │   ├── assessment.ts
│   │   ├── persona.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   ├── utils/                        # Shared utilities
│   │   ├── storage.ts
│   │   ├── analytics.ts
│   │   ├── package.json
│   │   └── index.ts
│   │
│   └── config/                       # Shared configuration
│       ├── env.ts
│       ├── package.json
│       └── index.ts
│
├── backend/
│   ├── src/
│   ├── tests/
│   └── data/                         # ⚠️ REMOVE question banks
│
├── infra/
│   ├── supabase/
│   ├── edge/
│   └── ci/
│
├── docs/
│   ├── architecture.md
│   ├── setup.md
│   ├── design-system.md
│   ├── personality-engine.md
│   ├── quiz-flow.md
│   └── contribution-guide.md
│
├── archive/                          # All old markdown files
│   ├── historical/
│   ├── test-results/
│   ├── migrations-notes/
│   └── misc/
│
├── package.json                      # Root workspace config
├── turbo.json                        # Turborepo config
└── pnpm-workspace.yaml               # PNPM workspace config
```

---

## 🔄 Migration Map

### Files to MOVE → `packages/personality-engine/`

#### From Web:
- `web/lib/personas.ts` → `packages/personality-engine/mapping/personaMapping.ts`
- `web/lib/getPersonaData.ts` → `packages/personality-engine/mapping/getPersona.ts`
- `web/src/data/personas.ts` → DELETE (duplicate)
- `web/src/utils/getPersonaData.ts` → DELETE (duplicate)

#### From Mobile:
- `mobile/app/lib/personas.ts` → DELETE (will use shared)
- `mobile/app/hooks/useQuestions.ts` → `packages/api-sdk/hooks/useQuestions.ts`
- `mobile/app/hooks/useAssessmentAPI.ts` → `packages/api-sdk/hooks/useAssessment.ts`

#### From Backend:
- `backend/data/question_bank/lifesync_180_questions.json` → `packages/personality-engine/data/questions_180.json`
- `backend/data/question_bank/smart_quiz_30.json` → `packages/personality-engine/data/smart_30.json`
- `backend/src/scoring/*` → Reference implementation (keep for validation)

### Files to MOVE → `packages/ashborn/`

#### From Web:
- `web/app/quiz/components/QuestionCard.tsx` → `packages/ashborn/quiz/QuestionCard.web.tsx`
- `web/app/quiz/components/LikertScale.tsx` → `packages/ashborn/quiz/LikertScale.web.tsx`
- `web/components/ui/*` → `packages/ashborn/components/`

#### From Mobile:
- `mobile/app/components/QuestionCard.tsx` → `packages/ashborn/quiz/QuestionCard.native.tsx`
- `mobile/app/components/ChoiceButton.tsx` → `packages/ashborn/quiz/ChoiceButton.tsx`

#### From Design System:
- `LifeSync Design System/ui/*` → `packages/ashborn/components/`
- `LifeSync Design System/design-system/*` → `packages/ashborn/tokens/`

### Files to MOVE → `packages/api-sdk/`

- `web/lib/api.ts` → `packages/api-sdk/client.ts`
- `mobile/app/lib/api.ts` → DELETE (will use shared)
- `web/hooks/useQuestions.ts` → `packages/api-sdk/hooks/useQuestions.ts`

### Files to MOVE → `packages/utils/`

- `web/lib/storage.ts` → `packages/utils/storage.ts`
- `web/lib/analytics.ts` → `packages/utils/analytics.ts`
- `web/lib/cache.ts` → `packages/utils/cache.ts`

### Files to MOVE → `packages/types/`

- `web/lib/types.ts` → `packages/types/assessment.ts`
- `mobile/app/types/index.ts` → Merge into `packages/types/`

### Files to DELETE (Duplicates)

```
❌ web/lib/personas.ts
❌ web/lib/getPersonaData.ts
❌ web/src/data/personas.ts
❌ web/src/utils/getPersonaData.ts
❌ mobile/app/lib/personas.ts
❌ mobile/app/lib/api.ts
❌ backend/data/question_bank/* (moved to packages)
```

### Markdown Files to MOVE → `archive/`

All root-level `.md` files EXCEPT:
- README.md
- docs/architecture.md
- docs/setup.md
- docs/design-system.md
- docs/personality-engine.md
- docs/quiz-flow.md
- docs/contribution-guide.md

Move to:
- `archive/historical/` - Old deployment guides, setup docs
- `archive/test-results/` - Test result markdown files
- `archive/migrations-notes/` - Migration and update notes
- `archive/misc/` - Everything else

---

## 📦 Package Dependencies

### `packages/personality-engine/package.json`
```json
{
  "name": "@lifesync/personality-engine",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {}
}
```

### `packages/ashborn/package.json`
```json
{
  "name": "@lifesync/ashborn",
  "version": "1.0.0",
  "main": "index.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-native": "^0.72.0"
  }
}
```

### `packages/api-sdk/package.json`
```json
{
  "name": "@lifesync/api-sdk",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": {
    "@lifesync/types": "workspace:*"
  }
}
```

---

## 🔧 Import Updates

### Before (Web):
```typescript
import { getPersonaData } from "../../lib/getPersonaData";
import { PERSONA_PROFILES } from "@/lib/personas";
import { submitAssessment } from "@/lib/api";
```

### After (Web):
```typescript
import { computeProfile, getPersona } from "@lifesync/personality-engine";
import { submitAssessment } from "@lifesync/api-sdk";
```

### Before (Mobile):
```typescript
import { PERSONA_PROFILES } from "../lib/personas";
import { submitAssessment } from "../lib/api";
import { useQuestions } from "../hooks/useQuestions";
```

### After (Mobile):
```typescript
import { computeProfile, getPersona } from "@lifesync/personality-engine";
import { submitAssessment, useQuestions } from "@lifesync/api-sdk";
```

---

## ✅ Validation Checklist

After restructuring, verify:

- [ ] Web and Mobile load same questions from `@lifesync/personality-engine/data`
- [ ] Web and Mobile use same `computeProfile()` function
- [ ] Identical inputs produce identical OCEAN scores
- [ ] No duplicate scoring logic exists
- [ ] Backend only validates, doesn't compute personality
- [ ] All imports use `@lifesync/*` packages
- [ ] No broken imports in web or mobile
- [ ] Tests pass for personality engine
- [ ] Design system components work on both platforms

---

## 🚀 Execution Steps

1. Create `packages/` directory structure
2. Create `apps/` directory and move web/mobile
3. Move question banks to `personality-engine/data/`
4. Extract scoring logic to `personality-engine/scoring/`
5. Extract persona mapping to `personality-engine/mapping/`
6. Move design system to `ashborn/`
7. Move API client to `api-sdk/`
8. Move utilities to `utils/` and `types/`
9. Update all imports in web and mobile
10. Delete duplicate files
11. Move markdown files to `archive/`
12. Create new documentation in `docs/`
13. Test web application
14. Test mobile application
15. Verify identical scoring results

---

**Ready for execution.**
