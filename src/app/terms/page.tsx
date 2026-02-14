import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms | ClawCook",
    description: "Terms of service for using the ClawCook product experience.",
};

const TERMS = [
    {
        title: "Eligibility",
        body: "You must be legally able to use online services in your jurisdiction. If you are using ClawCook on behalf of an organization, you confirm you have authority to bind that entity.",
    },
    {
        title: "Service Scope",
        body: "ClawCook provides a deploy-style simulation experience, analytics, and community-facing tools. We may update or discontinue features to keep the product safe, compliant, and useful.",
    },
    {
        title: "Content and Conduct",
        body: "Do not misuse the service or upload malicious content. You remain responsible for any handles, submissions, or content you provide.",
    },
    {
        title: "Availability",
        body: "We aim for high uptime but cannot guarantee uninterrupted availability. Scheduled maintenance or unexpected outages may occur.",
    },
];

export default function TermsPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black/55 px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-140 w-140 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Terms</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Straightforward terms for a playful protocol.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        These terms describe the basic rules for using ClawCook. By accessing the service, you agree to
                        follow the guidelines below.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-2">
                    {TERMS.map((item) => (
                        <article key={item.title} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 glass-panel rounded-2xl p-7 sm:p-10">
                    <h2 className="text-2xl font-bold text-white">Updates</h2>
                    <p className="mt-3 text-sm text-neutral-300">
                        We may revise these terms from time to time. Material updates will be reflected on this page.
                    </p>
                </section>
            </div>
        </main>
    );
}

