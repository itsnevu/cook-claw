"use client";

import { motion } from "framer-motion";

interface ClawMachineProps {
    isGrabbing: boolean;
}

export function ClawMachine({ isGrabbing }: ClawMachineProps) {
    return (
        <div className="relative w-64 h-64 flex justify-center items-start">
            {/* The Rope */}
            <motion.div
                className="absolute w-1 bg-gradient-to-b from-gray-500 to-gray-700 top-0"
                initial={{ height: 50 }}
                animate={{ height: isGrabbing ? 200 : 50 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />

            {/* The Claw Mechanism */}
            <motion.div
                className="absolute top-[50px]"
                animate={{ top: isGrabbing ? 200 : 50 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <div className="relative w-16 h-12 bg-gray-800 rounded-t-lg border border-gray-600 shadow-xl shadow-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse box-shadow-glow" />
                </div>

                {/* Left Claw */}
                <motion.div
                    className="absolute -left-4 top-8 w-4 h-16 border-l-4 border-b-4 border-gray-400 rounded-bl-full origin-top-right"
                    animate={{ rotate: isGrabbing ? -15 : -45 }}
                    transition={{ duration: 0.5, delay: isGrabbing ? 1 : 0 }}
                />

                {/* Right Claw */}
                <motion.div
                    className="absolute -right-4 top-8 w-4 h-16 border-r-4 border-b-4 border-gray-400 rounded-br-full origin-top-left"
                    animate={{ rotate: isGrabbing ? 15 : 45 }}
                    transition={{ duration: 0.5, delay: isGrabbing ? 1 : 0 }}
                />
            </motion.div>
        </div>
    );
}
