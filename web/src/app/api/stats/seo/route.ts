import { NextResponse } from "next/server";
import {
  getAutomationAlerts,
  getAutomationState,
  getTopAutomationOpportunities,
  getTopAutomationRoiPages,
} from "@/lib/automation/catalog";
import { getAutomationDataReality } from "@/lib/automation/data-reality";
import { deriveCtaLiveAuditAlert, getCtaLiveAuditStatus } from "@/lib/automation/github-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? undefined;
  const state = getAutomationState();
  const dataReality = getAutomationDataReality(state);
  const ctaLiveAuditStatus = await getCtaLiveAuditStatus();
  const ctaLiveAuditAlert = deriveCtaLiveAuditAlert(ctaLiveAuditStatus);
  const alerts = [
    ...(ctaLiveAuditAlert ? [ctaLiveAuditAlert] : []),
    ...getAutomationAlerts(locale, 10),
  ]
    .sort(
      (a, b) =>
        new Date(b.triggeredAt).getTime() -
        new Date(a.triggeredAt).getTime()
    )
    .slice(0, 10);

  return NextResponse.json(
    {
      data: {
        metrics: state.metrics,
        dataReality,
        externalSources: state.externalSources,
        ctaLiveAudit: ctaLiveAuditStatus,
        topOpportunities: getTopAutomationOpportunities(locale, 10),
        topRoiPages: getTopAutomationRoiPages(locale, 10),
        alerts,
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
