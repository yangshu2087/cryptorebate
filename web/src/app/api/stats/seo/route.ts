import { NextResponse } from "next/server";
import {
  getAutomationAlerts,
  getAutomationState,
  getTopAutomationOpportunities,
  getTopAutomationRoiPages,
} from "@/lib/automation/catalog";
import { getAutomationDataReality } from "@/lib/automation/data-reality";
import { deriveCtaLiveAuditAlert, getCtaLiveAuditStatus } from "@/lib/automation/github-actions";

function toStatusLabel(status?: string | null) {
  switch (status) {
    case "success":
      return "成功";
    case "failed":
      return "失败";
    case "skipped":
      return "已跳过";
    case "disabled":
      return "未接通";
    case "completed":
      return "已完成";
    case "in_progress":
      return "运行中";
    case "queued":
      return "排队中";
    case "never_run":
      return "尚无运行记录";
    default:
      return status ?? "未知";
  }
}

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
  const latestGscRun = state.runs.find((item) => item.job === "daily_gsc_ingest");
  const latestPartnerRun = state.runs.find((item) => item.job === "daily_revenue_sync");
  const partnerFailures = state.externalSources.partners.filter(
    (item) => item.status === "failed"
  ).length;
  const operatorSummary = {
    statusCards: {
      ctaLiveAudit: {
        status: ctaLiveAuditStatus?.status ?? "unknown",
        conclusion: ctaLiveAuditStatus?.conclusion ?? null,
        label:
          ctaLiveAuditStatus?.status === "completed"
            ? toStatusLabel(ctaLiveAuditStatus.conclusion ?? "completed")
            : toStatusLabel(ctaLiveAuditStatus?.status),
        runId: ctaLiveAuditStatus?.runId ?? 0,
        runNumber: ctaLiveAuditStatus?.runNumber ?? 0,
        updatedAt: ctaLiveAuditStatus?.updatedAt ?? "",
        href: ctaLiveAuditStatus?.htmlUrl ?? null,
      },
      gscSync: {
        status: state.externalSources.gsc.status,
        label: toStatusLabel(state.externalSources.gsc.status),
        updatedAt: state.externalSources.gsc.lastSyncAt ?? latestGscRun?.completedAt ?? "",
        rowsFetched: state.externalSources.gsc.rowsFetched,
        signalsWritten: state.externalSources.gsc.signalsWritten,
      },
      partnerSync: {
        status: partnerFailures > 0 ? "failed" : state.externalSources.partners.some((item) => item.status === "success") ? "success" : "disabled",
        label: partnerFailures > 0 ? "失败" : state.externalSources.partners.some((item) => item.status === "success") ? "成功" : "未接通",
        updatedAt:
          state.externalSources.partners
            .map((item) => item.lastSyncAt)
            .filter(Boolean)
            .sort()
            .at(-1) ?? latestPartnerRun?.completedAt ?? "",
        configuredCount: dataReality.flags.configuredPartnerCount,
        failedCount: partnerFailures,
      },
    },
    sevenDayChanges: {
      clicks: state.attribution.sevenDayClicks,
      registrations: state.attribution.sevenDayRegistrations,
      commissionsUsd: state.attribution.sevenDayCommissionUsd,
      realCoverageRate: state.attribution.realCoverageRate,
    },
    failureTrend: {
      criticalAlerts: alerts.filter((item) => item.level === "critical").length,
      warningAlerts: alerts.filter((item) => item.level === "warning").length,
      partnerFailures,
      gscHealthy: state.externalSources.gsc.status === "success",
      ctaLiveAuditHealthy:
        !ctaLiveAuditStatus ||
        ctaLiveAuditStatus.status === "never_run" ||
        (ctaLiveAuditStatus.status === "completed" &&
          ctaLiveAuditStatus.conclusion === "success"),
    },
    exchangeReality: state.attribution.byExchange.map((item) => ({
      exchangeSlug: item.exchangeSlug,
      clicks: item.clicks,
      conversions: item.conversions,
      commissionsUsd: item.commissionsUsd,
      dataSource: item.dataSource,
      reality:
        dataReality.partnerByExchange.find((entry) => entry.exchangeSlug === item.exchangeSlug)
          ?.reality ?? "未接通",
    })),
  };

  return NextResponse.json(
    {
      data: {
        metrics: state.metrics,
        dataReality,
        externalSources: state.externalSources,
        attribution: state.attribution,
        ctaLiveAudit: ctaLiveAuditStatus,
        topOpportunities: getTopAutomationOpportunities(locale, 10),
        topRoiPages: getTopAutomationRoiPages(locale, 10),
        alerts,
        operatorSummary,
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
