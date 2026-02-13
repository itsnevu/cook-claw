import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clawcook.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const routes = [
        "",
        "/about",
        "/docs",
        "/faq",
        "/contact",
        "/leaderboard",
        "/metrics",
        "/analytics",
        "/setup",
        "/security",
        "/privacy",
        "/terms",
        "/licenses",
    ];

    return routes.map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.7,
    }));
}

