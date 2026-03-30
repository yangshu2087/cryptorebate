import {
  getAutomationAlerts,
  getAutomationState,
  getTopAutomationOpportunities,
  getTopAutomationRoiPages,
} from "@/lib/automation/catalog";
import { auditCoverageRepair, readCoverageRepairArtifact } from "@/lib/automation/coverage-audit";
import { readCompetitorGapSummary } from "@/lib/automation/competitor-gap";
import { readCompetitorGapActionPlan } from "@/lib/automation/competitor-gap-actions";
import { readCompetitorGapSerpWinnersArtifact } from "@/lib/automation/competitor-gap-research";
import { getAutomationDataReality } from "@/lib/automation/data-reality";
import { buildSeoStatsFromDb } from "@/lib/automation/db-store";
import { getInternalLinkSlots } from "@/lib/automation/internal-links";
import { getIndexGrowthPolicy } from "@/lib/automation/index-growth-policy";
import {
  isFocusExchangeSlug,
  isFocusLocale,
  isFocusPageType,
} from "@/lib/automation/focus";
import { getGscFocusPageMonitorTargets } from "@/lib/automation/gsc-focus-page-monitor";
import { summarizeGscFocusPageRowMonitor } from "@/lib/automation/gsc-focus-page-monitor";
import { deriveCtaLiveAuditAlert, getCtaLiveAuditStatus } from "@/lib/automation/github-actions";
import type {
  AutomationAlert,
  AutomationState,
  CompetitorGapActionPlan,
  CompetitorGapSerpWinnersArtifact,
  CompetitorGapSummary,
  DistributionJob,
  GscFocusPageRowMonitorEntry,
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

export type IndexGrowthPolicySummary = {
  config: {
    maxNewPagesPerDay: number;
    maxRefreshPagesPerDay: number;
    publishDailyLimitPerExchange: number;
    refreshDailyLimitPerExchange: number;
    seedLocale: string;
    expansionLocales: string[];
    observationWindows: {
      day7: number;
      day14: number;
      day21: number;
    };
  };
  publishBudget: {
    used: number;
    max: number;
    remaining: number;
    byExchange: Array<{
      exchangeSlug: string;
      used: number;
      max: number;
    }>;
  };
  refreshBudget: {
    used: number;
    max: number;
    remaining: number;
    byExchange: Array<{
      exchangeSlug: string;
      used: number;
      max: number;
    }>;
  };
  deferredPages: Array<{
    id: string;
    locale: string;
    exchangeSlug: string;
    pageType: string;
    action: string;
    observationDays: number;
    reason: string;
    score: number;
  }>;
  refreshOrPrunePages: Array<{
    id: string;
    locale: string;
    exchangeSlug: string;
    pageType: string;
    action: "refresh" | "prune";
    observationDays: number;
    reason: string;
    score: number;
  }>;
};

export type SearchVisibilityActionPlan = {
  continuePush: Array<{
    id: string;
    locale: string;
    exchangeSlug: string;
    pageType: string;
    primaryQuery: string;
    score: number;
    title: string;
    description: string;
    why: string;
  }>;
  titleDescriptionRefresh: Array<{
    id: string;
    locale: string;
    exchangeSlug: string;
    pageType: string;
    primaryQuery: string;
    score: number;
    title: string;
    description: string;
    why: string;
    copyFocus: string;
  }>;
  refreshInsteadOfExpand: Array<{
    id: string;
    locale: string;
    exchangeSlug: string;
    pageType: string;
    primaryQuery: string;
    score: number;
    action: string;
    observationDays: number;
    why: string;
  }>;
};

export type GscFocusPageRowMonitorSummary = ReturnType<
  typeof buildGscFocusPageRowMonitorSummary
>;
export type CoverageRepairLaneSummary = Awaited<ReturnType<typeof auditCoverageRepair>>;

export type DiscoverySprintSummary = {
  status: "warning" | "active" | "hit";
  label: string;
  updatedAt: string;
  trackedSeedPages: number;
  pageRowsSeen: number;
  impressionPagesSeen: number;
  clickPagesSeen: number;
  seedPagesSurfaced: number;
  seedPagesFrozen: number;
  seedPagesRefreshDue: number;
  pinnedSurfaces: {
    homepage: DiscoverySprintSurfaceSummary;
    exchangeHub: DiscoverySprintSurfaceSummary;
    exchangeDetail: DiscoverySprintSurfaceSummary;
    feed: DiscoverySprintSurfaceSummary;
    freshSitemap: DiscoverySprintSurfaceSummary;
    focusSitemap: DiscoverySprintSurfaceSummary;
  };
  stageBuckets: {
    observe: DiscoverySprintEntry[];
    ctrRefresh: DiscoverySprintEntry[];
    templateRefresh: DiscoverySprintEntry[];
    pruneCandidate: DiscoverySprintEntry[];
    frozen: DiscoverySprintEntry[];
  };
  firstImpressionForecast: {
    day3: DiscoverySprintForecastEntry[];
    day7: DiscoverySprintForecastEntry[];
    day14: DiscoverySprintForecastEntry[];
  };
  summary: {
    topTargetPage: DiscoverySprintEntry | null;
    topRefreshPage: DiscoverySprintEntry | null;
    topImpressionPage3d: DiscoverySprintForecastEntry | null;
    topImpressionPage7d: DiscoverySprintForecastEntry | null;
    topImpressionPage14d: DiscoverySprintForecastEntry | null;
    blockedExpansionExample: {
      locale: string;
      exchangeSlug: string;
      pageType: string;
      reason: string;
    } | null;
  };
};

type DiscoverySprintEntry = {
  id: string;
  locale: string;
  exchangeSlug: string;
  pageType: string;
  primaryQuery: string;
  routePath: string;
  score: number;
  stage: string;
  reason: string;
  observationDays: number;
};

type DiscoverySprintForecastEntry = DiscoverySprintEntry & {
  horizonDays: 3 | 7 | 14;
  likelihoodScore: number;
  pinCount: number;
  pinSources: string[];
  why: string;
};

type DiscoverySprintSurfaceSummary = {
  count: number;
  items: DiscoverySprintEntry[];
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

export function buildIndexGrowthPolicySummary(
  state: AutomationState
): IndexGrowthPolicySummary {
  const config = getIndexGrowthPolicy();
  const opportunities = [...state.opportunities];
  const publishScheduled = opportunities.filter(
    (item) =>
      item.indexPolicyScheduledToday &&
      (item.indexPolicyAction === "publish" || item.indexPolicyAction === "expand")
  );
  const refreshScheduled = opportunities.filter(
    (item) => item.indexPolicyScheduledToday && item.indexPolicyAction === "refresh"
  );

  const buildByExchange = (
    items: typeof publishScheduled,
    max: number
  ): Array<{ exchangeSlug: string; used: number; max: number }> =>
    Object.entries(
      items.reduce<Record<string, number>>((acc, item) => {
        acc[item.exchangeSlug] = (acc[item.exchangeSlug] ?? 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .map(([exchangeSlug, used]) => ({ exchangeSlug, used, max }));

  const deferredPages = opportunities
    .filter(
      (item) =>
        !item.indexPolicyScheduledToday &&
        (item.indexPolicyAction === "publish" ||
          item.indexPolicyAction === "expand" ||
          item.indexPolicyAction === "refresh")
    )
    .sort(
      (a, b) =>
        (b.discoveryPriority ?? 0) - (a.discoveryPriority ?? 0) ||
        b.score - a.score
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      locale: item.locale,
      exchangeSlug: item.exchangeSlug,
      pageType: item.pageType,
      action: item.indexPolicyAction,
      observationDays: item.indexPolicyObservationDays,
      reason: item.indexPolicyReason,
      score: item.score,
    }));

  const refreshOrPrunePages = opportunities
    .filter(
      (item) =>
        item.indexPolicyAction === "refresh" || item.indexPolicyAction === "prune"
    )
    .sort(
      (a, b) =>
        b.indexPolicyObservationDays - a.indexPolicyObservationDays ||
        b.score - a.score
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      locale: item.locale,
      exchangeSlug: item.exchangeSlug,
      pageType: item.pageType,
      action: item.indexPolicyAction as "refresh" | "prune",
      observationDays: item.indexPolicyObservationDays,
      reason: item.indexPolicyReason,
      score: item.score,
    }));

  return {
    config,
    publishBudget: {
      used: publishScheduled.length,
      max: config.maxNewPagesPerDay,
      remaining: Math.max(0, config.maxNewPagesPerDay - publishScheduled.length),
      byExchange: buildByExchange(publishScheduled, config.publishDailyLimitPerExchange),
    },
    refreshBudget: {
      used: refreshScheduled.length,
      max: config.maxRefreshPagesPerDay,
      remaining: Math.max(0, config.maxRefreshPagesPerDay - refreshScheduled.length),
      byExchange: buildByExchange(refreshScheduled, config.refreshDailyLimitPerExchange),
    },
    deferredPages,
    refreshOrPrunePages,
  };
}


function getActionPlanCopyFocus(pageType: string) {
  switch (pageType) {
    case "official-site":
      return "把主 query 放到标题前半段，并在描述里明确 official domain / safe signup route / region restrictions / alternatives。";
    case "referral-code":
      return "把 referral code / official signup route / rebate terms 放进 description，避免只写泛泛返佣。";
    case "signup-kyc":
      return "在描述里直接写 signup / KYC documents / rebate active timing / funding prerequisites。";
    case "fees-rebate":
      return "在描述里直接写 fees / rebate / effective trading cost / compare alternatives。";
    default:
      return "把主 query 放到标题前半段，并让 description 直接回答用户的注册前问题。";
  }
}

export function buildSearchVisibilityActionPlan(
  state: AutomationState
): SearchVisibilityActionPlan {
  const policy = getIndexGrowthPolicy();
  const pageMap = new Map(
    state.pages.map((page) => [
      `${page.locale}:${page.exchangeSlug}:${page.pageType}`,
      page,
    ] as const)
  );
  const priorityPageTypes = new Set(policy.priorityPageTypes);
  const seedLocale = policy.seedLocale;
  const scoreSort = (a: AutomationState["opportunities"][number], b: AutomationState["opportunities"][number]) =>
    (b.discoveryPriority ?? 0) - (a.discoveryPriority ?? 0) || b.score - a.score;

  const continuePush = state.opportunities
    .filter(
      (item) =>
        item.focusLane === "focus" &&
        item.locale === seedLocale &&
        priorityPageTypes.has(item.pageType) &&
        item.indexPolicyAllowPromotion
    )
    .sort(scoreSort)
    .slice(0, 8)
    .map((item) => {
      const page = pageMap.get(`${item.locale}:${item.exchangeSlug}:${item.pageType}`);
      return {
        id: item.id,
        locale: item.locale,
        exchangeSlug: item.exchangeSlug,
        pageType: item.pageType,
        primaryQuery: item.primaryQuery,
        score: item.score,
        title: page?.metadata.title ?? item.primaryQuery,
        description: page?.metadata.description ?? item.indexPolicyReason,
        why:
          item.indexPolicyAction === "refresh"
            ? "这是焦点 seed 页，虽然还没进 page rows，但当前仍应继续推并同步刷新模板/内链。"
            : "这是当前最该继续推的焦点 seed 页，优先争取先进入 GSC page rows。",
      };
    });

  const titleDescriptionRefresh = state.opportunities
    .filter(
      (item) =>
        item.focusLane === "focus" &&
        item.locale === seedLocale &&
        priorityPageTypes.has(item.pageType)
    )
    .sort(scoreSort)
    .slice(0, 8)
    .map((item) => {
      const page = pageMap.get(`${item.locale}:${item.exchangeSlug}:${item.pageType}`);
      return {
        id: item.id,
        locale: item.locale,
        exchangeSlug: item.exchangeSlug,
        pageType: item.pageType,
        primaryQuery: item.primaryQuery,
        score: item.score,
        title: page?.metadata.title ?? item.primaryQuery,
        description: page?.metadata.description ?? item.indexPolicyReason,
        why: "这是高意图 seed 页，标题/描述的 query 命中和 CTR 文案优先级最高。",
        copyFocus: getActionPlanCopyFocus(item.pageType),
      };
    });

  const refreshInsteadOfExpand = state.opportunities
    .filter(
      (item) =>
        item.indexPolicyAction === "refresh" ||
        item.indexPolicyAction === "prune" ||
        (item.locale !== seedLocale &&
          policy.expansionLocales.includes(item.locale) &&
          item.indexPolicyAction === "hold")
    )
    .sort(
      (a, b) =>
        b.indexPolicyObservationDays - a.indexPolicyObservationDays ||
        scoreSort(a, b)
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      locale: item.locale,
      exchangeSlug: item.exchangeSlug,
      pageType: item.pageType,
      primaryQuery: item.primaryQuery,
      score: item.score,
      action: item.indexPolicyAction,
      observationDays: item.indexPolicyObservationDays,
      why: item.indexPolicyReason,
    }));

  return {
    continuePush,
    titleDescriptionRefresh,
    refreshInsteadOfExpand,
  };
}

