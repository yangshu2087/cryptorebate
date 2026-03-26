import { NextResponse } from "next/server";
import {
  getAutomationAlerts,
  getAutomationState,
  getTopAutomationOpportunities,
  getTopAutomationRoiPages,
} from "@/lib/automation/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? undefined;
  const state = getAutomationState();

  return NextResponse.json(
    {
      data: {
        metrics: state.metrics,
        externalSources: state.externalSources,
        topOpportunities: getTopAutomationOpportunities(locale, 10),
        topRoiPages: getTopAutomationRoiPages(locale, 10),
        alerts: getAutomationAlerts(locale, 10),
      },
      meta: {
        generatedAt: state.generatedAt,
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
