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
- **Cache Strategy**: LRU eviction and TTL-based cache management to optimize DB hits
- **Database Performance**: Optimized pagination and sub-second query indexing
- **Reliability & Resilience**: 
  - **Circuit Breaker**: Prevents cascading failures for LLM calls
  - **Dynamic Timeouts**: 60s global request and database operation timeouts
  - **Fallback Chain**: Automatic model fallback (Pro -> Flash -> Cache)
- **Security**: 
  - **Rate Limiting**: Hardened protection for Auth and AI endpoints
  - **Input Validation**: Zod-style schema validation for all API inputs
- **Observability**: Structured request logging and real-time performance metrics
- **Quality Assurance**: Automated CI/CD (GitHub Actions) with Ruff/Black pre-commit hooks

## Architecture

LifeSync uses a modern, **Refined Monolith (Phase 3)** architecture designed for stability and observability.

### 🔌 State-of-the-Art Reliability
- **Circuit Breaker**: The LLM integration is wrapped in a circuit breaker pattern (Open/Closed/Half-Open) to protect the system during provider outages.
- **Fail-Fast Timeouts**: Every layer (Request, DB, AI) has strict timeout enforcement to ensure no operation hangs indefinitely.
- **Resilient Fallback**: Multilayered fallback logic for AI responses ensures high availability even during high-traffic peaks.

### 📦 Optimized Data Layer
- **Unified Connection Pool**: A singleton Postgres client manages connections efficiently across the entire backend life cycle.
- **Strategic Indexing**: Highly optimized B-Tree indexes for `user_id` and `created_at` ensure history lookups remain instantaneous.
- **LRU Caching**: Transparent caching layer reduces database load by up to 70% for repeat assessment views.

---

## 🔮 Future Vision: SpacetimeDB Migration

We are currently evaluating a migration from **FastAPI + Supabase** to **SpacetimeDB**. 

### **Why SpacetimeDB?**
- **Extreme Throughput**: Targets 100k+ Transactions Per Second (TPS).
- **Zero Latency**: Combines the application server and database into a single, high-performance WASM module.
- **Real-Time by Default**: Automatic WebSocket synchronization for live updates.

### **The Migration Strategy**
- **Logic Shifting**: Porting Python FastAPI logic to Rust/TypeScript "Reducers" inside the database.
- **Incremental Data Port**: Using a "Lazy Migration" pattern to move user data without downtime.
- **Direct Frontend Binding**: Removing traditional REST/GraphQL overhead for direct database-to-client mirroring.

---

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

   **Required Environment Variables:**
   ```bash
   # Database
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE=your-supabase-service-role-key

   # LLM Providers (at least one required)
   GEMINI_API_KEY=your-gemini-api-key
   OPENAI_API_KEY=your-openai-api-key
   GROK_API_KEY=your-grok-api-key
   LLM_PROVIDER=gemini  # or openai, grok

   # Security Configuration
   ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
   ENVIRONMENT=production  # or development

   # API Configuration
   API_HOST=0.0.0.0
   PORT=5174  # or any available port
   ```

   **Security Notes:**
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins for production
   - `ENVIRONMENT`: Set to `development` to auto-allow localhost origins
   - In production, ensure `ALLOWED_ORIGINS` contains only trusted domains
   - Rate limiting is automatically enabled (see Rate Limits section below)

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

### Backend Deployment

To deploy the backend API for production:

1. **Render (Recommended - Free Tier Available)**:
   - See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) for step-by-step instructions
   - Connect GitHub repository
   - Set root directory to `backend`
   - Configure environment variables (Supabase, API keys)
   - Auto-deploys on every push

   - Railway, Heroku, DigitalOcean, AWS, etc.
   - See backend [README.md](./backend/README.md) for details

### Backend Automation (Health Checks)

The system includes automated health monitoring to ensure database connectivity and API responsiveness:

1. **Daily Auto-Healing**:
   - A GitHub Action (`.github/workflows/supabase-health-check.yml`) runs every 24 hours at 00:00 UTC.
   - It executes `backend/scripts/supabase_health_check.py` to ping the Supabase database.
   - If successful, it prevents database pausing (for free tier projects).

2. **Discord Notifications**:
   - Health status reports are sent to a private Discord channel.
   - Reports include: `Status`, `Latency`, `Total Assessments`, and `Recent Activity`.
   - Setup: Add `DISCORD_WEBHOOK_URL` to GitHub Secrets and local `.env`.

### Web Deployment

To deploy the web app for your colleagues to view:

1. **GitHub Pages (Free & Automatic)**:
   - See [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) for setup
   - Enable GitHub Pages in repository settings
   - Set `NEXT_PUBLIC_API_URL` secret to your backend URL
   - Auto-deploys on every push

