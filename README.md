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
```

`NEYNAR_API_KEY` is required for fetching real Farcaster casts in `POST /api/roast`.
`OPENAI_API_KEY` enables AI roast generation. If missing, the app falls back to heuristic roast mode.

### API Routes

- `POST /api/roast` -> generate roast from real Farcaster cast history.
- `GET /api/leaderboard` -> returns current in-memory leaderboard and recent roast events.

Leaderboard storage is currently memory-based (runtime only). Use a database/KV for persistent production data.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
