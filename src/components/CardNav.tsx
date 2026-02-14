"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

export type CardNavLink = {
    label: string;
    href: string;
    ariaLabel: string;
};

export type CardNavItem = {
    label: string;
    bgColor: string;
    textColor: string;
    links: CardNavLink[];
};

interface CardNavProps {
    logoSrc: string;
    logoAlt?: string;
    items: CardNavItem[];
    className?: string;
    ease?: string;
    baseColor?: string;
    menuColor?: string;
    buttonBgColor?: string;
    buttonTextColor?: string;
    actionLabel?: string;
    actionHref?: string;
    onActionClick?: () => void;
}

export function CardNav({
    logoSrc,
    logoAlt = "ClawCook Logo",
    items,
    className = "",
    ease = "power3.out",
    baseColor = "rgba(10, 10, 10, 0.9)",
    menuColor = "hsl(24 95% 56%)",
    buttonBgColor = "rgba(251, 146, 60, 0.15)",
    buttonTextColor = "hsl(24 95% 56%)",
    actionLabel = "System Online",
    actionHref = "https://base.org",
    onActionClick,
}: CardNavProps) {
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const navRef = useRef<HTMLDivElement | null>(null);
    const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const calculateHeight = () => {
        const navEl = navRef.current;
        if (!navEl) {
            return 264;
        }

        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        if (isMobile) {
            const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement | null;
            if (!contentEl) {
                return 264;
            }

            const prevVisibility = contentEl.style.visibility;
            const prevPointerEvents = contentEl.style.pointerEvents;
            const prevPosition = contentEl.style.position;
            const prevHeight = contentEl.style.height;

            contentEl.style.visibility = "visible";
            contentEl.style.pointerEvents = "auto";
            contentEl.style.position = "static";
            contentEl.style.height = "auto";

            const topBar = 64;
            const padding = 16;
            const total = topBar + contentEl.scrollHeight + padding;

            contentEl.style.visibility = prevVisibility;
            contentEl.style.pointerEvents = prevPointerEvents;
            contentEl.style.position = prevPosition;
            contentEl.style.height = prevHeight;

            return total;
        }

        return 264;
    };

    const createTimeline = () => {
        const navEl = navRef.current;
        if (!navEl) {
            return null;
        }

        gsap.set(navEl, { height: 64, overflow: "hidden" });
        gsap.set(cardsRef.current, { y: 40, opacity: 0 });

        const tl = gsap.timeline({ paused: true });
        tl.to(navEl, {
            height: calculateHeight,
            duration: 0.42,
            ease,
        });
        tl.to(
            cardsRef.current,
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease,
                stagger: 0.07,
            },
            "-=0.12"
        );

        return tl;
    };

    useLayoutEffect(() => {
        const tl = createTimeline();
        tlRef.current = tl;
        return () => {
            tl?.kill();
            tlRef.current = null;
        };
    }, [ease, items]);

    useLayoutEffect(() => {
        const onResize = () => {
            const tl = tlRef.current;
            if (!tl) {
                return;
            }

            if (isExpanded) {
                gsap.set(navRef.current, { height: calculateHeight() });
            }

            tl.kill();
            const next = createTimeline();
            if (!next) {
                return;
            }
            if (isExpanded) {
                next.progress(1);
            }
            tlRef.current = next;
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [isExpanded]);

    const toggleMenu = () => {
        const tl = tlRef.current;
        if (!tl) {
            return;
        }

        if (!isExpanded) {
            setIsHamburgerOpen(true);
            setIsExpanded(true);
            tl.play(0);
        } else {
            setIsHamburgerOpen(false);
            tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
            tl.reverse();
        }
    };

    const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
        cardsRef.current[index] = el;
    };

    return (
        <div className={`mx-auto w-full max-w-6xl px-6 sm:px-12 ${className}`}>
            <nav
                ref={navRef}
                className="relative block h-16 overflow-hidden rounded-2xl border border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)] will-change-[height]"
                style={{ backgroundColor: baseColor }}
            >
                <div className="absolute inset-x-0 top-0 z-[2] flex h-16 items-center justify-between px-3 sm:px-4">
                    <button
                        type="button"
                        className="group order-2 flex h-full cursor-pointer flex-col items-center justify-center gap-1.5 md:order-none"
                        onClick={toggleMenu}
                        aria-label={isExpanded ? "Close menu" : "Open menu"}
                    >
                        <span
                            className={`h-0.5 w-7 rounded-full bg-current transition-[transform,opacity] duration-300 ${
                                isHamburgerOpen ? "translate-y-1 rotate-45" : ""
                            }`}
                            style={{ color: menuColor }}
                        />
                        <span
                            className={`h-0.5 w-7 rounded-full bg-current transition-[transform,opacity] duration-300 ${
                                isHamburgerOpen ? "-translate-y-1 -rotate-45" : ""
                            }`}
                            style={{ color: menuColor }}
                        />
                    </button>

                    <Link
                        href="/"
                        className="order-1 flex items-center gap-3 text-white md:absolute md:left-1/2 md:top-1/2 md:order-none md:-translate-x-1/2 md:-translate-y-1/2"
                    >
                        <Image src={logoSrc} alt={logoAlt} width={132} height={36} className="h-9 w-auto object-contain" />
                        <div>
                            <p className="font-roxaine text-sm tracking-[0.1em]">ClawCook</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">X402 x ERC-8004</p>
                        </div>
                    </Link>

                    {onActionClick ? (
                        <button
                            type="button"
                            onClick={onActionClick}
                            className="hidden h-10 items-center rounded-xl border border-primary/25 px-3 text-xs font-mono uppercase tracking-widest transition-colors hover:border-primary/45 md:inline-flex"
                            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                        >
                            {actionLabel}
                        </button>
                    ) : (
                        <a
                            href={actionHref}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden h-10 items-center rounded-xl border border-primary/25 px-3 text-xs font-mono uppercase tracking-widest transition-colors hover:border-primary/45 md:inline-flex"
                            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                        >
                            {actionLabel}
                        </a>
                    )}
                </div>

                <div
                    className={`card-nav-content absolute inset-x-0 bottom-0 top-16 z-[1] flex flex-col gap-2 p-2 ${
                        isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
                    } md:flex-row md:items-end md:gap-3`}
                    aria-hidden={!isExpanded}
                >
                    {items.slice(0, 3).map((item, index) => (
                        <div
                            key={`${item.label}-${index}`}
                            ref={setCardRef(index)}
                            className="relative flex min-h-16 flex-1 select-none flex-col gap-2 rounded-xl border border-white/10 p-4"
                            style={{ backgroundColor: item.bgColor, color: item.textColor }}
                        >
                            <p className="text-xl tracking-tight md:text-2xl">{item.label}</p>
                            <div className="mt-auto flex flex-col gap-1.5">
                                {item.links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        aria-label={link.ariaLabel}
                                        className="inline-flex items-center gap-1.5 text-sm text-white/90 transition-opacity hover:opacity-75"
                                        onClick={() => {
                                            const tl = tlRef.current;
                                            if (!tl) {
                                                return;
                                            }
                                            setIsHamburgerOpen(false);
                                            tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
                                            tl.reverse();
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
                                            <path d="M3 11L11 3M11 3H4.8M11 3V9.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                        </svg>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>
        </div>
    );
}
