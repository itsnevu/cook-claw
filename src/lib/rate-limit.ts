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

export async function checkRateLimit(fid: number, username: string): Promise<RateLimitStatus> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Check Power User (Mock)
    const isPowerUser = MOCK_POWER_USERS.includes(username);

    // 2. Check Social Score (Mock)
    // Randomly assign a score between 0-100
    const socialScore = Math.floor(Math.random() * 100);
    const MIN_SCORE = 20;

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
