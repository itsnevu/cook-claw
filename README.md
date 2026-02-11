This is a [Next.js](https://nextjs.org) project for **ClawCook** (roast-to-earn Farcaster app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create `.env.local` and add:

```bash
NEYNAR_API_KEY=your_neynar_api_key
OPENAI_API_KEY=your_openai_api_key
# optional
# OPENAI_MODEL=gpt-4.1-mini
# optional for persistent roast history + distributed rate limiting
# UPSTASH_REDIS_REST_URL=https://<your-endpoint>.upstash.io
# UPSTASH_REDIS_REST_TOKEN=<your-token>
# optional: protect /api/metrics
# METRICS_API_TOKEN=<your-metrics-token>
# optional: coin id used for CLAW price/fdv in /api/ticker
# COINGECKO_CLAW_ID=claw
# optional: fallback token address for DexScreener if CoinGecko lacks CLAW price/fdv
# CLAW_TOKEN_ADDRESS=0x...
# optional: OpenAI moderation model override
# OPENAI_MODERATION_MODEL=omni-moderation-latest
# optional: server-side product analytics
# POSTHOG_API_KEY=phc_xxx
# POSTHOG_HOST=https://app.posthog.com
```

`NEYNAR_API_KEY` is required for fetching real Farcaster casts in `POST /api/roast`.
`OPENAI_API_KEY` enables AI roast generation. If missing, the app falls back to heuristic roast mode.
If `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set, roast history and rate limiting become shared/persistent across instances.

### API Routes

- `POST /api/roast` -> generate roast from real Farcaster cast history.
  - Includes moderation check for roast output before returning/storing.
  - Emits optional PostHog events when POSTHOG env is configured.
- `GET /api/ticker` -> live BTC/ETH/CLAW/FDV from CoinGecko + internal users/roasts stats.
  - CLAW price/fdv falls back to DexScreener when `CLAW_TOKEN_ADDRESS` is configured.
- `GET /api/leaderboard` -> returns leaderboard and recent roast events.
  - Query params: `period=daily|weekly|all`, `limit`, `minAttempts`, `recent`
- `GET /api/metrics` -> runtime observability snapshot (roast engine, rate-limit, aggregate stats)
  - If `METRICS_API_TOKEN` is set, send `x-metrics-token` (or `Authorization: Bearer ...`)
  - Optional query: `history` (2-180 samples, default 60)
  - Optional query: `since` and `until` (ISO datetime filter for history)
  - Optional query: `format=csv` (export history as CSV)
- `GET/POST /api/frame/[[...routes]]` -> Farcaster Frame flow wired to real roast engine.

Without Redis env, leaderboard storage/rate limit fallback to process memory (runtime only).

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