function toDiscoverySprintEntry(
  item: AutomationState["opportunities"][number]
): DiscoverySprintEntry {
  return {
    id: item.id,
    locale: item.locale,
    exchangeSlug: item.exchangeSlug,
    pageType: item.pageType,
    primaryQuery: item.primaryQuery,
    routePath: `/${item.locale}/exchanges/${item.exchangeSlug}/${item.pageType}`,
    score: item.score,
    stage: item.discoverySprintStage,
    reason: item.indexPolicyReason,
    observationDays: item.indexPolicyObservationDays,
  };
}

function sortDiscoverySprintEntries(a: DiscoverySprintEntry, b: DiscoverySprintEntry) {
  return b.score - a.score || b.observationDays - a.observationDays || a.id.localeCompare(b.id);
}

function buildDiscoverySprintSurfaceSummary(
  opportunitiesByKey: Map<string, AutomationState["opportunities"][number]>,
  keys: string[]
): DiscoverySprintSurfaceSummary {
  const items = Array.from(new Set(keys))
    .map((key) => opportunitiesByKey.get(key))
    .filter((item): item is AutomationState["opportunities"][number] => Boolean(item))
    .map(toDiscoverySprintEntry)
    .sort(sortDiscoverySprintEntries);

  return {
    count: items.length,
    items,
  };
}

