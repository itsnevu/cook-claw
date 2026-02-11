import { NextResponse } from "next/server";
import { getLeaderboard, getRecentRoasts } from "@/lib/roast-store";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") ?? 20);
    const minAttemptsParam = Number(searchParams.get("minAttempts") ?? 1);
    const recentParam = Number(searchParams.get("recent") ?? 10);

    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
    const minAttempts = Number.isFinite(minAttemptsParam) ? Math.min(Math.max(minAttemptsParam, 1), 20) : 1;
    const recent = Number.isFinite(recentParam) ? Math.min(Math.max(recentParam, 1), 50) : 10;

    return NextResponse.json({
        leaderboard: getLeaderboard(limit, minAttempts),
        recentRoasts: getRecentRoasts(recent),
    });
}
