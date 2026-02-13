"use client";

import { useState } from "react";
import { CardNav, type CardNavItem } from "@/components/CardNav";

const NAV_GROUPS: CardNavItem[] = [
    {
        label: "Protocol",
        bgColor: "rgba(27, 10, 2, 0.96)",
        textColor: "#fff",
        links: [
            { label: "About", href: "/about", ariaLabel: "About ClawCook" },
            { label: "Docs", href: "/docs", ariaLabel: "ClawCook docs" },
            { label: "FAQ", href: "/faq", ariaLabel: "Frequently asked questions" },
        ],
    },
    {
        label: "Network",
        bgColor: "rgba(36, 12, 2, 0.96)",
        textColor: "#fff",
        links: [
            { label: "Leaderboard", href: "/leaderboard", ariaLabel: "Top deploy operators" },
            { label: "Metrics", href: "/metrics", ariaLabel: "Protocol metrics" },
            { label: "Analytics", href: "/analytics", ariaLabel: "Analytics dashboard" },
        ],
    },
    {
        label: "Support",
        bgColor: "rgba(47, 16, 3, 0.96)",
        textColor: "#fff",
        links: [
            { label: "Setup", href: "/setup", ariaLabel: "Setup guide" },
            { label: "Contact", href: "/contact", ariaLabel: "Contact page" },
            { label: "Terms", href: "/terms", ariaLabel: "Terms of service" },
        ],
    },
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
        <header className="fixed inset-x-0 top-0 z-40 py-3">
            <CardNav
                logoSrc="/clawcook-logo.png"
                logoAlt="ClawCook Logo"
                items={NAV_GROUPS}
                baseColor="rgba(0, 0, 0, 0.86)"
                menuColor="hsl(24 95% 56%)"
                buttonBgColor={notificationsEnabled ? "rgba(251, 146, 60, 0.18)" : "rgba(255,255,255,0.08)"}
                buttonTextColor={notificationsEnabled ? "hsl(24 95% 56%)" : "rgba(255,255,255,0.85)"}
                actionLabel={notificationsEnabled ? "Notif On" : "Notif Off"}
                onActionClick={handleToggleNotifications}
            />
            {pageLabel ? (
                <div className="mx-auto mt-2 w-full max-w-6xl px-6 sm:px-12">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">{pageLabel}</p>
                </div>
            ) : null}
        </header>
    );
}
