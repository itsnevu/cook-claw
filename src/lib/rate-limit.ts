export interface RateLimitStatus {
    allowed: boolean;
    reason?: string;
}

export interface RateLimitMetrics {
    allowed: number;
    blockedUserMinute: number;
    blockedUserDaily: number;
    blockedIpMinute: number;
    redisFallbacks: number;
}

interface RateLimitOptions {
    ip?: string;
}

const USER_WINDOW_SECONDS = 60;
const USER_WINDOW_LIMIT = 5;
const USER_DAILY_LIMIT = 40;

const IP_WINDOW_SECONDS = 60;
const IP_WINDOW_LIMIT = 25;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

declare global {
    var __clawcookRateLimitMemory: Map<string, { count: number; expiresAt: number }> | undefined;
    var __clawcookRateLimitMetrics: RateLimitMetrics | undefined;
}

function getMemoryBucketStore(): Map<string, { count: number; expiresAt: number }> {
    if (!globalThis.__clawcookRateLimitMemory) {
        globalThis.__clawcookRateLimitMemory = new Map();
    }
    return globalThis.__clawcookRateLimitMemory;
}

function getMetricsStore(): RateLimitMetrics {
    if (!globalThis.__clawcookRateLimitMetrics) {
        globalThis.__clawcookRateLimitMetrics = {
            allowed: 0,
            blockedUserMinute: 0,
            blockedUserDaily: 0,
            blockedIpMinute: 0,
            redisFallbacks: 0,
        };
    }
    return globalThis.__clawcookRateLimitMetrics;
}

export function getRateLimitMetrics(): RateLimitMetrics {
    return { ...getMetricsStore() };
}

function getClientIp(rawIp: string | undefined): string {
    if (!rawIp) {
        return "unknown";
    }
    return rawIp.split(",")[0].trim() || "unknown";
}

function dayBucket(): string {
    return new Date().toISOString().slice(0, 10);
}

function minuteBucket(now = Date.now()): number {
    return Math.floor(now / 60_000);
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
        throw new Error(`Redis rate-limit pipeline failed (${res.status}).`);
    }

    const payload = await res.json() as Array<{ result?: unknown }>;
    return payload.map((item) => item.result);
}

function incrementMemoryCounter(key: string, ttlSeconds: number): number {
    const store = getMemoryBucketStore();
    const now = Date.now();
    const expiresAt = now + (ttlSeconds * 1000);
    const current = store.get(key);

    if (!current || current.expiresAt <= now) {
        store.set(key, { count: 1, expiresAt });
        return 1;
    }

    current.count += 1;
    store.set(key, current);
    return current.count;
}

async function incrementWithRedisAndExpire(key: string, ttlSeconds: number): Promise<number> {
    const results = await redisPipeline([
        ["INCR", key],
        ["EXPIRE", key, String(ttlSeconds)],
    ]);
    const count = Number(results[0] ?? 0);
    return Number.isFinite(count) ? count : 0;
}

async function incrementCounter(key: string, ttlSeconds: number): Promise<number> {
    if (isRedisConfigured()) {
        try {
            return await incrementWithRedisAndExpire(key, ttlSeconds);
        } catch (error) {
            getMetricsStore().redisFallbacks += 1;
            console.error("rate-limit: redis unavailable, using memory fallback.", error);
        }
    }

    return incrementMemoryCounter(key, ttlSeconds);
}

export async function checkRateLimit(fid: number, username: string, options: RateLimitOptions = {}): Promise<RateLimitStatus> {
    const metrics = getMetricsStore();
    const normalizedUsername = username.trim().replace(/^@/, "").toLowerCase();
    const ip = getClientIp(options.ip);
    const minute = minuteBucket();
    const day = dayBucket();

    const userMinuteKey = `rl:user:${fid}:${normalizedUsername}:m:${minute}`;
    const userDailyKey = `rl:user:${fid}:${normalizedUsername}:d:${day}`;
    const ipMinuteKey = `rl:ip:${ip}:m:${minute}`;

    const [userMinuteCount, userDailyCount, ipMinuteCount] = await Promise.all([
        incrementCounter(userMinuteKey, USER_WINDOW_SECONDS + 5),
        incrementCounter(userDailyKey, 172_800),
        incrementCounter(ipMinuteKey, IP_WINDOW_SECONDS + 5),
    ]);

    if (userMinuteCount > USER_WINDOW_LIMIT) {
        metrics.blockedUserMinute += 1;
        return {
            allowed: false,
            reason: `Too many requests. Try again in ${USER_WINDOW_SECONDS} seconds.`,
        };
    }

    if (userDailyCount > USER_DAILY_LIMIT) {
        metrics.blockedUserDaily += 1;
        return {
            allowed: false,
            reason: `Daily roast limit reached (${USER_DAILY_LIMIT}). Come back tomorrow.`,
        };
    }

    if (ipMinuteCount > IP_WINDOW_LIMIT) {
        metrics.blockedIpMinute += 1;
        return {
            allowed: false,
            reason: "Network is sending requests too quickly. Slow down and retry.",
        };
    }

    metrics.allowed += 1;
    return { allowed: true };
}
