import {
  SEO_CONTENT_LOCALES,
  SEO_PAGE_TYPES,
  getExchangeSeoClusterLabels,
  getExchangeSeoEntriesForExchange as getBaseSeoEntriesForExchange,
  getExchangeSeoEntry as getBaseSeoEntry,
  getExchangeSeoGuidesForLocale as getBaseSeoGuidesForLocale,
  getExchangeSeoPageLabels as getBaseSeoPageLabels,
  isExchangeSeoPageType,
  isSeoContentLocale,
  type ExchangeSeoContentEntry,
} from "@/data/exchange-seo";
import { exchanges, getExchangeBySlug } from "@/data/exchanges";
import { getAutomationLocaleCopy } from "./locale-copy";
import { buildAutomationState } from "./engine";
import type {
  AutomationDynamicPageType,
  AutomationLifecycleStage,
  AutomationSeoPage,
  AutomationState,
} from "./types";

export type UnifiedSeoPageType = string;

export type UnifiedSeoEntry = ExchangeSeoContentEntry & {
  automationSource: "base" | "dynamic";
  stage?: AutomationLifecycleStage;
  qualityScore?: number;
  refreshDueAt?: string;
  opportunityScore?: number;
};

export type OpportunityQuestionGroup = {
  pageType: string;
  guides: UnifiedSeoEntry[];
};

let cachedState: AutomationState | null = null;

function getState() {
  if (!cachedState) {
    cachedState = buildAutomationState();
  }
  return cachedState;
}

export function getAutomationState() {
  return getState();
}

export function resetAutomationStateCache() {
  cachedState = null;
}

function getComparisonPeers(slug: string): [string, string] {
  const mapping: Record<string, [string, string]> = {
    binance: ["okx", "bybit"],
    okx: ["binance", "bybit"],
    bybit: ["binance", "okx"],
    bitget: ["bybit", "binance"],
    gate: ["kucoin", "binance"],
    kucoin: ["gate", "binance"],
    huobi: ["okx", "binance"],
  };

  return mapping[slug] ?? ["binance", "okx"];
}

export function mapAutomationPageToUnifiedEntry(page: AutomationSeoPage): UnifiedSeoEntry {
  const exchange = getExchangeBySlug(page.exchangeSlug);
  if (!exchange) {
    throw new Error(`Missing exchange for automation page ${page.id}`);
  }

  const opportunity = getState().opportunities.find(
    (item) => item.clusterId === page.queryClusterId
  );

  return {
    locale: page.locale as (typeof SEO_CONTENT_LOCALES)[number],
    exchange,
    pageType: page.pageType as never,
    comparisonPeers: getComparisonPeers(page.exchangeSlug) as [typeof exchange.slug, typeof exchange.slug],
    primaryQuery: page.primaryQuery,
    secondaryQueries: page.secondaryQueries,
    metadata: page.metadata,
    heroTitle: page.heroTitle,
    heroDescription: page.heroDescription,
    answerBox: page.answerBox,
    factCard: page.factCard,
    fit: page.fit,
    sections: page.sections,
    faq: page.faq,
    cta: page.cta,
    lastReviewed: page.lastReviewed,
    automationSource: "dynamic",
    stage: page.stage,
    qualityScore: page.qualityScore,
    refreshDueAt: page.refreshDueAt,
    opportunityScore: opportunity?.score,
  };
}

function sortEntries(entries: UnifiedSeoEntry[]) {
  return [...entries].sort((a, b) => {
    const aBase = a.automationSource === "base" ? 1 : 0;
    const bBase = b.automationSource === "base" ? 1 : 0;
    if (aBase !== bBase) return bBase - aBase;
    return (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0);
  });
}

function orderEntriesWithInternalLinks(
  locale: string,
  slug: string,
  entries: UnifiedSeoEntry[]
) {
  const manifestGroup = getState().internalLinks.exchangeGroups.find(
    (group) => group.locale === locale && group.exchangeSlug === slug
  );
  if (!manifestGroup) {
    return sortEntries(entries);
  }

  const manifestOrder = new Map(
    manifestGroup.guides.map((guide, index) => [guide.pageType, index] as const)
  );

  return [...sortEntries(entries)].sort((a, b) => {
    const aIndex = manifestOrder.get(a.pageType);
    const bIndex = manifestOrder.get(b.pageType);
    if (aIndex != null && bIndex != null) return aIndex - bIndex;
    if (aIndex != null) return -1;
    if (bIndex != null) return 1;
    return 0;
  });
}

