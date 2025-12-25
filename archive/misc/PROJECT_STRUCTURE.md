# LifeSync Project - Complete Directory Structure

> Generated on: 2025-11-28  
> This document provides a comprehensive overview of the entire LifeSync project structure.

---

## 📁 Root Directory Structure

```
lifesync/
├── 📄 Documentation Files (Root)
│   ├── ANSWER_VARIATION_TEST_RESULTS.md
│   ├── BACKEND_WEB_CONNECTION_COMPLETE.md
│   ├── CLAUDE_SOLUTION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── GITHUB_PAGES_ARCHITECTURE.md
│   ├── GITHUB_PAGES_SETUP.md
│   ├── GITHUB_PREPARATION_SUMMARY.md
│   ├── ISSUE_ANALYSIS.md
│   ├── LICENSE
│   ├── LLM_EXPLANATION_UPDATE_COMPLETE.md
│   ├── MOBILE_MIGRATION_PLAN.md
│   ├── PERSONA_EXPANSION_PACK_SUMMARY.md
│   ├── PERSONA_PROMPT_UPDATE.md
│   ├── PERSONA_VARIATION_TEST_RESULTS.md
│   ├── PHASE3_COMPLETE.md
│   ├── PHASE3_IMPLEMENTATION_SUMMARY.md
│   ├── QUICK_START_DEPLOYMENT.md
│   ├── README.md
│   ├── RENDER_DEPLOYMENT_GUIDE.md
│   ├── RESULTS_PAGE_FIXES_COMPLETE.md
│   ├── RUN_LOCAL.md
│   ├── TESTING_GUIDE.md
│   ├── TEST_IMPLEMENTATION_SUMMARY.md
│   ├── TEST_RESULTS_SUMMARY.md
│   └── TOMORROW_PLAN.md
│
├── 📄 Configuration Files (Root)
│   ├── .env.example
│   ├── .gitignore
│   ├── .nvmrc
│   ├── package-lock.json
│   └── package.json.bak
│
├── 🌐 web/ (Next.js Web Application)
├── 📱 mobile/ (React Native/Expo Mobile Application)
├── ⚙️ backend/ (Python FastAPI Backend)
├── 🎨 LifeSync Design System/ (Figma Design System)
├── 📚 docs/ (Additional Documentation)
└── 🔧 .github/ (GitHub Actions & Workflows)
```

---

## 🌐 Web Application (`/web`)

### Web Root Structure
```
web/
├── 📄 Configuration Files
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── .prettierrc
│   ├── next.config.mjs
│   ├── next-env.d.ts
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vercel.json
│   ├── package.json
│   └── README.md
│
├── 📂 app/ (Next.js App Router)
│   ├── layout.tsx                    # Root layout with navigation
│   ├── page.tsx                      # Home page
│   │
│   ├── 📂 quiz/                      # ✨ QUIZ MODULE (WEB)
│   │   ├── page.tsx                  # Main quiz page
│   │   └── 📂 components/
│   │       ├── LikertScale.tsx       # Likert scale component
│   │       └── QuestionCard.tsx      # Question card component
│   │
│   ├── 📂 results/                   # Assessment results
│   │   └── page.tsx                  # Results display page
│   │
│   ├── 📂 dashboard/                 # User dashboard
│   │   └── page.tsx                  # Dashboard page
│   │
│   └── 📂 history/                   # Assessment history
│       └── page.tsx                  # History page
│
├── 📂 components/                    # Shared React components
│   ├── Navigation.tsx                # Main navigation component
│   │
│   ├── 📂 results/                   # Results-specific components
│   │   ├── InvalidAssessmentBanner.tsx
│   │   └── PersonalityResultCard.tsx
│   │
│   └── 📂 ui/                        # UI component library
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── LoadingOverlay.tsx
│       ├── MotionContainer.tsx
│       ├── ProgressBar.tsx
│       ├── SectionHeader.tsx
│       ├── Toast.tsx
│       ├── TraitBar.tsx
│       └── TraitRadarChart.tsx
│
├── 📂 lib/                           # Utility libraries
│   ├── analytics.ts                  # Analytics utilities
│   ├── api.ts                        # API client
│   ├── cache.ts                      # Caching utilities
│   ├── getPersonaData.ts             # Persona data fetcher
│   ├── personas.ts                   # Persona definitions
│   ├── storage.ts                    # Local storage utilities
│   ├── types.ts                      # TypeScript type definitions
│   └── utils.ts                      # General utilities
│
├── 📂 hooks/                         # Custom React hooks
│   └── (1 hook file)
│
├── 📂 src/                           # Source utilities
│   ├── 📂 data/
│   │   └── personas.ts               # Persona data
│   └── 📂 utils/
│       └── getPersonaData.ts         # Persona utilities
│
├── 📂 styles/                        # Global styles
│   ├── globals.css                   # Global CSS
│   └── animations.css                # Animation definitions
│
├── 📂 tests/                         # Web tests
│   └── (1 test file)
│
└── 📂 out/                           # Build output (autogenerated)
    └── (Static export files)
```

