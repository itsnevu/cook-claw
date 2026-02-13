"use client";

import { useEffect, useState } from "react";

export function CustomCursor() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const media = window.matchMedia("(hover: hover) and (pointer: fine)");
        const updateEnabled = () => setEnabled(media.matches);
        updateEnabled();
        media.addEventListener("change", updateEnabled);

        if (!media.matches) {
            return () => media.removeEventListener("change", updateEnabled);
        }

        const root = document.documentElement;
        const cursor = document.createElement("div");
        cursor.className = "custom-cursor";
        document.body.append(cursor);

        let x = window.innerWidth / 2;
        let y = window.innerHeight / 2;
        let raf = 0;

        const move = (event: MouseEvent) => {
            x = event.clientX;
            y = event.clientY;
            cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };

        const animate = () => {
            raf = window.requestAnimationFrame(animate);
        };

        const handleHover = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) {
                cursor.classList.remove("is-hover");
                return;
            }
            const hit = target.closest("a, button, input, textarea, select, [role='button'], [data-cursor='interactive']");
            const active = Boolean(hit);
            cursor.classList.toggle("is-hover", active);
        };

        root.classList.add("cursor-enabled");
        window.addEventListener("mousemove", move, { passive: true });
        window.addEventListener("mousemove", handleHover, { passive: true });
        raf = window.requestAnimationFrame(animate);

        return () => {
            media.removeEventListener("change", updateEnabled);
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mousemove", handleHover);
            window.cancelAnimationFrame(raf);
            root.classList.remove("cursor-enabled");
            cursor.remove();
        };
    }, []);

    if (!enabled) {
        return null;
    }

    return null;
}
