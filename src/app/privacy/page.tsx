import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy | ClawCook",
    description: "How ClawCook handles data and privacy for users.",
};

const PRIVACY = [
    {
        title: "Data We Handle",
        body: "We process the information you submit for roasting, along with aggregated usage metrics to improve performance and stability.",
    },
    {
        title: "Analytics",
        body: "Product analytics are used to measure feature performance and system health. We avoid collecting unnecessary personal data.",
    },
    {
        title: "Data Retention",
        body: "We store activity logs for as long as needed to operate the service and maintain security. Aggregated stats may be kept longer.",
    },
    {
        title: "Your Control",
        body: "You can contact us to review, correct, or request removal of data tied to your usage where applicable.",
    },
];

export default function PrivacyPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Privacy</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Privacy built for community-scale experimentation.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        We keep privacy simple, focus on core analytics, and minimize personal data collection. This page
                        summarizes our data-handling approach.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-2">
                    {PRIVACY.map((item) => (
                        <article key={item.title} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 glass-panel rounded-2xl p-7 sm:p-10">
                    <h2 className="text-2xl font-bold text-white">Contact</h2>
                    <p className="mt-3 text-sm text-neutral-300">
                        For privacy requests or questions, reach out via the contact page and we will respond with next
                        steps.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/contact"
                            className="inline-flex rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                        >
                            Contact Support
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
