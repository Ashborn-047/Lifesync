# LifeSync Web

The official web version of the LifeSync platform - your personalized life optimization hub.

## Features

- **Personality Assessment** - Complete Big Five personality test
- **AI-Powered Insights** - Get detailed analysis of your personality traits
- **Modern UI** - Beautiful glassmorphism design with smooth animations
- **Fast & Responsive** - Built with Next.js 14 and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (deployed on Railway)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL (default: `http://localhost:5174`)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── quiz/              # Assessment quiz
│   ├── results/           # Results page
│   └── dashboard/         # Dashboard
├── components/ui/         # Reusable UI components
├── lib/                   # Utilities and API
│   ├── api.ts            # Backend API integration
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
└── styles/               # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Integration

The web app connects to the LifeSync backend API:

- `GET /v1/questions` - Fetch assessment questions
- `POST /v1/assessments` - Submit assessment responses
- `POST /v1/assessments/{id}/generate_explanation` - Generate AI explanation

## License

Part of the LifeSync project.
