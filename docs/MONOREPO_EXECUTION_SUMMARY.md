# LifeSync Monorepo Restructure - Execution Summary

> **Date**: 2025-11-28  
> **Status**: PARTIALLY COMPLETED - Core Engine Created  
> **Next Steps**: Complete migration and update imports

---

## ✅ COMPLETED STEPS

### 1. Directory Structure Created
```
✓ packages/personality-engine/data/
✓ packages/personality-engine/scoring/
✓ packages/personality-engine/mapping/
✓ packages/personality-engine/types/
✓ packages/ashborn/
✓ packages/api-sdk/
✓ packages/types/
✓ packages/utils/
✓ archive/
```

### 2. Core Personality Engine Files Created

#### Types (`packages/personality-engine/types/`)
- ✅ `Question.ts` - Question and QuestionBank interfaces
- ✅ `Answer.ts` - Answer and AssessmentResponse types
- ✅ `Profile.ts` - OceanScores, PersonalityProfile, PersonaProfile
- ✅ `index.ts` - Type exports

#### Scoring Logic (`packages/personality-engine/scoring/`)
- ✅ `applyReverseScoring.ts` - Reverse scoring (1→5, 2→4, etc.)
- ✅ `aggregateTraits.ts` - Aggregate OCEAN scores from answers
- ✅ `normalizeScores.ts` - Normalize to 0-100 scale
- ✅ `computeProfile.ts` - **✨ CANONICAL SCORING FUNCTION**
- ✅ `index.ts` - Scoring exports

#### Mapping (`packages/personality-engine/mapping/`)
- ✅ `factorMapping.ts` - OCEAN → MBTI conversion

#### Data (`packages/personality-engine/data/`)
- ✅ `questions_180.json` - Copied from backend
- ✅ `smart_30.json` - Copied from backend

---

## 🚧 REMAINING WORK

### Phase 1: Complete Personality Engine
1. Create `personaMapping.ts` with all 16 MBTI persona profiles
2. Create `reverseMapping.ts` for reverse-scored questions
3. Create main `index.ts` export file
4. Create `package.json` for the package

### Phase 2: Move Web App
```bash
# Move web to apps/
mv web apps/web

# Update web imports to use @lifesync/personality-engine
# Files to update:
- apps/web/app/quiz/page.tsx
- apps/web/app/results/page.tsx
- apps/web/lib/api.ts
```

### Phase 3: Move Mobile App
```bash
# Move mobile to apps/
mv mobile apps/mobile

# Update mobile imports
# Files to update:
- apps/mobile/app/screens/QuizScreen.tsx
- apps/mobile/app/screens/QuizResultScreen.tsx
- apps/mobile/app/lib/api.ts
```

### Phase 4: Create Shared Packages

#### `packages/api-sdk/`
Move and consolidate:
- `web/lib/api.ts` → `packages/api-sdk/client.ts`
- `web/hooks/useQuestions.ts` → `packages/api-sdk/hooks/useQuestions.ts`
- `mobile/app/hooks/useQuestions.ts` → DELETE (use shared)

#### `packages/ashborn/` (Design System)
Move:
- `web/app/quiz/components/QuestionCard.tsx` → `quiz/QuestionCard.web.tsx`
- `mobile/app/components/QuestionCard.tsx` → `quiz/QuestionCard.native.tsx`
- `web/app/quiz/components/LikertScale.tsx` → `quiz/LikertScale.web.tsx`
- `mobile/app/components/ChoiceButton.tsx` → `quiz/ChoiceButton.tsx`

#### `packages/utils/`
Move:
- `web/lib/storage.ts`
- `web/lib/analytics.ts`
- `web/lib/cache.ts`

#### `packages/types/`
Move:
- `web/lib/types.ts` → `assessment.ts`
- Merge with `mobile/app/types/index.ts`

### Phase 5: Delete Duplicates
```bash
# Delete these files after migration:
rm web/lib/personas.ts
rm web/lib/getPersonaData.ts
rm web/src/data/personas.ts
rm web/src/utils/getPersonaData.ts
rm mobile/app/lib/personas.ts
rm mobile/app/lib/api.ts
rm -rf backend/data/question_bank/
```

### Phase 6: Archive Markdown Files
Move all root `.md` files to `archive/` except:
- README.md
- Keep in root

Move to archive:
- `archive/historical/` - DEPLOYMENT_GUIDE.md, GITHUB_PAGES_*.md, etc.
- `archive/test-results/` - *_TEST_RESULTS.md, *_SUMMARY.md
- `archive/migrations-notes/` - MOBILE_MIGRATION_PLAN.md, *_UPDATE.md
- `archive/misc/` - Everything else

