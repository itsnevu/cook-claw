export type RoastProfile = "Larping Dev" | "Vibes-only Trader" | "Reply Guy" | "Unknown";

export interface Cast {
    text: string;
    timestamp: string;
    likes: number;
}

export interface RoastResult {
    roast: string;
    profile: RoastProfile;
    score: number; // 0-100
}

export interface RoastEngineMetrics {
    totalRequests: number;
    aiSuccess: number;
    aiFailure: number;
    fallbackUsed: number;
    lastAiErrorAt?: string;
}

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

const MOCK_ROASTS: Record<RoastProfile, string[]> = {
    "Larping Dev": [
        "Your GitHub contribution graph looks like a Morse code message for SOS.",
        "You spend more time configuring your neovim than shipping code.",
        "Nice wrapper around the wrapper around the API."
    ],
    "Vibes-only Trader": [
        "Your portfolio is down 90% but the vibes are immaculate.",
        "Buying high and selling low is not a strategy, it is a lifestyle.",
        "You call it accumulation phase, the market calls it exit liquidity."
    ],
    "Reply Guy": [
        "Do you ever have original thoughts, or just replies?",
        "Your notifications are the only thing validating your existence.",
        "Touching grass is not a protocol you can interact with."
    ],
    "Unknown": [
        "You are so mysterious even the bot had to improvise.",
        "Profile unclear, aura detected, chaos confirmed."
    ]
};

const PROFILE_SET = new Set<RoastProfile>(["Larping Dev", "Vibes-only Trader", "Reply Guy", "Unknown"]);

declare global {
    var __clawcookRoastEngineMetrics: RoastEngineMetrics | undefined;
}

function getMetricsStore(): RoastEngineMetrics {
    if (!globalThis.__clawcookRoastEngineMetrics) {
        globalThis.__clawcookRoastEngineMetrics = {
            totalRequests: 0,
            aiSuccess: 0,
            aiFailure: 0,
            fallbackUsed: 0,
        };
    }
    return globalThis.__clawcookRoastEngineMetrics;
}

export function getRoastEngineMetrics(): RoastEngineMetrics {
    return { ...getMetricsStore() };
}

function clampScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score)));
}

function inferProfileFromHistory(history: Cast[]): RoastProfile {
    const allText = history.map((h) => h.text.toLowerCase()).join(" ");

    if (allText.includes("gm") || allText.includes("wagmi") || allText.includes("mint")) {
        return "Vibes-only Trader";
    }
    if (allText.includes("git") || allText.includes("deploy") || allText.includes("rust")) {
        return "Larping Dev";
    }
    if (allText.includes("agree") || allText.includes("this") || history.length > 50) {
        return "Reply Guy";
    }

    return "Unknown";
}

function buildFallbackRoast(_username: string, history: Cast[]): RoastResult {
    const profile = inferProfileFromHistory(history);
    const roasts = MOCK_ROASTS[profile];
    const roast = roasts[Math.floor(Math.random() * roasts.length)];

    const avgLikes = history.length > 0
        ? history.reduce((sum, cast) => sum + cast.likes, 0) / history.length
        : 0;

    const score = clampScore(20 + (history.length * 1.5) + (avgLikes * 2));

    return { roast, profile, score };
}

function extractOutputText(response: unknown): string | null {
    if (!response || typeof response !== "object") {
        return null;
    }

    const direct = (response as { output_text?: unknown }).output_text;
    if (typeof direct === "string" && direct.trim().length > 0) {
        return direct;
    }

    const output = (response as { output?: unknown }).output;
    if (!Array.isArray(output)) {
        return null;
    }

    for (const item of output) {
        const content = (item as { content?: unknown }).content;
        if (!Array.isArray(content)) {
            continue;
        }

        for (const part of content) {
            const candidate = part as { type?: unknown; text?: unknown };
            if (candidate.type === "output_text" && typeof candidate.text === "string") {
                return candidate.text;
            }
        }
    }

    return null;
}

function validateRoastResult(candidate: unknown): RoastResult | null {
    if (!candidate || typeof candidate !== "object") {
        return null;
    }

    const roast = (candidate as { roast?: unknown }).roast;
    const profile = (candidate as { profile?: unknown }).profile;
    const score = (candidate as { score?: unknown }).score;

    if (typeof roast !== "string" || roast.trim().length === 0) {
        return null;
    }
    if (typeof profile !== "string" || !PROFILE_SET.has(profile as RoastProfile)) {
        return null;
    }
    if (typeof score !== "number") {
        return null;
    }

    return {
        roast: roast.trim(),
        profile: profile as RoastProfile,
        score: clampScore(score),
    };
}

async function generateRoastWithOpenAI(username: string, history: Cast[]): Promise<RoastResult | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return null;
    }

    const inputPreview = history
        .slice(0, 20)
        .map((cast, index) => `${index + 1}. (${cast.likes} likes) ${cast.text}`)
        .join("\n");

    const body = {
        model: DEFAULT_OPENAI_MODEL,
        input: [
            {
                role: "system",
                content: [
                    {
                        type: "input_text",
                        text: "You are ClawCook roast engine. Return JSON only following the schema. Roast must be witty, non-hateful, and under 220 characters.",
                    },
                ],
            },
            {
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: `Handle: ${username}\nRecent casts:\n${inputPreview || "No cast text available"}`,
                    },
                ],
            },
        ],
        text: {
            format: {
                type: "json_schema",
                name: "roast_result",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        roast: { type: "string" },
                        profile: {
                            type: "string",
                            enum: ["Larping Dev", "Vibes-only Trader", "Reply Guy", "Unknown"],
                        },
                        score: { type: "number", minimum: 0, maximum: 100 },
                    },
                    required: ["roast", "profile", "score"],
                    additionalProperties: false,
                },
            },
        },
        temperature: 0.9,
    };

    const res = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error(`OpenAI roast request failed (${res.status}).`);
    }

    const payload = await res.json();
    const outputText = extractOutputText(payload);
    if (!outputText) {
        throw new Error("OpenAI response had no output text.");
    }

    const parsed = JSON.parse(outputText) as unknown;
    return validateRoastResult(parsed);
}

export async function generateRoast(username: string, history: Cast[]): Promise<RoastResult> {
    const metrics = getMetricsStore();
    metrics.totalRequests += 1;

    try {
        const aiResult = await generateRoastWithOpenAI(username, history);
        if (aiResult) {
            metrics.aiSuccess += 1;
            return aiResult;
        }
    } catch (error) {
        metrics.aiFailure += 1;
        metrics.lastAiErrorAt = new Date().toISOString();
        console.error("generateRoast: AI path failed, using fallback.", error);
    }

    metrics.fallbackUsed += 1;
    return buildFallbackRoast(username, history);
}
