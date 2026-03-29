import {
  getAutomationAlerts,
  getAutomationState,
  getTopAutomationOpportunities,
  getTopAutomationRoiPages,
} from "@/lib/automation/catalog";
import { readCompetitorGapSummary } from "@/lib/automation/competitor-gap";
import { readCompetitorGapActionPlan } from "@/lib/automation/competitor-gap-actions";
import { readCompetitorGapSerpWinnersArtifact } from "@/lib/automation/competitor-gap-research";
import { getAutomationDataReality } from "@/lib/automation/data-reality";
import { buildSeoStatsFromDb } from "@/lib/automation/db-store";
import { getInternalLinkSlots } from "@/lib/automation/internal-links";
import {
  isFocusExchangeSlug,
  isFocusLocale,
  isFocusPageType,
} from "@/lib/automation/focus";
import {
  deriveCtaLiveAuditAlert,
  getCtaLiveAuditStatus,
} from "@/lib/automation/github-actions";
import type {
  AutomationAlert,
  AutomationState,
  CompetitorGapActionPlan,
  CompetitorGapSerpWinnersArtifact,
  CompetitorGapSummary,
  DistributionJob,
} from "@/lib/automation/types";

function toStatusLabel(status?: string | null) {
  switch (status) {
    case "success":
      return "成功";
    case "warning":
      return "警告";
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
    case "pending":
      return "待发布";
    case "published":
      return "已发布";
    default:
      return status ?? "未知";
  }
}

function buildDistributionSummary(distributionJobs: DistributionJob[]) {
  const summary = {
    total: distributionJobs.length,
    queued: 0,
    pending: 0,
    published: 0,
    failed: 0,
    inProgress: 0,
    byChannel: {
      telegram: { total: 0, queued: 0, pending: 0, published: 0, failed: 0, inProgress: 0 },
      x: { total: 0, queued: 0, pending: 0, published: 0, failed: 0, inProgress: 0 },
    },
  };

  for (const job of distributionJobs) {
    const channelSummary =
      job.channel === "telegram" ? summary.byChannel.telegram : summary.byChannel.x;
    channelSummary.total += 1;

    switch (job.status) {
      case "queued":
        summary.queued += 1;
        channelSummary.queued += 1;
        break;
      case "pending":
        summary.pending += 1;
        channelSummary.pending += 1;
        break;
      case "published":
        summary.published += 1;
        channelSummary.published += 1;
        break;
      case "failed":
        summary.failed += 1;
        channelSummary.failed += 1;
        break;
      case "in_progress":
        summary.inProgress += 1;
        channelSummary.inProgress += 1;
        break;
      default:
        break;
    }
  }

  return summary;
}

function buildCompetitorGapProviderHits(artifact: CompetitorGapSerpWinnersArtifact) {
  const summary = {
    "duckduckgo-html": 0,
    serper: 0,
    brave: 0,
  };

  for (const record of artifact.records) {
    const hitProviders = new Set(
      record.providerReports
        .filter((report) => report.status === "success" && report.resultCount > 0)
        .map((report) => report.provider)
    );

    for (const provider of hitProviders) {
      summary[provider] += 1;
    }
  }

  return summary;
}

function buildCompetitorGapDominantDomains(artifact: CompetitorGapSerpWinnersArtifact) {
  return Object.entries(
    artifact.records.reduce<Record<string, number>>((acc, record) => {
      for (const domain of record.dominantDomains) {
        acc[domain] = (acc[domain] ?? 0) + 1;
      }
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, count]) => ({ domain, count }));
}

export type DiscoveryLaneSummary = {
  gscRowsFetched: number;
  pagesWithImpressions: number;
  queriesTop20: number;
  queriesTop10: number;
  focusPagesPublished: number;
  focusPagesSurfaced: number;
  realCtaClicks7d: number;
};

export type MonetizationLaneSummary = {
  affiliateClicks: number;
  realAffiliateClicks: number;
  registrations: number;
  realRegistrations: number;
  commissionsUsd: number;
  realCommissionUsd: number;
  syntheticCommissionUsd: number;
  realCoverageRate: number;
};

