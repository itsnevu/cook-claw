"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClawMachineProps {
    isGrabbing: boolean;
}

const DROP_DURATION = 0.58;

export function ClawMachine({ isGrabbing }: ClawMachineProps) {
    return (
        <div className="relative h-64 w-full overflow-hidden sm:h-80 sm:w-80">
            <div className="absolute left-1/2 top-1 h-2 w-36 -translate-x-1/2 rounded-full bg-white/8" />

            <motion.div
                className="absolute left-1/2 top-3 z-10 -translate-x-1/2"
                animate={isGrabbing ? { x: 0, y: 0 } : { x: [0, -3, 3, 0], y: [0, 1, -1, 0] }}
                transition={isGrabbing ? { duration: 0.2 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.div
                    className="mx-auto w-[2px] bg-gradient-to-b from-neutral-700 via-neutral-500 to-neutral-300"
                    animate={{ height: isGrabbing ? 154 : 44 }}
                    transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                />

                <motion.div
                    className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center"
                    animate={{ y: isGrabbing ? 154 : 44 }}
                    transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                >
                    <div className="relative h-10 w-16 rounded-t-md border border-white/10 bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-lg shadow-black/50">
                        <div className="absolute inset-0 rounded-t-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="flex h-full items-center justify-center">
                            <motion.div
                                className={cn(
                                    "h-3 w-3 rounded-full shadow-[0_0_12px_currentColor]",
                                    isGrabbing ? "bg-primary text-primary" : "bg-emerald-400 text-emerald-400"
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
                        className="-mt-1"
                        animate={isGrabbing ? { rotate: 0 } : { rotate: [0, -1.5, 1.5, 0] }}
                        transition={isGrabbing ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <rect x="67" y="10" width="6" height="20" rx="3" fill="rgb(255 106 26)" />
                        <circle cx="70" cy="36" r="8.5" fill="rgb(255 106 26)" stroke="rgba(255, 165, 115, 0.45)" />
                        <circle cx="70" cy="36" r="3" fill="rgb(255 198 157)" />
                        <rect x="58" y="42" width="24" height="5" rx="2.5" fill="rgb(255 106 26)" opacity="0.92" />
                        <circle cx="58" cy="44.5" r="2.2" fill="rgb(255 198 157)" />
                        <circle cx="82" cy="44.5" r="2.2" fill="rgb(255 198 157)" />

                        <g transform="translate(70 44)">
                            <motion.g
                                style={{ transformOrigin: "0px 0px" }}
                                animate={{ rotate: isGrabbing ? -46 : -4 }}
                                transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                            >
                                <path d="M0 0 L-14 20 L-23 40" fill="none" stroke="rgb(255 106 26)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M-23 40 L-15 32" fill="none" stroke="rgb(255 106 26)" strokeWidth="4" strokeLinecap="round" />
                                <path d="M-23 40 L-14 48" fill="none" stroke="rgb(255 106 26)" strokeWidth="4" strokeLinecap="round" />
                            </motion.g>
                        </g>

                        <g transform="translate(70 44)">
                            <motion.g
                                style={{ transformOrigin: "0px 0px" }}
                                animate={{ rotate: isGrabbing ? 46 : 4 }}
                                transition={{ duration: isGrabbing ? DROP_DURATION : 0.22, ease: isGrabbing ? "easeIn" : "easeOut" }}
                            >
                                <path d="M0 0 L14 20 L23 40" fill="none" stroke="rgb(255 106 26)" strokeWidth="6" strokeLinecap="round" />
                                <path d="M23 40 L15 32" fill="none" stroke="rgb(255 106 26)" strokeWidth="4" strokeLinecap="round" />
                                <path d="M23 40 L14 48" fill="none" stroke="rgb(255 106 26)" strokeWidth="4" strokeLinecap="round" />
                            </motion.g>
                        </g>

                        <circle cx="70" cy="44" r="4" fill="rgb(255 198 157)" stroke="rgba(255, 106, 26, 0.65)" />
                    </motion.svg>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute bottom-8 left-1/2 h-8 w-36 -translate-x-1/2 rounded-[100%] bg-black/45 blur-xl"
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
        </div>
    );
}
