# LifeSync

LifeSync — a modular, AI-powered personal operating system that unifies behavioral analytics, adaptive personas, and seamless cross-platform automation. Built to scale from prototype to production with a clean, event-driven architecture.

## Overview

LifeSync is a comprehensive personality assessment platform that combines the Big Five (OCEAN) personality model with AI-powered insights. The platform features a modern web interface, a cross-platform mobile app, and a robust backend API that provides personality scoring, MBTI proxy conversion, and intelligent explanations.

## Features

### Core Functionality
- **30-Question Personality Quiz**: Balanced question distribution across all OCEAN traits
- **Big Five Scoring**: Accurate OCEAN trait calculation with confidence metrics
- **MBTI Proxy**: Conversion of OCEAN scores to MBTI-style 4-letter codes
- **AI-Powered Explanations**: Multi-LLM support (Gemini, OpenAI, Grok) for personalized insights
- **Persona System**: 16 human-friendly persona profiles with strengths, challenges, and communication styles
- **Cross-Platform**: Web (Next.js) and Mobile (Expo React Native) applications

### Technical Features
- **Null-Safe Scoring**: Returns `null` for insufficient data instead of defaulting to 50%
- **Cache Busting**: Ensures fresh question data on every fetch
- **Response Validation**: Backend validation for balanced question coverage
- **Data Persistence**: Mobile app stores assessment results locally
- **PDF Reports**: Downloadable personality assessment reports

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **LLM Providers**: Google Gemini (primary), OpenAI, Grok (fallback)
- **Scoring Engine**: Custom OCEAN personality scorer with facet-level analysis
- **PDF Generation**: ReportLab for assessment reports

### Web
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Charts**: Recharts (radar charts, trait bars)
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Mobile
- **Framework**: Expo React Native
- **Platform**: iOS, Android, Web
- **Navigation**: Expo Router
- **State Management**: React Hooks + AsyncStorage
- **UI Components**: Custom components with Moti animations
- **Icons**: Ionicons, Lucide React Native

## Project Structure

```
lifesync/
├── backend/              # FastAPI backend service
│   ├── src/
│   │   ├── api/         # API endpoints
│   │   ├── scorer/      # Personality scoring engine
│   │   ├── llm/         # LLM provider integrations
│   │   ├── personas/    # Persona definitions
│   │   └── config/      # Configuration management
│   ├── infra/           # Infrastructure (Supabase migrations)
│   ├── scripts/         # Utility scripts
│   └── tests/           # Test suite
│
├── web/                 # Next.js web application
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities and API client
│   └── hooks/           # React hooks
│
├── mobile/              # Expo React Native mobile app
│   ├── app/             # Expo router screens
│   │   ├── screens/     # Screen components
│   │   ├── components/  # Reusable components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities and API client
│   └── assets/          # Images and icons
│
└── docs/                # Documentation
```

## How to Run

### Prerequisites
- Python 3.9+ (for backend)
- Node.js 18+ (for web and mobile)
- Expo CLI (for mobile development)
- Supabase account (for database)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and LLM API keys
   ```

4. Run database migrations:
   ```bash
   # Apply Supabase migrations from infra/supabase/schemas/
   ```

5. Start the server:
   ```bash
   python -m uvicorn src.api.server:app --reload --port 5174 --host 0.0.0.0
   ```

The backend API will be available at `http://localhost:5174`

### Web Setup

1. Navigate to web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The web app will be available at `http://localhost:3000`

### Mobile Setup

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure environment variables:
   ```bash
   cp .env-example .env.local
   # Edit .env.local with your backend API URL
   # Use your PC's local IP (e.g., http://192.168.0.12:5174) instead of localhost
   ```

4. Start Expo development server:
   ```bash
   npx expo start --tunnel
   ```

5. Connect with Expo Go:
   - Install Expo Go app on your mobile device
   - Scan the QR code or use the tunnel URL
   - Ensure your mobile and PC are on the same network (or use tunnel mode)

## Future Roadmap

### Phase 1: Core Features ✅
- [x] Personality assessment engine
- [x] Web interface
- [x] Mobile app (iOS/Android)
- [x] AI-powered explanations
- [x] Persona system

### Phase 2: Enhanced Analytics
- [ ] Historical assessment tracking
- [ ] Personality trait trends over time
- [ ] Comparative analysis (team, group insights)
- [ ] Career matching based on personality

### Phase 3: Automation & Integration
- [ ] Calendar integration for daily syncs
- [ ] Task management integration
- [ ] Habit tracking
- [ ] Cross-platform data synchronization

### Phase 4: Advanced Features
- [ ] Multi-language support
- [ ] Custom assessment templates
- [ ] Team/organization dashboards
- [ ] API for third-party integrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
