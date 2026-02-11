import { NextResponse } from "next/server";
import { getRoastAggregateMetrics } from "@/lib/roast-store";

const GECKO_BASE = "https://api.coingecko.com/api/v3";
const VS_CURRENCY = "usd";
const CLAW_ID = process.env.COINGECKO_CLAW_ID ?? "claw";

interface TickerResponse {
    btc: number | null;
    eth: number | null;
    claw: number | null;
    fdv: number | null;
    users: number;
    roasts: number;
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

export async function GET() {
    const [{ btc, eth }, { claw, fdv }, allTime] = await Promise.all([
        fetchSimplePrices(),
        fetchClawMarketData(),
        getRoastAggregateMetrics("all"),
    ]);

    const payload: TickerResponse = {
        btc,
        eth,
        claw,
        fdv,
        users: allTime.uniqueUsers,
        roasts: allTime.totalRoasts,
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload);
}
