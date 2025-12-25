# LifeSync Monorepo - Quick Reference Card

## 📁 New Structure at a Glance

```
lifesync/
├── apps/
│   ├── web/          # Next.js (import from @lifesync/*)
│   └── mobile/       # Expo (import from @lifesync/*)
│
├── packages/
│   ├── personality-engine/    # ✨ SINGLE SOURCE OF TRUTH
│   ├── ashborn/               # Design system
│   ├── api-sdk/               # Shared API client
│   ├── types/                 # Shared types
│   └── utils/                 # Shared utilities
│
├── backend/          # Python FastAPI (unchanged)
├── docs/             # Clean documentation
└── archive/          # Old markdown files
```

---

## ✨ The Canonical Function

```typescript
// packages/personality-engine/scoring/computeProfile.ts
export function computeProfile(
  answers: AnswerMap,
  questions: Question[]
): PersonalityProfile
```

**Both web and mobile MUST use this function.**

---

## 🔄 Import Changes

### Before
```typescript
// Web
import { PERSONA_PROFILES } from "@/lib/personas";
import { useQuestions } from "@/hooks/useQuestions";

// Mobile
import { PERSONA_PROFILES } from "../lib/personas";
import { useQuestions } from "../hooks/useQuestions";
```

### After
```typescript
// Both Web and Mobile
import { computeProfile, PERSONA_PROFILES } from "@lifesync/personality-engine";
import { useQuestions } from "@lifesync/api-sdk";
```

---

## ✅ What's Done (40%)

- ✅ Directory structure created
- ✅ Personality engine types
- ✅ Scoring logic (computeProfile, reverse scoring, aggregation, normalization)
- ✅ MBTI mapping
- ✅ Question data copied
- ✅ Documentation created

---

## 🚧 What's Next (60%)

1. **Complete personality engine** - Add personaMapping.ts
2. **Move apps** - mv web apps/web, mv mobile apps/mobile
3. **Update imports** - Change to @lifesync/* in all files
4. **Delete duplicates** - Remove old persona/scoring files
5. **Test** - Verify identical OCEAN scores

---

## 📋 Files to Delete After Migration

```
❌ web/lib/personas.ts
❌ web/lib/getPersonaData.ts
❌ web/src/data/personas.ts
❌ web/src/utils/getPersonaData.ts
❌ mobile/app/lib/personas.ts
❌ mobile/app/lib/api.ts
❌ mobile/app/hooks/useQuestions.ts
❌ backend/data/question_bank/
```

---

## 🎯 Critical Files Created

1. `packages/personality-engine/scoring/computeProfile.ts` - **THE** scoring function
2. `packages/personality-engine/scoring/applyReverseScoring.ts` - Reverse scoring
3. `packages/personality-engine/scoring/aggregateTraits.ts` - OCEAN aggregation
4. `packages/personality-engine/mapping/factorMapping.ts` - OCEAN → MBTI
5. `packages/personality-engine/data/questions_180.json` - All questions

---

## 📊 Progress: 40% Complete

**Foundation laid. Core engine created. Ready for Phase 2.**

---

## 📚 Documentation Files

1. **MONOREPO_RESTRUCTURE_PLAN.md** - Full plan
2. **MONOREPO_EXECUTION_SUMMARY.md** - Progress tracker
3. **MONOREPO_DIRECTORY_TREE.md** - Visual comparison
4. **MONOREPO_FINAL_REPORT.md** - Complete report
5. **MONOREPO_QUICK_REFERENCE.md** - This file

---

**Start with:** Complete `personaMapping.ts` and create `package.json` files.
