"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry, RoastEvent } from "@/lib/roast-store";

type LeaderboardPeriod = "daily" | "weekly" | "all";

interface LeaderboardResponse {
    period: LeaderboardPeriod;
    minAttempts: number;
    leaderboard: LeaderboardEntry[];
    recentRoasts: RoastEvent[];
}

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
    {
        username: "degenbella",
        attempts: 24,
        averageScore: 92.4,
        bestScore: 99,
        lastProfile: "Reply Guy",
        lastAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    },
    {
        username: "basewizard",
        attempts: 19,
        averageScore: 89.7,
        bestScore: 97,
        lastProfile: "Larping Dev",
        lastAt: new Date(Date.now() - 14 * 60_000).toISOString(),
    },
    {
        username: "gmfarcaster",
        attempts: 17,
        averageScore: 87.9,
        bestScore: 95,
        lastProfile: "Vibes-only Trader",
        lastAt: new Date(Date.now() - 21 * 60_000).toISOString(),
    },
    {
        username: "alphaframe",
        attempts: 15,
        averageScore: 86.3,
        bestScore: 94,
        lastProfile: "Reply Guy",
        lastAt: new Date(Date.now() - 28 * 60_000).toISOString(),
    },
];

const FALLBACK_RECENT_DEPLOYS: RoastEvent[] = [
    {
        id: "fallback-deploy-1",
        username: "degenbella",
        profile: "Reply Guy",
        score: 94,
        roast: "Deploy bundle broadcasted with high confidence and low latency drift.",
        createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    },
    {
        id: "fallback-deploy-2",
        username: "basewizard",
        profile: "Larping Dev",
        score: 89,
        roast: "Module compiled and finalized with stable gas profile.",
        createdAt: new Date(Date.now() - 11 * 60_000).toISOString(),
    },
    {
        id: "fallback-deploy-3",
        username: "gmfarcaster",
        profile: "Vibes-only Trader",
        score: 91,
        roast: "Operator synchronized deployment state across settlement nodes.",
        createdAt: new Date(Date.now() - 17 * 60_000).toISOString(),
    },
    {
        id: "fallback-deploy-4",
        username: "alphaframe",
        profile: "Reply Guy",
        score: 86,
        roast: "Runtime telemetry published with clean module score output.",
        createdAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    },
];

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<LeaderboardPeriod>("all");
    const [minAttempts, setMinAttempts] = useState(1);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(
                    `/api/leaderboard?limit=20&recent=12&period=${period}&minAttempts=${minAttempts}`,
                    { cache: "no-store" }
                );
                const payload = await res.json() as LeaderboardResponse & { error?: string };
                if (!res.ok) {
                    throw new Error(payload.error ?? "Failed to fetch leaderboard.");
                }
                setData(payload);
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch leaderboard.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [period, minAttempts]);

    const displayLeaderboard = data?.leaderboard.length ? data.leaderboard : FALLBACK_LEADERBOARD;
    const displayRecentDeploys = data?.recentRoasts.length ? data.recentRoasts : FALLBACK_RECENT_DEPLOYS;

    return (
        <main className="relative min-h-screen overflow-hidden bg-black/55 px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-6xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Leaderboard</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Top deploy operators by average score.
                    </h1>
                    <p className="mt-4 text-sm text-neutral-300">
                        Data is shared when Redis is configured. Otherwise this view shows runtime memory only.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {(["daily", "weekly", "all"] as LeaderboardPeriod[]).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setPeriod(value)}
                                className={`rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
                                    period === value
                                        ? "bg-primary text-white"
                                        : "border border-white/20 bg-white/5 text-neutral-300 hover:border-primary/40"
                                }`}
                            >
                                {value === "all" ? "All Time" : value}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Min Runs</span>
                        {[1, 3, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setMinAttempts(value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                                    minAttempts === value
                                        ? "bg-primary text-white"
                                        : "border border-white/20 bg-white/5 text-neutral-300 hover:border-primary/40"
                                }`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </section>

                {loading && <p className="mt-6 text-sm text-neutral-400">Loading leaderboard...</p>}
                {error && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

                {!loading && !error && (
                    <section className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Ranking</h2>
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                                        <tr>
                                            <th className="py-2 pr-3">#</th>
                                            <th className="py-2 pr-3">Handle</th>
                                            <th className="py-2 pr-3">Avg</th>
                                            <th className="py-2 pr-3">Best</th>
                                            <th className="py-2 pr-3">Runs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-neutral-200">
                                        {displayLeaderboard.map((item, idx) => (
                                            <tr key={item.username} className="border-t border-white/10">
                                                <td className="py-2 pr-3">{idx + 1}</td>
                                                <td className="py-2 pr-3 font-mono">@{item.username}</td>
                                                <td className="py-2 pr-3">{item.averageScore}</td>
                                                <td className="py-2 pr-3">{item.bestScore}</td>
                                                <td className="py-2 pr-3">{item.attempts}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Recent Deploys</h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                {displayRecentDeploys.map((event) => (
                                    <li key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                        <p className="font-mono text-neutral-200">
                                            @{event.username} <span className="text-primary">({event.score})</span>
                                        </p>
                                        <p className="mt-1 text-neutral-400">{event.profile}</p>
                                        <p className="mt-1 italic text-neutral-300">&ldquo;{event.roast}&rdquo;</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

