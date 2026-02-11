import { NextResponse } from "next/server";
import { getIntegrationStatus } from "@/lib/integration-status";

export async function GET() {
    const items = await getIntegrationStatus();
    const required = items.filter((i) => i.required);
    const requiredReady = required.filter((i) => i.state === "connected").length;

    return NextResponse.json({
        summary: {
            requiredReady,
            requiredTotal: required.length,
            overallReady: requiredReady === required.length,
        },
        items,
        generatedAt: new Date().toISOString(),
    });
}
