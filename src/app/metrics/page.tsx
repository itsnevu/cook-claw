"use client";

import { useEffect, useState } from "react";

interface MetricsPoint {
    timestamp: string;
    totalRequests: number;
    aiFailures: number;
    fallbackUsed: number;
    blockedTotal: number;
}

interface DeltaPoint {
    requestsDelta: number;
    aiFailuresDelta: number;
    fallbackDelta: number;
    blockedDelta: number;
}

interface MetricsResponse {
    deployEngine: {
        totalRequests: number;
        aiSuccess: number;
        aiFailure: number;
        fallbackUsed: number;
        lastAiErrorAt?: string;
    };
    rateLimit: {
        allowed: number;
        blockedUserMinute: number;
        blockedUserDaily: number;
        blockedIpMinute: number;
        redisFallbacks: number;
    };
    aggregates: {
        allTime: {
            totalDeploys: number;
            uniqueUsers: number;
            averageScore: number;
            bestScore: number;
            profileBreakdown: Record<string, number>;
        };
        daily: {
            totalDeploys: number;
            uniqueUsers: number;
            averageScore: number;
            bestScore: number;
            profileBreakdown: Record<string, number>;
        };
    };
    history: MetricsPoint[];
    generatedAt: string;
}

function toSparklinePoints(values: number[], width = 240, height = 60): string {
    if (values.length === 0) {
        return "";
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = values.length > 1 ? width / (values.length - 1) : width;

    return values
        .map((value, index) => {
            const x = index * step;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
    const points = toSparklinePoints(values);
    return (
        <svg viewBox="0 0 240 60" className="h-16 w-full">
            <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} />
        </svg>
    );
}

function buildDeltaSeries(points: MetricsPoint[]): DeltaPoint[] {
    if (points.length < 2) {
        return [];
    }

    const deltas: DeltaPoint[] = [];
    for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1];
        const curr = points[i];
        deltas.push({
            requestsDelta: Math.max(0, curr.totalRequests - prev.totalRequests),
            aiFailuresDelta: Math.max(0, curr.aiFailures - prev.aiFailures),
            fallbackDelta: Math.max(0, curr.fallbackUsed - prev.fallbackUsed),
            blockedDelta: Math.max(0, curr.blockedTotal - prev.blockedTotal),
        });
    }
    return deltas;
}

