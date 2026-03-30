import { SITE_URL } from "@/lib/constants";
import {
  FOCUS_EXCHANGE_SLUGS,
  FOCUS_PAGE_TYPES,
} from "./focus";
import type {
  AutomationAlert,
  DistributionJobPayload,
  GscFocusPageRowMonitorEntry,
} from "./types";

export type SearchConsolePageObservation = {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscFocusPageMonitorTarget = {
  key: string;
  locale: "en";
  exchangeSlug: (typeof FOCUS_EXCHANGE_SLUGS)[number];
  pageType: (typeof FOCUS_PAGE_TYPES)[number];
  routePath: string;
  url: string;
};

export type GscFocusPageRowMonitorSummary = {
  trackedCount: number;
  seenCount: number;
  pageRowsSeen: number;
  impressionPagesSeen: number;
  clickPagesSeen: number;
  pendingCount: number;
  lastCheckedAt: string;
  monitoringStartedAt: string;
  observationDays: number;
  firstSeenAt: string | null;
  firstSeenUrl: string | null;
  entries: GscFocusPageRowMonitorEntry[];
};

function normaliseUrl(url: string) {
  return new URL(url, SITE_URL).toString().replace(/\/+$/, "");
}

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getGscFocusPageMonitorTargets(siteUrl = SITE_URL): GscFocusPageMonitorTarget[] {
  const origin = siteUrl.replace(/\/+$/, "");
  const targets: GscFocusPageMonitorTarget[] = [];

  for (const exchangeSlug of FOCUS_EXCHANGE_SLUGS) {
    for (const pageType of FOCUS_PAGE_TYPES) {
      const routePath = `/exchanges/${exchangeSlug}/${pageType}`;
      targets.push({
        key: `focus-page-row:en:${exchangeSlug}:${pageType}`,
        locale: "en",
        exchangeSlug,
        pageType,
        routePath,
        url: `${origin}/en${routePath}`,
      });
    }
  }

  return targets;
}

export function reconcileGscFocusPageRowMonitor(
  previousEntries: GscFocusPageRowMonitorEntry[] | undefined,
  observations: SearchConsolePageObservation[],
  observedAt: string,
  siteUrl = SITE_URL
) {
  const targets = getGscFocusPageMonitorTargets(siteUrl);
  const previousByKey = new Map((previousEntries ?? []).map((entry) => [entry.key, entry] as const));
  const observationsByUrl = new Map(
    observations.map((observation) => [normaliseUrl(observation.url), observation] as const)
  );

  const entries: GscFocusPageRowMonitorEntry[] = [];
  const newlySeen: GscFocusPageRowMonitorEntry[] = [];

  for (const target of targets) {
    const previous = previousByKey.get(target.key);
    const observation = observationsByUrl.get(normaliseUrl(target.url));
    const firstSeenAt = previous?.firstSeenAt ?? (observation ? observedAt : undefined);
    const firstImpressionAt =
      previous?.firstImpressionAt ??
      ((observation?.impressions ?? 0) > 0 ? observedAt : undefined);
    const firstClickAt =
      previous?.firstClickAt ??
      ((observation?.clicks ?? 0) > 0 ? observedAt : undefined);
    const entry: GscFocusPageRowMonitorEntry = {
      key: target.key,
      locale: target.locale,
      exchangeSlug: target.exchangeSlug,
      pageType: target.pageType,
      routePath: target.routePath,
      url: target.url,
      seenInPageRows: Boolean(firstSeenAt),
      seenInImpressions: Boolean(firstImpressionAt),
      seenInClicks: Boolean(firstClickAt),
      monitoringStartedAt: previous?.monitoringStartedAt ?? observedAt,
      firstSeenAt,
      firstImpressionAt,
      firstClickAt,
      lastSeenAt: observation ? observedAt : previous?.lastSeenAt,
      lastImpressionAt:
        (observation?.impressions ?? 0) > 0 ? observedAt : previous?.lastImpressionAt,
      lastClickAt:
        (observation?.clicks ?? 0) > 0 ? observedAt : previous?.lastClickAt,
      lastCheckedAt: observedAt,
      latestImpressions: observation?.impressions ?? previous?.latestImpressions,
      latestClicks: observation?.clicks ?? previous?.latestClicks,
      latestCtr: observation?.ctr ?? previous?.latestCtr,
      latestPosition: observation?.position ?? previous?.latestPosition,
    };

    if (!previous?.firstSeenAt && observation) {
      newlySeen.push(entry);
    }

    entries.push(entry);
  }

  return { entries, newlySeen };
}

export function summarizeGscFocusPageRowMonitor(
  entries: GscFocusPageRowMonitorEntry[] | undefined
): GscFocusPageRowMonitorSummary {
  const fallbackEntries = getGscFocusPageMonitorTargets().map(
    (target): GscFocusPageRowMonitorEntry => ({
      key: target.key,
      locale: target.locale,
      exchangeSlug: target.exchangeSlug,
      pageType: target.pageType,
      routePath: target.routePath,
      url: target.url,
      seenInPageRows: false,
      lastCheckedAt: "",
    })
  );
  const previousByKey = new Map(
    (entries ?? []).map((entry) => [entry.key, entry] as const)
  );
  const resolvedEntries = fallbackEntries.map(
    (fallback) => previousByKey.get(fallback.key) ?? fallback
  );
  const seenEntries = resolvedEntries.filter((entry) => entry.seenInPageRows);
  const impressionEntries = resolvedEntries.filter((entry) => entry.seenInImpressions);
  const clickEntries = resolvedEntries.filter((entry) => entry.seenInClicks);
  const trackedCount = resolvedEntries.length;
  const seenCount = seenEntries.length;
  const pendingCount = Math.max(0, trackedCount - seenCount);
  const lastCheckedAt =
    resolvedEntries
      .map((entry) => entry.lastCheckedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? "";
  const firstSeenEntry =
    [...seenEntries]
      .filter((entry) => entry.firstSeenAt)
      .sort((a, b) =>
        new Date(a.firstSeenAt ?? a.lastCheckedAt).getTime() -
        new Date(b.firstSeenAt ?? b.lastCheckedAt).getTime()
      )
      .at(0) ?? null;
  const monitoringStartedAt =
    resolvedEntries
      .map(
        (entry) =>
          entry.monitoringStartedAt ?? entry.firstSeenAt ?? entry.lastCheckedAt
      )
      .filter(Boolean)
      .sort()
      .at(0) ?? "";
  const observationDays = monitoringStartedAt
    ? Math.max(
        0,
        (Date.now() - new Date(monitoringStartedAt).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    : 0;

  return {
    trackedCount,
    seenCount,
    pageRowsSeen: seenEntries.length,
    impressionPagesSeen: impressionEntries.length,
    clickPagesSeen: clickEntries.length,
    pendingCount,
    lastCheckedAt,
    monitoringStartedAt,
    observationDays,
    firstSeenAt: firstSeenEntry?.firstSeenAt ?? null,
    firstSeenUrl: firstSeenEntry?.url ?? null,
    entries: resolvedEntries,
  };
}

export function buildGscFocusPageRowFirstSeenAlert(
  entry: GscFocusPageRowMonitorEntry
): AutomationAlert {
  return {
    id: `alert-${entry.key}`,
    level: "info",
    type: "gsc_page_row_first_seen",
    message: `GSC 首次记录到 ${entry.exchangeSlug} / ${entry.pageType} 页面曝光 · impressions ${entry.latestImpressions ?? 0} · clicks ${entry.latestClicks ?? 0} · position ${typeof entry.latestPosition === "number" ? entry.latestPosition.toFixed(2) : "n/a"}`,
    scope: {
      locale: entry.locale,
      exchangeSlug: entry.exchangeSlug,
      pageType: entry.pageType,
    },
    triggeredAt: entry.firstSeenAt ?? entry.lastCheckedAt,
    href: entry.url,
    source: "external",
    sourceLabel: "GSC Page-row Monitor",
  };
}

export function buildGscFocusPageRowTelegramReminder(entry: GscFocusPageRowMonitorEntry) {
  const title = `${titleCase(entry.exchangeSlug)} · ${titleCase(entry.pageType)} 首次进入 GSC page rows`;
  const summary = [
    "Google Search Console 第一次记录到该焦点页的 page row。",
    `impressions ${entry.latestImpressions ?? 0}`,
    `clicks ${entry.latestClicks ?? 0}`,
    typeof entry.latestPosition === "number" ? `position ${entry.latestPosition.toFixed(2)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const payload: DistributionJobPayload = {
    title,
    summary,
    url: entry.url,
    exchangeSlug: entry.exchangeSlug,
    pageType: entry.pageType,
    primaryQuery: `${entry.exchangeSlug} ${entry.pageType}`.replace(/-/g, " "),
    source: "gsc-focus-page-row",
    sourceLabel: "GSC 首次 page-row",
    tags: [
      "gsc-page-row-monitor",
      "focus-cluster",
      "search-discovery",
      "telegram-reminder",
      entry.exchangeSlug,
      entry.pageType,
    ],
  };

  return {
    locale: entry.locale,
    exchangeSlug: entry.exchangeSlug,
    pageType: entry.pageType,
    routePath: `${entry.routePath}#gsc-page-row-first-seen`,
    payload,
  };
}

export function buildGscFocusPageRowDailyTelegramSummary(
  summary: GscFocusPageRowMonitorSummary,
  reportDate: string,
  siteUrl = SITE_URL
) {
  const adminUrl = `${siteUrl.replace(/\/+$/, "")}/en/admin/seo#gsc-focus-page-monitor`;
  const payload: DistributionJobPayload = {
    title: `GSC 焦点页监控日报 · ${summary.trackedCount} tracked / ${summary.seenCount} seen`,
    summary: [
      `${summary.pendingCount} 待命中`,
      `last checked ${summary.lastCheckedAt || "n/a"}`,
      summary.firstSeenAt ? `first seen ${summary.firstSeenAt}` : "尚未出现首个命中",
    ].join(" · "),
    url: adminUrl,
    primaryQuery: "gsc focus page-row daily summary",
    source: "gsc-focus-page-row",
    sourceLabel: "GSC 焦点页日报",
    tags: [
      "gsc-focus-page-monitor",
      "daily-summary",
      "search-discovery",
      `tracked-${summary.trackedCount}`,
      `seen-${summary.seenCount}`,
    ],
  };

  return {
    locale: "en" as const,
    routePath: `/admin/seo#gsc-focus-page-monitor-daily-${reportDate}`,
    payload,
  };
}
