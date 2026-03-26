import { NextResponse } from "next/server";
import { runExternalSync } from "@/lib/automation/external-sync";

export const runtime = "nodejs";

export async function POST() {
  const { state, gsc } = await runExternalSync("gsc");

  return NextResponse.json({
    ok: true,
    data: {
      generatedAt: state.generatedAt,
      totalSignals: state.metrics.totalSignals,
      totalOpportunities: state.metrics.totalOpportunities,
      gsc: gsc?.report ?? null,
    },
  });
}
