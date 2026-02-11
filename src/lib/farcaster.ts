import type { Cast } from "@/lib/roast-engine";

const NEYNAR_BASE_URL = "https://api.neynar.com/v2/farcaster";
const DEFAULT_LIMIT = 20;

function getNeynarApiKey(): string {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
        throw new Error("NEYNAR_API_KEY is not configured.");
    }
    return apiKey;
}

export function normalizeHandle(input: string): string {
    return input.trim().replace(/^@/, "").toLowerCase();
}

export async function resolveFidByUsername(username: string): Promise<number> {
    const url = `${NEYNAR_BASE_URL}/user/by_username?username=${encodeURIComponent(username)}`;
    const res = await fetch(url, {
        headers: {
            accept: "application/json",
            "x-api-key": getNeynarApiKey(),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to resolve Farcaster user (${res.status}).`);
    }

    const data = await res.json() as { user?: { fid?: number } };
    const fid = data.user?.fid;

    if (!fid) {
        throw new Error("Farcaster user not found.");
    }

    return fid;
}

export async function fetchRecentCastsByFid(fid: number, limit = DEFAULT_LIMIT): Promise<Cast[]> {
    const url = `${NEYNAR_BASE_URL}/feed/user/casts/?fid=${fid}&limit=${limit}&include_replies=false`;
    const res = await fetch(url, {
        headers: {
            accept: "application/json",
            "x-api-key": getNeynarApiKey(),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch Farcaster casts (${res.status}).`);
    }

    const data = await res.json() as {
        casts?: Array<{
            text?: string;
            timestamp?: string;
            reactions?: { likes_count?: number };
        }>;
    };

    const casts = (data.casts ?? [])
        .map((cast) => ({
            text: cast.text ?? "",
            timestamp: cast.timestamp ?? new Date().toISOString(),
            likes: cast.reactions?.likes_count ?? 0,
        }))
        .filter((cast) => cast.text.trim().length > 0);

    if (casts.length === 0) {
        throw new Error("No recent casts found for this user.");
    }

    return casts;
}

export async function fetchRecentCastsByUsername(rawUsername: string, limit = DEFAULT_LIMIT): Promise<Cast[]> {
    const username = normalizeHandle(rawUsername);
    if (!username) {
        throw new Error("Username is required.");
    }

    const fid = await resolveFidByUsername(username);
    return fetchRecentCastsByFid(fid, limit);
}
