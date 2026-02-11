/**
 * Mock Rate Limiter
 * Checks if a user is eligible to be roasted based on:
 * 1. Farcaster Power User status (Mocked)
 * 2. Castra Social Score (Mocked)
 * 3. Daily limits
 */

export interface RateLimitStatus {
    allowed: boolean;
    reason?: string;
}

const MOCK_POWER_USERS = ["dwr.eth", "v", "balajis", "vitalik.eth"];
const MIN_SCORE = 20;

function getDailyDeterministicScore(fid: number): number {
    const dayBucket = Math.floor(Date.now() / 86_400_000);
    return Math.abs((fid * 31 + dayBucket * 17) % 100);
}

export async function checkRateLimit(fid: number, username: string): Promise<RateLimitStatus> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Check Power User (Mock)
    const normalizedUsername = username.trim().replace(/^@/, "").toLowerCase();
    const isPowerUser = MOCK_POWER_USERS.includes(normalizedUsername);

    // 2. Check Social Score (Mock)
    // Deterministic daily score by fid, so users get consistent results in a day.
    const socialScore = getDailyDeterministicScore(fid);

    if (socialScore < MIN_SCORE && !isPowerUser) {
        return {
            allowed: false,
            reason: `Social Score too low (${socialScore}). Need ${MIN_SCORE}+ or Power User status.`
        };
    }

    // 3. Daily Limit (Memory-based mock)
    // In production, use Redis/KV

    return { allowed: true };
}