function isWithinDays(timestamp: string | undefined, days: number) {
  if (!timestamp) return false;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs <= days * 24 * 60 * 60 * 1000;
}

export function buildDiscoveryLaneSummary(state: AutomationState): DiscoveryLaneSummary {
  const slots = getInternalLinkSlots(state.internalLinks);
  const gscSignals = state.signals.filter((signal) => signal.source === "gsc");
  const pagesWithImpressions = new Set(
    gscSignals
      .filter((signal) => signal.impressions > 0)
      .map((signal) => `${signal.locale}:${signal.exchangeSlug}:${signal.pageType}`)
  ).size;
  const queriesTop20 = gscSignals.filter(
    (signal) => signal.impressions > 0 && signal.position <= 20
  ).length;
  const queriesTop10 = gscSignals.filter(
    (signal) => signal.impressions > 0 && signal.position <= 10
  ).length;
  const focusPagesPublished = state.pages.filter(
    (page) =>
      page.stage === "published" &&
      isFocusLocale(page.locale) &&
      isFocusExchangeSlug(page.exchangeSlug) &&
      isFocusPageType(page.pageType)
  ).length;
  const focusPagesSurfaced = new Set(
    slots.homepageHeroSecondary
      .flatMap((slot) => slot.guides)
      .concat(
        slots.homepageQuestionClusters.flatMap((slot) => slot.guides),
        slots.exchangeHubFocus.flatMap((slot) => slot.guides),
        slots.exchangeDetailFocus.flatMap((slot) => slot.guides),
        slots.brandSupporting.flatMap((slot) => slot.guides)
      )
      .filter((guide) => isFocusLocale(guide.locale))
      .filter((guide) => isFocusExchangeSlug(guide.exchangeSlug))
      .filter((guide) => isFocusPageType(guide.pageType))
      .map((guide) => `${guide.locale}:${guide.exchangeSlug}:${guide.pageType}`)
  ).size;
  const realCtaClicks7d = state.affiliateClicks.filter(
    (click) => click.dataSource === "real" && isWithinDays(click.clickedAt, 7)
  ).length;

  return {
    gscRowsFetched: state.externalSources.gsc.rowsFetched,
    pagesWithImpressions,
    queriesTop20,
    queriesTop10,
    focusPagesPublished,
    focusPagesSurfaced,
    realCtaClicks7d,
  };
}

export function buildMonetizationLaneSummary(
  state: AutomationState
): MonetizationLaneSummary {
  return {
    affiliateClicks: state.attribution.clicks,
    realAffiliateClicks: state.attribution.realClicks,
    registrations: state.attribution.conversions,
    realRegistrations: state.attribution.realConversions,
    commissionsUsd:
      state.attribution.realCommissionUsd + state.attribution.syntheticCommissionUsd,
    realCommissionUsd: state.attribution.realCommissionUsd,
    syntheticCommissionUsd: state.attribution.syntheticCommissionUsd,
    realCoverageRate: state.attribution.realCoverageRate,
  };
}

