"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClawMachine } from "@/components/ClawMachine";
import { generateRoast, RoastResult } from "@/lib/roast-engine";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RoastResult | null>(null);

    const handleRoast = async () => {
        if (!username) return;
        setLoading(true);
        setResult(null);

        const mockHistory = [{ text: "gm wagmi", timestamp: "now", likes: 10 }];
        const roastData = await generateRoast(username, mockHistory);

        setResult(roastData);
        setLoading(false);
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden bg-background">

            {/* Background Effects */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="z-10 absolute top-8 left-0 right-0 flex justify-between px-8 sm:px-16 font-mono text-xs sm:text-sm text-neutral-500 uppercase tracking-widest">
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
                <a href="https://base.org" target="_blank" className="hover:text-primary transition-colors">
                    System: Online
                </a>
            </div>

            <div className="z-20 w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 sm:gap-24">

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
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white glow-text">
                            ROAST<span className="text-primary">.EXE</span>
                        </h1>
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
                                <p className="text-neutral-300 text-sm italic">"{result.roast}"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Ticker mockup */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/50 border-t border-white/5 flex items-center px-4 font-mono text-[10px] sm:text-xs text-neutral-600 overflow-hidden whitespace-nowrap">
                <div className="animate-marquee flex gap-8">
                    <span>BTC: $98,234.12</span>
                    <span>ETH: $3,452.90</span>
                    <span>CLAW: $0.00042</span>
                    <span>FDV: $4.2M</span>
                    <span>USERS: 12,402</span>
                    <span>ROASTS: 145,201</span>
                </div>
            </div>
        </main >
    );
}
