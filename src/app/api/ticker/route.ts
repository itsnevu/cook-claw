import { NextResponse } from "next/server";
import { getDeployAggregateMetrics } from "@/lib/deploy-store";
import { captureServerEvent } from "@/lib/telemetry";
import { captureServerException } from "@/lib/sentry";
import { getDeployAggregateFromDb } from "@/lib/deploy-db";

const GECKO_BASE = "https://api.coingecko.com/api/v3";
const VS_CURRENCY = "usd";
const CLAW_ID = process.env.COINGECKO_CLAW_ID ?? "claw";
const CLAW_TOKEN_ADDRESS = process.env.CLAW_TOKEN_ADDRESS ?? "";
const DEXSCREENER_BASE = "https://api.dexscreener.com/latest/dex/tokens";

interface TickerResponse {
    btc: number | null;
    eth: number | null;
    claw: number | null;
    fdv: number | null;
    users: number;
    deploys: number;
    updatedAt: string;
}

async function fetchSimplePrices(): Promise<{ btc: number | null; eth: number | null }> {
    const url = `${GECKO_BASE}/simple/price?ids=bitcoin,ethereum&vs_currencies=${VS_CURRENCY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        return { btc: null, eth: null };
    }

    const data = await res.json() as {
        bitcoin?: { usd?: number };
        ethereum?: { usd?: number };
    };

    return {
        btc: data.bitcoin?.usd ?? null,
        eth: data.ethereum?.usd ?? null,
    };
}

async function fetchClawMarketData(): Promise<{ claw: number | null; fdv: number | null }> {
    const url = `${GECKO_BASE}/coins/markets?vs_currency=${VS_CURRENCY}&ids=${encodeURIComponent(CLAW_ID)}&sparkline=false`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        return { claw: null, fdv: null };
    }

    const data = await res.json() as Array<{
        current_price?: number;
        fully_diluted_valuation?: number;
    }>;
    const market = data[0];

    return {
        claw: market?.current_price ?? null,
        fdv: market?.fully_diluted_valuation ?? null,
    };
}

async function fetchClawDexFallback(): Promise<{ claw: number | null; fdv: number | null }> {
    if (!CLAW_TOKEN_ADDRESS) {
        return { claw: null, fdv: null };
    }

    const url = `${DEXSCREENER_BASE}/${encodeURIComponent(CLAW_TOKEN_ADDRESS)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        return { claw: null, fdv: null };
    }

    const data = await res.json() as {
        pairs?: Array<{
            priceUsd?: string;
            fdv?: number;
            liquidity?: { usd?: number };
        }>;
    };

    const pairs = data.pairs ?? [];
    if (pairs.length === 0) {
        return { claw: null, fdv: null };
    }

    const bestPair = [...pairs].sort(
        (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    )[0];

    const price = bestPair.priceUsd ? Number(bestPair.priceUsd) : null;
    const parsedPrice = price !== null && Number.isFinite(price) ? price : null;
    const parsedFdv = typeof bestPair.fdv === "number" && Number.isFinite(bestPair.fdv) ? bestPair.fdv : null;

    return {
        claw: parsedPrice,
        fdv: parsedFdv,
    };
}

export async function GET() {
    try {
        const [{ btc, eth }, clawMarket, clawDexFallback, dbAllTime, memAllTime] = await Promise.all([
            fetchSimplePrices(),
            fetchClawMarketData(),
            fetchClawDexFallback(),
            getDeployAggregateFromDb("all"),
            getDeployAggregateMetrics("all"),
        ]);
        const allTime = dbAllTime ?? memAllTime;

        const claw = clawMarket.claw ?? clawDexFallback.claw;
        const fdv = clawMarket.fdv ?? clawDexFallback.fdv;
        const usedDexFallback = clawMarket.claw === null && clawDexFallback.claw !== null;

        if (usedDexFallback) {
            await captureServerEvent("ticker_claw_dex_fallback_used", "system:ticker", {
                clawPrice: claw,
                fdv,
            });
        }

        const payload: TickerResponse = {
            btc,
            eth,
            claw,
            fdv,
            users: allTime.uniqueUsers,
            deploys: allTime.totalDeploys,
            updatedAt: new Date().toISOString(),
        };

        return NextResponse.json(payload);
    } catch (error) {
        await captureServerException(error, { route: "/api/ticker" });
        return NextResponse.json(
            {
                btc: null,
                eth: null,
                claw: null,
                fdv: null,
                users: 0,
                deploys: 0,
                updatedAt: new Date().toISOString(),
            } satisfies TickerResponse,
            { status: 200 }
        );
    }
}
