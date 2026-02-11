import { NextResponse } from "next/server";
import { getLeaderboard, getRecentRoasts, type LeaderboardPeriod } from "@/lib/roast-store";
import { getLeaderboardFromDb, getRecentRoastsFromDb } from "@/lib/roast-db";

function parsePeriod(value: string | null): LeaderboardPeriod {
    if (value === "daily" || value === "weekly" || value === "all") {
        return value;
    }
    return "all";
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limitParam = Number(searchParams.get("limit") ?? 20);
    const minAttemptsParam = Number(searchParams.get("minAttempts") ?? 1);
    const recentParam = Number(searchParams.get("recent") ?? 10);
    const period = parsePeriod(searchParams.get("period"));

    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
    const minAttempts = Number.isFinite(minAttemptsParam) ? Math.min(Math.max(minAttemptsParam, 1), 20) : 1;
    const recent = Number.isFinite(recentParam) ? Math.min(Math.max(recentParam, 1), 50) : 10;

    const [dbLeaderboard, dbRecent] = await Promise.all([
        getLeaderboardFromDb(limit, minAttempts, period),
        getRecentRoastsFromDb(recent),
    ]);

    return NextResponse.json({
        period,
        minAttempts,
        leaderboard: dbLeaderboard ?? await getLeaderboard(limit, minAttempts, period),
        recentRoasts: dbRecent ?? await getRecentRoasts(recent),
    });
}
