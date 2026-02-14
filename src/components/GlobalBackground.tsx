"use client";

import PixelBlast from "@/components/PixelBlast";

export function GlobalBackground() {
    return (
        <div className="relative h-full w-full">
            <PixelBlast
                variant="square"
                pixelSize={4}
                color="#d53016"
                patternScale={2}
                patternDensity={1}
                pixelSizeJitter={0}
                enableRipples
                rippleSpeed={0.4}
                rippleThickness={0.12}
                rippleIntensityScale={1.5}
                liquid={false}
                liquidStrength={0.12}
                liquidRadius={1.2}
                liquidWobbleSpeed={5}
                speed={0.5}
                edgeFade={0.25}
                transparent
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(213,48,22,0.24),transparent_46%),radial-gradient(circle_at_82%_12%,rgba(179,9,40,0.22),transparent_44%),radial-gradient(circle_at_52%_78%,rgba(255,194,156,0.15),transparent_48%),linear-gradient(180deg,rgba(20,10,10,0.52),rgba(22,9,14,0.72))]" />
        </div>
    );
}