function getDiscoverySprintPageTypeWeight(pageType: string, horizonDays: 3 | 7 | 14) {
  switch (pageType) {
    case "referral-code":
      return horizonDays === 3 ? 11 : horizonDays === 7 ? 10 : 8;
    case "official-site":
      return horizonDays === 3 ? 10 : horizonDays === 7 ? 9 : 7;
    case "fees-rebate":
      return horizonDays === 14 ? 10 : horizonDays === 7 ? 7 : 6;
    case "signup-kyc":
      return horizonDays === 14 ? 9 : horizonDays === 7 ? 7 : 5;
    default:
      return 4;
  }
}

function getDiscoverySprintStageWeight(stage: string, horizonDays: 3 | 7 | 14) {
  switch (stage) {
    case "observe":
      return horizonDays === 3 ? 18 : horizonDays === 7 ? 14 : 10;
    case "ctr-refresh":
      return horizonDays === 3 ? 11 : horizonDays === 7 ? 18 : 16;
    case "template-refresh":
      return horizonDays === 3 ? 3 : horizonDays === 7 ? 9 : 18;
    case "prune-candidate":
      return horizonDays === 14 ? 4 : -12;
    case "frozen":
      return -80;
    default:
      return 0;
  }
}

function buildDiscoverySprintForecastEntry(
  item: AutomationState["opportunities"][number],
  monitorEntry: GscFocusPageRowMonitorEntry | undefined,
  horizonDays: 3 | 7 | 14,
  pinSources: string[]
): DiscoverySprintForecastEntry {
  const baseEntry = toDiscoverySprintEntry(item);
  const scoreBase = item.discoveryPriority ?? item.score;
  const pinCount = pinSources.length;
  const alreadySeenPenalty =
    monitorEntry?.seenInImpressions || monitorEntry?.seenInClicks ? -120 : 0;
  const score =
    scoreBase +
    getDiscoverySprintStageWeight(item.discoverySprintStage, horizonDays) +
    getDiscoverySprintPageTypeWeight(item.pageType, horizonDays) +
    pinCount * 6 +
    (item.indexPolicyAllowPromotion ? 10 : -100) +
    alreadySeenPenalty;

  const reasons = [
    `当前 stage = ${item.discoverySprintStage}`,
    `${pinCount} 个站内 surface 正在主推`,
    item.indexPolicyAllowPromotion ? "仍在 promotion 主链" : "已退出 promotion 主链",
  ];

  if (monitorEntry?.seenInPageRows) {
    reasons.push("已进 page rows，下一步重点是拿 impression/click");
  } else {
    reasons.push("尚未进 page rows，仍在争取首个展示资格");
  }

  return {
    ...baseEntry,
    horizonDays,
    likelihoodScore: Math.round(score),
    pinCount,
    pinSources,
    why: reasons.join(" · "),
  };
}

