"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClawMachine } from "@/components/ClawMachine";
import type { RoastResult } from "@/lib/roast-engine";
import Image from "next/image";
import Link from "next/link";

interface TickerData {
    btc: number | null;
    eth: number | null;
    claw: number | null;
    fdv: number | null;
    users: number;
    roasts: number;
}

const USD_COMPACT = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
});

const USD_2 = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const NUMBER_INT = new Intl.NumberFormat("en-US");

function formatUsd(value: number | null, tiny = false): string {
    if (value === null) {
        return "--";
    }
    if (tiny) {
        return value < 0.01 ? `$${value.toFixed(6)}` : USD_2.format(value);
    }
    return USD_2.format(value);
}

export default function Home() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RoastResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ticker, setTicker] = useState<TickerData>({
        btc: null,
        eth: null,
        claw: null,
        fdv: null,
        users: 0,
        roasts: 0,
    });

    useEffect(() => {
        let mounted = true;

        const pullTicker = async () => {
            try {
                const res = await fetch("/api/ticker", { cache: "no-store" });
                if (!res.ok) {
                    return;
                }
                const data = await res.json() as TickerData;
                if (mounted) {
                    setTicker(data);
                }
            } catch {
                // Keep previous ticker snapshot on transient failures.
            }
        };

        pullTicker();
        const timer = setInterval(pullTicker, 60_000);
        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, []);

    const handleRoast = async () => {
        const normalizedUsername = username.trim().replace(/^@/, "");
        if (!normalizedUsername) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch("/api/roast", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: normalizedUsername }),
            });

            const data = await response.json() as RoastResult & { error?: string };
            if (!response.ok) {
                throw new Error(data.error ?? "Roast request failed.");
            }

            setResult(data);
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : "Roast request failed.";
            setError(message);
        }

        setLoading(false);
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center p-6 pb-16 pt-28 sm:px-16 sm:pt-32 overflow-hidden bg-background">

            {/* Background Effects */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="z-30 absolute top-8 left-0 right-0 flex justify-between px-8 sm:px-16 font-mono text-xs sm:text-sm text-neutral-500 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <Image
                        src="/clawcook-logo.png"
                        alt="ClawCook Logo"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover scale-125"
                    />
                    <span className="font-bold">ClawCook</span>
                </span>
                <div className="flex items-center gap-5">
                    <Link href="/about" className="hover:text-primary transition-colors">
                        About Us
                    </Link>
                    <Link href="/docs" className="hover:text-primary transition-colors">
                        Docs
                    </Link>
                    <Link href="/faq" className="hover:text-primary transition-colors">
                        FAQ
                    </Link>
                    <Link href="/contact" className="hover:text-primary transition-colors">
                        Contact
                    </Link>
                    <Link href="/leaderboard" className="hover:text-primary transition-colors">
                        Leaderboard
                    </Link>
                    <Link href="/metrics" className="hover:text-primary transition-colors">
                        Metrics
                    </Link>
                    <a href="https://base.org" target="_blank" className="hover:text-primary transition-colors">
                        System: Online
                    </a>
                </div>
            </div>

            <section className="z-20 w-full max-w-5xl text-center mb-14 sm:mb-16">
                <p className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    ClawCook Protocol
                </p>
                <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-white sm:text-6xl">
                    The first roast-to-earn arena for Farcaster personalities.
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-sm text-neutral-300 sm:text-base">
                    Drop a handle, trigger the claw, and let the engine score your social aura. ClawCook turns playful roasting into an onchain mini-game where every pull has a payoff.
                </p>
                <div className="mt-7 flex items-center justify-center gap-3">
                    <a
                        href="#roast-console"
                        className="rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                    >
                        Start Roasting
                    </a>
                    <Link
                        href="/about"
                        className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-100 transition-colors hover:border-primary/50 hover:text-primary"
                    >
                        Learn More
                    </Link>
                </div>
            </section>

            <div id="roast-console" className="z-20 w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 sm:gap-24">

                {/* The Claw Section */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative glass-panel rounded-2xl p-8 sm:p-12 hover:border-primary/30 transition-colors duration-500">
                        <ClawMachine isGrabbing={loading} />
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex-1 w-full max-w-sm flex flex-col gap-6">
                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white glow-text">
                            ROAST<span className="text-primary">.EXE</span>
                        </h2>
                        <p className="text-neutral-400 text-sm sm:text-base font-mono">
                            Insert handle. Get cooked. Earn $CLAW.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="@farcaster_handle"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-4 glass-input rounded-xl text-center md:text-left font-mono text-lg outline-none"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs font-mono">
                                FC_V2
                            </div>
                        </div>

                        <button
                            onClick={handleRoast}
                            disabled={loading}
                            className="w-full relative overflow-hidden group p-4 bg-primary hover:bg-secondary rounded-xl font-bold uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-50 disabled:grayscale"
                        >
                            <span className="relative z-10">{loading ? "INITIALIZING..." : "INITIATE PROTOCOL"}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Terminal Output / Result */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="glass-panel rounded-xl p-4 overflow-hidden border-l-4 border-l-primary"
                            >
                                <div className="font-mono text-xs text-primary mb-2 flex justify-between">
                                    <span>Analysis Complete</span>
                                    <span>Score: {result.score}</span>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-1">{result.profile}</h2>
                                <p className="text-neutral-300 text-sm italic">
                                    &ldquo;{result.roast}&rdquo;
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Ticker mockup */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/50 border-t border-white/5 flex items-center px-4 font-mono text-[10px] sm:text-xs text-neutral-600 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee flex gap-8">
                    <span>BTC: {formatUsd(ticker.btc)}</span>
                    <span>ETH: {formatUsd(ticker.eth)}</span>
                    <span>CLAW: {formatUsd(ticker.claw, true)}</span>
                    <span>FDV: {ticker.fdv === null ? "--" : USD_COMPACT.format(ticker.fdv)}</span>
                    <span>USERS: {NUMBER_INT.format(ticker.users)}</span>
                    <span>ROASTS: {NUMBER_INT.format(ticker.roasts)}</span>
                </div>
            </div>
        </main >
    );
}