function getInternalLinkGroupsForLocale(locale: string) {
  return getState().internalLinks.exchangeGroups.filter((group) => group.locale === locale);
}

function mapTargetsToEntries(
  locale: string,
  targets: Array<{ exchangeSlug: string; pageType: string }>
) {
  const unique = new Map<string, UnifiedSeoEntry>();
  for (const target of targets) {
    const entry = getUnifiedSeoEntry(locale, target.exchangeSlug, target.pageType);
    if (!entry) continue;
    unique.set(`${target.exchangeSlug}:${target.pageType}`, entry);
  }
  return [...unique.values()];
}

export function getTopOpportunityEntriesForLocale(locale: string, limit = 6) {
  const groups = getInternalLinkGroupsForLocale(locale)
    .map((group) => ({
      exchangeSlug: group.exchangeSlug,
      guides: [...group.guides].sort((a, b) => b.score - a.score),
    }))
    .filter((group) => group.guides.length > 0)
    .sort((a, b) => (b.guides[0]?.score ?? 0) - (a.guides[0]?.score ?? 0));

  const picked: Array<{ exchangeSlug: string; pageType: string }> = [];
  const seen = new Set<string>();
  let depth = 0;

  while (picked.length < limit) {
    let addedThisRound = false;
    for (const group of groups) {
      const guide = group.guides[depth];
      if (!guide) continue;
      const key = `${guide.exchangeSlug}:${guide.pageType}`;
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push({ exchangeSlug: guide.exchangeSlug, pageType: guide.pageType });
      addedThisRound = true;
      if (picked.length >= limit) break;
    }
    if (!addedThisRound) break;
    depth += 1;
  }

  return mapTargetsToEntries(locale, picked);
}

