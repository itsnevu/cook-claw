interface TelemetryProps {
    [key: string]: string | number | boolean | null | undefined;
}

const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://app.posthog.com";
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;

function sanitizeProps(props: TelemetryProps): Record<string, string | number | boolean | null> {
    const out: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(props)) {
        if (value === undefined) {
            continue;
        }
        out[key] = value;
    }
    return out;
}

export async function captureServerEvent(
    event: string,
    distinctId: string,
    properties: TelemetryProps = {}
): Promise<void> {
    if (!POSTHOG_API_KEY) {
        return;
    }

    const payload = {
        api_key: POSTHOG_API_KEY,
        event,
        distinct_id: distinctId,
        properties: {
            source: "clawcook-server",
            ...sanitizeProps(properties),
        },
        timestamp: new Date().toISOString(),
    };

    try {
        const res = await fetch(`${POSTHOG_HOST}/capture/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`captureServerEvent failed (${res.status}) for ${event}`);
        }
    } catch (error) {
        console.error("captureServerEvent transport error", error);
    }
}
