"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClawMachineProps {
    isGrabbing: boolean;
}

export function ClawMachine({ isGrabbing }: ClawMachineProps) {
    return (
        <div className="relative w-full h-64 sm:w-80 sm:h-80 flex justify-center items-start">

            {/* The Rope */}
            <div className="absolute top-0 w-[2px] h-full flex justify-center">
                <motion.div
                    className="w-[2px] bg-gradient-to-b from-neutral-700 via-neutral-500 to-neutral-400"
                    initial={{ height: 40 }}
                    animate={{ height: isGrabbing ? 180 : 40 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />
            </div>

            {/* The Claw Mechanism */}
            <motion.div
                className="absolute z-10 flex flex-col items-center"
                initial={{ top: 40 }}
                animate={{ top: isGrabbing ? 180 : 40 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                {/* Central Hub */}
                <div className="relative w-16 h-12 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-t-lg border border-white/10 shadow-lg shadow-black/50 flex items-center justify-center">
                    {/* Indicator Light */}
                    <div className={cn(
                        "w-3 h-3 rounded-full transition-colors duration-300 shadow-[0_0_10px_currentColor]",
                        isGrabbing ? "bg-primary text-primary" : "bg-green-500 text-green-500"
                    )} />

                    {/* Metallic Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-t-lg" />
                </div>

                {/* Claw Arms Container */}
                <div className="relative -mt-1">
                    {/* Left Claw */}
                    <motion.div
                        className="absolute right-[28px] -top-2 w-4 h-20 border-l-[6px] border-b-[6px] border-neutral-400 rounded-bl-[100px] origin-top-right shadow-sm"
                        animate={{ rotate: isGrabbing ? -15 : -35 }}
                        transition={{ duration: 0.5, delay: isGrabbing ? 1 : 0 }}
                    />

                    {/* Right Claw */}
                    <motion.div
                        className="absolute left-[28px] -top-2 w-4 h-20 border-r-[6px] border-b-[6px] border-neutral-400 rounded-br-[100px] origin-top-left shadow-sm"
                        animate={{ rotate: isGrabbing ? 15 : 35 }}
                        transition={{ duration: 0.5, delay: isGrabbing ? 1 : 0 }}
                    />
                </div>
            </motion.div>

            {/* Shadow/Target Zone */}
            <div className="absolute bottom-8 w-32 h-8 bg-black/40 blur-xl rounded-[100%] scale-x-150" />
        </div>
    );
}