export default function MetricsPage() {
    const [data, setData] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState("");
    const [exporting, setExporting] = useState(false);
    const [since, setSince] = useState("");
    const [until, setUntil] = useState("");

    useEffect(() => {
        const storedToken = window.localStorage.getItem("clawcook_metrics_token");
        if (storedToken) {
            setToken(storedToken);
        }
        const storedSince = window.localStorage.getItem("clawcook_metrics_since");
        const storedUntil = window.localStorage.getItem("clawcook_metrics_until");
        if (storedSince) {
            setSince(storedSince);
        }
        if (storedUntil) {
            setUntil(storedUntil);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            try {
                const headers: HeadersInit = {};
                if (token.trim()) {
                    headers["x-metrics-token"] = token.trim();
                    window.localStorage.setItem("clawcook_metrics_token", token.trim());
                }

                const params = new URLSearchParams({ history: "90" });
                if (since) {
                    params.set("since", new Date(since).toISOString());
                    window.localStorage.setItem("clawcook_metrics_since", since);
                }
                if (until) {
                    params.set("until", new Date(until).toISOString());
                    window.localStorage.setItem("clawcook_metrics_until", until);
                }

                const res = await fetch(`/api/metrics?${params.toString()}`, {
                    cache: "no-store",
                    headers,
                });
                const payload = await res.json() as MetricsResponse & { error?: string };
                if (!res.ok) {
                    throw new Error(payload.error ?? "Failed to fetch metrics.");
                }
                if (mounted) {
                    setData(payload);
                    setError(null);
                }
            } catch (fetchError) {
                if (mounted) {
                    const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch metrics.";
                    setError(message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        run();
        const timer = setInterval(run, 10_000);
        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [token, since, until]);

    const history = data?.history ?? [];
    const deltaSeries = buildDeltaSeries(history);

    const handleExportCsv = async () => {
        try {
            setExporting(true);
            const headers: HeadersInit = {};
            if (token.trim()) {
                headers["x-metrics-token"] = token.trim();
            }

            const params = new URLSearchParams({ history: "180", format: "csv" });
            if (since) {
                params.set("since", new Date(since).toISOString());
            }
            if (until) {
                params.set("until", new Date(until).toISOString());
            }

            const res = await fetch(`/api/metrics?${params.toString()}`, {
                cache: "no-store",
                headers,
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null) as { error?: string } | null;
                throw new Error(payload?.error ?? "Failed to export CSV.");
            }

            const blob = await res.blob();
            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            a.download = "clawcook-metrics-history.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(href);
        } catch (exportError) {
            const message = exportError instanceof Error ? exportError.message : "Failed to export CSV.";
            setError(message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(30,12,10,0.72),rgba(40,12,18,0.68))] px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-6xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Runtime Metrics</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Live observability for deploy engine and rate limiting.
                    </h1>
                    <p className="mt-4 text-sm text-neutral-300">
                        Auto-refresh every 10 seconds. Generated at: {data?.generatedAt ?? "-"}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="metrics-token" className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                            Metrics Token
                        </label>
                        <input
                            id="metrics-token"
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="optional: METRICS_API_TOKEN"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary/50 sm:max-w-md"
                        />
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            disabled={exporting}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-mono uppercase tracking-widest text-white transition-colors hover:bg-secondary disabled:opacity-60"
                        >
                            {exporting ? "Exporting..." : "Export CSV"}
                        </button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input
                            type="datetime-local"
                            value={since}
                            onChange={(e) => setSince(e.target.value)}
                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
                        />
                        <input
                            type="datetime-local"
                            value={until}
                            onChange={(e) => setUntil(e.target.value)}
                            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
                        />
                    </div>
                </section>

                {loading && <p className="mt-6 text-sm text-neutral-400">Loading metrics...</p>}
                {error && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

                {!loading && !error && data && (
                    <section className="mt-8 grid gap-6 md:grid-cols-2">
                        <article className="glass-panel rounded-2xl p-6 md:col-span-2">
                            <h2 className="text-xl font-bold text-white">Trends (Delta per Sample)</h2>
                            <p className="mt-2 text-xs text-neutral-400">
                                Last {history.length} cumulative samples from server. Charts show per-interval deltas.
                            </p>
                            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Requests / Interval</p>
                                    <Sparkline values={deltaSeries.map((h) => h.requestsDelta)} color="#ff4500" />
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">AI Failures / Interval</p>
                                    <Sparkline values={deltaSeries.map((h) => h.aiFailuresDelta)} color="#ff9f1a" />
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Rate-Limit Blocks / Interval</p>
                                    <Sparkline values={deltaSeries.map((h) => h.blockedDelta)} color="#ff3b30" />
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 lg:col-span-3">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">Fallback / Interval</p>
                                    <Sparkline values={deltaSeries.map((h) => h.fallbackDelta)} color="#ff7a45" />
                                </div>
                            </div>
                        </article>

                        <article className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Deploy Engine</h2>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                                <li>Total Requests: {data.deployEngine.totalRequests}</li>
                                <li>AI Success: {data.deployEngine.aiSuccess}</li>
                                <li>AI Failure: {data.deployEngine.aiFailure}</li>
                                <li>Fallback Used: {data.deployEngine.fallbackUsed}</li>
                                <li>Last AI Error: {data.deployEngine.lastAiErrorAt ?? "-"}</li>
                            </ul>
                        </article>

                        <article className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Rate Limit</h2>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                                <li>Allowed: {data.rateLimit.allowed}</li>
                                <li>Blocked User Minute: {data.rateLimit.blockedUserMinute}</li>
                                <li>Blocked User Daily: {data.rateLimit.blockedUserDaily}</li>
                                <li>Blocked IP Minute: {data.rateLimit.blockedIpMinute}</li>
                                <li>Redis Fallbacks: {data.rateLimit.redisFallbacks}</li>
                            </ul>
                        </article>

                        <article className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Aggregate (All Time)</h2>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                                <li>Total Deploys: {data.aggregates.allTime.totalDeploys}</li>
                                <li>Unique Users: {data.aggregates.allTime.uniqueUsers}</li>
                                <li>Average Score: {data.aggregates.allTime.averageScore}</li>
                                <li>Best Score: {data.aggregates.allTime.bestScore}</li>
                            </ul>
                        </article>

                        <article className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Profile Breakdown (Daily)</h2>
                            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                                {Object.entries(data.aggregates.daily.profileBreakdown).map(([profile, count]) => (
                                    <li key={profile}>{profile}: {count}</li>
                                ))}
                            </ul>
                        </article>
                    </section>
                )}
            </div>
        </main>
    );
}

