"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LeaderboardEntry, RoastEvent } from "@/lib/roast-store";

type LeaderboardPeriod = "daily" | "weekly" | "all";

interface LeaderboardResponse {
    period: LeaderboardPeriod;
    minAttempts: number;
    leaderboard: LeaderboardEntry[];
    recentRoasts: RoastEvent[];
}

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

    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-6xl">
                <nav className="mb-10 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-neutral-500">
                    <span>ClawCook / Leaderboard</span>
                    <div className="flex items-center gap-4">
                        <Link href="/about" className="transition-colors hover:text-primary">About</Link>
                        <Link href="/docs" className="transition-colors hover:text-primary">Docs</Link>
                        <Link href="/faq" className="transition-colors hover:text-primary">FAQ</Link>
                        <Link href="/contact" className="transition-colors hover:text-primary">Contact</Link>
                        <Link href="/metrics" className="transition-colors hover:text-primary">Metrics</Link>
                        <Link href="/analytics" className="transition-colors hover:text-primary">Analytics</Link>
                        <Link href="/" className="transition-colors hover:text-primary">Back to Roast</Link>
                    </div>
                </nav>

                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Leaderboard</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Top roasted handles by average score.
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
                                        {data?.leaderboard.length ? data.leaderboard.map((item, idx) => (
                                            <tr key={item.username} className="border-t border-white/10">
                                                <td className="py-2 pr-3">{idx + 1}</td>
                                                <td className="py-2 pr-3 font-mono">@{item.username}</td>
                                                <td className="py-2 pr-3">{item.averageScore}</td>
                                                <td className="py-2 pr-3">{item.bestScore}</td>
                                                <td className="py-2 pr-3">{item.attempts}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-neutral-400">No data yet. Run some roasts first.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white">Recent Roasts</h2>
                            <ul className="mt-4 space-y-3 text-sm">
                                {data?.recentRoasts.length ? data.recentRoasts.map((event) => (
                                    <li key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                        <p className="font-mono text-neutral-200">
                                            @{event.username} <span className="text-primary">({event.score})</span>
                                        </p>
                                        <p className="mt-1 text-neutral-400">{event.profile}</p>
                                        <p className="mt-1 italic text-neutral-300">&ldquo;{event.roast}&rdquo;</p>
                                    </li>
                                )) : (
                                    <li className="text-neutral-400">No roast activity yet.</li>
                                )}
                            </ul>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
