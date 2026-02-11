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
    return (
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-12">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/clawcook-logo.png"
                            alt="ClawCook Logo"
                            width={48}
                            height={48}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="text-white">
                            <div className="text-sm font-semibold uppercase tracking-widest">ClawCook</div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                                Roast Protocol
                            </div>
                        </div>
                    </Link>
                    {pageLabel ? (
                        <span className="hidden text-xs font-mono uppercase tracking-widest text-neutral-500 sm:inline">
                            {pageLabel}
                        </span>
                    ) : null}
                </div>
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
            </div>
        </header>
    );
}
