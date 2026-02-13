const OPENAI_MODERATION_ENDPOINT = "https://api.openai.com/v1/moderations";
const OPENAI_MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL ?? "omni-moderation-latest";

export interface ModerationResult {
    allowed: boolean;
    reason?: string;
}

interface OpenAIModerationCategoryScores {
    sexual?: number;
    violence?: number;
    hate?: number;
    harassment?: number;
    "self-harm"?: number;
}

interface OpenAIModerationResult {
    flagged?: boolean;
    categories?: Record<string, boolean>;
    category_scores?: OpenAIModerationCategoryScores;
}

function buildReason(result: OpenAIModerationResult): string {
    if (result.categories) {
        const flagged = Object.entries(result.categories)
            .filter(([, isFlagged]) => Boolean(isFlagged))
            .map(([name]) => name);
        if (flagged.length > 0) {
            return `Output blocked by safety policy (${flagged.join(", ")}).`;
        }
    }
    return "Output blocked by safety policy.";
}

export async function moderateDeployText(text: string): Promise<ModerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { allowed: true };
    }

    const res = await fetch(OPENAI_MODERATION_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: OPENAI_MODERATION_MODEL,
            input: text,
        }),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`Moderation request failed (${res.status}).`);
    }

    const payload = await res.json() as { results?: OpenAIModerationResult[] };
    const result = payload.results?.[0];
    if (!result) {
        return { allowed: true };
    }

    if (result.flagged) {
        return {
            allowed: false,
            reason: buildReason(result),
        };
    }

    return { allowed: true };
}
