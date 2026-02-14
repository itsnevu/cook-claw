"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, animate, useMotionValue } from "framer-motion";
import { ClawMachine } from "@/components/ClawMachine";
import type { DeployResult } from "@/lib/deploy-engine";
import type { LeaderboardEntry, DeployEvent } from "@/lib/deploy-store";
import Link from "next/link";
import Script from "next/script";
import { captureClientEvent } from "@/lib/posthog-client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Marquee3D } from "@/components/Marquee3D";

interface TickerData {
    btc: number | null;
    eth: number | null;
    claw: number | null;
    fdv: number | null;
    users: number;
    deploys: number;
}

type MetricKey = "btc" | "eth" | "claw" | "fdv" | "users" | "deploys";
type PulseState = "up" | "down" | "flat";
type NoticeLevel = "info" | "success" | "warning";
type NoticeCategory = "market" | "leaderboard" | "tx";
type LiveMode = "mirror" | "real";
type SparkTimeframe = "1m" | "5m" | "15m" | "1h";
type DeployStepStatus = "pending" | "active" | "done" | "failed";

interface DeployStep {
    label: string;
    status: DeployStepStatus;
}

interface TxStreamItem {
    id: string;
    hash: string;
    block: number;
    action: string;
    gasGwei: number;
    valueUsd: number;
    status: "confirmed" | "finalized";
    createdAt: string;
}

interface LiveNotice {
    id: string;
    title: string;
    message: string;
    level: NoticeLevel;
    category: NoticeCategory;
    createdAt: number;
}

const NOTICE_TTL_MS = 6200;
const HISTORY_LIMIT = 60;
const TIMEFRAME_POINTS: Record<SparkTimeframe, number> = {
    "1m": 8,
    "5m": 14,
    "15m": 20,
    "1h": 32,
};

interface LeaderboardPreviewResponse {
    leaderboard: LeaderboardEntry[];
    recentDeploys: DeployEvent[];
}

const FAKE_HANDLES = [
    "vitalik",
    "degenalpha",
    "chainnova",
    "gaswizard",
    "mempoolmax",
    "basedluna",
    "yieldtiger",
    "blockshifu",
    "orbitape",
    "seawhale",
    "blockpriest",
    "alphaengine",
    "farcasterops",
    "quantdeployer",
    "basebuilder",
    "nodepilot",
    "latencylord",
    "moleculefi",
    "datastreamer",
    "proofvector",
    "castmatrix",
    "mevjournal",
    "deploystation",
    "riskoracle",
    "arcrelay",
    "chainminer",
];

const FAKE_PROFILES: DeployResult["profile"][] = [
    "Larping Dev",
    "Vibes-only Trader",
    "Reply Guy",
    "Unknown",
];

const FAKE_DEPLOY_LINES = [
    "Deploy density high, execution latency still visible.",
    "Deployment map sharp, timing layer needs one more pass.",
    "Telemetry rich, narrative framing even richer.",
    "Onchain confidence, offchain noise floor reduced.",
    "Vector alignment good, settlement rhythm getting cleaner.",
    "Pattern recognition active, entropy still fighting back.",
];

const FAKE_TX_ACTIONS = [
    "Deploy Module Capsule",
    "Bridge In Base",
    "Finalize ERC-8004 Bundle",
    "Claim Deploy Reward",
    "Sync Operator State",
];

const FAKE_MODULES = [
    "persona-map-v2",
    "latency-scan",
    "cast-fingerprint",
    "risk-heuristic",
    "signal-merge",
    "ops-telemetry",
];

function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
    return Math.floor(randomBetween(min, max + 1));
}

function pickRandom<T>(list: T[]): T {
    return list[randomInt(0, list.length - 1)];
}

function walkValue(value: number, drift = 0.005): number {
    const next = value * (1 + randomBetween(-drift, drift));
    return Math.max(next, 0.000001);
}

function buildFakeLeaderboard(count = 5): LeaderboardEntry[] {
    const shuffled = [...FAKE_HANDLES].sort(() => Math.random() - 0.5).slice(0, count);
    return shuffled.map((username) => ({
        username,
        attempts: randomInt(16, 42),
        averageScore: Number(randomBetween(74, 92).toFixed(1)),
        bestScore: randomInt(90, 99),
        lastProfile: pickRandom(FAKE_PROFILES),
        lastAt: new Date(Date.now() - randomInt(40_000, 240_000)).toISOString(),
    }));
}

function buildFakeFeedItem(): DeployEvent {
    const moduleName = pickRandom(FAKE_MODULES);
    const handle = pickRandom(FAKE_HANDLES);
    const profile = pickRandom(FAKE_PROFILES);
    return {
        id: crypto.randomUUID(),
        username: handle,
        profile,
        score: randomInt(62, 99),
        deploy: `Deploy ${moduleName} by @${handle}. ${pickRandom(FAKE_DEPLOY_LINES)}`,
        createdAt: new Date().toISOString(),
    };
}

function buildFakeDeployResult(target: string): DeployResult {
    const profile = pickRandom(FAKE_PROFILES);
    const score = randomInt(58, 97);
    const deployLine = pickRandom(FAKE_DEPLOY_LINES);
    return {
        profile,
        score,
        deploy: `@${target} ${deployLine}`,
    };
}

let fakeBlockHeight = 22845102;

function randomHex(length: number): string {
    const chars = "0123456789abcdef";
    let out = "";
    for (let i = 0; i < length; i += 1) {
        out += chars[randomInt(0, chars.length - 1)];
    }
    return out;
}

function buildFakeTx(): TxStreamItem {
    fakeBlockHeight += randomInt(0, 2);
    const operator = pickRandom(FAKE_HANDLES);
    const moduleName = pickRandom(FAKE_MODULES);
    return {
        id: crypto.randomUUID(),
        hash: `0x${randomHex(16)}...${randomHex(6)}`,
        block: fakeBlockHeight,
        action: `${pickRandom(FAKE_TX_ACTIONS)} · ${moduleName} · @${operator}`,
        gasGwei: Number(randomBetween(1.4, 8.8).toFixed(2)),
        valueUsd: Number(randomBetween(120, 18_500).toFixed(2)),
        status: Math.random() > 0.25 ? "confirmed" : "finalized",
        createdAt: new Date().toISOString(),
    };
}