---

## 📱 Mobile Application (`/mobile`)

### Mobile Root Structure
```
mobile/
├── 📄 Configuration Files
│   ├── .env
│   ├── .env-example
│   ├── .env.local
│   ├── .gitignore
│   ├── app.json                      # Expo configuration
│   ├── babel.config.js               # Babel configuration
│   ├── eas.json                      # EAS Build configuration
│   ├── expo-env.d.ts                 # Expo TypeScript definitions
│   ├── index.js                      # Entry point
│   ├── metro.config.js               # Metro bundler config
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── README.md
│
├── 📄 Documentation Files
│   ├── ANDROID_SETUP.md
│   ├── ANDROID_STUDIO_CONFLICTS.md
│   ├── API_URL_FIX.md
│   ├── DASHBOARD_EXPLAINED.md
│   ├── EXPO_GO_CONNECTION.md
│   ├── EXPO_GO_CONNECTION_FIX.md
│   ├── EXPO_GO_VS_DEV_CLIENT.md
│   ├── EXPO_LINKED.md
│   ├── HARDCODED_FIXES.md
│   ├── ISSUES_FIXED.md
│   ├── NETWORK_TROUBLESHOOTING.md
│   ├── QUICK_START_ANDROID.md
│   ├── README_MOBILE_UPGRADE.md
│   ├── START_EMULATOR_GUIDE.md
│   ├── START_SERVERS.md
│   ├── TESTING_OPTIONS.md
│   ├── TROUBLESHOOTING.md
│   ├── TROUBLESHOOT_EXPO_GO.md
│   ├── WHY_EXPO_GO_NOT_WORKING.md
│   └── WORKFLOWS_EXPLAINED.md
│
├── 📄 Scripts
│   ├── start-android.bat             # Windows batch script
│   └── start-android.ps1             # PowerShell script
│
├── 📄 App.js                         # Main app component (26KB - large file)
│
├── 📂 app/                           # Expo Router app directory
│   ├── _layout.tsx                   # Root layout
│   ├── index.tsx                     # Home screen
│   │
│   ├── 📂 screens/                   # ✨ ALL MOBILE SCREENS
│   │   ├── HomeScreen.tsx            # Main home screen
│   │   ├── OnboardingScreen.tsx      # Onboarding flow
│   │   │
│   │   ├── 📂 Quiz Screens/          # ✨ QUIZ MODULE (MOBILE)
│   │   │   ├── QuizIntroScreen.tsx   # Quiz introduction
│   │   │   ├── QuizScreen.tsx        # Main quiz screen
│   │   │   └── QuizResultScreen.tsx  # Quiz results
│   │   │
│   │   ├── PersonalityReportScreen.tsx  # Personality report
│   │   ├── BudgetBuddyScreen.tsx     # Budget feature
│   │   ├── CareerCompassScreen.tsx   # Career feature
│   │   └── MindMeshScreen.tsx        # Mind mesh feature
│   │
│   ├── 📂 components/                # Mobile-specific components
│   │   ├── ChoiceButton.tsx          # Quiz choice button
│   │   ├── LoadingOverlay.tsx        # Loading overlay
│   │   ├── QuestionCard.tsx          # Question card (mobile)
│   │   │
│   │   └── 📂 cards/                 # Card components
│   │       ├── BottomActionBar.tsx
│   │       ├── GradientCard.tsx
│   │       ├── MetricChip.tsx
│   │       ├── SectionHeader.tsx
│   │       └── index.ts
│   │
│   ├── 📂 hooks/                     # Custom mobile hooks
│   │   ├── useAssessmentAPI.ts       # Assessment API hook
│   │   ├── useLatestAssessment.ts    # Latest assessment hook
│   │   └── useQuestions.ts           # Questions hook
│   │
│   ├── 📂 lib/                       # Mobile utilities
│   │   ├── animations.ts             # Animation utilities
│   │   ├── api.ts                    # API client
│   │   ├── config.ts                 # App configuration
│   │   ├── haptics.ts                # Haptic feedback
│   │   ├── navigation-compat.ts      # Navigation compatibility
│   │   └── personas.ts               # Persona definitions
│   │
│   ├── 📂 styles/                    # Mobile style system
│   │   ├── index.ts                  # Style exports
│   │   ├── colors.ts                 # Color palette
│   │   ├── radius.ts                 # Border radius
│   │   ├── shadows.ts                # Shadow definitions
│   │   ├── spacing.ts                # Spacing scale
│   │   └── typography.ts             # Typography system
│   │
│   └── 📂 types/                     # TypeScript types
│       └── index.ts
│
├── 📂 assets/                        # Mobile assets
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
│
└── 📂 .expo/                         # Expo cache (autogenerated)
```

