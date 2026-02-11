import { NextResponse } from "next/server";
import { fetchRecentCastsByFid, normalizeHandle, resolveFidByUsername } from "@/lib/farcaster";
import { generateRoast } from "@/lib/roast-engine";
import { checkRateLimit } from "@/lib/rate-limit";
import { addRoastEvent } from "@/lib/roast-store";
import { moderateRoastText } from "@/lib/moderation";
import { captureServerEvent } from "@/lib/telemetry";

export async function POST(req: Request) {
    try {
        const body = await req.json() as { username?: string };
        const username = normalizeHandle(body.username ?? "");

        if (!username) {
            return NextResponse.json({ error: "Username is required." }, { status: 400 });
        }

        const fid = await resolveFidByUsername(username);
        const forwardedFor = req.headers.get("x-forwarded-for") ?? undefined;
        const distinctId = `fid:${fid}`;
        const rateLimitStatus = await checkRateLimit(fid, username, { ip: forwardedFor });

        if (!rateLimitStatus.allowed) {
            await captureServerEvent("roast_rate_limited", distinctId, {
                username,
                reason: rateLimitStatus.reason ?? "rate_limit",
            });
            return NextResponse.json(
                { error: rateLimitStatus.reason ?? "Rate limit exceeded." },
                { status: 429 }
            );
        }

        const history = await fetchRecentCastsByFid(fid);
        const result = await generateRoast(username, history);
        const moderation = await moderateRoastText(result.roast);
        if (!moderation.allowed) {
            await captureServerEvent("roast_moderation_blocked", distinctId, {
                username,
                profile: result.profile,
                score: result.score,
                reason: moderation.reason ?? "moderation_blocked",
            });
            return NextResponse.json(
                { error: moderation.reason ?? "Roast blocked by moderation policy." },
                { status: 422 }
            );
        }

        await addRoastEvent({
            username,
            profile: result.profile,
            roast: result.roast,
            score: result.score,
        });
        await captureServerEvent("roast_success", distinctId, {
            username,
            profile: result.profile,
            score: result.score,
        });

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate roast.";
        await captureServerEvent("roast_error", "anonymous", {
            message,
        });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