function sortDiscoverySprintForecastEntries(
  a: DiscoverySprintForecastEntry,
  b: DiscoverySprintForecastEntry
) {
  return (
    b.likelihoodScore - a.likelihoodScore ||
    b.pinCount - a.pinCount ||
    sortDiscoverySprintEntries(a, b)
  );
}

function buildDiscoverySprintForecast(
  trackedSeedOpportunities: AutomationState["opportunities"],
  monitorByKey: Map<string, GscFocusPageRowMonitorEntry>,
  pinSourcesByKey: Map<string, string[]>,
  horizonDays: 3 | 7 | 14
) {
  return trackedSeedOpportunities
    .map((item) => {
      const key = `${item.locale}:${item.exchangeSlug}:${item.pageType}`;
      const monitorEntry = monitorByKey.get(key);
      if (monitorEntry?.seenInImpressions || monitorEntry?.seenInClicks) {
        return null;
      }
      return buildDiscoverySprintForecastEntry(
        item,
        monitorEntry,
        horizonDays,
        pinSourcesByKey.get(key) ?? []
      );
    })
    .filter((item): item is DiscoverySprintForecastEntry => Boolean(item))
    .filter((item) => item.likelihoodScore > -100)
    .sort(sortDiscoverySprintForecastEntries)
    .slice(0, 12);
}

