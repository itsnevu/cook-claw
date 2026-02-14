import Link from "next/link";
import Image from "next/image";

const PRODUCT_LINKS = [
    { href: "/about", label: "About" },
    { href: "/docs", label: "Docs" },
    { href: "/faq", label: "FAQ" },
    { href: "/leaderboard", label: "Leaderboard" },
];

const COMMUNITY_LINKS = [
    { href: "/metrics", label: "Metrics" },
    { href: "/analytics", label: "Analytics" },
    { href: "/contact", label: "Contact" },
    { href: "/setup", label: "Setup" },
];

const RESOURCE_LINKS = [
    { href: "/docs", label: "Developer Guide" },
    { href: "/faq", label: "Support" },
    { href: "/contact", label: "Press" },
    { href: "https://base.org", label: "System Status", external: true },
];

const LEGAL_LINKS = [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/security", label: "Security" },
    { href: "/licenses", label: "Licenses" },
];

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-400 transition-colors hover:text-primary"
            >
                {label}
            </a>
        );
    }

    return (
        <Link href={href} className="text-sm text-neutral-400 transition-colors hover:text-primary">
            {label}
        </Link>
    );
}

export function Footer() {
    return (
        <footer className="relative mt-0 bg-black/60 px-6 py-12 sm:px-12">
            <div className="absolute inset-0 opacity-30 grid-bg pointer-events-none" />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/CLAWCOOK-removebg.png"
                                alt="ClawCook Logo"
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-full object-cover"
                            />
                            <div>
                                <div className="text-lg font-semibold text-white font-roxaine">ClawCook</div>
                                <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                                    ERC-8004 Narrative Layer
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-300">
                            A correlation-first interface for onchain identity narratives, built for Farcaster-native communities and backed by live metrics, settlement telemetry, and transparent status reporting.
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-neutral-500">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                            System Online
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-4 md:w-auto">
                        <div className="space-y-3">
                            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">Product</div>
                            <div className="flex flex-col gap-2">
                                {PRODUCT_LINKS.map((item) => (
                                    <FooterLink key={item.href} {...item} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">Community</div>
                            <div className="flex flex-col gap-2">
                                {COMMUNITY_LINKS.map((item) => (
                                    <FooterLink key={item.href} {...item} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">Resources</div>
                            <div className="flex flex-col gap-2">
                                {RESOURCE_LINKS.map((item) => (
                                    <FooterLink key={item.href} {...item} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500">Legal</div>
                            <div className="flex flex-col gap-2">
                                {LEGAL_LINKS.map((item) => (
                                    <FooterLink key={item.href} {...item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>(c) 2026 ClawCook. All rights reserved.</span>
                    <div className="flex flex-wrap gap-4 font-mono uppercase tracking-widest text-[10px] text-neutral-500">
                        <span>Version: 0.1.0</span>
                        <span>Region: iad1</span>
                        <span>Latency: 112ms</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}