export type SeoDashboardData = {
  state: AutomationState;
  metrics: Record<string, unknown>;
  dataReality: ReturnType<typeof getAutomationDataReality>;
  externalSources: AutomationState["externalSources"];
  attribution: AutomationState["attribution"];
  discovery: DiscoveryLaneSummary;
  monetization: MonetizationLaneSummary;
  ctaLiveAudit: Awaited<ReturnType<typeof getCtaLiveAuditStatus>>;
  topOpportunities: ReturnType<typeof getTopAutomationOpportunities>;
  topRoiPages: ReturnType<typeof getTopAutomationRoiPages>;
  distributionJobs: DistributionJob[];
  distributionSummary: ReturnType<typeof buildDistributionSummary>;
  competitorGapSummary: CompetitorGapSummary;
  competitorGapActionPlan: CompetitorGapActionPlan;
  competitorGapSerpWinners: CompetitorGapSerpWinnersArtifact;
  alerts: AutomationAlert[];
  operatorSummary: {
    statusCards: {
      ctaLiveAudit: {
        status: string;
        conclusion: string | null;
        label: string;
        runId: number;
        runNumber: number;
        updatedAt: string;
        href: string | null;
      };
      gscSync: {
        status: string;
        label: string;
        updatedAt: string;
        rowsFetched: number;
        signalsWritten: number;
        sitemapSubmitStatus: string;
        sitemapsSubmitted: string[];
        lastSitemapSubmitAt: string;
      };
      partnerSync: {
        status: string;
        label: string;
        updatedAt: string;
        configuredCount: number;
        failedCount: number;
      };
      internalLinkRefresh: {
        status: string;
        label: string;
        updatedAt: string;
        exchangeGroups: number;
        surfacedGuides: number;
        localesCovered: number;
      };
      competitorGap: {
        status: string;
        label: string;
        updatedAt: string;
        topicsReviewed: number;
        publishCandidates: number;
        refreshCandidates: number;
        internalLinkCandidates: number;
        concreteActions: number;
        providerHits: {
          duckduckgoHtml: number;
          serper: number;
          brave: number;
        };
        totalWinnerUrls: number;
      };
      distribution: {
        status: string;
        label: string;
        queued: number;
        pending: number;
        failed: number;
        published: number;
      };
    };
    discovery: DiscoveryLaneSummary;
    monetization: MonetizationLaneSummary;
    sevenDayChanges: {
      clicks: number;
      registrations: number;
      commissionsUsd: number;
      realCoverageRate: number;
    };
    failureTrend: {
      criticalAlerts: number;
      warningAlerts: number;
      partnerFailures: number;
      gscHealthy: boolean;
      ctaLiveAuditHealthy: boolean;
      distributionFailures: number;
    };
    exchangeReality: Array<{
      exchangeSlug: string;
      clicks: number;
      conversions: number;
      commissionsUsd: number;
      dataSource: string;
      reality: string;
    }>;
  };
};