export function buildDiscoverySprintSummary(
  state: AutomationState
): DiscoverySprintSummary {
  const focusPageRows = state.externalSources.gsc.focusPageRows ?? [];
  const focusMonitor = summarizeGscFocusPageRowMonitor(focusPageRows);
  const monitorByKey = new Map(
    focusPageRows.map((entry) => [
      `${entry.locale}:${entry.exchangeSlug}:${entry.pageType}`,
      entry,
    ] as const)
  );
  const opportunitiesByKey = new Map(
    state.opportunities.map((item) => [
      `${item.locale}:${item.exchangeSlug}:${item.pageType}`,
      item,
    ] as const)
  );
  const trackedSeedOpportunities = getGscFocusPageMonitorTargets()
    .map((target) =>
      opportunitiesByKey.get(`${target.locale}:${target.exchangeSlug}:${target.pageType}`)
    )
    .filter((item): item is AutomationState["opportunities"][number] => Boolean(item));

  const activeSeedOpportunities = trackedSeedOpportunities.filter(
    (item) => item.indexPolicyAllowPromotion
  );
  const slots = getInternalLinkSlots(state.internalLinks);
  const homepageKeys = [
    ...slots.homepageHeroSecondary.flatMap((slot) => slot.guides),
    ...slots.homepageQuestionClusters.flatMap((slot) => slot.guides),
  ].map((guide) => `${guide.locale}:${guide.exchangeSlug}:${guide.pageType}`);
  const exchangeHubKeys = slots.exchangeHubFocus
    .flatMap((slot) => slot.guides)
    .map((guide) => `${guide.locale}:${guide.exchangeSlug}:${guide.pageType}`);
  const exchangeDetailKeys = slots.exchangeDetailFocus
    .flatMap((slot) => slot.guides)
    .map((guide) => `${guide.locale}:${guide.exchangeSlug}:${guide.pageType}`);
  const discoveryAssetKeys = activeSeedOpportunities.map(
    (item) => `${item.locale}:${item.exchangeSlug}:${item.pageType}`
  );
  const pinSourcesByKey = new Map<string, string[]>();
  const addPinSources = (label: string, keys: string[]) => {
    for (const key of new Set(keys)) {
      const existing = pinSourcesByKey.get(key) ?? [];
      if (!existing.includes(label)) {
        existing.push(label);
      }
      pinSourcesByKey.set(key, existing);
    }
  };
  addPinSources("homepage", homepageKeys);
  addPinSources("exchange-hub", exchangeHubKeys);
  addPinSources("exchange-detail", exchangeDetailKeys);
  addPinSources("feed", discoveryAssetKeys);
  addPinSources("fresh-sitemap", discoveryAssetKeys);
  addPinSources("focus-sitemap", discoveryAssetKeys);

  const observe = trackedSeedOpportunities
    .filter((item) => item.discoverySprintStage === "observe")
    .map(toDiscoverySprintEntry)
    .sort(sortDiscoverySprintEntries);
  const ctrRefresh = trackedSeedOpportunities
    .filter((item) => item.discoverySprintStage === "ctr-refresh")
    .map(toDiscoverySprintEntry)
    .sort(sortDiscoverySprintEntries);
  const templateRefresh = trackedSeedOpportunities
    .filter((item) => item.discoverySprintStage === "template-refresh")
    .map(toDiscoverySprintEntry)
    .sort(sortDiscoverySprintEntries);
  const pruneCandidate = trackedSeedOpportunities
    .filter((item) => item.discoverySprintStage === "prune-candidate")
    .map(toDiscoverySprintEntry)
    .sort(sortDiscoverySprintEntries);
  const frozen = state.opportunities
    .filter((item) => item.discoverySprintStage === "frozen")
    .slice(0, 8)
    .map(toDiscoverySprintEntry)
    .sort(sortDiscoverySprintEntries);

  const blockedExpansionExample = state.opportunities
    .filter((item) => item.locale !== "en" && item.indexPolicyAction === "hold")
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))[0];

  const seedPagesSurfaced = new Set([
    ...homepageKeys,
    ...exchangeHubKeys,
    ...exchangeDetailKeys,
    ...discoveryAssetKeys,
  ]).size;
  const forecastDay3 = buildDiscoverySprintForecast(
    trackedSeedOpportunities,
    monitorByKey,
    pinSourcesByKey,
    3
  );
  const forecastDay7 = buildDiscoverySprintForecast(
    trackedSeedOpportunities,
    monitorByKey,
    pinSourcesByKey,
    7
  );
  const forecastDay14 = buildDiscoverySprintForecast(
    trackedSeedOpportunities,
    monitorByKey,
    pinSourcesByKey,
    14
  );

  return {
    status:
      focusMonitor.clickPagesSeen > 0
        ? "hit"
        : focusMonitor.pageRowsSeen > 0 || focusMonitor.impressionPagesSeen > 0
          ? "active"
          : "warning",
    label:
      focusMonitor.clickPagesSeen > 0
        ? `已拿到点击 ${focusMonitor.clickPagesSeen}/${focusMonitor.trackedCount}`
        : focusMonitor.pageRowsSeen > 0 || focusMonitor.impressionPagesSeen > 0
          ? `已开始展示 ${focusMonitor.pageRowsSeen}/${focusMonitor.trackedCount}`
          : "12 页冲刺中",
    updatedAt:
      [state.internalLinks.refreshedAt, focusMonitor.lastCheckedAt, state.generatedAt]
        .filter(Boolean)
        .sort()
        .at(-1) ?? "",
    trackedSeedPages: focusMonitor.trackedCount,
    pageRowsSeen: focusMonitor.pageRowsSeen,
    impressionPagesSeen: focusMonitor.impressionPagesSeen,
    clickPagesSeen: focusMonitor.clickPagesSeen,
    seedPagesSurfaced,
    seedPagesFrozen: trackedSeedOpportunities.filter(
      (item) => item.discoverySprintStage === "frozen"
    ).length,
    seedPagesRefreshDue: trackedSeedOpportunities.filter((item) =>
      ["ctr-refresh", "template-refresh", "prune-candidate"].includes(item.discoverySprintStage)
    ).length,
    pinnedSurfaces: {
      homepage: buildDiscoverySprintSurfaceSummary(opportunitiesByKey, homepageKeys),
      exchangeHub: buildDiscoverySprintSurfaceSummary(opportunitiesByKey, exchangeHubKeys),
      exchangeDetail: buildDiscoverySprintSurfaceSummary(opportunitiesByKey, exchangeDetailKeys),
      feed: buildDiscoverySprintSurfaceSummary(opportunitiesByKey, discoveryAssetKeys),
      freshSitemap: buildDiscoverySprintSurfaceSummary(opportunitiesByKey, discoveryAssetKeys),
      focusSitemap: buildDiscoverySprintSurfaceSummary(opportunitiesByKey, discoveryAssetKeys),
    },
    stageBuckets: {
      observe,
      ctrRefresh,
      templateRefresh,
      pruneCandidate,
      frozen,
    },
    firstImpressionForecast: {
      day3: forecastDay3,
      day7: forecastDay7,
      day14: forecastDay14,
    },
    summary: {
      topTargetPage: observe[0] ?? ctrRefresh[0] ?? templateRefresh[0] ?? null,
      topRefreshPage: ctrRefresh[0] ?? templateRefresh[0] ?? pruneCandidate[0] ?? null,
      topImpressionPage3d: forecastDay3[0] ?? null,
      topImpressionPage7d: forecastDay7[0] ?? null,
      topImpressionPage14d: forecastDay14[0] ?? null,
      blockedExpansionExample: blockedExpansionExample
        ? {
            locale: blockedExpansionExample.locale,
            exchangeSlug: blockedExpansionExample.exchangeSlug,
            pageType: blockedExpansionExample.pageType,
            reason: blockedExpansionExample.indexPolicyReason,
          }
        : null,
    },
  };
}