export function getOpportunityQuestionGroupsForLocale(
  locale: string,
  maxPageTypes = 8,
  limitPerType = 6
): OpportunityQuestionGroup[] {
  const byPageType = new Map<
    string,
    Array<{ exchangeSlug: string; pageType: string; score: number }>
  >();

  for (const group of getInternalLinkGroupsForLocale(locale)) {
    for (const guide of group.guides) {
      const existing = byPageType.get(guide.pageType) ?? [];
      existing.push({
        exchangeSlug: guide.exchangeSlug,
        pageType: guide.pageType,
        score: guide.score,
      });
      byPageType.set(guide.pageType, existing);
    }
  }

  return [...byPageType.entries()]
    .map(([pageType, guides]) => ({
      pageType,
      guides: mapTargetsToEntries(
        locale,
        guides
          .sort((a, b) => b.score - a.score)
          .slice(0, limitPerType)
          .map((guide) => ({
            exchangeSlug: guide.exchangeSlug,
            pageType: guide.pageType,
          }))
      ),
      score: guides[0]?.score ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPageTypes)
    .map(({ pageType, guides }) => ({ pageType, guides }));
}

export function getExchangeOpportunityGuides(
  locale: string,
  slug: string,
  featuredLimit = 4,
  supportingLimit = 6
) {
  const group = getState().internalLinks.exchangeGroups.find(
    (item) => item.locale === locale && item.exchangeSlug === slug
  );
  const featured = mapTargetsToEntries(
    locale,
    (group?.guides ?? []).slice(0, featuredLimit).map((guide) => ({
      exchangeSlug: guide.exchangeSlug,
      pageType: guide.pageType,
    }))
  );
  const featuredPageTypes = new Set(featured.map((guide) => guide.pageType));
  const supporting = getUnifiedSeoEntriesForExchange(locale, slug)
    .filter((guide) => !featuredPageTypes.has(guide.pageType))
    .slice(0, supportingLimit);

  return { featured, supporting };
}

export function getUnifiedSeoPageHref(slug: string, pageType: string) {
  return `/exchanges/${slug}/${pageType}`;
}

export function getUnifiedSeoPageLabels(locale: string, pageType: string) {
  if (isExchangeSeoPageType(pageType)) {
    return getBaseSeoPageLabels(locale as (typeof SEO_CONTENT_LOCALES)[number], pageType);
  }

  const copy = getAutomationLocaleCopy(locale);
  const intentCopy = copy.intents[pageType as AutomationDynamicPageType];
  if (!intentCopy) {
    return {
      short: pageType,
      nav: pageType,
      question: pageType,
    };
  }

  return {
    short: intentCopy.short,
    nav: intentCopy.nav,
    question: intentCopy.question,
  };
}

export function getUnifiedSeoEntry(locale: string, slug: string, pageType: string) {
  if (isExchangeSeoPageType(pageType)) {
    const entry = getBaseSeoEntry(locale, slug, pageType);
    return entry
      ? ({
          ...entry,
          automationSource: "base",
          opportunityScore: 100,
        } satisfies UnifiedSeoEntry)
      : null;
  }

  const page = getState().pages.find(
    (item) =>
      item.locale === locale &&
      item.exchangeSlug === slug &&
      item.pageType === pageType &&
      item.stage !== "deprecated" &&
      item.stage !== "quarantined"
  );

  return page ? mapAutomationPageToUnifiedEntry(page) : null;
}

export function getUnifiedSeoEntriesForExchange(locale: string, slug: string) {
  const baseEntries = getBaseSeoEntriesForExchange(locale, slug).map(
    (entry) =>
      ({
        ...entry,
        automationSource: "base",
        opportunityScore: 100,
      }) satisfies UnifiedSeoEntry
  );

  const dynamicEntries = getState()
    .pages.filter(
      (page) =>
        page.locale === locale &&
        page.exchangeSlug === slug &&
        !isExchangeSeoPageType(page.pageType) &&
        page.stage !== "deprecated" &&
        page.stage !== "quarantined"
    )
    .map(mapAutomationPageToUnifiedEntry);

  return orderEntriesWithInternalLinks(locale, slug, [...baseEntries, ...dynamicEntries]);
}

export function getUnifiedSeoStaticParams() {
  const baseParams = SEO_CONTENT_LOCALES.flatMap((locale) =>
    exchanges.flatMap((exchange) =>
      SEO_PAGE_TYPES.map((pageType) => ({
        locale,
        slug: exchange.slug,
        pageType,
      }))
    )
  );

  const dynamicParams = getState().pages
    .filter(
      (page) =>
        !isExchangeSeoPageType(page.pageType) &&
        page.stage !== "deprecated" &&
        page.stage !== "quarantined"
    )
    .map((page) => ({
      locale: page.locale,
      slug: page.exchangeSlug,
      pageType: page.pageType,
    }));

  const unique = new Map<string, { locale: string; slug: string; pageType: string }>();
  for (const item of [...baseParams, ...dynamicParams]) {
    unique.set(`${item.locale}:${item.slug}:${item.pageType}`, item);
  }

  return [...unique.values()];
}

export function getUnifiedSeoGuidesForLocale(locale: string) {
  const baseGroups = getBaseSeoGuidesForLocale(locale);
  return baseGroups.map((group) => ({
    ...group,
    guides: getUnifiedSeoEntriesForExchange(locale, group.exchange.slug).slice(0, 8),
  }));
}

export function getTopAutomationOpportunities(locale?: string, limit = 12) {
  return getState()
    .opportunities.filter((item) => (!locale ? true : item.locale === locale))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getAutomationAlerts(locale?: string, limit = 12) {
  return getState()
    .alerts.filter((item) => (!locale ? true : item.scope.locale === locale))
    .slice(0, limit);
}

export function getTopAutomationRoiPages(locale?: string, limit = 12) {
  return getState()
    .pageRoiDaily.filter((item) => (!locale ? true : item.locale === locale))
    .sort((a, b) => b.commissionsUsd - a.commissionsUsd)
    .slice(0, limit);
}

export {
  SEO_CONTENT_LOCALES,
  getExchangeSeoClusterLabels as getUnifiedSeoClusterLabels,
  isSeoContentLocale,
};
