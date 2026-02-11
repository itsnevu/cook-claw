import { NextResponse } from "next/server";
import type { RoastProfile } from "@/lib/roast-engine";
import { addRoastEvent } from "@/lib/roast-store";
import { persistRoastEventToDb } from "@/lib/roast-db";

const PROFILES: RoastProfile[] = ["Larping Dev", "Vibes-only Trader", "Reply Guy", "Unknown"];
const USERNAMES = [
    "alice",
    "buildermax",
    "clawfan",
    "degenqueen",
    "framepilot",
    "gmnight",
    "hashrunner",
    "mintlord",
    "onchainkid",
    "protocolcat",
];
const ROASTS = [
    "Your alpha is always 24 hours late but still loud.",
    "You deploy vibes faster than features.",
    "Your timeline is 90% replies and 10% coping.",
    "Your bags are red but your confidence is green.",
    "You call it strategy, chat calls it chaos.",
    "Even your hot takes need a rollback plan.",
];

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(list: T[]): T {
    return list[randomInt(0, list.length - 1)];
}

function isAuthorized(req: Request): boolean {
    const expected = process.env.DEV_SEED_TOKEN;
    if (!expected) {
        return true;
    }

    const headerToken = req.headers.get("x-dev-seed-token");
    const bearer = req.headers.get("authorization");
    const bearerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : null;
    return headerToken === expected || bearerToken === expected;
}

export async function POST(req: Request) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Seed endpoint disabled in production." }, { status: 403 });
    }

    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized seed access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({})) as { count?: number; daysBack?: number };
    const count = Math.min(Math.max(body.count ?? 120, 1), 2000);
    const daysBack = Math.min(Math.max(body.daysBack ?? 30, 1), 365);

    for (let i = 0; i < count; i += 1) {
        const profile = pickOne(PROFILES);
        const username = pickOne(USERNAMES);
        const score = randomInt(20, 99);
        const roast = pickOne(ROASTS);
        const backMinutes = randomInt(0, daysBack * 24 * 60);
        const createdAt = new Date(Date.now() - backMinutes * 60_000).toISOString();

        const persisted = await persistRoastEventToDb({
            username,
            profile,
            score,
            roast,
            createdAt,
            source: "seed",
        });
        if (!persisted) {
            await addRoastEvent({
                username,
                profile,
                score,
                roast,
                createdAt,
            });
        }
    }

    return NextResponse.json({
        seeded: count,
        daysBack,
        generatedAt: new Date().toISOString(),
    });
}
