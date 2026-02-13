import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    reverse?: boolean;
    pauseOnHover?: boolean;
    vertical?: boolean;
    repeat?: number;
}

export function Marquee({
    children,
    className,
    reverse = false,
    pauseOnHover = false,
    vertical = false,
    repeat = 2,
    ...props
}: MarqueeProps) {
    return (
        <div
            {...props}
            className={cn(
                "group flex overflow-hidden [--duration:18s] [--gap:0.9rem]",
                vertical ? "flex-col" : "flex-row",
                className
            )}
        >
            {Array.from({ length: repeat }).map((_, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "flex shrink-0 justify-around gap-[var(--gap)]",
                        vertical ? "flex-col" : "flex-row",
                        vertical
                            ? "[animation:marquee-vertical_var(--duration)_linear_infinite]"
                            : "[animation:marquee_var(--duration)_linear_infinite]",
                        reverse && "[animation-direction:reverse]",
                        pauseOnHover && "group-hover:[animation-play-state:paused]"
                    )}
                >
                    {children}
                </div>
            ))}
        </div>
    );
}
