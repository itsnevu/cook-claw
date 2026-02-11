export interface MetricsSnapshot {
    timestamp: string;
    totalRequests: number;
    aiFailures: number;
    fallbackUsed: number;
    blockedTotal: number;
}

interface MetricsStoreState {
    snapshots: MetricsSnapshot[];
}

const MAX_SNAPSHOTS = 360;
const REDIS_METRICS_KEY = "clawcook:metrics_snapshots";
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

declare global {
    var __clawcookMetricsStore: MetricsStoreState | undefined;
}

function getStore(): MetricsStoreState {
    if (!globalThis.__clawcookMetricsStore) {
        globalThis.__clawcookMetricsStore = { snapshots: [] };
    }
    return globalThis.__clawcookMetricsStore;
}

function isRedisConfigured(): boolean {
    return Boolean(redisUrl && redisToken);
}

async function redisPipeline(commands: Array<Array<string>>): Promise<unknown[]> {
    if (!redisUrl || !redisToken) {
        throw new Error("Redis is not configured.");
    }

    const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${redisToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Metrics Redis pipeline failed (${res.status}).`);
    }

    const payload = await res.json() as Array<{ result?: unknown }>;
    return payload.map((item) => item.result);
}

export async function appendMetricsSnapshot(snapshot: MetricsSnapshot): Promise<void> {
    const store = getStore();
    store.snapshots.push(snapshot);
    if (store.snapshots.length > MAX_SNAPSHOTS) {
        store.snapshots = store.snapshots.slice(-MAX_SNAPSHOTS);
    }

    if (isRedisConfigured()) {
        try {
            await redisPipeline([
                ["RPUSH", REDIS_METRICS_KEY, JSON.stringify(snapshot)],
                ["LTRIM", REDIS_METRICS_KEY, String(-MAX_SNAPSHOTS), "-1"],
            ]);
        } catch (error) {
            console.error("appendMetricsSnapshot: redis write failed, memory fallback only.", error);
        }
    }
}

export async function getMetricsHistory(limit = 60): Promise<MetricsSnapshot[]> {
    const safeLimit = Math.max(2, Math.min(limit, MAX_SNAPSHOTS));

    if (isRedisConfigured()) {
        try {
            const results = await redisPipeline([
                ["LRANGE", REDIS_METRICS_KEY, String(-safeLimit), "-1"],
            ]);
            const raw = results[0];
            if (Array.isArray(raw)) {
                const parsed = raw
                    .map((item) => {
                        if (typeof item !== "string") {
                            return null;
                        }
                        try {
                            return JSON.parse(item) as MetricsSnapshot;
                        } catch {
                            return null;
                        }
                    })
                    .filter((item): item is MetricsSnapshot => item !== null);

                if (parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("getMetricsHistory: redis read failed, using memory fallback.", error);
        }
    }

    const store = getStore();
    return store.snapshots.slice(-safeLimit);
}
