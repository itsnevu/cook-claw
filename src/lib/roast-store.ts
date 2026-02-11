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

interface RoastStoreState {
    events: RoastEvent[];
}

const MAX_EVENTS = 1000;

declare global {
    var __clawcookRoastStore: RoastStoreState | undefined;
}

function getStore(): RoastStoreState {
    if (!globalThis.__clawcookRoastStore) {
        globalThis.__clawcookRoastStore = { events: [] };
    }
    return globalThis.__clawcookRoastStore;
}

export function addRoastEvent(input: Omit<RoastEvent, "id" | "createdAt">): RoastEvent {
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

    return event;
}

export function getRecentRoasts(limit = 20): RoastEvent[] {
    return getStore().events.slice(0, limit);
}

export function getLeaderboard(limit = 20, minAttempts = 1): LeaderboardEntry[] {
    const byUser = new Map<string, RoastEvent[]>();

    for (const event of getStore().events) {
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
