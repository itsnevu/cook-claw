"use client";

import PixelBlast from "@/components/PixelBlast";

export function GlobalBackground() {
    return (
        <div className="relative h-full w-full">
            <PixelBlast
                variant="square"
                pixelSize={4}
                color="#FB923C"
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,146,60,0.22),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.16),transparent_38%),linear-gradient(180deg,rgba(8,8,8,0.58),rgba(8,8,8,0.72))]" />
        </div>
    );
}