---

## ⚙️ Backend (`/backend`)

### Backend Structure
```
backend/
├── 📄 Configuration Files
│   ├── .env                          # Environment variables
│   ├── .gitignore
│   ├── requirements.txt              # Python dependencies
│   ├── render.yaml                   # Render.com deployment config
│   └── README.md
│
├── 📄 Documentation Files
│   ├── GROK_EXPLANATION_GENERATOR_UPDATE.md
│   ├── GROK_PROVIDER_SETUP.md
│   ├── LLM_SYSTEM_UPDATE.md
│   └── SETUP_LOCAL_TESTING.md
│
├── 📄 Test Results & Data
│   ├── scoring_analysis_table.txt
│   ├── scoring_variation_results.json
│   └── stress_test_results.json
│
├── 📂 src/                           # Source code
│   ├── __init__.py
│   ├── supabase_client.py            # Supabase client
│   │
│   ├── 📂 api/                       # FastAPI application
│   │   ├── __init__.py
│   │   ├── config.py                 # API configuration
│   │   ├── server.py                 # Main FastAPI server
│   │   │
│   │   └── 📂 routes/                # API routes
│   │       ├── __init__.py
│   │       └── questions.py          # Questions endpoint
│   │
│   ├── 📂 ai/                        # AI/LLM modules
│   │   ├── __init__.py
│   │   ├── explanation_generator.py  # Generate explanations
│   │   ├── pdf_generator.py          # PDF generation
│   │   └── tone_generator.py         # Tone generation
│   │
│   ├── 📂 llm/                       # LLM provider system
│   │   ├── __init__.py
│   │   ├── explanations.py           # Explanation templates
│   │   ├── gemini_provider.py        # Google Gemini provider
│   │   ├── llm_client.py             # LLM client
│   │   ├── llm_router.py             # LLM routing logic
│   │   ├── openai_provider.py        # OpenAI provider
│   │   ├── provider_base.py          # Base provider class
│   │   ├── router.py                 # Router implementation
│   │   └── templates.py              # Prompt templates
│   │
│   ├── 📂 config/                    # Configuration modules
│   │   ├── __init__.py
│   │   └── llm_provider.py           # LLM provider config
│   │
│   ├── 📂 models/                    # Data models
│   │   └── (Python data models)
│   │
│   ├── 📂 scoring/                   # Scoring engine
│   │   └── (Scoring logic)
│   │
│   ├── 📂 services/                  # Business logic services
│   │   └── (Service modules)
│   │
│   └── 📂 utils/                     # Utility functions
│       └── (Utility modules)
│
├── 📂 data/                          # Data files
│   ├── 📂 question_bank/             # ✨ QUIZ QUESTIONS
│   │   ├── lifesync_180_questions.json  # Full question bank (180 questions)
│   │   └── smart_quiz_30.json        # Smart quiz (30 questions)
│   │
│   └── 📂 samples/                   # Sample data
│
├── 📂 scripts/                       # Utility scripts
│   ├── csv_export_supabase.py        # Export to CSV
│   ├── debug_question_matching.py    # Debug questions
│   ├── debug_test.py                 # Debug tests
│   ├── fix_invalid_assessments.py    # Fix assessments
│   ├── generate_analysis_table.py    # Generate analysis
│   ├── set_supabase_keys.ps1         # Set Supabase keys
│   ├── start_server.bat              # Start server (Windows)
│   ├── start_server.sh               # Start server (Unix)
│   ├── stress_test.py                # Stress testing
│   ├── test_api.sh                   # Test API
│   ├── test_data_flow.py             # Test data flow
│   ├── test_extreme_scores.py        # Test extreme scores
│   ├── test_gemini_models.py         # Test Gemini models
│   ├── test_grok_llm.py              # Test Grok LLM
│   ├── test_grok_provider.py         # Test Grok provider
│   ├── test_local_personality_engine.py  # Test personality engine
│   ├── test_safe_json.py             # Test JSON safety
│   ├── test_scorer_directly.py       # Test scorer
│   ├── test_scoring_issues.py        # Test scoring issues
│   ├── test_scoring_variation.py     # Test scoring variation
│   ├── test_supabase_connection.py   # Test Supabase
│   ├── update_env_quick.ps1          # Quick env update
│   └── update_env_supabase.ps1       # Supabase env update
│
├── 📂 tests/                         # Unit & integration tests
│   ├── __init__.py
│   ├── README_TESTS.md
│   ├── test_answer_variation.py      # Test answer variations
│   ├── test_integration_fixes.py     # Integration tests
│   ├── test_llm_responses.py         # Test LLM responses
│   ├── test_null_handling.py         # Test null handling
│   ├── test_persona_variation.py     # Test persona variations
│   ├── test_scorer_validation.py     # Validate scorer
│   ├── test_scoring.py               # Scoring tests
│   └── (Additional test files)
│
└── 📂 infra/                         # Infrastructure
    ├── 📂 edge_functions/            # Edge functions
    │
    └── 📂 supabase/                  # Supabase configuration
        ├── 📂 schemas/               # Database schemas
        │   └── (3 schema files)
        │
        └── 📂 sql_import/            # SQL import scripts
            └── (2 SQL files)
```

