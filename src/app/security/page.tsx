import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Security | ClawCook",
    description: "Security posture, reporting, and platform safeguards for ClawCook.",
};

const SECURITY = [
    {
        title: "Infrastructure",
        body: "We monitor uptime, request rates, and abuse signals to maintain reliability. Automated alerts keep the team informed of anomalies.",
    },
    {
        title: "Access Controls",
        body: "Administrative tools are restricted to authorized operators and audited where possible.",
    },
    {
        title: "Data Protection",
        body: "Sensitive environment variables and credentials are stored securely and rotated as needed.",
    },
    {
        title: "Responsible Disclosure",
        body: "If you discover a vulnerability, please report it. We prioritize verification and remediation.",
    },
];

export default function SecurityPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Security</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Security practices that keep the roast engine resilient.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        We focus on predictable operations, monitored services, and a responsible disclosure path. This
                        page outlines the basics.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-2">
                    {SECURITY.map((item) => (
                        <article key={item.title} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 glass-panel rounded-2xl p-7 sm:p-10">
                    <h2 className="text-2xl font-bold text-white">Report an Issue</h2>
                    <p className="mt-3 text-sm text-neutral-300">
                        Share details via the contact page and include steps to reproduce. We will acknowledge and
                        prioritize fixes based on severity.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/contact"
                            className="inline-flex rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                        >
                            Submit Report
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
