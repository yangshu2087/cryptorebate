import { SITE_URL } from "@/lib/constants";
import { FOCUS_EXCHANGE_SLUGS, FOCUS_PAGE_TYPES } from "./focus";
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

export type GscFocusPageMilestone = "page-row" | "impression" | "click";

export type GscFocusPageMilestoneEvent = {
  milestone: GscFocusPageMilestone;
  entry: GscFocusPageRowMonitorEntry;
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

function getMilestoneRank(milestone: GscFocusPageMilestone) {
  switch (milestone) {
    case "click":
      return 3;
    case "impression":
      return 2;
    case "page-row":
    default:
      return 1;
  }
}

function getMilestoneAlertType(milestone: GscFocusPageMilestone): AutomationAlert["type"] {
  switch (milestone) {
    case "click":
      return "gsc_click_first_seen";
    case "impression":
      return "gsc_impression_first_seen";
    case "page-row":
    default:
      return "gsc_page_row_first_seen";
  }
}

function getMilestoneSourceLabel(milestone: GscFocusPageMilestone) {
  switch (milestone) {
    case "click":
      return "GSC 首次 click";
    case "impression":
      return "GSC 首次 impression";
    case "page-row":
    default:
      return "GSC 首次 page-row";
  }
}

function getMilestoneRouteSuffix(milestone: GscFocusPageMilestone) {
  switch (milestone) {
    case "click":
      return "#gsc-click-first-seen";
    case "impression":
      return "#gsc-impression-first-seen";
    case "page-row":
    default:
      return "#gsc-page-row-first-seen";
  }
}

function getMilestoneTitle(entry: GscFocusPageRowMonitorEntry, milestone: GscFocusPageMilestone) {
  const base = `${titleCase(entry.exchangeSlug)} · ${titleCase(entry.pageType)}`;
  switch (milestone) {
    case "click":
      return `${base} 首次拿到自然搜索 click`;
    case "impression":
      return `${base} 首次拿到 Search Console impression`;
    case "page-row":
    default:
      return `${base} 首次进入 GSC page rows`;
  }
}

function getMilestoneSummary(entry: GscFocusPageRowMonitorEntry, milestone: GscFocusPageMilestone) {
  const lead =
    milestone === "click"
      ? "Google Search Console 第一次记录到该焦点页的自然搜索点击。"
      : milestone === "impression"
        ? "Google Search Console 第一次记录到该焦点页的 impression。"
        : "Google Search Console 第一次记录到该焦点页的 page row。";

  return [
    lead,
    `impressions ${entry.latestImpressions ?? 0}`,
    `clicks ${entry.latestClicks ?? 0}`,
    typeof entry.latestPosition === "number"
      ? `position ${entry.latestPosition.toFixed(2)}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
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
  const newlyImpressions: GscFocusPageRowMonitorEntry[] = [];
  const newlyClicks: GscFocusPageRowMonitorEntry[] = [];

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
    if (!previous?.firstImpressionAt && (observation?.impressions ?? 0) > 0) {
      newlyImpressions.push(entry);
    }
    if (!previous?.firstClickAt && (observation?.clicks ?? 0) > 0) {
      newlyClicks.push(entry);
    }

    entries.push(entry);
  }

  return { entries, newlySeen, newlyImpressions, newlyClicks };
}

export function buildGscFocusPageMilestoneEvents(input: {
  pageRows?: GscFocusPageRowMonitorEntry[];
  impressions?: GscFocusPageRowMonitorEntry[];
  clicks?: GscFocusPageRowMonitorEntry[];
}) {
  const deduped = new Map<string, GscFocusPageMilestoneEvent>();
  const addEvent = (milestone: GscFocusPageMilestone, entry: GscFocusPageRowMonitorEntry) => {
    const existing = deduped.get(entry.key);
    if (!existing || getMilestoneRank(milestone) > getMilestoneRank(existing.milestone)) {
      deduped.set(entry.key, { milestone, entry });
    }
  };

  for (const entry of input.pageRows ?? []) addEvent("page-row", entry);
  for (const entry of input.impressions ?? []) addEvent("impression", entry);
  for (const entry of input.clicks ?? []) addEvent("click", entry);

  return [...deduped.values()].sort((a, b) => {
    const timeA = new Date(
      a.milestone === "click"
        ? a.entry.firstClickAt ?? a.entry.lastCheckedAt
        : a.milestone === "impression"
          ? a.entry.firstImpressionAt ?? a.entry.lastCheckedAt
          : a.entry.firstSeenAt ?? a.entry.lastCheckedAt
    ).getTime();
    const timeB = new Date(
      b.milestone === "click"
        ? b.entry.firstClickAt ?? b.entry.lastCheckedAt
        : b.milestone === "impression"
          ? b.entry.firstImpressionAt ?? b.entry.lastCheckedAt
          : b.entry.firstSeenAt ?? b.entry.lastCheckedAt
    ).getTime();
    return timeA - timeB || getMilestoneRank(b.milestone) - getMilestoneRank(a.milestone);
  });
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
  const previousByKey = new Map((entries ?? []).map((entry) => [entry.key, entry] as const));
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
      .sort(
        (a, b) =>
          new Date(a.firstSeenAt ?? a.lastCheckedAt).getTime() -
          new Date(b.firstSeenAt ?? b.lastCheckedAt).getTime()
      )
      .at(0) ?? null;
  const monitoringStartedAt =
    resolvedEntries
      .map((entry) => entry.monitoringStartedAt ?? entry.firstSeenAt ?? entry.lastCheckedAt)
      .filter(Boolean)
      .sort()
      .at(0) ?? "";
  const observationDays = monitoringStartedAt
    ? Math.max(0, (Date.now() - new Date(monitoringStartedAt).getTime()) / (24 * 60 * 60 * 1000))
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

export function buildGscFocusPageMilestoneAlert(
  event: GscFocusPageMilestoneEvent
): AutomationAlert {
  const { entry, milestone } = event;
  const triggeredAt =
    milestone === "click"
      ? entry.firstClickAt ?? entry.lastCheckedAt
      : milestone === "impression"
        ? entry.firstImpressionAt ?? entry.lastCheckedAt
        : entry.firstSeenAt ?? entry.lastCheckedAt;

  return {
    id: `alert-${milestone}-${entry.key}`,
    level: "info",
    type: getMilestoneAlertType(milestone),
    message: `${getMilestoneTitle(entry, milestone)} · impressions ${entry.latestImpressions ?? 0} · clicks ${entry.latestClicks ?? 0} · position ${typeof entry.latestPosition === "number" ? entry.latestPosition.toFixed(2) : "n/a"}`,
    scope: {
      locale: entry.locale,
      exchangeSlug: entry.exchangeSlug,
      pageType: entry.pageType,
    },
    triggeredAt,
    href: entry.url,
    source: "external",
    sourceLabel: getMilestoneSourceLabel(milestone),
  };
}

export function buildGscFocusPageMilestoneTelegramReminder(event: GscFocusPageMilestoneEvent) {
  const { entry, milestone } = event;
  const payload: DistributionJobPayload = {
    title: getMilestoneTitle(entry, milestone),
    summary: getMilestoneSummary(entry, milestone),
    url: entry.url,
    exchangeSlug: entry.exchangeSlug,
    pageType: entry.pageType,
    primaryQuery: `${entry.exchangeSlug} ${entry.pageType}`.replace(/-/g, " "),
    source: "gsc-focus-page-row",
    sourceLabel: getMilestoneSourceLabel(milestone),
    tags: [
      "gsc-page-row-monitor",
      "focus-cluster",
      "search-discovery",
      "telegram-reminder",
      `milestone-${milestone}`,
      entry.exchangeSlug,
      entry.pageType,
    ],
  };

  return {
    locale: entry.locale,
    exchangeSlug: entry.exchangeSlug,
    pageType: entry.pageType,
    routePath: `${entry.routePath}${getMilestoneRouteSuffix(milestone)}`,
    payload,
  };
}

export function buildGscFocusPageRowFirstSeenAlert(entry: GscFocusPageRowMonitorEntry) {
  return buildGscFocusPageMilestoneAlert({ milestone: "page-row", entry });
}

export function buildGscFocusPageRowTelegramReminder(entry: GscFocusPageRowMonitorEntry) {
  return buildGscFocusPageMilestoneTelegramReminder({ milestone: "page-row", entry });
}
