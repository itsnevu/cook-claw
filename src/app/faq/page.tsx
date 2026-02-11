import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ | ClawCook",
    description: "Frequently asked questions about ClawCook.",
};

const faqs = [
    {
        q: "Is ClawCook connected to Farcaster?",
        a: "ClawCook is designed around Farcaster handles as the main identity input in the roast console.",
    },
    {
        q: "What does the score represent?",
        a: "The score summarizes persona intensity from the roast engine output, useful for gameplay loops and social sharing.",
    },
    {
        q: "Do users need crypto to use the roast tool?",
        a: "Basic roast interaction can be presented as a social feature, while onchain reward layers can be optional.",
    },
    {
        q: "Can projects run campaigns with ClawCook?",
        a: "Yes. Campaigns can map scores and roast outputs into events, quests, and leaderboard-style activations.",
    },
];

export default function FaqPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">FAQ</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Answers to common ClawCook questions.
                    </h1>
                </section>

                <section className="mt-8 grid gap-4">
                    {faqs.map((item) => (
                        <article key={item.q} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.q}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.a}</p>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}
