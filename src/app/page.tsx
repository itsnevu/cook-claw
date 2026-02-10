"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClawMachine } from "@/components/ClawMachine";
import { generateRoast, RoastResult } from "@/lib/roast-engine";

export default function Home() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RoastResult | null>(null);

    const handleRoast = async () => {
        if (!username) return;
        setLoading(true);
        setResult(null);

        // Mock history fetch
        const mockHistory = [{ text: "gm wagmi", timestamp: "now", likes: 10 }];
        const roastData = await generateRoast(username, mockHistory);

        setResult(roastData);
        setLoading(false);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-background text-foreground overflow-hidden relative">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                <p className="fixed left-0 top-0 flex w-full justify-center border-b border-border bg-background pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    SnarkClaw v1.0
                </p>
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <a
                        className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                        href="https://base.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        On Base
                    </a>
                </div>
            </div>

            <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-primary before:opacity-10 before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-secondary after:via-primary after:opacity-40 after:blur-2xl z-[-1]">
                <ClawMachine isGrabbing={loading} />
            </div>

            <div className="mb-32 grid text-center w-full max-w-lg">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="@farcaster_handle"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-4 rounded-lg bg-card border border-border text-center text-xl focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                        onClick={handleRoast}
                        disabled={loading}
                        className="p-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-secondary disabled:opacity-50 transition-colors uppercase tracking-widest"
                    >
                        {loading ? "Aligning Claws..." : "Roast Me"}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-8 p-6 border border-primary/50 bg-primary/10 rounded-xl"
                        >
                            <h2 className="text-2xl font-bold mb-2 text-primary">{result.profile}</h2>
                            <p className="text-lg italic">"{result.roast}"</p>
                            <div className="mt-4 text-xs text-muted-foreground">
                                Social Score: {result.score}/100
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
