export type IntegrationState = "connected" | "missing" | "optional" | "error" | "disabled";

export interface IntegrationStatusItem {
    key: string;
    name: string;
    state: IntegrationState;
    required: boolean;
    message: string;
    nextStep?: string;
}

function hasEnv(name: string): boolean {
    return Boolean(process.env[name] && process.env[name]?.trim().length);
}

function redact(value: string | undefined): string {
    if (!value) {
        return "not set";
    }
    if (value.length <= 6) {
        return "***";
    }
    return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

async function safeFetch(url: string, headers?: HeadersInit): Promise<{ ok: boolean; status: number | null }> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, {
            method: "GET",
            headers,
            cache: "no-store",
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return { ok: res.ok, status: res.status };
    } catch {
        return { ok: false, status: null };
    }
}

export async function getIntegrationStatus(): Promise<IntegrationStatusItem[]> {
    const items: IntegrationStatusItem[] = [];

    const dbEnabled = process.env.PRISMA_DB_ENABLED === "true";
    const hasDbUrl = hasEnv("DATABASE_URL");
    items.push({
        key: "database",
        name: "Prisma Database",
        required: true,
        state: dbEnabled && hasDbUrl ? "connected" : dbEnabled ? "missing" : "disabled",
        message: dbEnabled
            ? `PRISMA_DB_ENABLED=true, DATABASE_URL=${redact(process.env.DATABASE_URL)}`
            : "Prisma DB mode disabled; app uses fallback store.",
        nextStep: dbEnabled ? (hasDbUrl ? undefined : "Set DATABASE_URL in .env.local.") : "Set PRISMA_DB_ENABLED=true.",
    });

    const redisReady = hasEnv("UPSTASH_REDIS_REST_URL") && hasEnv("UPSTASH_REDIS_REST_TOKEN");
    items.push({
        key: "redis",
        name: "Upstash Redis",
        required: false,
        state: redisReady ? "connected" : "optional",
        message: redisReady ? "Redis env detected." : "Redis not configured. Memory fallback active.",
        nextStep: redisReady ? undefined : "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
    });

    const neynarKey = process.env.NEYNAR_API_KEY;
    let neynarState: IntegrationState = "missing";
    let neynarMessage = "NEYNAR_API_KEY not set.";
    if (neynarKey) {
        const ping = await safeFetch("https://api.neynar.com/v2/farcaster/user/by_username?username=dwr", {
            "x-api-key": neynarKey,
            accept: "application/json",
        });
        neynarState = ping.ok ? "connected" : "error";
        neynarMessage = ping.ok ? "Neynar API reachable." : `Neynar check failed (${ping.status ?? "no response"}).`;
    }
    items.push({
        key: "neynar",
        name: "Neynar Farcaster API",
        required: true,
        state: neynarState,
        message: neynarMessage,
        nextStep: neynarKey ? undefined : "Set NEYNAR_API_KEY.",
    });

    const openAiKey = process.env.OPENAI_API_KEY;
    let openAiState: IntegrationState = "missing";
    let openAiMessage = "OPENAI_API_KEY not set.";
    if (openAiKey) {
        const ping = await safeFetch("https://api.openai.com/v1/models", {
            Authorization: `Bearer ${openAiKey}`,
        });
        openAiState = ping.ok ? "connected" : "error";
        openAiMessage = ping.ok ? "OpenAI API reachable." : `OpenAI check failed (${ping.status ?? "no response"}).`;
    }
    items.push({
        key: "openai",
        name: "OpenAI (Deploy + Moderation)",
        required: true,
        state: openAiState,
        message: openAiMessage,
        nextStep: openAiKey ? undefined : "Set OPENAI_API_KEY.",
    });

    const geckoPing = await safeFetch("https://api.coingecko.com/api/v3/ping");
    items.push({
        key: "coingecko",
        name: "CoinGecko",
        required: true,
        state: geckoPing.ok ? "connected" : "error",
        message: geckoPing.ok ? "CoinGecko reachable." : "CoinGecko check failed.",
        nextStep: geckoPing.ok ? undefined : "Check outbound network access from deployment.",
    });

    const clawTokenAddress = process.env.CLAW_TOKEN_ADDRESS;
    if (clawTokenAddress) {
        const dexPing = await safeFetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(clawTokenAddress)}`);
        items.push({
            key: "dexscreener",
            name: "DexScreener Fallback",
            required: false,
            state: dexPing.ok ? "connected" : "error",
            message: dexPing.ok ? "DexScreener fallback ready." : "DexScreener check failed.",
            nextStep: dexPing.ok ? undefined : "Verify CLAW_TOKEN_ADDRESS token contract.",
        });
    } else {
        items.push({
            key: "dexscreener",
            name: "DexScreener Fallback",
            required: false,
            state: "optional",
            message: "CLAW_TOKEN_ADDRESS not set; fallback disabled.",
            nextStep: "Set CLAW_TOKEN_ADDRESS to enable fallback.",
        });
    }

    const posthogServer = hasEnv("POSTHOG_API_KEY");
    const posthogClient = hasEnv("NEXT_PUBLIC_POSTHOG_API_KEY");
    items.push({
        key: "posthog",
        name: "PostHog Analytics",
        required: false,
        state: posthogServer || posthogClient ? "connected" : "optional",
        message: `server=${posthogServer ? "on" : "off"}, client=${posthogClient ? "on" : "off"}`,
        nextStep: posthogServer || posthogClient ? undefined : "Set POSTHOG_API_KEY and/or NEXT_PUBLIC_POSTHOG_API_KEY.",
    });

    const sentryServer = hasEnv("SENTRY_DSN");
    const sentryClient = hasEnv("NEXT_PUBLIC_SENTRY_DSN");
    items.push({
        key: "sentry",
        name: "Sentry Monitoring",
        required: false,
        state: sentryServer || sentryClient ? "connected" : "optional",
        message: `server=${sentryServer ? "on" : "off"}, client=${sentryClient ? "on" : "off"}`,
        nextStep: sentryServer || sentryClient ? undefined : "Set SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN.",
    });

    items.push({
        key: "metrics-token",
        name: "Metrics Access Token",
        required: false,
        state: hasEnv("METRICS_API_TOKEN") ? "connected" : "optional",
        message: hasEnv("METRICS_API_TOKEN")
            ? "Protected metrics enabled."
            : "Metrics endpoint is open unless protected by platform/auth.",
        nextStep: hasEnv("METRICS_API_TOKEN") ? undefined : "Set METRICS_API_TOKEN.",
    });

    return items;
}
