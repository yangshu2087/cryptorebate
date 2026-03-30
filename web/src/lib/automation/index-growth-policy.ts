import fs from "node:fs";
import path from "node:path";
import indexGrowthPolicySeed from "@/data/automation/index-growth-policy.json";
import {
  isFocusExchangeSlug,
  isFocusLocale,
  isFocusPageType,
  type OpportunityFocusLane,
} from "./focus";
import type { GscFocusPageRowMonitorEntry, QueryOpportunity } from "./types";

export type DiscoverySprintStage =
  | "observe"
  | "ctr-refresh"
  | "template-refresh"
  | "prune-candidate"
  | "frozen";

export type IndexGrowthPolicyConfig = {
  maxNewPagesPerDay: number;
  maxRefreshPagesPerDay: number;
  publishDailyLimitPerExchange: number;
  refreshDailyLimitPerExchange: number;
  seedLocale: string;
  expansionLocales: string[];
  priorityExchanges: string[];
  priorityPageTypes: string[];
  observationWindows: {
    day7: number;
    day14: number;
    day21: number;
  };
};

export type IndexGrowthPolicyDecision = {
  action: "publish" | "observe" | "refresh" | "expand" | "prune" | "hold";
  allowPromotion: boolean;
  allowExpansion: boolean;
  observationDays: number;
  seedSeenInPageRows: boolean;
  cohort: "seed" | "expansion" | "background";
  reason: string;
};

function resolvePolicyPath(...parts: string[]) {
  return path.join(process.cwd(), "src", "data", ...parts);
}

