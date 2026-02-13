"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
    { href: "/about", label: "About" },
    { href: "/docs", label: "Docs" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/metrics", label: "Metrics" },
    { href: "/analytics", label: "Analytics" },
    { href: "/setup", label: "Setup" },
];

export function Navbar({ pageLabel }: { pageLabel?: string }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        if (typeof window === "undefined") {
            return true;
        }
        try {
            const raw = window.localStorage.getItem("clawcook.notifications.enabled");
            if (raw !== null) {
                return raw === "1";
            }
        } catch {
            // Ignore storage access errors.
        }
        return true;
    });

    const handleToggleNotifications = () => {
        const next = !notificationsEnabled;
        setNotificationsEnabled(next);
        try {
            window.localStorage.setItem("clawcook.notifications.enabled", next ? "1" : "0");
        } catch {
            // Ignore storage write errors.
        }
        window.dispatchEvent(new CustomEvent("clawcook:notifications-toggle", { detail: { enabled: next } }));
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-12">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/clawcook-logo.png"
                            alt="X402 Protocol Logo"
                            width={48}
                            height={48}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="text-white">
                            <div className="text-sm font-semibold tracking-widest">X402 Console</div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                                ERC-8004 Correlator
                            </div>
                        </div>
                    </Link>
                    {pageLabel ? (
                        <span className="hidden text-xs font-mono uppercase tracking-widest text-neutral-500 sm:inline">
                            {pageLabel}
                        </span>
                    ) : null}
                </div>
                <div className="flex items-center gap-3">
                    <nav className="hidden items-center gap-5 text-xs font-mono uppercase tracking-widest text-neutral-400 lg:flex">
                        {NAV_LINKS.map((item) => (
                            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary">
                                {item.label}
                            </Link>
                        ))}
                        <a href="https://base.org" target="_blank" rel="noreferrer" className="transition-colors hover:text-primary">
                            System: Online
                        </a>
                    </nav>

                    <button
                        type="button"
                        onClick={handleToggleNotifications}
                        aria-label={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                        className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-neutral-300 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true" className="shrink-0">
                            <rect
                                x="1"
                                y="1"
                                width="32"
                                height="18"
                                rx="9"
                                fill={notificationsEnabled ? "hsla(188, 84%, 53%, 0.25)" : "rgba(255,255,255,0.08)"}
                                stroke={notificationsEnabled ? "hsl(188, 84%, 53%)" : "rgba(255,255,255,0.3)"}
                                strokeWidth="1"
                            />
                            <g
                                style={{
                                    transform: `translateX(${notificationsEnabled ? 14 : 0}px)`,
                                    transition: "transform 180ms ease",
                                }}
                            >
                                <circle
                                    cx="10"
                                    cy="10"
                                    r="6"
                                    fill={notificationsEnabled ? "hsl(188, 84%, 53%)" : "rgb(212,212,212)"}
                                />
                            </g>
                        </svg>
                        <span className="hidden sm:inline">{notificationsEnabled ? "Notif On" : "Notif Off"}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
