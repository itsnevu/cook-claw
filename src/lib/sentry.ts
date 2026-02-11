interface SentryContext {
    [key: string]: string | number | boolean | null | undefined;
}

function parseDsn(dsn: string): { endpoint: string; host: string; projectId: string; publicKey: string } | null {
    try {
        const url = new URL(dsn);
        const publicKey = url.username;
        const host = `${url.protocol}//${url.host}`;
        const projectId = url.pathname.replace("/", "");
        if (!publicKey || !projectId) {
            return null;
        }
        return {
            endpoint: `${host}/api/${projectId}/envelope/`,
            host,
            projectId,
            publicKey,
        };
    } catch {
        return null;
    }
}

function sanitizeContext(context: SentryContext): Record<string, string | number | boolean | null> {
    const out: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(context)) {
        if (value === undefined) {
            continue;
        }
        out[key] = value;
    }
    return out;
}

async function sendSentryEvent(dsn: string | undefined, error: unknown, context: SentryContext): Promise<void> {
    if (!dsn) {
        return;
    }

    const parsed = parseDsn(dsn);
    if (!parsed) {
        return;
    }

    const eventId = crypto.randomUUID().replace(/-/g, "");
    const err = error instanceof Error ? error : new Error(String(error));
    const payload = {
        event_id: eventId,
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "error",
        logger: "clawcook",
        server_name: "clawcook-app",
        message: err.message,
        tags: {
            app: "clawcook",
        },
        extra: sanitizeContext(context),
        exception: {
            values: [
                {
                    type: err.name || "Error",
                    value: err.message,
                    stacktrace: err.stack
                        ? {
                            frames: err.stack.split("\n").map((line) => ({ filename: line.trim() })),
                        }
                        : undefined,
                },
            ],
        },
    };

    const envelopeHeader = JSON.stringify({
        event_id: eventId,
        dsn,
        sent_at: new Date().toISOString(),
    });
    const itemHeader = JSON.stringify({ type: "event" });
    const body = `${envelopeHeader}\n${itemHeader}\n${JSON.stringify(payload)}`;

    try {
        await fetch(parsed.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-sentry-envelope",
            },
            body,
            cache: "no-store",
        });
    } catch {
        // Swallow monitoring transport errors.
    }
}

export async function captureServerException(error: unknown, context: SentryContext = {}): Promise<void> {
    await sendSentryEvent(process.env.SENTRY_DSN, error, context);
}

export async function captureClientException(error: unknown, context: SentryContext = {}): Promise<void> {
    await sendSentryEvent(process.env.NEXT_PUBLIC_SENTRY_DSN, error, context);
}
