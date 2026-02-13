"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClawMachineProps {
    isGrabbing: boolean;
}

const DROP_DURATION = 0.62;

export function ClawMachine({ isGrabbing }: ClawMachineProps) {
    return (
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(249,115,22,0.2),transparent_42%),linear-gradient(160deg,#030712,#0f172a_55%,#111827)] sm:h-80 sm:w-80">
            <div className="pointer-events-none absolute inset-0 opacity-30 bg-size-[16px_16px] bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]" />
            <div className="absolute left-1/2 top-2 h-2 w-44 -translate-x-1/2 rounded-full bg-cyan-200/20" />

            <motion.div
                className="absolute left-1/2 top-3 z-10 -translate-x-1/2"
                animate={isGrabbing ? { x: 0, y: 0 } : { x: [0, -3, 3, 0], y: [0, 1, -1, 0] }}
                transition={isGrabbing ? { duration: 0.2 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.div
                    className="mx-auto w-0.5 bg-linear-to-b from-cyan-300/80 via-cyan-200/45 to-cyan-100/20"
                    animate={{ height: isGrabbing ? 166 : 52 }}
                    transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                />

                <motion.div
                    className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center"
                    animate={{ y: isGrabbing ? 166 : 52 }}
                    transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                >
                    <div className="relative h-17 w-45 overflow-hidden rounded-xl border border-cyan-200/20 bg-linear-to-br from-slate-900/95 via-slate-900 to-slate-950 shadow-[0_18px_34px_rgba(2,6,23,0.7)]">
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-100/10 to-transparent" />
                        <div className="absolute left-3 top-2 rounded-md border border-cyan-200/20 bg-cyan-300/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-cyan-200">
                            NARASI X402
                        </div>
                        <div className="absolute right-3 top-2 rounded-md border border-orange-300/30 bg-orange-300/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-orange-200">
                            ERC-8004
                        </div>
                        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
                            <div className="rounded border border-cyan-300/20 bg-black/40 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-cyan-100/90">
                                Correlation Live
                            </div>
                            <motion.div
                                className={cn(
                                    "h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]",
                                    isGrabbing ? "bg-orange-300 text-orange-300" : "bg-cyan-300 text-cyan-300"
                                )}
                                animate={isGrabbing ? { scale: [1, 1.2, 1] } : { scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </div>

                    <motion.svg
                        viewBox="0 0 140 134"
                        width="140"
                        height="134"
                        className="-mt-1 drop-shadow-[0_10px_20px_rgba(15,23,42,0.45)]"
                        animate={isGrabbing ? { rotate: 0 } : { rotate: [0, -1.5, 1.5, 0] }}
                        transition={isGrabbing ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <rect x="67" y="10" width="6" height="20" rx="3" fill="rgb(34 211 238)" />
                        <circle cx="70" cy="36" r="8.5" fill="rgb(34 211 238)" stroke="rgba(6,182,212,0.45)" />
                        <circle cx="70" cy="36" r="3" fill="rgb(186 230 253)" />
                        <rect x="58" y="42" width="24" height="5" rx="2.5" fill="rgb(251 146 60)" opacity="0.95" />
                        <circle cx="58" cy="44.5" r="2.2" fill="rgb(255 237 213)" />
                        <circle cx="82" cy="44.5" r="2.2" fill="rgb(255 237 213)" />

                        <g transform="translate(70 44)">
                            <motion.g
                                style={{ transformOrigin: "0px 0px" }}
                                animate={{ rotate: isGrabbing ? -46 : -4 }}
                                transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                            >
                                <path d="M0 0 L-14 20 L-23 40" fill="none" stroke="rgb(251 146 60)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M-23 40 L-15 32" fill="none" stroke="rgb(251 146 60)" strokeWidth="4" strokeLinecap="round" />
                                <path d="M-23 40 L-14 48" fill="none" stroke="rgb(251 146 60)" strokeWidth="4" strokeLinecap="round" />
                            </motion.g>
                        </g>

                        <g transform="translate(70 44)">
                            <motion.g
                                style={{ transformOrigin: "0px 0px" }}
                                animate={{ rotate: isGrabbing ? 46 : 4 }}
                                transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                            >
                                <path d="M0 0 L14 20 L23 40" fill="none" stroke="rgb(251 146 60)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M23 40 L15 32" fill="none" stroke="rgb(251 146 60)" strokeWidth="4" strokeLinecap="round" />
                                <path d="M23 40 L14 48" fill="none" stroke="rgb(251 146 60)" strokeWidth="4" strokeLinecap="round" />
                            </motion.g>
                        </g>

                        <circle cx="70" cy="44" r="4" fill="rgb(255 237 213)" stroke="rgba(251,146,60,0.65)" />
                    </motion.svg>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute bottom-9 left-1/2 h-8 w-44 -translate-x-1/2 rounded-[100%] bg-cyan-900/45 blur-xl"
                animate={
                    isGrabbing
                        ? { scaleX: 1.58, opacity: 0.92 }
                        : { scaleX: [1.2, 1.36, 1.2], opacity: [0.45, 0.72, 0.45] }
                }
                transition={
                    isGrabbing
                        ? { duration: DROP_DURATION, ease: "easeIn" }
                        : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                }
            />

            <div className="absolute bottom-2 left-2 right-2 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.13em]">
                <motion.div
                    className="rounded-md border border-cyan-300/20 bg-cyan-950/55 px-2 py-1 text-cyan-100/90"
                    animate={isGrabbing ? { opacity: [0.55, 1, 0.55] } : { opacity: [0.45, 0.78, 0.45] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    X402 stream lock
                </motion.div>
                <motion.div
                    className="rounded-md border border-orange-300/25 bg-orange-950/40 px-2 py-1 text-orange-100/90"
                    animate={isGrabbing ? { opacity: [0.55, 1, 0.55] } : { opacity: [0.45, 0.78, 0.45] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                >
                    ERC-8004 sync
                </motion.div>
            </div>
        </div>
    );
}
