/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { handle } from "frog/next";
import { fetchRecentCastsByFid, normalizeHandle, resolveFidByUsername } from "@/lib/farcaster";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateDeploy } from "@/lib/deploy-engine";
import { addDeployEvent } from "@/lib/deploy-store";
import { moderateDeployText } from "@/lib/moderation";
import { captureServerEvent } from "@/lib/telemetry";
import { captureServerException } from "@/lib/sentry";
import { persistDeployEventToDb } from "@/lib/deploy-db";

const app = new Frog({
    basePath: "/api/frame",
    title: "ClawCook",
});

app.frame("/", (c) => {
    return c.res({
        action: "/deploy",
        image: (
            <div
                style={{
                    alignItems: "center",
                    background: "linear-gradient(to right, #0D0D0D, #1a1a1a)",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                    textAlign: "center",
                    width: "100%",
                    padding: "0 80px",
                }}
            >
                <div style={{ color: "#d53016", fontSize: 62, lineHeight: 1.2 }}>ClawCook</div>
                <div style={{ color: "white", fontSize: 28, marginTop: 12 }}>Deploy-to-Earn Clawbot</div>
                <div style={{ color: "#B8B8B8", fontSize: 22, marginTop: 20 }}>
                    Enter Farcaster handle and pull the claw.
                </div>
            </div>
        ),
        intents: [
            <TextInput key="input-handle" placeholder="@farcaster_handle" />,
            <Button key="start-deploy" value="deploy">Deploy Me</Button>,
        ],
    });
});

app.frame("/deploy", async (c) => {
    const username = normalizeHandle(c.inputText ?? "");
    if (!username) {
        return c.res({
            action: "/deploy",
            image: (
                <div
                    style={{
                        alignItems: "center",
                        background: "linear-gradient(to right, #0D0D0D, #2A1A12)",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                        textAlign: "center",
                        width: "100%",
                        padding: "0 80px",
                    }}
                >
                    <div style={{ color: "#FF6F3C", fontSize: 50 }}>Handle missing</div>
                    <div style={{ color: "white", fontSize: 24, marginTop: 12 }}>
                        Enter a Farcaster handle to continue.
                    </div>
                </div>
            ),
            intents: [
                <TextInput key="input-handle-retry" placeholder="@farcaster_handle" />,
                <Button key="retry-deploy" value="retry">Try Again</Button>,
            ],
        });
    }

    try {
        const fid = await resolveFidByUsername(username);
        const distinctId = `fid:${fid}`;
        const rateLimit = await checkRateLimit(fid, username);
        if (!rateLimit.allowed) {
            await captureServerEvent("frame_deploy_rate_limited", distinctId, {
                username,
                reason: rateLimit.reason ?? "rate_limit",
            });
            return c.res({
                image: (
                    <div
                        style={{
                            alignItems: "center",
                            background: "linear-gradient(to right, #0D0D0D, #3A1010)",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            justifyContent: "center",
                            textAlign: "center",
                            width: "100%",
                            padding: "0 80px",
                        }}
                    >
                        <div style={{ color: "#FF3B30", fontSize: 46 }}>Rate Limited</div>
                        <div style={{ color: "white", fontSize: 22, marginTop: 12 }}>{rateLimit.reason}</div>
                    </div>
                ),
                intents: [
                    <Button.Reset key="reset-rate-limit">Back</Button.Reset>,
                ],
            });
        }

        const history = await fetchRecentCastsByFid(fid);
        const result = await generateDeploy(username, history);
        const moderation = await moderateDeployText(result.deploy);
        if (!moderation.allowed) {
            await captureServerEvent("frame_deploy_moderation_blocked", distinctId, {
                username,
                profile: result.profile,
                score: result.score,
                reason: moderation.reason ?? "moderation_blocked",
            });
            return c.res({
                image: (
                    <div
                        style={{
                            alignItems: "center",
                            background: "linear-gradient(to right, #0D0D0D, #3A1010)",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            justifyContent: "center",
                            textAlign: "center",
                            width: "100%",
                            padding: "0 80px",
                        }}
                    >
                        <div style={{ color: "#FF3B30", fontSize: 42 }}>Safety Blocked</div>
                        <div style={{ color: "white", fontSize: 20, marginTop: 12 }}>
                            {moderation.reason ?? "Output blocked by safety policy."}
                        </div>
                    </div>
                ),
                intents: [
                    <Button.Reset key="reset-moderation">Try Again</Button.Reset>,
                ],
            });
        }

        const persisted = await persistDeployEventToDb({
            username,
            profile: result.profile,
            deploy: result.deploy,
            score: result.score,
            source: "frame",
        });
        if (!persisted) {
            await addDeployEvent({
                username,
                profile: result.profile,
                deploy: result.deploy,
                score: result.score,
            });
        }
        await captureServerEvent("frame_deploy_success", distinctId, {
            username,
            profile: result.profile,
            score: result.score,
        });

        return c.res({
            image: (
                <div
                    style={{
                        alignItems: "center",
                        background: "linear-gradient(to right, #0D0D0D, #432818)",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                        textAlign: "center",
                        width: "100%",
                        padding: "0 80px",
                    }}
                >
                    <div style={{ color: "#d53016", fontSize: 36 }}>
                        @{username} / Score {result.score}
                    </div>
                    <div style={{ color: "#FFD3C2", fontSize: 24, marginTop: 10 }}>{result.profile}</div>
                    <div style={{ color: "white", fontSize: 24, marginTop: 18, lineHeight: 1.35 }}>
                        &ldquo;{result.deploy}&rdquo;
                    </div>
                </div>
            ),
            intents: [
                <Button.Reset key="reset-deploy">Deploy Another</Button.Reset>,
            ],
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to deploy profile.";
        await captureServerException(error, { route: "/api/frame/deploy" });
        await captureServerEvent("frame_deploy_error", "anonymous", { message });
        return c.res({
            image: (
                <div
                    style={{
                        alignItems: "center",
                        background: "linear-gradient(to right, #0D0D0D, #3A1010)",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                        textAlign: "center",
                        width: "100%",
                        padding: "0 80px",
                    }}
                >
                    <div style={{ color: "#FF3B30", fontSize: 44 }}>Deploy Failed</div>
                    <div style={{ color: "white", fontSize: 22, marginTop: 12 }}>{message}</div>
                </div>
            ),
            intents: [
                <Button.Reset key="reset-error">Try Again</Button.Reset>,
            ],
        });
    }
});

export const GET = handle(app);
export const POST = handle(app);
