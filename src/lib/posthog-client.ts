interface ClientEventProps {
    [key: string]: string | number | boolean | null | undefined;
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
const DEFAULT_SAMPLE_RATE = Number(process.env.NEXT_PUBLIC_POSTHOG_SAMPLE_RATE ?? "1");
const EVENT_COOLDOWN_MS = Number(process.env.NEXT_PUBLIC_POSTHOG_EVENT_COOLDOWN_MS ?? "5000");

const EVENT_SAMPLE_RATES: Record<string, number> = {
    home_viewed: 1,
    roast_initiated: 1,
    roast_success: 1,
    roast_error: 1,
};

function getDistinctId(): string {
    const key = "clawcook_distinct_id";
    const existing = window.localStorage.getItem(key);
    if (existing) {
        return existing;
    }
    const id = `anon_${crypto.randomUUID()}`;
    window.localStorage.setItem(key, id);
    return id;
}

function sanitizeProps(props: ClientEventProps): Record<string, string | number | boolean | null> {
    const out: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(props)) {
        if (value === undefined) {
            continue;
        }
        out[key] = value;
    }
    return out;
}

function shouldSample(event: string): boolean {
    const rate = EVENT_SAMPLE_RATES[event] ?? DEFAULT_SAMPLE_RATE;
    if (rate >= 1) {
        return true;
    }
    if (rate <= 0) {
        return false;
    }
    return Math.random() < rate;
}

function shouldThrottle(event: string): boolean {
    const key = `clawcook_event_last_ts:${event}`;
    const now = Date.now();
    const raw = window.sessionStorage.getItem(key);
    const lastTs = raw ? Number(raw) : 0;
    if (Number.isFinite(lastTs) && now - lastTs < EVENT_COOLDOWN_MS) {
        return true;
    }
    window.sessionStorage.setItem(key, String(now));
    return false;
}

export async function captureClientEvent(event: string, props: ClientEventProps = {}): Promise<void> {
    if (!POSTHOG_KEY || typeof window === "undefined") {
        return;
    }
    if (!shouldSample(event)) {
        return;
    }
    if (shouldThrottle(event)) {
        return;
    }

    const payload = {
        api_key: POSTHOG_KEY,
        event,
        distinct_id: getDistinctId(),
        properties: {
            source: "clawcook-client",
            ...sanitizeProps(props),
        },
        timestamp: new Date().toISOString(),
    };

    try {
        await fetch(`${POSTHOG_HOST}/capture/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
            cache: "no-store",
        });
    } catch {
        // Swallow analytics transport errors.
    }
}
