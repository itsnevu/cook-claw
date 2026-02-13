"use client";

import { useEffect, useMemo, useState } from "react";

type IntegrationState = "connected" | "missing" | "optional" | "error" | "disabled";

interface IntegrationStatusItem {
    key: string;
    name: string;
    state: IntegrationState;
    required: boolean;
    message: string;
    nextStep?: string;
}

interface SetupResponse {
    summary: {
        requiredReady: number;
        requiredTotal: number;
        overallReady: boolean;
    };
    items: IntegrationStatusItem[];
    generatedAt: string;
}

function stateClass(state: IntegrationState): string {
    switch (state) {
        case "connected":
            return "text-green-300 border-green-500/40 bg-green-500/10";
        case "missing":
            return "text-red-300 border-red-500/40 bg-red-500/10";
        case "error":
            return "text-amber-300 border-amber-500/40 bg-amber-500/10";
        case "disabled":
            return "text-neutral-300 border-white/20 bg-white/5";
        default:
            return "text-sky-300 border-sky-500/40 bg-sky-500/10";
    }
}

export default function SetupPage() {
    const [data, setData] = useState<SetupResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            try {
                const res = await fetch("/api/setup/status", { cache: "no-store" });
                const payload = await res.json() as SetupResponse & { error?: string };
                if (!res.ok) {
                    throw new Error(payload.error ?? "Failed to load setup status.");
                }
                if (mounted) {
                    setData(payload);
                    setError(null);
                }
            } catch (fetchError) {
                if (mounted) {
                    const message = fetchError instanceof Error ? fetchError.message : "Failed to load setup status.";
                    setError(message);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        run();
        const timer = setInterval(run, 15000);
        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, []);

    const requiredMissing = useMemo(
        () => data?.items.filter((i) => i.required && i.state !== "connected") ?? [],
        [data]
    );

    return (
        <main className="relative min-h-screen overflow-hidden bg-black/55 px-6 pb-16 pt-28 sm:px-16 sm:pt-32">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[560px] w-[560px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

            <div className="relative z-20 mx-auto w-full max-w-6xl">
                <section className="glass-panel rounded-2xl p-7 sm:p-10">
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Integration Setup</p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Live stack readiness check.
                    </h1>
                    <p className="mt-4 text-sm text-neutral-300">
                        Required ready: {data?.summary.requiredReady ?? 0}/{data?.summary.requiredTotal ?? 0} | Generated at: {data?.generatedAt ?? "-"}
                    </p>
                </section>

                {loading && <p className="mt-6 text-sm text-neutral-400">Checking integrations...</p>}
                {error && <p className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

                {!loading && !error && data && (
                    <section className="mt-8 space-y-4">
                        {data.items.map((item) => (
                            <article key={item.key} className="glass-panel rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                                        <p className="mt-1 text-sm text-neutral-300">{item.message}</p>
                                        {item.nextStep && (
                                            <p className="mt-2 text-xs text-neutral-400">Next: {item.nextStep}</p>
                                        )}
                                    </div>
                                    <span className={`rounded-lg border px-3 py-1 text-xs font-mono uppercase tracking-widest ${stateClass(item.state)}`}>
                                        {item.state}
                                    </span>
                                </div>
                            </article>
                        ))}

                        {requiredMissing.length > 0 && (
                            <article className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-200">Required Next Actions</h3>
                                <ul className="mt-2 space-y-1 text-sm text-amber-100">
                                    {requiredMissing.map((item) => (
                                        <li key={`req-${item.key}`}>- {item.name}: {item.nextStep ?? "Check configuration."}</li>
                                    ))}
                                </ul>
                            </article>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