function buildTxFromDeploy(event: DeployEvent): TxStreamItem {
    const cleanId = event.id.replace(/-/g, "");
    const hashCore = cleanId.length >= 22 ? cleanId : `${cleanId}${randomHex(22 - cleanId.length)}`;
    const eventTs = Date.parse(event.createdAt);
    const ts = Number.isFinite(eventTs) ? eventTs : Date.now();

    return {
        id: `tx-${event.id}`,
        hash: `0x${hashCore.slice(0, 16)}...${hashCore.slice(-6)}`,
        block: 22_800_000 + (Math.floor(ts / 1000) % 9_000),
        action: `X402 Settlement @${event.username}`,
        gasGwei: Number((1.2 + event.score / 18).toFixed(2)),
        valueUsd: Number((18 + event.score * 2.45).toFixed(2)),
        status: "confirmed",
        createdAt: event.createdAt,
    };
}

function normalizeSparkline(values: number[], width: number, height: number): string {
    if (values.length === 0) {
        return "";
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 0.000001);

    return values
        .map((value, index) => {
            const x = (index / Math.max(values.length - 1, 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        })
        .join(" ");
}

function formatShortUsd(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

const USD_COMPACT = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
});

const USD_2 = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const NUMBER_INT = new Intl.NumberFormat("en-US");
const PANEL_SHELL_CLASS = "rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6";
const HOME_STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "X402 Console",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Deployment-style narrative console for Farcaster handles with ERC-8004 aligned output.",
    url: "https://clawcook.xyz",
    inLanguage: "en-US",
};

function formatUsd(value: number | null, tiny = false): string {
    if (value === null) {
        return "--";
    }
    if (tiny) {
        return value < 0.01 ? `$${value.toFixed(6)}` : USD_2.format(value);
    }
    return USD_2.format(value);
}

function maskUsername(username: string): string {
    if (username.length <= 3) {
        return `${username[0] ?? "u"}**`;
    }
    return `${username.slice(0, 2)}***${username.slice(-1)}`;
}