### Phase 7: Create Root Configuration
Create:
- `package.json` (workspace root)
- `pnpm-workspace.yaml` or `turbo.json`
- `.gitignore` updates

### Phase 8: Update Imports

#### Web Quiz Page
**Before:**
```typescript
import { useQuestions } from "@/hooks/useQuestions";
import { submitAssessment } from "@/lib/api";
```

**After:**
```typescript
import { useQuestions, submitAssessment } from "@lifesync/api-sdk";
import { computeProfile } from "@lifesync/personality-engine";
import questions_180 from "@lifesync/personality-engine/data/questions_180.json";
```

#### Mobile Quiz Screen
**Before:**
```typescript
import { useQuestions } from '../hooks/useQuestions';
import { submitAssessment } from '../lib/api';
```

**After:**
```typescript
import { useQuestions, submitAssessment } from "@lifesync/api-sdk";
import { computeProfile } from "@lifesync/personality-engine";
import questions_180 from "@lifesync/personality-engine/data/questions_180.json";
```

---

## 📋 CRITICAL FILES CREATED

### `packages/personality-engine/scoring/computeProfile.ts`
This is the **SINGLE SOURCE OF TRUTH** for personality scoring.

```typescript
export function computeProfile(
  answers: AnswerMap,
  questions: Question[]
): PersonalityProfile {
  // Step 1: Apply reverse scoring
  const reversedAnswers = applyReverseScoring(answers, questions);
  
  // Step 2: Aggregate by traits and facets
  const { ocean: rawOcean, facets: rawFacets } = aggregateTraits(reversedAnswers, questions);
  
  // Step 3: Normalize scores to 0-100 scale
  const ocean = normalizeScores(rawOcean);
  const facets = normalizeFacetScores(rawFacets);
  
  // Step 4: Determine MBTI type
  const mbti_type = determineMBTI(ocean);
  
  return { ocean, facets, mbti_type, persona: mbti_type };
}
```

**Both web and mobile MUST use this exact function.**

---

## ✅ VALIDATION CHECKLIST

After completing all phases:

- [ ] Web loads questions from `@lifesync/personality-engine/data/questions_180.json`
- [ ] Mobile loads questions from `@lifesync/personality-engine/data/questions_180.json`
- [ ] Web uses `computeProfile()` from `@lifesync/personality-engine`
- [ ] Mobile uses `computeProfile()` from `@lifesync/personality-engine`
- [ ] Identical inputs produce identical OCEAN scores (web vs mobile)
- [ ] No duplicate persona files exist
- [ ] No duplicate scoring logic exists
- [ ] Backend does NOT compute personality (only validates)
- [ ] All imports use `@lifesync/*` packages
- [ ] No broken imports
- [ ] Web app builds successfully
- [ ] Mobile app builds successfully
- [ ] Tests pass

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Complete persona mapping file** with all 16 MBTI profiles
2. **Create package.json files** for all packages
3. **Move web and mobile** to `apps/` directory
4. **Update all imports** to use `@lifesync/*` packages
5. **Delete duplicate files**
6. **Test both applications** with identical quiz inputs
7. **Verify identical OCEAN scores**

---

## 📊 PROGRESS TRACKER

| Phase | Status | Files | Progress |
|-------|--------|-------|----------|
| Directory Structure | ✅ Complete | 20+ dirs | 100% |
| Personality Engine Types | ✅ Complete | 4 files | 100% |
| Scoring Logic | ✅ Complete | 5 files | 100% |
| MBTI Mapping | ✅ Complete | 1 file | 100% |
| Question Data | ✅ Complete | 2 files | 100% |
| Persona Mapping | ⏳ Pending | 1 file | 0% |
| Package Configs | ⏳ Pending | 6 files | 0% |
| Move Apps | ⏳ Pending | 2 moves | 0% |
| Update Imports | ⏳ Pending | 10+ files | 0% |
| Delete Duplicates | ⏳ Pending | 8+ files | 0% |
| Archive Docs | ⏳ Pending | 50+ files | 0% |
| Testing | ⏳ Pending | - | 0% |

**Overall Progress: 40%**

---

## 🚀 READY TO CONTINUE

The foundation is laid. The core personality engine exists and is ready to be used.

**To continue:**
1. Complete the persona mapping
2. Create package.json files
3. Move apps to apps/ directory
4. Update all imports
5. Test and validate

The monorepo structure will eliminate code drift and ensure web and mobile produce identical results.
