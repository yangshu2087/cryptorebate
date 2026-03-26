import { NextResponse } from "next/server";
import { regenerateAutomationState } from "@/lib/automation/persistence";

export async function POST() {
  const state = await regenerateAutomationState();

  return NextResponse.json({
    ok: true,
    data: {
      generatedAt: state.generatedAt,
      projectedRevenue: state.metrics.monthlyProjectedRevenueUsd,
      opportunities: state.metrics.totalOpportunities,
      publishedPages: state.metrics.publishedPages,
      alerts: state.alerts.length,
    },
  });
}