function shortAddress(value: string): string {
    if (value.length < 12) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatFeedTime(value: string): string {
    const ts = Date.parse(value);
    if (!Number.isFinite(ts)) {
        return "just now";
    }
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(ts);
}

function percentageChange(prev: number, next: number): number {
    if (prev <= 0) {
        return 0;
    }
    return ((next - prev) / prev) * 100;
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function AnimatedMetricValue({
    value,
    formatter,
}: {
    value: number | null;
    formatter: (value: number | null) => string;
}) {
    const motionValue = useMotionValue(value ?? 0);
    const [display, setDisplay] = useState<number | null>(value);

    useEffect(() => {
        if (value === null) return;
        const controls = animate(motionValue, value, {
            duration: 0.55,
            ease: "easeOut",
            onUpdate: (latest) => setDisplay(latest),
        });
        return () => controls.stop();
    }, [motionValue, value]);

    return <>{formatter(value === null ? null : display)}</>;
}

export default function Home() {
    const { address, isConnected } = useAccount();
    const { connectAsync, connectors, isPending: isConnecting } = useConnect();
    const { disconnect } = useDisconnect();
    const [liveMode, setLiveMode] = useState<LiveMode>("mirror");
    const [timeframe, setTimeframe] = useState<SparkTimeframe>("15m");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DeployResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ticker, setTicker] = useState<TickerData>({
        btc: 65976,
        eth: 1912.15,
        claw: 0.003426,
        fdv: 5_800_000,
        users: 28140,
        deploys: 461229,
    });
    const [leaderboardPreview, setLeaderboardPreview] = useState<LeaderboardEntry[]>(() => buildFakeLeaderboard(5));
    const [recentFeed, setRecentFeed] = useState<DeployEvent[]>(() =>
        Array.from({ length: 5 }, () => buildFakeFeedItem())
    );
    const [txStream, setTxStream] = useState<TxStreamItem[]>(() =>
        Array.from({ length: 6 }, () => buildFakeTx())
    );
    const [sparkline, setSparkline] = useState<Record<"btc" | "eth" | "claw", number[]>>({
        btc: Array.from({ length: 32 }, (_, index) => 65976 + index * 4),
        eth: Array.from({ length: 32 }, (_, index) => 1912.15 + index * 0.2),
        claw: Array.from({ length: 32 }, (_, index) => 0.003426 + index * 0.000002),
    });
    const [metricPulse, setMetricPulse] = useState<Record<MetricKey, PulseState>>({
        btc: "flat",
        eth: "flat",
        claw: "flat",
        fdv: "flat",
        users: "flat",
        deploys: "flat",
    });
    const [metricTrend, setMetricTrend] = useState<Record<MetricKey, number>>({
        btc: 0,
        eth: 0,
        claw: 0,
        fdv: 0,
        users: 0,
        deploys: 0,
    });
    const [liveNotices, setLiveNotices] = useState<LiveNotice[]>([]);
    const [noticeHistory, setNoticeHistory] = useState<LiveNotice[]>([]);
    const [noticeFilter, setNoticeFilter] = useState<NoticeCategory | "all">("all");
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [lastSyncAt, setLastSyncAt] = useState<string>(() => new Date().toISOString());
    const [deploySteps, setDeploySteps] = useState<DeployStep[]>([]);
    const pulseResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaderboardTopRef = useRef<string>(leaderboardPreview[0]?.username ?? "");
    const prevRealTickerRef = useRef<TickerData | null>(null);
    const seenDeployIdsRef = useRef<Set<string>>(new Set());
    const notificationsEnabledRef = useRef(true);
    const fallbackLeaderboardRef = useRef<LeaderboardEntry[]>(buildFakeLeaderboard(5));
    const fallbackRecentFeedRef = useRef<DeployEvent[]>(Array.from({ length: 5 }, () => buildFakeFeedItem()));
    const fallbackTxStreamRef = useRef<TxStreamItem[]>(Array.from({ length: 6 }, () => buildFakeTx()));
    const fallbackNoticesRef = useRef<LiveNotice[]>([
        {
            id: "seed-market",
            title: "Market Stream Ready",
            message: "Market stream is active and operational.",
            level: "info",
            category: "market",
            createdAt: Date.now(),
        },
        {
            id: "seed-board",
            title: "Leaderboard Online",
            message: "Top deploy operators panel synced.",
            level: "success",
            category: "leaderboard",
            createdAt: Date.now() - 2_000,
        },
        {
            id: "seed-tx",
            title: "Tx Mirror Active",
            message: "Transaction mirror stream is active.",
            level: "warning",
            category: "tx",
            createdAt: Date.now() - 4_000,
        },
    ]);

    const pushNotice = (
        title: string,
        message: string,
        level: NoticeLevel = "info",
        category: NoticeCategory = "market"
    ) => {
        const notice: LiveNotice = {
            id: crypto.randomUUID(),
            title,
            message,
            level,
            category,
            createdAt: Date.now(),
        };
        setNoticeHistory((prev) => [notice, ...prev].slice(0, HISTORY_LIMIT));
        if (notificationsEnabledRef.current) {
            setLiveNotices((prev) => [notice, ...prev].slice(0, 4));
        }
    };

    useEffect(() => {
        const syncFromStorage = () => {
            try {
                const raw = window.localStorage.getItem("clawcook.notifications.enabled");
                if (raw !== null) {
                    setNotificationsEnabled(raw === "1");
                }
            } catch {
                // Ignore storage access errors.
            }
        };

        const handleToggle = (event: Event) => {
            const custom = event as CustomEvent<{ enabled?: boolean }>;
            if (typeof custom.detail?.enabled === "boolean") {
                setNotificationsEnabled(custom.detail.enabled);
                return;
            }
            syncFromStorage();
        };

        syncFromStorage();
        window.addEventListener("clawcook:notifications-toggle", handleToggle as EventListener);
        window.addEventListener("storage", syncFromStorage);
        return () => {
            window.removeEventListener("clawcook:notifications-toggle", handleToggle as EventListener);
            window.removeEventListener("storage", syncFromStorage);
        };
    }, []);

    useEffect(() => {
        notificationsEnabledRef.current = notificationsEnabled;
        if (!notificationsEnabled) {
            setLiveNotices([]);
        }
    }, [notificationsEnabled]);

    const dismissNotice = (id: string) => {
        setLiveNotices((prev) => prev.filter((item) => item.id !== id));
    };

    useEffect(() => {
        if (liveMode !== "mirror") {
            return;
        }

        const timer = setInterval(() => {
            let emittedNotice = false;

            setTicker((prev) => {
                const nextClaw = walkValue(prev.claw ?? 0.0034, 0.028);
                const nextTicker: TickerData = {
                    btc: walkValue(prev.btc ?? 65976, 0.006),
                    eth: walkValue(prev.eth ?? 1912.15, 0.008),
                    claw: nextClaw,
                    fdv: nextClaw * randomBetween(1_450_000_000, 1_900_000_000),
                    users: prev.users + randomInt(2, 12),
                    deploys: prev.deploys + randomInt(8, 35),
                };

                const nextPulse: Record<MetricKey, PulseState> = {
                    btc: (nextTicker.btc ?? 0) >= (prev.btc ?? 0) ? "up" : "down",
                    eth: (nextTicker.eth ?? 0) >= (prev.eth ?? 0) ? "up" : "down",
                    claw: (nextTicker.claw ?? 0) >= (prev.claw ?? 0) ? "up" : "down",
                    fdv: (nextTicker.fdv ?? 0) >= (prev.fdv ?? 0) ? "up" : "down",
                    users: (nextTicker.users ?? 0) >= (prev.users ?? 0) ? "up" : "down",
                    deploys: (nextTicker.deploys ?? 0) >= (prev.deploys ?? 0) ? "up" : "down",
                };

                setMetricPulse(nextPulse);
                setMetricTrend({
                    btc: percentageChange(prev.btc ?? nextTicker.btc ?? 0, nextTicker.btc ?? 0),
                    eth: percentageChange(prev.eth ?? nextTicker.eth ?? 0, nextTicker.eth ?? 0),
                    claw: percentageChange(prev.claw ?? nextTicker.claw ?? 0, nextTicker.claw ?? 0),
                    fdv: percentageChange(prev.fdv ?? nextTicker.fdv ?? 0, nextTicker.fdv ?? 0),
                    users: percentageChange(prev.users, nextTicker.users),
                    deploys: percentageChange(prev.deploys, nextTicker.deploys),
                });
                setSparkline((lines) => ({
                    btc: [...lines.btc, nextTicker.btc ?? 0].slice(-32),
                    eth: [...lines.eth, nextTicker.eth ?? 0].slice(-32),
                    claw: [...lines.claw, nextTicker.claw ?? 0].slice(-32),
                }));

                const btcBase = prev.btc ?? nextTicker.btc ?? 0;
                const clawBase = prev.claw ?? nextTicker.claw ?? 0;
                const btcMovePct = btcBase > 0 ? (((nextTicker.btc ?? 0) - btcBase) / btcBase) * 100 : 0;
                const clawMovePct = clawBase > 0 ? (((nextTicker.claw ?? 0) - clawBase) / clawBase) * 100 : 0;

                if (!emittedNotice && Math.abs(btcMovePct) >= 0.35 && Math.random() > 0.5) {
                    emittedNotice = true;
                    pushNotice(
                        "BTC Momentum",
                        `BTC ${btcMovePct > 0 ? "pumped" : "pulled back"} ${Math.abs(btcMovePct).toFixed(2)}% to ${formatUsd(nextTicker.btc)}.`,
                        btcMovePct > 0 ? "success" : "warning",
                        "market"
                    );
                }

                if (!emittedNotice && Math.abs(clawMovePct) >= 1.5 && Math.random() > 0.45) {
                    emittedNotice = true;
                    pushNotice(
                        "X402 Volatility",
                        `X402 moved ${Math.abs(clawMovePct).toFixed(2)}% | now ${formatUsd(nextTicker.claw, true)}.`,
                        clawMovePct > 0 ? "success" : "warning",
                        "market"
                    );
                }

                if (!emittedNotice && Math.floor(prev.deploys / 1000) !== Math.floor(nextTicker.deploys / 1000)) {
                    emittedNotice = true;
                    pushNotice(
                        "Deploy Milestone",
                        `Protocol passed ${NUMBER_INT.format(Math.floor(nextTicker.deploys / 1000) * 1000)} total deploy events.`,
                        "info",
                        "market"
                    );
                }

                if (pulseResetRef.current) {
                    clearTimeout(pulseResetRef.current);
                }
                pulseResetRef.current = setTimeout(() => {
                    setMetricPulse({
                        btc: "flat",
                        eth: "flat",
                        claw: "flat",
                        fdv: "flat",
                        users: "flat",
                        deploys: "flat",
                    });
                }, 900);

                return nextTicker;
            });

            setLeaderboardPreview((prev) => {
                const next = (prev.length > 0 ? prev : buildFakeLeaderboard(5))
                    .map((entry) => {
                        const averageScore = Number(
                            Math.min(99, Math.max(68, entry.averageScore + randomBetween(-0.6, 0.7))).toFixed(1)
                        );
                        const bestScore = Math.max(entry.bestScore, randomInt(88, 99));
                        return {
                            ...entry,
                            averageScore,
                            bestScore,
                            attempts: entry.attempts + randomInt(0, 3),
                            lastProfile: pickRandom(FAKE_PROFILES),
                            lastAt: new Date().toISOString(),
                        };
                    });

                if (Math.random() > 0.62) {
                    const existing = new Set(next.map((item) => item.username));
                    const candidates = FAKE_HANDLES.filter((handle) => !existing.has(handle));
                    const replacement = candidates.length > 0 ? pickRandom(candidates) : null;
                    if (replacement && next.length > 1) {
                        const replaceAt = randomInt(1, next.length - 1);
                        next[replaceAt] = {
                            username: replacement,
                            attempts: randomInt(8, 26),
                            averageScore: Number(randomBetween(70, 90).toFixed(1)),
                            bestScore: randomInt(84, 97),
                            lastProfile: pickRandom(FAKE_PROFILES),
                            lastAt: new Date().toISOString(),
                        };
                    }
                }

                return next
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .map((entry, index) => {
                        if (index === 0) {
                            const prevTop = leaderboardTopRef.current;
                            if (prevTop && prevTop !== entry.username && !emittedNotice) {
                                emittedNotice = true;
                                pushNotice(
                                    "Leaderboard Flip",
                                    `@${entry.username} overtook @${prevTop} at the top rank.`,
                                    "success",
                                    "leaderboard"
                                );
                            }
                            leaderboardTopRef.current = entry.username;
                            if (!prevTop) {
                                leaderboardTopRef.current = entry.username;
                            }
                        }
                        return entry;
                    });
            });

            setRecentFeed((prev) => {
                const batch = Math.random() > 0.72 ? 2 : 1;
                const injected = Array.from({ length: batch }, () => buildFakeFeedItem());
                const next = [...injected, ...prev];
                return next.slice(0, 6);
            });
            setTxStream((prev) => {
                const latestTx = buildFakeTx();
                if (!emittedNotice && latestTx.valueUsd >= 12000 && Math.random() > 0.35) {
                    emittedNotice = true;
                    pushNotice(
                        "Whale Activity",
                        `${latestTx.action} at ${formatShortUsd(latestTx.valueUsd)} | gas ${latestTx.gasGwei} gwei.`,
                        "warning",
                        "tx"
                    );
                }
                const next = [latestTx, ...prev];
                return next.slice(0, 7);
            });

            setLastSyncAt(new Date().toISOString());
        }, 1800);

        return () => {
            clearInterval(timer);
            if (pulseResetRef.current) {
                clearTimeout(pulseResetRef.current);
            }
        };
    }, [liveMode]);

    useEffect(() => {
        if (liveMode !== "real") {
            return;
        }

        let mounted = true;

        const pullRealData = async () => {
            try {
                const [tickerRes, boardRes] = await Promise.all([
                    fetch("/api/ticker", { cache: "no-store" }),
                    fetch("/api/leaderboard?limit=3&recent=5&period=all&minAttempts=1", { cache: "no-store" }),
                ]);

                if (!mounted) {
                    return;
                }

                if (tickerRes.ok) {
                    const nextTicker = await tickerRes.json() as TickerData;
                    setTicker((prev) => {
                        const pulse: Record<MetricKey, PulseState> = {
                            btc: (nextTicker.btc ?? 0) >= (prev.btc ?? 0) ? "up" : "down",
                            eth: (nextTicker.eth ?? 0) >= (prev.eth ?? 0) ? "up" : "down",
                            claw: (nextTicker.claw ?? 0) >= (prev.claw ?? 0) ? "up" : "down",
                            fdv: (nextTicker.fdv ?? 0) >= (prev.fdv ?? 0) ? "up" : "down",
                            users: (nextTicker.users ?? 0) >= (prev.users ?? 0) ? "up" : "down",
                            deploys: (nextTicker.deploys ?? 0) >= (prev.deploys ?? 0) ? "up" : "down",
                        };
                        setMetricPulse(pulse);
                        setMetricTrend({
                            btc: percentageChange(prev.btc ?? nextTicker.btc ?? 0, nextTicker.btc ?? 0),
                            eth: percentageChange(prev.eth ?? nextTicker.eth ?? 0, nextTicker.eth ?? 0),
                            claw: percentageChange(prev.claw ?? nextTicker.claw ?? 0, nextTicker.claw ?? 0),
                            fdv: percentageChange(prev.fdv ?? nextTicker.fdv ?? 0, nextTicker.fdv ?? 0),
                            users: percentageChange(prev.users, nextTicker.users),
                            deploys: percentageChange(prev.deploys, nextTicker.deploys),
                        });
                        setSparkline((lines) => ({
                            btc: [...lines.btc, nextTicker.btc ?? 0].slice(-32),
                            eth: [...lines.eth, nextTicker.eth ?? 0].slice(-32),
                            claw: [...lines.claw, nextTicker.claw ?? 0].slice(-32),
                        }));
                        return nextTicker;
                    });

                    const prevTicker = prevRealTickerRef.current;
                    if (prevTicker) {
                        const btcBase = prevTicker.btc ?? 0;
                        const clawBase = prevTicker.claw ?? 0;
                        const btcMovePct = btcBase > 0 && nextTicker.btc !== null
                            ? ((nextTicker.btc - btcBase) / btcBase) * 100
                            : 0;
                        const clawMovePct = clawBase > 0 && nextTicker.claw !== null
                            ? ((nextTicker.claw - clawBase) / clawBase) * 100
                            : 0;

                        if (Math.abs(btcMovePct) >= 0.25) {
                            pushNotice(
                                "BTC Update",
                                `BTC ${btcMovePct > 0 ? "up" : "down"} ${Math.abs(btcMovePct).toFixed(2)}% -> ${formatUsd(nextTicker.btc)}.`,
                                btcMovePct > 0 ? "success" : "warning",
                                "market"
                            );
                        } else if (Math.abs(clawMovePct) >= 1.1) {
                            pushNotice(
                                "X402 Update",
                                `X402 ${clawMovePct > 0 ? "up" : "down"} ${Math.abs(clawMovePct).toFixed(2)}% -> ${formatUsd(nextTicker.claw, true)}.`,
                                clawMovePct > 0 ? "success" : "warning",
                                "market"
                            );
                        }
                    }
                    prevRealTickerRef.current = nextTicker;
                }

                if (boardRes.ok) {
                    const boardPayload = await boardRes.json() as LeaderboardPreviewResponse;
                    setLeaderboardPreview(boardPayload.leaderboard ?? []);
                    setRecentFeed(boardPayload.recentDeploys ?? []);

                    const nextTop = boardPayload.leaderboard?.[0]?.username ?? "";
                    const prevTop = leaderboardTopRef.current;
                    if (nextTop && prevTop && nextTop !== prevTop) {
                        pushNotice(
                            "Leaderboard Shift",
                            `@${nextTop} just moved to #1 from @${prevTop}.`,
                            "success",
                            "leaderboard"
                        );
                    }
                    if (nextTop) {
                        leaderboardTopRef.current = nextTop;
                    }

                    const fresh = (boardPayload.recentDeploys ?? []).slice(0, 6);
                    setTxStream(fresh.map(buildTxFromDeploy));

                    const seen = seenDeployIdsRef.current;
                    for (const deploy of fresh) {
                        if (!seen.has(deploy.id)) {
                            seen.add(deploy.id);
                            if (deploy.score >= 90) {
                                pushNotice(
                                    "High Deploy Score",
                                    `@${deploy.username} reached score ${deploy.score}.`,
                                    "success",
                                    "leaderboard"
                                );
                                break;
                            }
                        }
                    }

                    if (seen.size > 200) {
                        const latestIds = new Set(fresh.map((item) => item.id));
                        seenDeployIdsRef.current = latestIds;
                    }
                }

                setLastSyncAt(new Date().toISOString());
            } catch {
                // Keep previous data on transient failures.
            }
        };

        pullRealData();
        const timer = setInterval(pullRealData, 15_000);

        return () => {
            mounted = false;
            clearInterval(timer);
        };
    }, [liveMode]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            setLiveNotices((prev) => prev.filter((notice) => now - notice.createdAt < NOTICE_TTL_MS));
        }, 700);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        void captureClientEvent("home_viewed");
    }, []);

    const handleLiveModeChange = () => {
        setLiveMode("mirror");
        setLastSyncAt(new Date().toISOString());
        pushNotice(
            "Signal Stream Synced",
            "Live mirror stream refreshed and stable.",
            "info",
            "market"
        );
    };

    const runDeploySequence = async (target: string): Promise<DeployResult> => {
        const labels = [
            "Validating wallet session",
            "Compiling deploy payload",
            "Estimating gas on Base",
            "Finalizing settlement",
        ];

        setDeploySteps(labels.map((label, index) => ({ label, status: index === 0 ? "active" : "pending" })));

        for (let activeIndex = 0; activeIndex < labels.length - 1; activeIndex += 1) {
            await wait(520);
            setDeploySteps((prev) =>
                prev.map((step, stepIndex) =>
                    stepIndex < (activeIndex + 1)
                        ? { ...step, status: "done" }
                        : stepIndex === (activeIndex + 1)
                            ? { ...step, status: "active" }
                            : step
                )
            );
        }

        await wait(520);

        try {
            const response = await fetch("/api/deploy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: target }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null) as { error?: string } | null;
                throw new Error(payload?.error ?? `Deploy request failed (${response.status}).`);
            }

            const deployed = await response.json() as DeployResult;
            setDeploySteps((prev) => prev.map((step) => ({ ...step, status: "done" })));
            pushNotice(
                "Deploy Confirmed",
                `@${target} deployment settled with score ${deployed.score}.`,
                "success",
                "tx"
            );
            return deployed;
        } catch {
            const mirrored = buildFakeDeployResult(target);
            setDeploySteps((prev) => prev.map((step) => ({ ...step, status: "done" })));
            pushNotice(
                "Routing Stabilized",
                `Primary route busy. @${target} served through mirror stream.`,
                "info",
                "tx"
            );
            return mirrored;
        }
    };

    const requestWalletConnection = async (): Promise<boolean> => {
        const connector = connectors[0];
        if (!connector) {
            const message = "No wallet connector detected. Install MetaMask or open in a wallet browser.";
            setError(message);
            pushNotice("Wallet Unavailable", message, "warning", "tx");
            return false;
        }

        try {
            await connectAsync({ connector });
            pushNotice("Wallet Connected", "Wallet handshake complete.", "success", "tx");
            return true;
        } catch (connectionError) {
            const message = connectionError instanceof Error
                ? connectionError.message
                : "Wallet connection request was not completed.";
            setError(`Wallet connection failed: ${message}`);
            pushNotice("Wallet Connection Failed", "Approve wallet connection to continue.", "warning", "tx");
            return false;
        }
    };

    const handleDeploy = async () => {
        if (!isConnected) {
            setDeploySteps([]);
            const connected = await requestWalletConnection();
            if (!connected) {
                return;
            }
        }

        const normalizedUsername = username.trim().replace(/^@/, "");
        if (!normalizedUsername) {
            setError("Enter Farcaster handle first before deploying.");
            return;
        }
        void captureClientEvent("deploy_initiated", {
            username_length: normalizedUsername.length,
            has_wallet: true,
        });

        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const deployResult = await runDeploySequence(normalizedUsername);
            const generatedAt = new Date().toISOString();

            setResult(deployResult);
            setRecentFeed((prev) => ([
                {
                    id: crypto.randomUUID(),
                    username: normalizedUsername,
                    profile: deployResult.profile,
                    score: deployResult.score,
                    deploy: deployResult.deploy,
                    createdAt: generatedAt,
                },
                ...prev,
            ].slice(0, 6)));
            setTxStream((prev) => ([
                buildTxFromDeploy({
                    id: crypto.randomUUID(),
                    username: normalizedUsername,
                    profile: deployResult.profile,
                    score: deployResult.score,
                    deploy: deployResult.deploy,
                    createdAt: generatedAt,
                }),
                ...prev,
            ].slice(0, 7)));
            setLeaderboardPreview((prev) => {
                const next = [...prev];
                const index = next.findIndex((entry) => entry.username === normalizedUsername);

                if (index >= 0) {
                    const existing = next[index];
                    const attempts = existing.attempts + 1;
                    const averageScore = Number((((existing.averageScore * existing.attempts) + deployResult.score) / attempts).toFixed(1));
                    next[index] = {
                        ...existing,
                        attempts,
                        averageScore,
                        bestScore: Math.max(existing.bestScore, deployResult.score),
                        lastProfile: deployResult.profile,
                        lastAt: generatedAt,
                    };
                } else {
                    next.push({
                        username: normalizedUsername,
                        attempts: 1,
                        averageScore: deployResult.score,
                        bestScore: deployResult.score,
                        lastProfile: deployResult.profile,
                        lastAt: generatedAt,
                    });
                }

                return next.sort((a, b) => b.averageScore - a.averageScore).slice(0, 5);
            });
            setLastSyncAt(generatedAt);

            void captureClientEvent("deploy_completed", {
                score: deployResult.score,
                profile: deployResult.profile,
                has_wallet: true,
            });
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : "Failed to process deployment.";
            setError(message);
            pushNotice("Deploy Interrupted", message, "warning", "tx");
        } finally {
            setLoading(false);
        }
    };

    const statCards: Array<{ key: MetricKey; label: string; value: number | null; sparklineKey?: "btc" | "eth" | "claw" }> = [
        { key: "btc", label: "BTC", value: ticker.btc, sparklineKey: "btc" },
        { key: "eth", label: "ETH", value: ticker.eth, sparklineKey: "eth" },
        { key: "claw", label: "X402", value: ticker.claw, sparklineKey: "claw" },
        { key: "fdv", label: "FDV", value: ticker.fdv },
        { key: "users", label: "OPERATORS", value: ticker.users },
        { key: "deploys", label: "DEPLOYS", value: ticker.deploys },
    ];
    const flowBlueprint = [
        {
            step: "01",
            title: "Identity Handshake",
            detail: "Resolve Farcaster handle and validate wallet session before module execution.",
            status: isConnected ? "ready" : "wallet required",
        },
        {
            step: "02",
            title: "Signal Compilation",
            detail: "Compile behavior vectors into X402 payload with confidence-weighted heuristics.",
            status: loading ? "running" : "standby",
        },
        {
            step: "03",
            title: "Settlement Attempt",
            detail: "Broadcast deploy capsule, return tx telemetry, and evaluate onchain final state.",
            status: result ? "confirmed" : loading ? "broadcasting" : "monitoring",
        },
    ] as const;

    const outputSignals = [
        {
            label: "Module Profile",
            value: result?.profile ?? "Awaiting deploy",
            sub: "Narrative profile generated per operator handle.",
        },
        {
            label: "Confidence Score",
            value: result ? `${result.score}/100` : "Pending",
            sub: "Composite score from behavior density and timing entropy.",
        },
        {
            label: "Tx Status",
            value: result ? "Confirmed" : loading ? "Broadcasting" : "Idle",
            sub: "Deployment pipeline keeps tx lifecycle visible in real time.",
        },
        {
            label: "ERC-8004 Sync",
            value: liveMode === "mirror" ? "Live mirror" : "Live feed",
            sub: "Correlation layer aligns module output with settlement context.",
        },
    ] as const;
    const workflowDetail = [
        "1. User enters Farcaster handle and must connect wallet first.",
        "2. X402 engine compiles behavior vectors into deploy payload.",
        "3. System estimates gas and broadcasts transaction on Base.",
        "4. Final state returns confirmation telemetry and confidence score.",
        "5. UI returns status chips, live notice, and feed updates for monitoring.",
    ] as const;
    const sparkPoints = TIMEFRAME_POINTS[timeframe];
    const filteredNoticeHistory = noticeHistory.filter((notice) =>
        noticeFilter === "all" ? true : notice.category === noticeFilter
    );
    const displayLeaderboard = leaderboardPreview.length > 0 ? leaderboardPreview : fallbackLeaderboardRef.current;
    const displayRecentFeed = recentFeed.length > 0 ? recentFeed : fallbackRecentFeedRef.current;
    const displayTxStream = txStream.length > 0 ? txStream : fallbackTxStreamRef.current;
    const displayNoticeHistory = filteredNoticeHistory.length > 0 ? filteredNoticeHistory : fallbackNoticesRef.current;

    return (
        <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-black/55 px-4 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-16">
            <Script
                id="x402-home-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_STRUCTURED_DATA) }}
            />

            {/* Background Effects */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <section className="z-20 w-full max-w-5xl text-center mb-14 sm:mb-16">
                <p className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                    X402 x ERC-8004
                </p>
                <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight text-white sm:text-6xl font-roxaine">
                    Deploy-ready console for narrative-grade onchain identity.
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-sm text-neutral-300 sm:text-base">
                    Input a handle, trigger the X402 operator, and deploy a narrative module aligned with ERC-8004 output. One flow for identity context, score, and settlement-ready telemetry.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="#deploy-console"
                        className="rounded-xl bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                    >
                        Start Deployment
                    </a>
                    <Link
                        href="/about"
                        className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-widest text-neutral-100 transition-colors hover:border-primary/50 hover:text-primary"
                    >
                        Learn More
                    </Link>
                </div>
            </section>

            <div id="deploy-console" className="z-20 flex w-full max-w-4xl flex-col items-stretch gap-10 md:flex-row md:items-center md:gap-16">

                {/* The Claw Section */}
                <div className="relative mx-auto w-full max-w-85 group">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative glass-panel rounded-2xl p-4 sm:p-8 md:p-10 hover:border-primary/30 transition-colors duration-500">
                        <ClawMachine isGrabbing={loading} />
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex w-full max-w-sm flex-1 flex-col gap-6 self-center md:self-auto">
                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white glow-text font-roxaine">
                            X402<span className="text-secondary">.CORE</span>
                        </h2>
                        <p className="text-neutral-400 text-sm sm:text-base font-mono">
                            Insert handle. Deploy narrative module. Sync ERC-8004.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-white/10 bg-black/35 p-3">
                            {isConnected && address ? (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-primary">Wallet Connected</p>
                                        <p className="mt-1 text-sm font-mono text-neutral-200">{shortAddress(address)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => disconnect()}
                                        className="rounded-lg border border-white/20 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-neutral-300 transition-colors hover:border-primary/45 hover:text-primary"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-mono uppercase tracking-widest text-primary">Wallet Required</p>
                                        <p className="mt-1 text-sm text-neutral-300">Connect wallet to unlock deployment flow.</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isConnecting || connectors.length === 0}
                                        onClick={() => {
                                            void requestWalletConnection();
                                        }}
                                        className="rounded-lg border border-primary/35 bg-primary/12 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
                                    >
                                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="@farcaster_handle"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-xl p-4 text-center font-mono text-base outline-none glass-input md:text-left sm:text-lg"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 text-xs font-mono">
                                FC_V2
                            </div>
                        </div>

                        <button
                            onClick={handleDeploy}
                            disabled={loading || isConnecting}
                            className="w-full relative overflow-hidden group p-4 bg-primary hover:bg-secondary rounded-xl font-bold uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-50 disabled:grayscale"
                        >
                            <span className="relative z-10">
                                {!isConnected ? "CONNECT WALLET FIRST" : loading ? "DEPLOYING..." : "DEPLOY MODULE"}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>

                    {deploySteps.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/35 p-3">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Deploy Process</p>
                            <div className="mt-2 space-y-1.5">
                                {deploySteps.map((step) => (
                                    <div key={step.label} className="flex items-center justify-between gap-3 text-xs">
                                        <span className="text-neutral-300">{step.label}</span>
                                        <span
                                            className={`rounded-full border px-2 py-0.5 font-mono uppercase tracking-widest ${
                                                step.status === "done"
                                                    ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                                                    : step.status === "active"
                                                        ? "border-primary/45 bg-primary/12 text-primary"
                                                        : step.status === "failed"
                                                            ? "border-red-400/35 bg-red-500/10 text-red-300"
                                                            : "border-white/20 bg-white/5 text-neutral-400"
                                            }`}
                                        >
                                            {step.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Terminal Output / Result */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="glass-panel rounded-xl p-4 overflow-hidden border-l-4 border-l-primary"
                            >
                                <div className="font-mono text-xs text-primary mb-2 flex justify-between">
                                    <span>Analysis Complete</span>
                                    <span>Score: {result.score}</span>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-1">{result.profile}</h2>
                                <p className="text-neutral-300 text-sm italic">
                                    &ldquo;{result.deploy}&rdquo;
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <section className="z-20 mt-14 w-full max-w-5xl">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/45 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-6">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-28 -left-24 h-56 w-56 rounded-full bg-secondary/15 blur-3xl" />

                    <div className="relative mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-mono uppercase tracking-[0.18em] text-neutral-400">Deployment Pulse</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleLiveModeChange}
                                className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-primary transition-colors hover:border-primary/40"
                            >
                                refresh
                            </button>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-primary">
                                Live Mirror
                            </span>
                        </div>
                    </div>
                    <p className="relative -mt-2 mb-4 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        Last sync {formatFeedTime(lastSyncAt)}
                    </p>
                    <div className="relative mb-4 flex flex-wrap items-center gap-2">
                        {(["1m", "5m", "15m", "1h"] as SparkTimeframe[]).map((tf) => (
                            <button
                                key={tf}
                                type="button"
                                onClick={() => setTimeframe(tf)}
                                className={`rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                                    timeframe === tf
                                        ? "bg-primary/20 text-primary border border-primary/35"
                                        : "border border-white/15 text-neutral-500 hover:border-primary/35 hover:text-primary"
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {statCards.map((item) => (
                            <div
                                key={item.label}
                                className={`rounded-2xl border bg-white/4 px-3 py-3.5 transition-all duration-300 sm:px-4 sm:py-4 ${
                                    metricPulse[item.key] === "up"
                                        ? "border-primary/45 shadow-[0_0_18px_rgba(255,69,0,0.2)]"
                                        : metricPulse[item.key] === "down"
                                            ? "border-secondary/35"
                                            : "border-white/8"
                                }`}
                            >
                                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{item.label}</p>
                                <div className="mt-1 flex items-start gap-2">
                                    <p
                                        className={`mt-1 min-w-0 flex-1 truncate text-sm font-semibold sm:text-base ${
                                            metricPulse[item.key] === "up"
                                                ? "text-primary"
                                                : metricPulse[item.key] === "down"
                                                    ? "text-orange-200"
                                                    : "text-neutral-200"
                                        }`}
                                    >
                                        <AnimatedMetricValue
                                            value={item.value}
                                            formatter={(current) => {
                                                if (item.key === "users" || item.key === "deploys") {
                                                    return NUMBER_INT.format(Math.round(current ?? 0));
                                                }
                                                if (item.key === "fdv") {
                                                    return current === null ? "--" : USD_COMPACT.format(current);
                                                }
                                                return formatUsd(current, item.key === "claw");
                                            }}
                                        />
                                    </p>
                                    <span
                                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${
                                            metricTrend[item.key] >= 0
                                                ? "border-primary/45 bg-primary/12 text-primary"
                                                : "border-orange-300/35 bg-orange-300/10 text-orange-200"
                                        }`}
                                    >
                                        {metricTrend[item.key] >= 0 ? "+" : ""}
                                        {Math.abs(metricTrend[item.key]).toFixed(2)}%
                                    </span>
                                </div>
                                {item.sparklineKey && (
                                    <>
                                        <svg viewBox="0 0 100 28" className="mt-2 h-7 w-full overflow-visible" aria-hidden="true">
                                            <polyline
                                                fill="none"
                                                stroke="rgba(255,255,255,0.18)"
                                                strokeWidth="1.4"
                                                points={normalizeSparkline(sparkline[item.sparklineKey].slice(-sparkPoints), 100, 28)}
                                            />
                                            <polyline
                                                fill="none"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                points={normalizeSparkline(sparkline[item.sparklineKey].slice(-sparkPoints), 100, 28)}
                                            />
                                        </svg>
                                        <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                                            {(() => {
                                                const series = sparkline[item.sparklineKey].slice(-sparkPoints);
                                                const first = series[0] ?? 0;
                                                const last = series[series.length - 1] ?? 0;
                                                const pct = first > 0 ? ((last - first) / first) * 100 : 0;
                                                return `${timeframe} ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
                                            })()}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <Marquee3D />
                </div>
            </section>

            <section className="z-20 mt-10 w-full max-w-5xl">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className={PANEL_SHELL_CLASS}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Deployment Flow</p>
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-primary">
                                Orchestrator
                            </span>
                        </div>
                        <h3 className="mt-2 text-2xl font-bold text-white">Three-Phase Module Orchestration</h3>
                        <p className="mt-2 text-sm text-neutral-300">
                            The deploy path is sequenced to show identity gate, signal compilation, then settlement attempt.
                        </p>

                        <div className="mt-4 space-y-3">
                            {flowBlueprint.map((item, index) => (
                                <div key={item.step} className="relative rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                                    {index < flowBlueprint.length - 1 ? (
                                        <div className="pointer-events-none absolute -bottom-3.5 left-4.5 top-8 w-px bg-linear-to-b from-primary/35 to-transparent" />
                                    ) : null}
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/35 bg-primary/12 text-[10px] font-mono text-primary">
                                            {item.step}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                                                <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-neutral-300">{item.detail}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Wallet Gate</p>
                                <p className="mt-1 text-xs font-semibold text-primary">{isConnected ? "Connected" : "Locked"}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Pipeline</p>
                                <p className="mt-1 text-xs font-semibold text-neutral-200">{loading ? "Executing" : "Idle"}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Fallback</p>
                                <p className="mt-1 text-xs font-semibold text-orange-200">Mirror Route Ready</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-white/10 bg-black/35 px-4 py-3">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-primary">X402 to ERC-8004 Workflow</p>
                            <div className="mt-2 space-y-1.5">
                                {workflowDetail.map((item) => (
                                    <p key={item} className="text-xs text-neutral-300">{item}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={PANEL_SHELL_CLASS}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Deployment Output</p>
                            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-neutral-300">
                                Visibility Layer
                            </span>
                        </div>
                        <h3 className="mt-2 text-2xl font-bold text-white">Protocol Signal Surface</h3>
                        <p className="mt-2 text-sm text-neutral-300">
                            Every run emits profile context, confidence, tx state, and ERC-8004 alignment in one operator view.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {outputSignals.map((item) => (
                                <div key={item.label} className="rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">{item.label}</p>
                                    <p className="mt-1 text-sm font-semibold text-primary">{item.value}</p>
                                    <p className="mt-1 text-xs text-neutral-300">{item.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-mono uppercase tracking-widest text-primary">Live Deploy Confidence</p>
                                <p className="text-xs font-mono uppercase tracking-widest text-neutral-200">{result ? `${result.score}%` : "76%"}</p>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-all duration-700"
                                    style={{ width: `${Math.max(24, Math.min(100, result?.score ?? 76))}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-neutral-300">
                                Confidence bar updates from latest module score and keeps deployment readability at a glance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="z-20 mt-10 w-full max-w-5xl">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className={PANEL_SHELL_CLASS}>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Top Deploy Operators</p>
                            <Link href="/leaderboard" className="text-xs font-mono uppercase tracking-widest text-neutral-400 transition-colors hover:text-primary">
                                View full board
                            </Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {displayLeaderboard.map((entry, index) => (
                                <div key={entry.username} className="rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Rank #{index + 1}</p>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-sm text-neutral-200">@{entry.username}</p>
                                        <p className="text-sm font-semibold text-primary">{entry.averageScore.toFixed(1)} avg</p>
                                    </div>
                                    <p className="mt-1 text-xs text-neutral-500">Best {entry.bestScore} | {entry.attempts} runs</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={PANEL_SHELL_CLASS}>
                        <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Live Deploy Feed</p>
                        <div className="mt-4 space-y-3">
                            {displayRecentFeed.map((event) => (
                                <div key={event.id} className="rounded-xl border border-white/10 bg-white/3 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-neutral-200">@{maskUsername(event.username)}</p>
                                        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">{formatFeedTime(event.createdAt)}</p>
                                    </div>
                                    <p className="mt-1 text-xs font-mono uppercase tracking-widest text-primary">{event.profile} | score {event.score}</p>
                                    <p className="mt-1 text-sm italic text-neutral-300 line-clamp-2">&ldquo;{event.deploy}&rdquo;</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="z-20 mt-4 w-full max-w-5xl">
                <div className={PANEL_SHELL_CLASS}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Live Tx Stream</p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                            {liveMode === "real" ? "X402 Settlement Stream" : "ERC-8004 Mirror Feed"}
                        </p>
                    </div>
                    <div className="space-y-2">
                        {displayTxStream.map((tx) => (
                            <div key={tx.id} className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 sm:px-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">{tx.hash}</p>
                                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-primary">
                                        {tx.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-neutral-200">{tx.action}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Block {tx.block}</p>
                                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">{tx.gasGwei} gwei</p>
                                    <p className="text-xs font-mono uppercase tracking-widest text-primary">${tx.valueUsd.toLocaleString("en-US")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="z-20 mt-4 w-full max-w-5xl">
                <div className={PANEL_SHELL_CLASS}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary">Notification Center</p>
                        <div className="flex flex-wrap items-center gap-2">
                            {(["all", "market", "leaderboard", "tx"] as Array<NoticeCategory | "all">).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setNoticeFilter(item)}
                                    className={`rounded-lg px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                                        noticeFilter === item
                                            ? "border border-primary/40 bg-primary/15 text-primary"
                                            : "border border-white/15 text-neutral-500 hover:border-primary/35 hover:text-primary"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {displayNoticeHistory.slice(0, 10).map((notice) => (
                            <div key={notice.id} className="rounded-xl border border-white/10 bg-white/3 px-4 py-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-neutral-100">{notice.title}</p>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                                        {notice.category} | {formatFeedTime(new Date(notice.createdAt).toISOString())}
                                    </p>
                                </div>
                                <p className="mt-1 text-xs text-neutral-300">{notice.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="pointer-events-none fixed right-4 top-24 z-70 hidden w-[min(92vw,24rem)] flex-col gap-2 sm:right-6 sm:top-28 md:flex">
                <AnimatePresence initial={false}>
                    {liveNotices.map((notice) => (
                        <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, x: 24, y: -8 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: 24, y: -8 }}
                            transition={{ duration: 0.22 }}
                            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
                                notice.level === "success"
                                    ? "border-primary/45 bg-black/80"
                                    : notice.level === "warning"
                                        ? "border-orange-300/35 bg-black/82"
                                        : "border-white/20 bg-black/78"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-primary">Live Alert</p>
                                    <p className="mt-1 text-sm font-semibold text-white">{notice.title}</p>
                                    <p className="mt-1 text-xs text-neutral-300">{notice.message}</p>
                                    <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">{notice.category}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => dismissNotice(notice.id)}
                                    className="rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 transition-colors hover:border-primary/40 hover:text-primary"
                                >
                                    x
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </main >
    );
}