export async function buildSeoDashboardData(locale?: string | null): Promise<SeoDashboardData> {
  const dbStats = await buildSeoStatsFromDb(locale);
  const state = dbStats?.state ?? getAutomationState();
  const dataReality = dbStats?.dataReality ?? getAutomationDataReality(state);
  const ctaLiveAuditStatus = await getCtaLiveAuditStatus();
  const ctaLiveAuditAlert = deriveCtaLiveAuditAlert(ctaLiveAuditStatus);
  const competitorGapSummary = await readCompetitorGapSummary();
  const competitorGapActionPlan = await readCompetitorGapActionPlan();
  const competitorGapSerpWinners = await readCompetitorGapSerpWinnersArtifact();
  const distributionJobs = dbStats?.distributionJobs ?? [];
  const distributionSummary = buildDistributionSummary(distributionJobs);
  const competitorGapProviderHits = buildCompetitorGapProviderHits(competitorGapSerpWinners);
  const discovery = buildDiscoveryLaneSummary(state);
  const monetization = buildMonetizationLaneSummary(state);
  const alerts = [
    ...(ctaLiveAuditAlert ? [ctaLiveAuditAlert] : []),
    ...(dbStats?.state.alerts ?? getAutomationAlerts(locale ?? undefined, 10)),
  ]
    .sort(
      (a, b) =>
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    )
    .slice(0, 10);

  const latestGscRun = state.runs.find((item) => item.job === "daily_gsc_ingest");
  const latestPartnerRun = state.runs.find(
    (item) => item.job === "daily_revenue_sync" || item.job === "monthly_partner_csv_import"
  );
  const partnerFailures = state.externalSources.partners.filter(
    (item) => item.status === "failed"
  ).length;
  const internalLinkSlots = getInternalLinkSlots(state.internalLinks);
  const internalLinkGroups = state.internalLinks.exchangeGroups;
  const surfacedGuides = [
    ...internalLinkSlots.homepageHeroSecondary.flatMap((slot) => slot.guides),
    ...internalLinkSlots.homepageQuestionClusters.flatMap((slot) => slot.guides),
    ...internalLinkSlots.exchangeHubFocus.flatMap((slot) => slot.guides),
    ...internalLinkSlots.exchangeDetailFocus.flatMap((slot) => slot.guides),
    ...internalLinkSlots.brandSupporting.flatMap((slot) => slot.guides),
  ].length;
  const localesCovered = new Set(
    [
      ...internalLinkSlots.homepageHeroSecondary.map((slot) => slot.locale),
      ...internalLinkSlots.homepageQuestionClusters.map((slot) => slot.locale),
      ...internalLinkSlots.exchangeHubFocus.map((slot) => slot.locale),
      ...internalLinkSlots.exchangeDetailFocus.map((slot) => slot.locale),
      ...internalLinkSlots.brandSupporting.map((slot) => slot.locale),
    ].filter(Boolean)
  ).size;

  return {
    state,
    metrics: dbStats?.metrics ?? state.metrics,
    dataReality,
    externalSources: state.externalSources,
    attribution: state.attribution,
    discovery,
    monetization,
    ctaLiveAudit: ctaLiveAuditStatus,
    topOpportunities:
      dbStats?.topOpportunities ?? getTopAutomationOpportunities(locale ?? undefined, 10),
    topRoiPages:
      dbStats?.topRoiPages ?? getTopAutomationRoiPages(locale ?? undefined, 10),
    distributionJobs,
    distributionSummary,
    competitorGapSummary,
    competitorGapActionPlan,
    competitorGapSerpWinners,
    alerts,
    operatorSummary: {
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
          sitemapSubmitStatus: state.externalSources.gsc.sitemapSubmitStatus ?? "skipped",
          sitemapsSubmitted: state.externalSources.gsc.sitemapsSubmitted ?? [],
          lastSitemapSubmitAt: state.externalSources.gsc.lastSitemapSubmitAt ?? "",
        },
        partnerSync: {
          status:
            partnerFailures > 0
              ? "failed"
              : state.externalSources.partners.some((item) => item.status === "success")
                ? "success"
                : "disabled",
          label:
            partnerFailures > 0
              ? "失败"
              : state.externalSources.partners.some((item) => item.status === "success")
                ? "成功"
                : "未接通",
          updatedAt:
            state.externalSources.partners
              .map((item) => item.lastSyncAt)
              .filter(Boolean)
              .sort()
              .at(-1) ?? latestPartnerRun?.completedAt ?? "",
          configuredCount: dataReality.flags.configuredPartnerCount,
          failedCount: partnerFailures,
        },
        internalLinkRefresh: {
          status: internalLinkGroups.length > 0 ? "success" : "warning",
          label: internalLinkGroups.length > 0 ? "已刷新" : "待刷新",
          updatedAt: state.internalLinks.refreshedAt,
          exchangeGroups: internalLinkGroups.length,
          surfacedGuides,
          localesCovered,
        },
        competitorGap: {
          status: competitorGapSummary.status,
          label: toStatusLabel(competitorGapSummary.status),
          updatedAt: competitorGapSummary.generatedAt,
          topicsReviewed: competitorGapSummary.topicsReviewed,
          publishCandidates: competitorGapSummary.publishCandidates,
          refreshCandidates: competitorGapSummary.refreshCandidates,
          internalLinkCandidates: competitorGapSummary.internalLinkCandidates,
          concreteActions: competitorGapActionPlan.totalActions,
          providerHits: {
            duckduckgoHtml: competitorGapProviderHits["duckduckgo-html"],
            serper: competitorGapProviderHits.serper,
            brave: competitorGapProviderHits.brave,
          },
          totalWinnerUrls: competitorGapSerpWinners.totalWinnerUrls,
        },
        distribution: {
          status:
            distributionSummary.failed > 0
              ? "failed"
              : distributionSummary.queued > 0
                ? "queued"
                : distributionSummary.pending > 0
                  ? "pending"
                  : distributionSummary.published > 0
                    ? "published"
                    : "skipped",
          label:
            distributionSummary.failed > 0
              ? "失败"
              : distributionSummary.queued > 0
                ? "排队中"
                : distributionSummary.pending > 0
                  ? "待发布"
                  : distributionSummary.published > 0
                    ? "已发布"
                    : "已跳过",
          queued: distributionSummary.queued,
          pending: distributionSummary.pending,
          failed: distributionSummary.failed,
          published: distributionSummary.published,
        },
      },
      discovery,
      monetization,
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
        distributionFailures: distributionSummary.failed,
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
    },
  };
}

export { buildCompetitorGapDominantDomains, buildCompetitorGapProviderHits };