---

## 🎨 LifeSync Design System (`/LifeSync Design System`)

### Design System Structure
```
LifeSync Design System/
├── 📄 Documentation
│   ├── Attributions.md               # Design attributions
│   ├── Guidelines.md                 # Design guidelines (30KB)
│   └── README (implicit)
│
├── 📄 Root Files
│   ├── AndroidMedium1.tsx            # Android medium component
│   ├── App.tsx                       # Design system app (7.6KB)
│   ├── globals.css                   # Global styles (5.6KB)
│   └── utils.ts                      # Utility functions
│
├── 📂 design-system/                 # ✨ DESIGN SYSTEM COMPONENTS
│   ├── ColorSwatch.tsx               # Color swatch component
│   ├── ComponentLibrary.tsx          # Component library
│   ├── CoreComponents.tsx            # Core components
│   ├── Documentation.tsx             # Documentation component
│   ├── ExportAssets.tsx              # Asset export
│   ├── Foundations.tsx               # Design foundations
│   ├── Iconography.tsx               # Icon system
│   ├── MobileTemplates.tsx           # Mobile templates
│   ├── ThemeProvider.tsx             # Theme provider
│   ├── ThemeSystem.tsx               # Theme system
│   ├── ThemeToggle.tsx               # Theme toggle
│   └── WebTemplates.tsx              # Web templates
│
├── 📂 ui/                            # ✨ SHADCN UI COMPONENTS (48 files)
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── aspect-ratio.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── breadcrumb.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── carousel.tsx
│   ├── chart.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── command.tsx
│   ├── context-menu.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── hover-card.tsx
│   ├── input-otp.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── menubar.tsx
│   ├── navigation-menu.tsx
│   ├── pagination.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── resizable.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── sonner.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toggle-group.tsx
│   ├── toggle.tsx
│   ├── tooltip.tsx
│   ├── use-mobile.ts
│   └── utils.ts
│
├── 📂 figma/                         # ✨ FIGMA IMPORTS
│   └── ImageWithFallback.tsx         # Figma image component
│
└── 📂 zip files here/                # ✨ FIGMA EXPORT ARCHIVES
    ├── components.zip                # Components export (406KB)
    ├── guidelines.zip                # Guidelines export
    ├── imports.zip                   # Imports export
    ├── lib.zip                       # Library export
    └── styles.zip                    # Styles export (5.7KB)
```

