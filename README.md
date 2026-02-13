# ClawCook

ClawCook is a Next.js application for Farcaster profile deploying with a game-like interaction model, live market ticker, leaderboard views, and operational analytics dashboards.

## Overview

This project includes:

- Deploy generation pipeline using Farcaster profile activity
- Moderation gate for generated deploy content
- Frame endpoint for Farcaster-compatible interactions
- Live ticker data with fallback market providers
- Leaderboard, metrics, and analytics pages
- Optional telemetry and monitoring integrations
- Prisma foundation for database-backed persistence

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS + Framer Motion
- Prisma (database foundation)
- Optional integrations: Neynar, OpenAI, Upstash Redis, CoinGecko, DexScreener, PostHog, Sentry

## Local Development

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` and configure the values you need:

```bash
# Core integrations
NEYNAR_API_KEY=your_neynar_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_MODERATION_MODEL=omni-moderation-latest

# Optional Redis (shared rate limits, shared runtime caches)
UPSTASH_REDIS_REST_URL=https://<your-endpoint>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-token>

# Optional ticker configuration
COINGECKO_CLAW_ID=claw
CLAW_TOKEN_ADDRESS=0x...

# Optional API protection
METRICS_API_TOKEN=<metrics_token>
DEV_SEED_TOKEN=<dev_seed_token>

# Optional analytics
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_API_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_SAMPLE_RATE=1
NEXT_PUBLIC_POSTHOG_EVENT_COOLDOWN_MS=5000

# Optional error monitoring
SENTRY_DSN=https://<key>@o0.ingest.sentry.io/<project>
NEXT_PUBLIC_SENTRY_DSN=https://<public-key>@o0.ingest.sentry.io/<project>

# Optional Prisma DB mode
PRISMA_DB_ENABLED=true
DATABASE_URL=file:./dev.db
```

## API Endpoints

### Deploy and Frame

- `POST /api/deploy`
  - Generates deploy output from Farcaster data
  - Applies moderation before returning/storing
- `GET|POST /api/frame/[[...routes]]`
  - Frame-compatible deploy flow

### Data Surfaces

- `GET /api/ticker`
  - Returns BTC/ETH/CLAW/FDV plus internal usage counters
  - Uses CoinGecko and can fall back to DexScreener for CLAW
- `GET /api/leaderboard`
  - Query: `period`, `limit`, `minAttempts`, `recent`
- `GET /api/metrics`
  - Query: `history`, `since`, `until`, `format=csv`
  - Can be protected with `METRICS_API_TOKEN`
- `GET /api/setup/status`
  - Returns integration readiness checks and connection hints

### Development Utility

- `POST /api/dev/seed`
  - Seeds development deploy data
  - Disabled in production
  - Optional protection with `DEV_SEED_TOKEN`

## Prisma Setup

Prisma schema and initial migration are included under `prisma/`.

To enable DB-backed mode:

1. Set:
   - `PRISMA_DB_ENABLED=true`
   - `DATABASE_URL=<your_db_url>`
2. Run:
   - `npx prisma generate`
   - `npx prisma migrate deploy`

When `PRISMA_DB_ENABLED=false`, endpoints use fallback in-memory/Redis paths where available.

## Scripts

- `npm run dev` - start local development
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Deployment Notes

Deploying on Vercel is supported.  
This repository includes `.npmrc` with `legacy-peer-deps=true` to avoid installation failures from known peer dependency conflicts in the current dependency set.

## Operational Notes

- Use `/setup` to validate environment readiness.
- Use `/metrics` and `/analytics` for runtime and KPI visibility.
- Use `/api/dev/seed` in non-production environments to populate test data.

## License

Add your project license here.
