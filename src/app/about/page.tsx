import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About Us | ClawCook",
    description: "What ClawCook is, how roast-to-earn works, and why it exists.",
};

const pillars = [
    {
        title: "Social Signal Engine",
        body: "ClawCook reads public behavior patterns and transforms them into roast-style personas, making profile analysis entertaining instead of dry.",
    },
    {
        title: "Roast-to-Earn Loop",
        body: "Each roast pull is built like an arcade action: input a handle, trigger the machine, and unlock score-driven outcomes around $CLAW.",
    },
    {
        title: "Onchain Game Identity",
        body: "The project combines meme culture and measurable interaction into a product identity that can live natively across Base-native communities.",
    },
];

export default function AboutPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">About Us</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        ClawCook turns Farcaster profiles into a playable onchain roast arena.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        We are building a product where humor, identity, and crypto-native incentives can coexist in one interaction loop. Instead of static profile tooling, users get a dramatic claw-machine interface that analyzes a handle and returns a signature roast persona with a score.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    {pillars.map((item) => (
                        <article key={item.title} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 glass-panel rounded-2xl p-7 sm:p-10">
                    <h2 className="text-2xl font-bold text-white">How It Works</h2>
                    <ol className="mt-4 space-y-3 text-sm text-neutral-300">
                        <li>1. Enter a Farcaster handle in the roast console.</li>
                        <li>2. Trigger the claw to run the persona and roast engine.</li>
                        <li>3. Receive a profile label, roast quote, and score output.</li>
                        <li>4. Use the result in social loops and campaign mechanics around $CLAW.</li>
                    </ol>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                        >
                            Launch Roast Console
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