export function buildGscFocusPageRowMonitorSummary(
  state: AutomationState
): {
  status: "tracking" | "hit" | "idle";
  label: string;
  trackedCount: number;
  seenCount: number;
  pendingCount: number;
  lastCheckedAt: string;
  monitoringStartedAt: string;
  observationDays: number;
  firstSeenAt: string | null;
  firstSeenUrl: string | null;
  entries: GscFocusPageRowMonitorEntry[];
} {
  const summary = summarizeGscFocusPageRowMonitor(state.externalSources.gsc.focusPageRows);

  return {
    status:
      summary.seenCount > 0
        ? "hit"
        : summary.trackedCount > 0
          ? "tracking"
          : "idle",
    label:
      summary.seenCount > 0
        ? `已命中 ${summary.seenCount}/${summary.trackedCount}`
        : summary.trackedCount > 0
          ? "待首个命中"
          : "未开始监控",
    ...summary,
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
  indexGrowthPolicy: IndexGrowthPolicySummary;
  searchVisibilityActionPlan: SearchVisibilityActionPlan;
  discoverySprint: DiscoverySprintSummary;
  coverageRepair: CoverageRepairLaneSummary;
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
        searchAnalyticsMode: string;
        note: string;
        sitemapSubmitStatus: string;
        sitemapsSubmitted: string[];
        lastSitemapSubmitAt: string;
      };
      coverageAudit: {
        status: string;
        label: string;
        updatedAt: string;
        issueCount: number;
        redirectIssueCount: number;
        notFoundIssueCount: number;
        discoveryIssueCount: number;
        summary: string;
      };
      coverageRepair: {
        status: string;
        label: string;
        checkedAt: string;
        redirectIssueCount: number;
        notFoundIssueCount: number;
        discoveryIssueCount: number;
        issueCount: number;
        expectedIndexTarget: string;
        xDefaultTarget: string | null;
        xDefaultHealthy: boolean;
      };
      discoverySprint: {
        status: string;
        label: string;
        updatedAt: string;
        trackedSeedPages: number;
        pageRowsSeen: number;
        impressionPagesSeen: number;
        clickPagesSeen: number;
        seedPagesSurfaced: number;
        seedPagesRefreshDue: number;
      };
      focusPageRowMonitor: {
        status: string;
        label: string;
        trackedCount: number;
        seenCount: number;
        pendingCount: number;
        lastCheckedAt: string;
        monitoringStartedAt: string;
        observationDays: number;
        firstSeenAt: string | null;
        firstSeenUrl: string | null;
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
    indexGrowthPolicy: IndexGrowthPolicySummary;
    discoverySprint: DiscoverySprintSummary;
    coverageRepair: CoverageRepairLaneSummary;
    focusPageRowMonitor: GscFocusPageRowMonitorSummary;
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
  const indexGrowthPolicy = buildIndexGrowthPolicySummary(state);
  const searchVisibilityActionPlan = buildSearchVisibilityActionPlan(state);
  const discoverySprint = buildDiscoverySprintSummary(state);
  const storedCoverageRepair = await readCoverageRepairArtifact();
  const coverageRepair =
    storedCoverageRepair.status === "never_run"
      ? await auditCoverageRepair()
      : storedCoverageRepair;
  const focusPageRowMonitor = buildGscFocusPageRowMonitorSummary(state);
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
  const latestCoverageAuditRun = state.runs.find(
    (item) => item.job === "daily_coverage_audit"
  );
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
    indexGrowthPolicy,
    searchVisibilityActionPlan,
    discoverySprint,
    coverageRepair,
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
          searchAnalyticsMode: state.externalSources.gsc.searchAnalyticsMode ?? "empty",
          note: state.externalSources.gsc.note ?? "",
          sitemapSubmitStatus: state.externalSources.gsc.sitemapSubmitStatus ?? "skipped",
          sitemapsSubmitted: state.externalSources.gsc.sitemapsSubmitted ?? [],
          lastSitemapSubmitAt: state.externalSources.gsc.lastSitemapSubmitAt ?? "",
        },
        coverageAudit: {
          status:
            latestCoverageAuditRun?.status ??
            (coverageRepair.status === "never_run"
              ? "never_run"
              : coverageRepair.issueCount > 0
                ? "warning"
                : "success"),
          label: toStatusLabel(
            latestCoverageAuditRun?.status ??
              (coverageRepair.status === "never_run"
                ? "never_run"
                : coverageRepair.issueCount > 0
                  ? "warning"
                  : "success")
          ),
          updatedAt: latestCoverageAuditRun?.completedAt ?? coverageRepair.checkedAt,
          issueCount: coverageRepair.issueCount,
          redirectIssueCount: coverageRepair.redirectIssueCount,
          notFoundIssueCount: coverageRepair.notFoundIssueCount,
          discoveryIssueCount: coverageRepair.discoveryIssueCount,
          summary:
            latestCoverageAuditRun?.summary ??
            `Coverage audit redirect=${coverageRepair.redirectIssueCount} 404=${coverageRepair.notFoundIssueCount} discovery=${coverageRepair.discoveryIssueCount}`,
        },
        coverageRepair: {
          status: coverageRepair.status,
          label: coverageRepair.label,
          checkedAt: coverageRepair.checkedAt,
          redirectIssueCount: coverageRepair.redirectIssueCount,
          notFoundIssueCount: coverageRepair.notFoundIssueCount,
          discoveryIssueCount: coverageRepair.discoveryIssueCount,
          issueCount: coverageRepair.issueCount,
          expectedIndexTarget: coverageRepair.expectedIndexTarget,
          xDefaultTarget: coverageRepair.xDefaultTarget,
          xDefaultHealthy: coverageRepair.xDefaultHealthy,
        },
        discoverySprint: {
          status: discoverySprint.status,
          label: discoverySprint.label,
          updatedAt: discoverySprint.updatedAt,
          trackedSeedPages: discoverySprint.trackedSeedPages,
          pageRowsSeen: discoverySprint.pageRowsSeen,
          impressionPagesSeen: discoverySprint.impressionPagesSeen,
          clickPagesSeen: discoverySprint.clickPagesSeen,
          seedPagesSurfaced: discoverySprint.seedPagesSurfaced,
          seedPagesRefreshDue: discoverySprint.seedPagesRefreshDue,
        },
        focusPageRowMonitor: {
          status: focusPageRowMonitor.status,
          label: focusPageRowMonitor.label,
          trackedCount: focusPageRowMonitor.trackedCount,
          seenCount: focusPageRowMonitor.seenCount,
          pendingCount: focusPageRowMonitor.pendingCount,
          lastCheckedAt: focusPageRowMonitor.lastCheckedAt,
          monitoringStartedAt: focusPageRowMonitor.monitoringStartedAt,
          observationDays: focusPageRowMonitor.observationDays,
          firstSeenAt: focusPageRowMonitor.firstSeenAt,
          firstSeenUrl: focusPageRowMonitor.firstSeenUrl,
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
      indexGrowthPolicy,
      discoverySprint,
      coverageRepair,
      focusPageRowMonitor,
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
