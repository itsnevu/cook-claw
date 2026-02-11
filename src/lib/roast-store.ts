import type { RoastProfile } from "@/lib/roast-engine";

export interface RoastEvent {
    id: string;
    username: string;
    profile: RoastProfile;
    score: number;
    roast: string;
    createdAt: string;
}

export interface LeaderboardEntry {
    username: string;
    attempts: number;
    averageScore: number;
    bestScore: number;
    lastProfile: RoastProfile;
    lastAt: string;
}

export type LeaderboardPeriod = "daily" | "weekly" | "all";

export interface RoastAggregateMetrics {
    totalRoasts: number;
    uniqueUsers: number;
    averageScore: number;
    bestScore: number;
    profileBreakdown: Record<RoastProfile, number>;
}

interface RoastStoreState {
    events: RoastEvent[];
}

const MAX_EVENTS = 1000;
const REDIS_EVENTS_KEY = "clawcook:roast_events";
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

declare global {
    var __clawcookRoastStore: RoastStoreState | undefined;
}

function getStore(): RoastStoreState {
    if (!globalThis.__clawcookRoastStore) {
        globalThis.__clawcookRoastStore = { events: [] };
    }
    return globalThis.__clawcookRoastStore;
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
        throw new Error(`Redis pipeline failed (${res.status}).`);
    }

    const payload = await res.json() as Array<{ result?: unknown }>;
    return payload.map((item) => item.result);
}

export async function addRoastEvent(input: Omit<RoastEvent, "id" | "createdAt">): Promise<RoastEvent> {
    const event: RoastEvent = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...input,
    };

    const store = getStore();
    store.events.unshift(event);
    if (store.events.length > MAX_EVENTS) {
        store.events = store.events.slice(0, MAX_EVENTS);
    }

    if (isRedisConfigured()) {
        try {
            await redisPipeline([
                ["LPUSH", REDIS_EVENTS_KEY, JSON.stringify(event)],
                ["LTRIM", REDIS_EVENTS_KEY, "0", String(MAX_EVENTS - 1)],
            ]);
        } catch (error) {
            console.error("addRoastEvent: redis write failed, memory fallback only.", error);
        }
    }

    return event;
}

export async function getRecentRoasts(limit = 20): Promise<RoastEvent[]> {
    const safeLimit = Math.max(1, Math.min(limit, 100));

    if (isRedisConfigured()) {
        try {
            const results = await redisPipeline([
                ["LRANGE", REDIS_EVENTS_KEY, "0", String(safeLimit - 1)],
            ]);
            const rawEvents = results[0];

            if (Array.isArray(rawEvents)) {
                return rawEvents
                    .map((item) => {
                        if (typeof item !== "string") {
                            return null;
                        }
                        try {
                            return JSON.parse(item) as RoastEvent;
                        } catch {
                            return null;
                        }
                    })
                    .filter((item): item is RoastEvent => item !== null);
            }
        } catch (error) {
            console.error("getRecentRoasts: redis read failed, using memory fallback.", error);
        }
    }

    return getStore().events.slice(0, safeLimit);
}

function filterEventsByPeriod(events: RoastEvent[], period: LeaderboardPeriod): RoastEvent[] {
    if (period === "all") {
        return events;
    }

    const now = Date.now();
    const windowMs = period === "daily" ? 86_400_000 : 7 * 86_400_000;
    const minTs = now - windowMs;

    return events.filter((event) => {
        const ts = Date.parse(event.createdAt);
        return Number.isFinite(ts) && ts >= minTs;
    });
}

export async function getLeaderboard(
    limit = 20,
    minAttempts = 1,
    period: LeaderboardPeriod = "all"
): Promise<LeaderboardEntry[]> {
    const sourceEvents = filterEventsByPeriod(await getRecentRoasts(MAX_EVENTS), period);
    const byUser = new Map<string, RoastEvent[]>();

    for (const event of sourceEvents) {
        const key = event.username.toLowerCase();
        const list = byUser.get(key);
        if (list) {
            list.push(event);
        } else {
            byUser.set(key, [event]);
        }
    }

    const entries: LeaderboardEntry[] = [];
    for (const [username, events] of byUser.entries()) {
        if (events.length < minAttempts) {
            continue;
        }

        const total = events.reduce((sum, item) => sum + item.score, 0);
        const bestScore = events.reduce((best, item) => Math.max(best, item.score), 0);
        const latest = events[0];

        entries.push({
            username,
            attempts: events.length,
            averageScore: Math.round((total / events.length) * 10) / 10,
            bestScore,
            lastProfile: latest.profile,
            lastAt: latest.createdAt,
        });
    }

    return entries
        .sort((a, b) => b.averageScore - a.averageScore || b.bestScore - a.bestScore || b.attempts - a.attempts)
        .slice(0, limit);
}

export async function getRoastAggregateMetrics(period: LeaderboardPeriod = "all"): Promise<RoastAggregateMetrics> {
    const events = filterEventsByPeriod(await getRecentRoasts(MAX_EVENTS), period);
    const profileBreakdown: Record<RoastProfile, number> = {
        "Larping Dev": 0,
        "Vibes-only Trader": 0,
        "Reply Guy": 0,
        "Unknown": 0,
    };

    const users = new Set<string>();
    let scoreSum = 0;
    let bestScore = 0;

    for (const event of events) {
        users.add(event.username.toLowerCase());
        profileBreakdown[event.profile] += 1;
        scoreSum += event.score;
        if (event.score > bestScore) {
            bestScore = event.score;
        }
    }

    const averageScore = events.length > 0 ? Math.round((scoreSum / events.length) * 10) / 10 : 0;

    return {
        totalRoasts: events.length,
        uniqueUsers: users.size,
        averageScore,
        bestScore,
        profileBreakdown,
    };
}
