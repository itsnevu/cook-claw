import { NextResponse } from "next/server";
import { getRoastEngineMetrics } from "@/lib/roast-engine";
import { getRateLimitMetrics } from "@/lib/rate-limit";
import { getRoastAggregateMetrics } from "@/lib/roast-store";
import { appendMetricsSnapshot, getMetricsHistory } from "@/lib/metrics-store";
import { getRoastAggregateFromDb } from "@/lib/roast-db";

function isAuthorized(req: Request): boolean {
    const expected = process.env.METRICS_API_TOKEN;
    if (!expected) {
        return true;
    }

    const headerToken = req.headers.get("x-metrics-token");
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    const queryToken = new URL(req.url).searchParams.get("token");

    return headerToken === expected || bearerToken === expected || queryToken === expected;
}

function parseDateParam(value: string | null): number | null {
    if (!value) {
        return null;
    }
    const ts = Date.parse(value);
    return Number.isFinite(ts) ? ts : null;
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized metrics access." }, { status: 401 });
    }

    const url = new URL(req.url);
    const historyLimitParam = Number(url.searchParams.get("history") ?? 60);
    const historyLimit = Number.isFinite(historyLimitParam) ? Math.min(Math.max(historyLimitParam, 2), 180) : 60;
    const format = url.searchParams.get("format");
    const sinceTs = parseDateParam(url.searchParams.get("since"));
    const untilTs = parseDateParam(url.searchParams.get("until"));

    const [dbAllTime, dbDaily, memAllTime, memDaily] = await Promise.all([
        getRoastAggregateFromDb("all"),
        getRoastAggregateFromDb("daily"),
        getRoastAggregateMetrics("all"),
        getRoastAggregateMetrics("daily"),
    ]);
    const allTime = dbAllTime ?? memAllTime;
    const daily = dbDaily ?? memDaily;

    const roastEngine = getRoastEngineMetrics();
    const rateLimit = getRateLimitMetrics();
    const generatedAt = new Date().toISOString();

    await appendMetricsSnapshot({
        timestamp: generatedAt,
        totalRequests: roastEngine.totalRequests,
        aiFailures: roastEngine.aiFailure,
        fallbackUsed: roastEngine.fallbackUsed,
        blockedTotal: rateLimit.blockedIpMinute + rateLimit.blockedUserMinute + rateLimit.blockedUserDaily,
    });

    const history = (await getMetricsHistory(historyLimit)).filter((point) => {
        const ts = Date.parse(point.timestamp);
        if (!Number.isFinite(ts)) {
            return false;
        }
        if (sinceTs !== null && ts < sinceTs) {
            return false;
        }
        if (untilTs !== null && ts > untilTs) {
            return false;
        }
        return true;
    });

    if (format === "csv") {
        const csvHeader = "timestamp,total_requests,ai_failures,fallback_used,blocked_total";
        const csvRows = history.map((point) =>
            `${point.timestamp},${point.totalRequests},${point.aiFailures},${point.fallbackUsed},${point.blockedTotal}`
        );
        const csv = [csvHeader, ...csvRows].join("\n");
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=\"clawcook-metrics-history.csv\"",
                "Cache-Control": "no-store",
            },
        });
    }

    return NextResponse.json({
        roastEngine,
        rateLimit,
        aggregates: {
            allTime,
            daily,
        },
        history,
        generatedAt,
    });
}
