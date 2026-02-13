"use client";

import { useEffect, useMemo, useState } from "react";

interface MetricsResponse {
    roastEngine: {
        totalRequests: number;
        aiSuccess: number;
        aiFailure: number;
        fallbackUsed: number;
    };
    rateLimit: {
        allowed: number;
        blockedUserMinute: number;
        blockedUserDaily: number;
        blockedIpMinute: number;
    };
    aggregates: {
        daily: {
            totalRoasts: number;
            uniqueUsers: number;
            averageScore: number;
            profileBreakdown: Record<string, number>;
        };
    };
    generatedAt: string;
}

interface LeaderboardResponse {
    leaderboard: Array<{
        username: string;
        averageScore: number;
        bestScore: number;
        attempts: number;
    }>;
}

function pct(numerator: number, denominator: number): string {
    if (denominator <= 0) {
        return "0%";
    }
    return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function findTopProfile(breakdown: Record<string, number>): string {
    const entries = Object.entries(breakdown);
    if (entries.length === 0) {
        return "-";
    }
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        const storedToken = window.localStorage.getItem("clawcook_metrics_token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            try {
                setError(null);
                const headers: HeadersInit = {};
                if (token.trim()) {
                    headers["x-metrics-token"] = token.trim();
                    window.localStorage.setItem("clawcook_metrics_token", token.trim());
                }

                const [metricsRes, leaderboardRes] = await Promise.all([
                    fetch("/api/metrics?history=30", { cache: "no-store", headers }),
                    fetch("/api/leaderboard?period=daily&limit=5&recent=5&minAttempts=1", { cache: "no-store" }),
                ]);

                const metricsJson = await metricsRes.json() as MetricsResponse & { error?: string };
                const leaderboardJson = await leaderboardRes.json() as LeaderboardResponse & { error?: string };

                if (!metricsRes.ok) {
                    throw new Error(metricsJson.error ?? "Failed to fetch metrics.");
                }
                if (!leaderboardRes.ok) {
                    throw new Error(leaderboardJson.error ?? "Failed to fetch leaderboard.");
                }

                if (mounted) {
                    setMetrics(metricsJson);
                    setLeaderboard(leaderboardJson);
                }
            } catch (fetchError) {
                if (mounted) {
                    const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch analytics.";
                    setError(message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        run();
        const timer = setInterval(run, 15_000);
        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [token]);

    const kpis = useMemo(() => {
        if (!metrics) {
            return null;
        }

        const blocked =
            metrics.rateLimit.blockedIpMinute +
            metrics.rateLimit.blockedUserMinute +
            metrics.rateLimit.blockedUserDaily;
        const moderationOrFallback = metrics.roastEngine.fallbackUsed;
        const requests = metrics.roastEngine.totalRequests;
        const topProfile = findTopProfile(metrics.aggregates.daily.profileBreakdown);
        const topHandle = leaderboard?.leaderboard?.[0]?.username ?? "-";

        return {
            successRate: pct(metrics.roastEngine.aiSuccess, requests),
            fallbackRate: pct(moderationOrFallback, requests),
            blockRate: pct(blocked, blocked + metrics.rateLimit.allowed),
            dailyRoasts: metrics.aggregates.daily.totalRoasts,
            dailyUsers: metrics.aggregates.daily.uniqueUsers,
            topProfile,
            topHandle,
            generatedAt: metrics.generatedAt,
        };
    }, [leaderboard, metrics]);

    return (
        <main className="relative min-h-screen overflow-hidden bg-black/55 px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-6xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Analytics</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Operational KPI snapshot for ClawCook.
                    </h1>
                    <p className="mt-4 text-sm text-neutral-300">
                        Auto-refresh every 15 seconds. Generated at: {kpis?.generatedAt ?? "-"}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="analytics-token" className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                            Metrics Token
                        </label>
                        <input
                            id="analytics-token"
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="optional: METRICS_API_TOKEN"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary/50 sm:max-w-md"
                        />
                    </div>
                </section>

                {loading && <p className="mt-6 text-sm text-neutral-400">Loading analytics...</p>}
                {error && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

                {!loading && !error && kpis && (
                    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">AI Success Rate</p>
                            <p className="mt-2 text-3xl font-bold text-white">{kpis.successRate}</p>
                        </article>
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Fallback Rate</p>
                            <p className="mt-2 text-3xl font-bold text-white">{kpis.fallbackRate}</p>
                        </article>
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Block Rate</p>
                            <p className="mt-2 text-3xl font-bold text-white">{kpis.blockRate}</p>
                        </article>
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Daily Roasts</p>
                            <p className="mt-2 text-3xl font-bold text-white">{kpis.dailyRoasts}</p>
                        </article>
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Daily Users</p>
                            <p className="mt-2 text-3xl font-bold text-white">{kpis.dailyUsers}</p>
                        </article>
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Top Daily Profile</p>
                            <p className="mt-2 text-xl font-bold text-white">{kpis.topProfile}</p>
                        </article>
                        <article className="glass-panel rounded-2xl p-5">
                            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Top Daily Handle</p>
                            <p className="mt-2 text-xl font-bold text-white">@{kpis.topHandle}</p>
                        </article>
                    </section>
                )}
            </div>
        </main>
    );
}

