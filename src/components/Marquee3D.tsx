/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

type DeployReview = {
    name: string;
    username: string;
    body: string;
    img: string;
};

const deployReviews: DeployReview[] = [
    {
        name: "Nova Relay",
        username: "@novarelay",
        body: "Module capsule finalized in 7.2s. Gas path stable and settlement clean.",
        img: "/CLAWCOOK-removebg.png",
    },
    {
        name: "Cast Matrix",
        username: "@castmatrix",
        body: "X402 sync locked. ERC-8004 loop confirmed with healthy confidence.",
        img: "/CLAWCOOK-removebg.png",
    },
    {
        name: "Node Pilot",
        username: "@nodepilot",
        body: "Wallet gate passed, deploy attempt reached chain and returned expected state.",
        img: "/CLAWCOOK-removebg.png",
    },
    {
        name: "Base Builder",
        username: "@basebuilder",
        body: "Operator profile mapped into narrative module with strong telemetry quality.",
        img: "/CLAWCOOK-removebg.png",
    },
    {
        name: "Risk Oracle",
        username: "@riskoracle",
        body: "Synthetic live feed mirrors onchain pacing and keeps dashboard signal readable.",
        img: "/CLAWCOOK-removebg.png",
    },
    {
        name: "Arc Relay",
        username: "@arcrelay",
        body: "Deployment stream looks real-time. Correlation events stay consistent.",
        img: "/CLAWCOOK-removebg.png",
    },
];

const firstRow = deployReviews.slice(0, deployReviews.length / 2);
const secondRow = deployReviews.slice(deployReviews.length / 2);
const thirdRow = deployReviews.slice(0, deployReviews.length / 2);
const fourthRow = deployReviews.slice(deployReviews.length / 2);

function ReviewCard({ img, name, username, body }: DeployReview) {
    return (
        <figure
            className={cn(
                "relative h-full w-fit cursor-pointer overflow-hidden rounded-xl border p-3 sm:w-44",
                "border-primary/30 bg-black/55 hover:bg-black/65"
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <img className="rounded-full border border-primary/35" width="30" height="30" alt="" src={img} />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium text-white">{name}</figcaption>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-primary">{username}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-xs text-neutral-300">{body}</blockquote>
        </figure>
    );
}

export function Marquee3D() {
    return (
        <div className="relative mt-5 flex h-72 w-full flex-row items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-black/35 [perspective:320px]">
            <div
                className="flex flex-row items-center gap-3"
                style={{
                    transform:
                        "translateX(-70px) translateY(0px) translateZ(-90px) rotateX(18deg) rotateY(-9deg) rotateZ(14deg)",
                }}
            >
                <Marquee pauseOnHover vertical className="[--duration:19s]">
                    {firstRow.map((review) => (
                        <ReviewCard key={`${review.username}-a`} {...review} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:21s]" vertical>
                    {secondRow.map((review) => (
                        <ReviewCard key={`${review.username}-b`} {...review} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
                    {thirdRow.map((review) => (
                        <ReviewCard key={`${review.username}-c`} {...review} />
                    ))}
                </Marquee>
                <Marquee pauseOnHover className="[--duration:22s]" vertical>
                    {fourthRow.map((review) => (
                        <ReviewCard key={`${review.username}-d`} {...review} />
                    ))}
                </Marquee>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-linear-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-linear-to-l from-background to-transparent" />
        </div>
    );
}
