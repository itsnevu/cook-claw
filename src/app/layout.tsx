import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
    title: "X402 Console",
    description: "Correlation-first protocol console aligned with ERC-8004 narrative systems.",
    icons: {
        icon: "/clawcook-favicon.png",
        shortcut: "/clawcook-favicon.png",
        apple: "/clawcook-favicon.png",
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
                <div className="flex min-h-screen flex-col">
                    <Navbar />
                    <div className="flex-1">{children}</div>
                    <Footer />
                    <ScrollToTop />
                </div>
            </body>
        </html>
    );
}

