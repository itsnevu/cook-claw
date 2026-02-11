import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Docs | ClawCook",
    description: "Quick documentation for ClawCook features and interaction flow.",
};

const sections = [
    {
        title: "Roast Console",
        detail: "Input a Farcaster handle and run the roast engine. The result returns profile label, roast line, and score in one output card.",
    },
    {
        title: "Persona Scoring",
        detail: "Each analysis maps social behavior into a persona score that can be reused across leaderboard and campaign mechanics.",
    },
    {
        title: "$CLAW Utility Layer",
        detail: "Roast events are designed as repeatable game loops, so token utility can connect to participation and retention features.",
    },
];

export default function DocsPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Documentation</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Product overview for ClawCook interaction design.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        This page is a concise guide for users and partners who need to understand the core mechanics quickly before integrating campaigns or creating community content.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    {sections.map((item) => (
                        <article key={item.title} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.detail}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 glass-panel rounded-2xl p-7 sm:p-10">
                    <h2 className="text-2xl font-bold text-white">Integration Checklist</h2>
                    <ol className="mt-4 space-y-3 text-sm text-neutral-300">
                        <li>1. Define your roast campaign objective (engagement, onboarding, or retention).</li>
                        <li>2. Prepare handle input flow for your audience.</li>
                        <li>3. Map score outcomes to rewards or content beats.</li>
                        <li>4. Track repeats and shareable roast outputs across channels.</li>
                    </ol>
                </section>
            </div>
        </main>
    );
}
