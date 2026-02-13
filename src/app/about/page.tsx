import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About Us | X402 Console",
    description: "What X402 Console is, how ERC-8004 correlation works, and why it exists.",
};

const pillars = [
    {
        title: "X402 Signal Engine",
        body: "X402 reads public behavior patterns and transforms them into narrative signal profiles so identity analysis becomes interpretable and engaging.",
    },
    {
        title: "ERC-8004 Correlation Loop",
        body: "Each run is designed as a protocol flow: input a handle, trigger correlation, and unlock score-driven outcomes that map into ERC-8004-ready contexts.",
    },
    {
        title: "Onchain Narrative Identity",
        body: "The project combines expressive narrative framing and measurable interaction into a system identity that can live natively across Base communities.",
    },
];

export default function AboutPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black/55 px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">About Us</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        X402 Console turns Farcaster profiles into a correlation-first narrative system.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        We are building a product where narrative, identity, and crypto-native incentives coexist in one interaction loop. Instead of static profile tooling, users get a live protocol interface that analyzes a handle and returns a signature narrative profile with score context.
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
                        <li>1. Enter a Farcaster handle in the X402 console.</li>
                        <li>2. Trigger the operator to run the narrative and scoring engine.</li>
                        <li>3. Receive a profile label, narrative output, and signal score.</li>
                        <li>4. Use the result in campaign loops and ERC-8004-aligned mechanics.</li>
                    </ol>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                        >
                            Launch X402 Console
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

