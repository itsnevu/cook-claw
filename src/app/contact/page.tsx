import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact | ClawCook",
    description: "Contact and collaboration channels for ClawCook.",
};

const channels = [
    {
        label: "Partnership",
        value: "partners@clawcook.xyz",
        note: "For brand collaborations, campaign integration, and co-marketing.",
    },
    {
        label: "Community",
        value: "@clawcook on Farcaster",
        note: "For product updates, feature requests, and community announcements.",
    },
    {
        label: "Technical",
        value: "dev@clawcook.xyz",
        note: "For API, tooling, and ecosystem build support.",
    },
];

export default function ContactPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black/55 px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Contact</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Reach the ClawCook team for collabs and support.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        Use the channels below based on your use case. We route messages by domain so replies are faster and context-specific.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    {channels.map((item) => (
                        <article key={item.label} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.label}</h2>
                            <p className="mt-3 text-sm font-mono text-primary">{item.value}</p>
                            <p className="mt-3 text-sm text-neutral-300">{item.note}</p>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}

