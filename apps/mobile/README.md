# LifeSync Mobile App

React Native mobile application for the LifeSync Personality Engine, built with Expo and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (optional, but recommended)
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file in the `mobile/` directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5174
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_KEY=
   ```

3. Start Expo development server:
   ```bash
   npx expo start
   ```

4. Run on your platform:
   - **iOS**: Press `i` or scan QR code with Expo Go app
   - **Android**: Press `a` or scan QR code with Expo Go app
   - **Web**: Press `w`

## 📁 Project Structure

```
mobile/
├── app/
│   ├── screens/          # Screen components
│   │   ├── OnboardingScreen.tsx
│   │   ├── QuizIntroScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── QuizResultScreen.tsx
│   │   └── PersonalityReportScreen.tsx
│   ├── components/      # Reusable components
│   │   ├── QuestionCard.tsx
│   │   ├── ChoiceButton.tsx
│   │   └── LoadingOverlay.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAssessmentAPI.ts
│   ├── lib/             # Utilities and API client
│   │   ├── api.ts
│   │   └── config.ts
│   ├── styles/          # Design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── _layout.tsx      # Root layout (Expo Router)
│   └── index.tsx        # Entry point
├── assets/              # Images, fonts, etc.
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🎨 Design System

The app uses a consistent design system with:

- **Colors**: Primary, background, surface, text colors
- **Typography**: Heading, subheading, body, caption styles
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)

## 🔌 API Integration

The app connects to the backend API at `EXPO_PUBLIC_API_URL`. 

### Available Endpoints

- `POST /v1/assessments` - Submit quiz answers
- `POST /v1/assessments/{id}/generate_explanation` - Generate personality report
- `GET /v1/questions` - Fetch questions (to be implemented in backend)

### API Client

The `app/lib/api.ts` file provides a universal fetch wrapper with:
- Error handling
- Typed responses
- JSON parsing
- Base URL configuration

## 📱 Screens

### OnboardingScreen
Welcome screen with "Start Personality Quiz" button.

### QuizIntroScreen
Introduction to the assessment with quiz details.

### QuizScreen
Interactive quiz with:
- One question at a time
- 5-point Likert scale (Strongly Disagree to Strongly Agree)
- Progress indicator
- Previous/Next navigation

### QuizResultScreen
Loading screen while generating personality explanation.

### PersonalityReportScreen
Displays:
- OCEAN trait scores
- Key insights
- LLM-generated explanation
- Assessment confidence

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

### TypeScript

The project uses TypeScript for type safety. Run type checking:
```bash
npx tsc --noEmit
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:5174
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_KEY=
```

**Note**: Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

### Backend Connection

For development, ensure the backend is running:
```bash
cd ../backend
uvicorn src.api.server:app --reload --port 5174
```

## 📝 Next Steps

- [ ] Implement question fetching from backend
- [ ] Add OCEAN trait visualization
- [ ] Enhance personality report UI
- [ ] Add user authentication
- [ ] Implement offline support
- [ ] Add animations and transitions

## 🐛 Troubleshooting

### Metro bundler errors
Clear cache: `npm start -- --clear`

### Connection to backend fails
- Verify backend is running on the correct port
- Check `EXPO_PUBLIC_API_URL` in `.env`
- For physical device, use your computer's IP address instead of localhost

### Expo Go app issues
- Update Expo Go app to latest version
- Clear Expo Go cache

## 📝 License

(To be added)

