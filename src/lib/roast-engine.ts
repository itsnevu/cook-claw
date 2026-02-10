
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

const MOCK_ROASTS: Record<RoastProfile, string[]> = {
    "Larping Dev": [
        "Your GitHub contribution graph looks like a Morse code message for 'SOS'.",
        "You spend more time configuring your neovim than actually shipping code.",
        "Nice wrapper around the wrapper around the API."
    ],
    "Vibes-only Trader": [
        "Your portfolio is down 90% but the vibes are immaculate.",
        "Buying high and selling low isn't a strategy, it's a lifestyle.",
        "You call it 'accumulation phase', the market calls it 'being exit liquidity'."
    ],
    "Reply Guy": [
        "Have you ever had an original thought or is your brain just a retweet button?",
        "Your notifications are the only thing validating your existence.",
        "Touching grass is not a protocol you can interact with."
    ],
    "Unknown": [
        "You're so boring even the AI can't roast you.",
        "Are you an NPC? Blink twice if you have a soul."
    ]
};

export async function generateRoast(username: string, history: Cast[]): Promise<RoastResult> {
    // TODO: Replace with actual LLM call (OpenAI/Bittensor)
    // For now, simple heuristic based on keywords

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency

    let profile: RoastProfile = "Unknown";
    const allText = history.map(h => h.text.toLowerCase()).join(" ");

    if (allText.includes("gm") || allText.includes("wagmi") || allText.includes("mint")) {
        profile = "Vibes-only Trader";
    } else if (allText.includes("git") || allText.includes("deploy") || allText.includes("rust")) {
        profile = "Larping Dev";
    } else if (allText.includes("agree") || allText.includes("this") || history.length > 50) {
        profile = "Reply Guy";
    }

    const roasts = MOCK_ROASTS[profile];
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    const score = Math.floor(Math.random() * 100);

    return {
        roast,
        profile,
        score
    };
}