2. **Other Options**:
   - See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
   - Vercel, Netlify, Docker, and self-hosted options available

3. **Automated Deployment**:
   - GitHub Actions workflow included (`.github/workflows/deploy-web.yml`)
   - Automatically builds and tests on every push

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
   npx expo start --lan
   ```
   
   **Note**: Use `--lan` instead of `--tunnel` for faster startup (60-90 seconds faster). Tunnel mode is only needed if you're not on the same network.

5. Connect with Expo Go:
   - Install Expo Go app on your mobile device
   - Scan the QR code or use the LAN URL
   - Ensure your mobile and PC are on the same network

## Security & Rate Limiting

LifeSync includes comprehensive security features to protect against abuse:

### Rate Limits

All rate limits are enforced per IP address and return HTTP 429 when exceeded:

| Endpoint | Rate Limit | Purpose |
|----------|------------|---------|
| `POST /v1/auth/signup` | 5 per hour | Prevent automated account creation |
| `POST /v1/auth/login` | 10 per hour, 3 per minute | Prevent brute force attacks |
| `POST /v1/auth/reset-password` | 3 per hour | Prevent email enumeration attacks |
| `POST /v1/assessments/{id}/generate_explanation` | 10 per day, 2 per hour | Protect LLM resources and costs |

### CORS Configuration

- **Development**: Automatically allows `localhost:3000`, `localhost:3001`, and `127.0.0.1` origins
- **Production**: Only allows origins specified in `ALLOWED_ORIGINS` environment variable
- **Default**: If `ALLOWED_ORIGINS` is empty in production, CORS is disabled (no origins allowed)

### Best Practices

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` as a template.
2. **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE` secret. Only use in backend, never expose to frontend.
3. **API Keys**: Rotate LLM API keys regularly and monitor usage.
4. **CORS Origins**: In production, list only your actual frontend domains.
5. **Rate Limits**: Monitor logs for rate limit violations to detect potential abuse.

## Performance Tips

### Mobile Development
To avoid slow command loading:

1. **Use LAN mode instead of tunnel**: `npx expo start --lan` (much faster)
2. **Install Expo CLI globally**: `npm install -g expo-cli` then use `expo start --lan`
3. **Exclude cache files**: Already configured in `.gitignore`
4. **Clear caches if needed**: `npm cache clean --force` and remove `node_modules/.cache`

### Backend Performance

The backend has been optimized for production performance with several key improvements:

#### Database Connection Pooling (Issue #7, #8, #9)
- **Singleton Pattern**: Single shared database client used across all requests
- **No Resource Leaks**: Connection pool prevents per-request client creation
- **Lifecycle Management**: Proper initialization on startup and cleanup on shutdown
- **Performance**: Reduces connection overhead by 90%+

#### Retry Logic (Issue #10)
- **Transient Error Handling**: Automatic retry for connection timeouts and network issues
- **Exponential Backoff**: 1s, 2s, 4s delays between retries (max 3 attempts)
- **Permanent Error Detection**: SQL errors and constraint violations are NOT retried
- **Configuration**: Customizable retry attempts via `@with_db_retry` decorator

#### Query Optimization (Issue #11)
- **Selective Field Fetching**: Only fetch needed columns (no more `SELECT *`)
- **Bandwidth Reduction**: 50-80% less data transferred per query
- **Specialized Methods**:
  - `get_assessment_summary()`: Essential fields only (id, mbti_code, confidence)
  - `get_assessment_scores()`: Score data only (trait_scores, facet_scores)
  - `get_assessment_full()`: Complete data (for explanation generation)
  - `get_history()`: Optimized history queries

#### Query Timeouts (Issue #12)
- **Configurable Timeouts**: Environment variables for timeout control
  - `DATABASE_QUERY_TIMEOUT=30.0` (standard operations)
  - `DATABASE_AUTH_TIMEOUT=10.0` (authentication operations)
  - `DATABASE_CONNECTION_TIMEOUT=5.0` (connection establishment)
- **Prevents Hanging**: Operations fail fast instead of blocking indefinitely
- **AsyncIO Support**: Native timeout support for async operations

#### Configuration

Add these optional environment variables to your `.env` file:

```bash
# Database Performance Configuration
DATABASE_QUERY_TIMEOUT=30.0      # Query timeout in seconds
DATABASE_AUTH_TIMEOUT=10.0       # Auth timeout in seconds
DATABASE_CONNECTION_TIMEOUT=5.0  # Connection timeout in seconds
```

#### Monitoring

Check connection pool health via the `/health` endpoint:

```bash
curl http://localhost:5174/health
```

Response includes database connection pool status:
```json
{
  "status": "healthy",
  "service": "LifeSync Personality Engine",
  "version": "1.0.0",
  "database": {
    "connection_pool": "initialized"
  }
}
```

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
