import { NextResponse } from "next/server";
import { fetchRecentCastsByFid, normalizeHandle, resolveFidByUsername } from "@/lib/farcaster";
import { generateRoast } from "@/lib/roast-engine";
import { checkRateLimit } from "@/lib/rate-limit";
import { addRoastEvent } from "@/lib/roast-store";

export async function POST(req: Request) {
    try {
        const body = await req.json() as { username?: string };
        const username = normalizeHandle(body.username ?? "");

        if (!username) {
            return NextResponse.json({ error: "Username is required." }, { status: 400 });
        }

        const fid = await resolveFidByUsername(username);
        const rateLimitStatus = await checkRateLimit(fid, username);

        if (!rateLimitStatus.allowed) {
            return NextResponse.json(
                { error: rateLimitStatus.reason ?? "Rate limit exceeded." },
                { status: 429 }
            );
        }

        const history = await fetchRecentCastsByFid(fid);
        const result = await generateRoast(username, history);
        addRoastEvent({
            username,
            profile: result.profile,
            roast: result.roast,
            score: result.score,
        });

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate roast.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
