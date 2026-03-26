import { NextResponse } from "next/server";
import { runExternalSync } from "@/lib/automation/external-sync";

export const runtime = "nodejs";

export async function POST() {
  const { state, partners } = await runExternalSync("partners");

  return NextResponse.json({
    ok: true,
    data: {
      generatedAt: state.generatedAt,
      projectedRevenue: state.metrics.monthlyProjectedRevenueUsd,
      opportunities: state.metrics.totalOpportunities,
      publishedPages: state.metrics.publishedPages,
      alerts: state.alerts.length,
      partnerSync: partners?.reports ?? [],
    },
  });
}
