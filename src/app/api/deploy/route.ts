import { NextResponse } from "next/server";
import { fetchRecentCastsByFid, normalizeHandle, resolveFidByUsername } from "@/lib/farcaster";
import { generateDeploy } from "@/lib/deploy-engine";
import { checkRateLimit } from "@/lib/rate-limit";
import { addDeployEvent } from "@/lib/deploy-store";
import { moderateDeployText } from "@/lib/moderation";
import { captureServerEvent } from "@/lib/telemetry";
import { captureServerException } from "@/lib/sentry";
import { persistDeployEventToDb } from "@/lib/deploy-db";

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
            await captureServerEvent("deploy_rate_limited", distinctId, {
                username,
                reason: rateLimitStatus.reason ?? "rate_limit",
            });
            return NextResponse.json(
                { error: rateLimitStatus.reason ?? "Rate limit exceeded." },
                { status: 429 }
            );
        }

        const history = await fetchRecentCastsByFid(fid);
        const result = await generateDeploy(username, history);
        const moderation = await moderateDeployText(result.deploy);
        if (!moderation.allowed) {
            await captureServerEvent("deploy_moderation_blocked", distinctId, {
                username,
                profile: result.profile,
                score: result.score,
                reason: moderation.reason ?? "moderation_blocked",
            });
            return NextResponse.json(
                { error: moderation.reason ?? "Deploy blocked by moderation policy." },
                { status: 422 }
            );
        }

        const persisted = await persistDeployEventToDb({
            username,
            profile: result.profile,
            deploy: result.deploy,
            score: result.score,
            source: "api",
        });
        if (!persisted) {
            await addDeployEvent({
                username,
                profile: result.profile,
                deploy: result.deploy,
                score: result.score,
            });
        }
        await captureServerEvent("deploy_success", distinctId, {
            username,
            profile: result.profile,
            score: result.score,
        });

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate deploy.";
        await captureServerException(error, { route: "/api/deploy" });
        await captureServerEvent("deploy_error", "anonymous", {
            message,
        });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
