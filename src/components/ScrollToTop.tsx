"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 320;
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const nextProgress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

            setVisible(scrollTop > SHOW_AFTER_PX);
            setProgress(nextProgress);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const dashOffset = CIRCUMFERENCE * (1 - progress);

    return (
        <button
            type="button"
            aria-label="Scroll to top"
            title="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={[
                "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full",
                "border border-white/15 bg-black/50 text-white backdrop-blur-xl",
                "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
                "transition-all duration-300 ease-out",
                "hover:scale-105 hover:border-primary/55 hover:shadow-[0_12px_35px_rgba(230,81,0,0.35)]",
                "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/45",
                visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
            ].join(" ")}
        >
            <span className="absolute inset-0 rounded-full bg-linear-to-br from-primary/35 to-secondary/20" />
            <svg
                viewBox="0 0 48 48"
                className="absolute inset-0 h-full w-full -rotate-90"
                aria-hidden="true"
            >
                <circle
                    cx="24"
                    cy="24"
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.16)"
                    strokeWidth="2.5"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={RADIUS}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <span className="relative z-10 flex h-full w-full items-center justify-center">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                >
                    <path d="M12 18V6" />
                    <path d="m6.5 11.5 5.5-5.5 5.5 5.5" />
                </svg>
            </span>
        </button>
    );
}

