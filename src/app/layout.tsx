import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'SnarkClaw',
    description: 'The World’s First Agentic "Roast-to-Earn" Clawbot',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={cn(inter.className, "bg-background text-foreground min-h-screen antialiased selection:bg-primary selection:text-primary-foreground")}>
                {children}
            </body>
        </html>
    )
}
