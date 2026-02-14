import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { GlobalBackground } from "@/components/GlobalBackground";
import { WalletProviders } from "@/components/WalletProviders";
import { CustomCursor } from "@/components/CustomCursor";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clawcook.xyz";
const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
    metadataBase,
    title: {
        default: "ClawCook",
        template: "%s | ClawCook",
    },
    description: "Deploy-ready narrative console for Farcaster handles with score output, live telemetry, and ERC-8004 aligned module context.",
    keywords: [
        "X402 Console",
        "ERC-8004",
        "Farcaster analytics",
        "onchain identity",
        "web3 narrative module",
        "Base ecosystem dashboard",
        "deployment console",
        "crypto telemetry",
    ],
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "ClawCook",
        title: "ClawCook",
        description: "Deploy-ready narrative console for Farcaster handles with score output, live telemetry, and ERC-8004 aligned module context.",
        images: [
            {
                url: "/CLAWCOOK-removebg.png",
                width: 1200,
                height: 630,
                alt: "ClawCook",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ClawCook",
        description: "Deploy-ready narrative console for Farcaster handles with score output, live telemetry, and ERC-8004 aligned module context.",
        images: ["/CLAWCOOK-removebg.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/CLAWCOOK-removebg.png",
        shortcut: "/CLAWCOOK-removebg.png",
        apple: "/CLAWCOOK-removebg.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={cn(
                    jakarta.variable,
                    jetbrains.variable,
                    "bg-background text-foreground min-h-screen antialiased selection:bg-primary selection:text-primary-foreground font-sans"
                )}
            >
                <div className="pointer-events-none fixed inset-0 z-0">
                    <GlobalBackground />
                </div>
                <WalletProviders>
                    <CustomCursor />
                    <div className="relative z-10 flex min-h-screen flex-col">
                        <Navbar />
                        <div className="flex-1">{children}</div>
                        <Footer />
                        <ScrollToTop />
                    </div>
                </WalletProviders>
            </body>
        </html>
    );
}

