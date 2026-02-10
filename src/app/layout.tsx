import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-jakarta',
})

export const metadata: Metadata = {
    title: 'ClawCook',
    description: 'The World’s First Agentic "Roast-to-Earn" Clawbot',
    icons: {
        icon: "/clawcook-favicon.png",
        shortcut: "/clawcook-favicon.png",
        apple: "/clawcook-favicon.png",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={cn(jakarta.className, "bg-background text-foreground min-h-screen antialiased selection:bg-primary selection:text-primary-foreground font-sans")}>
                {children}
            </body>
        </html>
    )
}