function readAutomationJsonSync<T>(parts: string[], fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(resolvePolicyPath(...parts), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function getIndexGrowthPolicy(): IndexGrowthPolicyConfig {
  return readAutomationJsonSync(
    ["automation", "index-growth-policy.json"],
    indexGrowthPolicySeed as IndexGrowthPolicyConfig
  );
}

export function isDiscoverySprintProtectedPage(
  locale: string,
  exchangeSlug: string,
  pageType: string,
  policy = getIndexGrowthPolicy()
) {
  return (
    locale === policy.seedLocale &&
    policy.priorityExchanges.includes(exchangeSlug) &&
    policy.priorityPageTypes.includes(pageType)
  );
}

type EvaluatePolicyInput = {
  locale: string;
  exchangeSlug: string;
  pageType: string;
  focusLane?: OpportunityFocusLane;
  monitorEntries?: GscFocusPageRowMonitorEntry[];
  now?: Date;
};

function getSeedEntry(
  entries: GscFocusPageRowMonitorEntry[] | undefined,
  exchangeSlug: string,
  pageType: string,
  seedLocale: string
) {
  return (entries ?? []).find(
    (entry) =>
      entry.locale === seedLocale &&
      entry.exchangeSlug === exchangeSlug &&
      entry.pageType === pageType
  );
}

function getObservationDays(entry: GscFocusPageRowMonitorEntry | undefined, now = new Date()) {
  const startedAt = entry?.monitoringStartedAt ?? entry?.firstSeenAt ?? entry?.lastCheckedAt;
  if (!startedAt) return 0;
  const delta = now.getTime() - new Date(startedAt).getTime();
  return Math.max(0, delta / (24 * 60 * 60 * 1000));
}

export function getDiscoverySprintStage(input: {
  locale: string;
  exchangeSlug: string;
  pageType: string;
  monitorEntries?: GscFocusPageRowMonitorEntry[];
  now?: Date;
}): DiscoverySprintStage {
  const policy = getIndexGrowthPolicy();
  if (
    !isDiscoverySprintProtectedPage(
      input.locale,
      input.exchangeSlug,
      input.pageType,
      policy
    )
  ) {
    return "frozen";
  }

  const seedEntry = getSeedEntry(
    input.monitorEntries,
    input.exchangeSlug,
    input.pageType,
    policy.seedLocale
  );
  const observationDays = getObservationDays(seedEntry, input.now);
  const seenInPageRows = Boolean(seedEntry?.seenInPageRows);
  const seenInImpressions = Boolean(seedEntry?.seenInImpressions);

  if (
    observationDays >= policy.observationWindows.day21 &&
    !seenInPageRows &&
    !seenInImpressions
  ) {
    return "prune-candidate";
  }

  if (observationDays >= policy.observationWindows.day14 && !seenInImpressions) {
    return "template-refresh";
  }

  if (observationDays >= policy.observationWindows.day7 && !seenInPageRows) {
    return "ctr-refresh";
  }

  return "observe";
}

export function evaluateIndexGrowthPolicy({
  locale,
  exchangeSlug,
  pageType,
  focusLane,
  monitorEntries,
  now = new Date(),
}: EvaluatePolicyInput): IndexGrowthPolicyDecision {
  const policy = getIndexGrowthPolicy();
  const lane =
    focusLane ??
    (isFocusLocale(locale) && isFocusExchangeSlug(exchangeSlug) && isFocusPageType(pageType)
      ? "focus"
      : "background");

  if (lane !== "focus") {
    return {
      action: "observe",
      allowPromotion: false,
      allowExpansion: false,
      observationDays: 0,
      seedSeenInPageRows: false,
      cohort: "background",
      reason:
        lane === "hold"
          ? "非优先页型已进入 hold，保持可访问但不进入当前索引增长主链。"
          : "非焦点矩阵页面保持背景观察，默认不进入每日发布、推荐位和渠道分发预算。",
    };
  }

  const seedEntry = getSeedEntry(
    monitorEntries,
    exchangeSlug,
    pageType,
    policy.seedLocale
  );
  const observationDays = getObservationDays(seedEntry, now);
  const seedSeenInPageRows = Boolean(seedEntry?.seenInPageRows);
  const isSeedLocale = locale === policy.seedLocale;
  const isExpansionLocale = policy.expansionLocales.includes(locale);

  if (!isSeedLocale && !isExpansionLocale) {
    return {
      action: "hold",
      allowPromotion: false,
      allowExpansion: false,
      observationDays,
      seedSeenInPageRows,
      cohort: "background",
      reason: `当前索引增长只覆盖 ${policy.seedLocale} 种子语种和 ${policy.expansionLocales.join(" / ")} 扩张语种，${locale} 暂不进入扩张主链。`,
    };
  }

  if (isExpansionLocale && !seedSeenInPageRows) {
    const action = observationDays >= policy.observationWindows.day21 ? "prune" : "hold";
    return {
      action,
      allowPromotion: false,
      allowExpansion: false,
      observationDays,
      seedSeenInPageRows,
      cohort: "expansion",
      reason:
        action === "prune"
          ? `${policy.seedLocale} 种子页在 ${policy.observationWindows.day21} 天内仍未进入 page rows，${locale} 扩张页暂停并转入 prune 队列。`
          : `${locale} 扩张页需等待 ${policy.seedLocale} 种子页先进入 GSC page rows，当前继续观察不放量。`,
    };
  }

  if (seedSeenInPageRows) {
    return {
      action: isExpansionLocale ? "expand" : "publish",
      allowPromotion: true,
      allowExpansion: true,
      observationDays,
      seedSeenInPageRows,
      cohort: isSeedLocale ? "seed" : "expansion",
      reason: `${policy.seedLocale} 种子页已进入 GSC page rows，可以继续放量当前 cohort。`,
    };
  }

  if (observationDays >= policy.observationWindows.day21) {
    return {
      action: "prune",
      allowPromotion: false,
      allowExpansion: false,
      observationDays,
      seedSeenInPageRows,
      cohort: "seed",
      reason: `${policy.observationWindows.day21} 天仍未进入 page rows，停止继续扩张并把该 cohort 转入 prune。`,
    };
  }

  if (observationDays >= policy.observationWindows.day14) {
    return {
      action: "refresh",
      allowPromotion: true,
      allowExpansion: false,
      observationDays,
      seedSeenInPageRows,
      cohort: "seed",
      reason: `${policy.observationWindows.day14} 天仍未进入 page rows，继续刷新模板/内链，不扩张新语种。`,
    };
  }

  if (observationDays >= policy.observationWindows.day7) {
    return {
      action: "refresh",
      allowPromotion: true,
      allowExpansion: false,
      observationDays,
      seedSeenInPageRows,
      cohort: "seed",
      reason: `${policy.observationWindows.day7} 天观察窗内仍未出现 page rows，进入 refresh 优先级。`,
    };
  }

  return {
    action: "observe",
    allowPromotion: true,
    allowExpansion: false,
    observationDays,
    seedSeenInPageRows,
    cohort: "seed",
    reason: `处于 ${policy.seedLocale} 种子观察窗内，继续集中推送高意图页，不提前扩张。`,
  };
}

function compareOpportunityBudgetPriority(a: QueryOpportunity, b: QueryOpportunity) {
  if (b.discoveryPriority !== a.discoveryPriority) {
    return b.discoveryPriority - a.discoveryPriority;
  }

  if (b.score !== a.score) {
    return b.score - a.score;
  }

  if (b.projectedMonthlyRevenueUsd !== a.projectedMonthlyRevenueUsd) {
    return b.projectedMonthlyRevenueUsd - a.projectedMonthlyRevenueUsd;
  }

  return a.id.localeCompare(b.id);
}

function withBudgetDeferral(
  opportunity: QueryOpportunity,
  budgetType: "publish" | "refresh",
  policy: IndexGrowthPolicyConfig
): QueryOpportunity {
  const budgetReason =
    budgetType === "publish"
      ? `当日发布预算已满（全局 ${policy.maxNewPagesPerDay} / 交易所 ${policy.publishDailyLimitPerExchange}），顺延到下一轮。`
      : `当日刷新预算已满（全局 ${policy.maxRefreshPagesPerDay} / 交易所 ${policy.refreshDailyLimitPerExchange}），顺延到下一轮。`;

  return {
    ...opportunity,
    indexPolicyAllowPromotion: false,
    indexPolicyAllowExpansion: false,
    indexPolicyScheduledToday: false,
    indexPolicyReason: `${opportunity.indexPolicyReason} ${budgetReason}`.trim(),
  };
}

export function applyIndexGrowthPolicyBudget(
  opportunities: QueryOpportunity[]
): QueryOpportunity[] {
  const policy = getIndexGrowthPolicy();
  const updated = new Map(
    opportunities.map((opportunity) => [
      opportunity.id,
      {
        ...opportunity,
        indexPolicyScheduledToday:
          opportunity.indexPolicyAllowPromotion &&
          ["publish", "expand", "refresh"].includes(opportunity.indexPolicyAction),
      },
    ] as const)
  );

  const publishCandidates = opportunities
    .filter(
      (opportunity) =>
        opportunity.indexPolicyAllowPromotion &&
        (opportunity.indexPolicyAction === "publish" ||
          opportunity.indexPolicyAction === "expand")
    )
    .sort(compareOpportunityBudgetPriority);

  const refreshCandidates = opportunities
    .filter(
      (opportunity) =>
        opportunity.indexPolicyAllowPromotion &&
        opportunity.indexPolicyAction === "refresh"
    )
    .sort(compareOpportunityBudgetPriority);

  let publishGlobal = 0;
  const publishByExchange = new Map<string, number>();
  for (const opportunity of publishCandidates) {
    const exchangeCount = publishByExchange.get(opportunity.exchangeSlug) ?? 0;
    if (
      publishGlobal >= policy.maxNewPagesPerDay ||
      exchangeCount >= policy.publishDailyLimitPerExchange
    ) {
      updated.set(
        opportunity.id,
        withBudgetDeferral(opportunity, "publish", policy)
      );
      continue;
    }

    publishGlobal += 1;
    publishByExchange.set(opportunity.exchangeSlug, exchangeCount + 1);
  }

  let refreshGlobal = 0;
  const refreshByExchange = new Map<string, number>();
  for (const opportunity of refreshCandidates) {
    const exchangeCount = refreshByExchange.get(opportunity.exchangeSlug) ?? 0;
    if (
      refreshGlobal >= policy.maxRefreshPagesPerDay ||
      exchangeCount >= policy.refreshDailyLimitPerExchange
    ) {
      updated.set(
        opportunity.id,
        withBudgetDeferral(opportunity, "refresh", policy)
      );
      continue;
    }

    refreshGlobal += 1;
    refreshByExchange.set(opportunity.exchangeSlug, exchangeCount + 1);
  }

  return opportunities.map(
    (opportunity) => updated.get(opportunity.id) ?? opportunity
  );
}
