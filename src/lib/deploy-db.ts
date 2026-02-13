import type { DeployProfile } from "@/lib/deploy-engine";
import type { LeaderboardEntry, LeaderboardPeriod, DeployAggregateMetrics, DeployEvent } from "@/lib/deploy-store";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const PROFILE_SET = new Set<DeployProfile>(["Larping Dev", "Vibes-only Trader", "Reply Guy", "Unknown"]);

export interface PersistDeployInput {
    username: string;
    profile: DeployProfile;
    score: number;
    deploy: string;
    createdAt?: string;
    source?: string;
}

function toDeployProfile(value: string): DeployProfile {
    if (PROFILE_SET.has(value as DeployProfile)) {
        return value as DeployProfile;
    }
    return "Unknown";
}

function toDeployEvent(row: {
    id: string;
    username: string;
    profile: string;
    score: number;
    deploy: string;
    createdAt: Date;
}): DeployEvent {
    return {
        id: row.id,
        username: row.username,
        profile: toDeployProfile(row.profile),
        score: row.score,
        deploy: row.deploy,
        createdAt: row.createdAt.toISOString(),
    };
}

function periodStart(period: LeaderboardPeriod): Date | null {
    if (period === "all") {
        return null;
    }
    const now = Date.now();
    const windowMs = period === "daily" ? 86_400_000 : 7 * 86_400_000;
    return new Date(now - windowMs);
}

export async function persistDeployEventToDb(input: PersistDeployInput): Promise<boolean> {
    if (!isDatabaseConfigured()) {
        return false;
    }

    try {
        const normalizedUsername = input.username.trim().replace(/^@/, "").toLowerCase();
        let userId: string | null = null;

        if (normalizedUsername) {
            const user = await prisma.user.upsert({
                where: { username: normalizedUsername },
                update: {},
                create: { username: normalizedUsername },
                select: { id: true },
            });
            userId = user.id;
        }

        await prisma.deployEvent.create({
            data: {
                userId: userId ?? undefined,
                username: normalizedUsername,
                profile: input.profile,
                score: input.score,
                deploy: input.deploy,
                source: input.source ?? "api",
                createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
            },
        });
        return true;
    } catch (error) {
        console.error("persistDeployEventToDb failed", error);
        return false;
    }
}

export async function getRecentDeploysFromDb(limit = 20): Promise<DeployEvent[] | null> {
    if (!isDatabaseConfigured()) {
        return null;
    }
    try {
        const safeLimit = Math.max(1, Math.min(limit, 100));
        const rows = await prisma.deployEvent.findMany({
            orderBy: { createdAt: "desc" },
            take: safeLimit,
            select: {
                id: true,
                username: true,
                profile: true,
                score: true,
                deploy: true,
                createdAt: true,
            },
        });
        return rows.map(toDeployEvent);
    } catch (error) {
        console.error("getRecentDeploysFromDb failed", error);
        return null;
    }
}

export async function getLeaderboardFromDb(
    limit = 20,
    minAttempts = 1,
    period: LeaderboardPeriod = "all"
): Promise<LeaderboardEntry[] | null> {
    if (!isDatabaseConfigured()) {
        return null;
    }
    try {
        const start = periodStart(period);
        const rows = await prisma.deployEvent.findMany({
            where: start ? { createdAt: { gte: start } } : undefined,
            orderBy: { createdAt: "desc" },
            take: 4000,
            select: {
                username: true,
                profile: true,
                score: true,
                createdAt: true,
            },
        });

        const byUser = new Map<string, typeof rows>();
        for (const row of rows) {
            const key = row.username.toLowerCase();
            const list = byUser.get(key);
            if (list) {
                list.push(row);
            } else {
                byUser.set(key, [row]);
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
                lastProfile: toDeployProfile(latest.profile),
                lastAt: latest.createdAt.toISOString(),
            });
        }

        return entries
            .sort((a, b) => b.averageScore - a.averageScore || b.bestScore - a.bestScore || b.attempts - a.attempts)
            .slice(0, limit);
    } catch (error) {
        console.error("getLeaderboardFromDb failed", error);
        return null;
    }
}

export async function getDeployAggregateFromDb(period: LeaderboardPeriod = "all"): Promise<DeployAggregateMetrics | null> {
    if (!isDatabaseConfigured()) {
        return null;
    }
    try {
        const start = periodStart(period);
        const rows = await prisma.deployEvent.findMany({
            where: start ? { createdAt: { gte: start } } : undefined,
            take: 4000,
            select: {
                username: true,
                profile: true,
                score: true,
            },
        });

        const profileBreakdown: Record<DeployProfile, number> = {
            "Larping Dev": 0,
            "Vibes-only Trader": 0,
            "Reply Guy": 0,
            "Unknown": 0,
        };

        let bestScore = 0;
        let scoreSum = 0;
        const users = new Set<string>();

        for (const row of rows) {
            users.add(row.username.toLowerCase());
            const profile = toDeployProfile(row.profile);
            profileBreakdown[profile] += 1;
            scoreSum += row.score;
            if (row.score > bestScore) {
                bestScore = row.score;
            }
        }

        return {
            totalDeploys: rows.length,
            uniqueUsers: users.size,
            averageScore: rows.length > 0 ? Math.round((scoreSum / rows.length) * 10) / 10 : 0,
            bestScore,
            profileBreakdown,
        };
    } catch (error) {
        console.error("getDeployAggregateFromDb failed", error);
        return null;
    }
}
