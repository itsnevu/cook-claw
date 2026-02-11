import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Licenses | ClawCook",
    description: "Open source acknowledgements and licensing details for ClawCook.",
};

const LICENSE_BLOCKS = [
    {
        title: "Core Platform",
        body: "ClawCook uses Next.js, React, and Prisma as core building blocks. These frameworks are distributed under their respective open source licenses.",
    },
    {
        title: "UI and Motion",
        body: "Motion and UI layers use libraries such as Framer Motion, Tailwind CSS, and lucide-react with permissive licenses.",
    },
    {
        title: "Web3 Stack",
        body: "Wallet and chain tooling includes wagmi, viem, and RainbowKit, each governed by their project licenses.",
    },
    {
        title: "Fonts and Assets",
        body: "Brand assets, logos, and illustrations are owned by ClawCook unless otherwise stated. External assets retain their original licenses.",
    },
];

export default function LicensesPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-5xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Licenses</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Acknowledging the open source stack behind ClawCook.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm text-neutral-300 sm:text-base">
                        This page summarizes the major open source dependencies powering the platform. Refer to each
                        package for its full license text.
                    </p>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-2">
                    {LICENSE_BLOCKS.map((item) => (
                        <article key={item.title} className="glass-panel rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                            <p className="mt-3 text-sm text-neutral-300">{item.body}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 glass-panel rounded-2xl p-7 sm:p-10">
                    <h2 className="text-2xl font-bold text-white">Need Full License Texts?</h2>
                    <p className="mt-3 text-sm text-neutral-300">
                        If you need a complete list of packages and licenses, we can generate and publish a detailed
                        report.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/contact"
                            className="inline-flex rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                        >
                            Request License Report
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