---

## 📚 Additional Directories

### Documentation (`/docs`)
```
docs/
└── (2 documentation files)
```

### GitHub Actions (`/.github`)
```
.github/
└── (1 workflow configuration)
```

---

## 🔍 Key Quiz/Assessment Files Summary

### Web Quiz Files
```
web/app/quiz/
├── page.tsx                          # Main quiz page
└── components/
    ├── LikertScale.tsx               # Likert scale input
    └── QuestionCard.tsx              # Question display card
```

### Mobile Quiz Files
```
mobile/app/screens/
├── QuizIntroScreen.tsx               # Quiz introduction
├── QuizScreen.tsx                    # Main quiz interface
└── QuizResultScreen.tsx              # Results display

mobile/app/components/
├── ChoiceButton.tsx                  # Answer choice button
└── QuestionCard.tsx                  # Question card (mobile version)
```

### Backend Quiz Files
```
backend/data/question_bank/
├── lifesync_180_questions.json       # Full 180-question bank
└── smart_quiz_30.json                # Smart 30-question quiz
```

---

## 🗂️ Autogenerated/Build Folders

### Web Build Outputs
- `web/.next/` - Next.js build cache
- `web/out/` - Static export output

### Mobile Build Outputs
- `mobile/.expo/` - Expo development cache

### Backend Cache
- `backend/.pytest_cache/` - Pytest cache
- `backend/src/**/__pycache__/` - Python bytecode cache

### Node Modules
- `web/node_modules/` - Web dependencies
- `mobile/node_modules/` - Mobile dependencies
- `lifesync/node_modules/` - Root dependencies (if any)

---

## 📊 Project Statistics

### Total Structure
- **3 Main Applications**: Web (Next.js), Mobile (Expo), Backend (FastAPI)
- **1 Design System**: Figma-based with 48 shadcn/ui components
- **Quiz Questions**: 180 full questions + 30 smart quiz questions
- **Documentation Files**: 50+ markdown files across all directories
- **Test Files**: 20+ test files (backend + web)

### Technology Stack
- **Frontend Web**: Next.js 14+, React, TypeScript, Tailwind CSS
- **Frontend Mobile**: Expo, React Native, TypeScript
- **Backend**: Python, FastAPI, Supabase
- **AI/LLM**: Google Gemini, OpenAI, Grok integration
- **Design**: Figma, shadcn/ui component library

---

## 🎯 Notable Features

1. **Dual Quiz Implementation**: Separate but parallel quiz implementations in web and mobile
2. **Comprehensive Design System**: Full Figma design system with 48+ UI components
3. **Multi-LLM Support**: Backend supports multiple LLM providers (Gemini, OpenAI, Grok)
4. **Extensive Testing**: Comprehensive test suites for scoring, variations, and integrations
5. **Deployment Ready**: Configurations for Vercel (web), EAS (mobile), Railway/Render (backend)

---

*This structure represents the complete LifeSync project as of November 28, 2025.*
