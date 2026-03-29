import {
  getExchangeSeoEntry,
  getExchangeSeoEntriesForExchange,
  isExchangeSeoPageType,
  type ExchangeSeoContentEntry,
} from "@/data/exchange-seo";
import { exchanges } from "@/data/exchanges";
import {
  FOCUS_LOCALES,
  FOCUS_PAGE_TYPES,
  getOpportunityFocusLane,
  isFocusExchangeSlug,
  isFocusLocale,
  isFocusPageType,
  type OpportunityFocusLane,
} from "./focus";
import type {
  AutomationInternalLinkGroup,
  AutomationInternalLinkManifest,
  AutomationInternalLinkTarget,
  AutomationSeoPage,
  RoiEntry,
} from "./types";

const PAGE_TYPE_PRIORITY: Record<string, number> = {
  "official-site": 130,
  "referral-code": 126,
  "signup-kyc": 118,
  "fees-rebate": 112,
  "app-download": 106,
  "safety-review": 102,
  "country-availability": 98,
  "verification-troubleshooting": 96,
  "deposit-withdrawal": 94,
  login: 92,
  "copy-trading": 88,
  "proof-of-reserves": 84,
  "trading-bot": 82,
  "new-listings": 80,
};

type Candidate = {
  locale: string;
  exchangeSlug: string;
  pageType: string;
  href: string;
  title: string;
  primaryQuery: string;
  source: "base" | "dynamic";
  score: number;
  focusLane: OpportunityFocusLane;
};

function getPageTypePriority(pageType: string) {
  return PAGE_TYPE_PRIORITY[pageType] ?? 70;
}

function getRoiMap(pageRoiDaily: RoiEntry[]) {
  const map = new Map<string, RoiEntry>();
  for (const item of pageRoiDaily) {
    map.set(`${item.locale}:${item.exchangeSlug}:${item.pageType}`, item);
  }
  return map;
}

function freshnessBonus(timestamp?: string) {
  if (!timestamp) return 0;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  if (ageDays <= 7) return 8;
  if (ageDays <= 30) return 4;
  if (ageDays <= 90) return 1;
  return 0;
}

function baseCandidateFromEntry(entry: ExchangeSeoContentEntry): Candidate {
  const focusLane = getOpportunityFocusLane({
    locale: entry.locale,
    exchangeSlug: entry.exchange.slug,
    pageType: entry.pageType,
  });

  return {
    locale: entry.locale,
    exchangeSlug: entry.exchange.slug,
    pageType: entry.pageType,
    href: `/exchanges/${entry.exchange.slug}/${entry.pageType}`,
    title: entry.metadata.title,
    primaryQuery: entry.primaryQuery,
    source: "base",
    score:
      getPageTypePriority(entry.pageType) +
      freshnessBonus(entry.lastReviewed) +
      (focusLane === "focus" ? 24 : focusLane === "background" ? 4 : -12),
    focusLane,
  };
}

function dynamicCandidateFromPage(
  page: AutomationSeoPage,
  opportunity?: { score: number; discoveryPriority?: number; focusLane?: OpportunityFocusLane },
  roi?: RoiEntry
): Candidate {
  const clicksBonus = roi ? Math.log1p(roi.clicks) * 2 : 0;
  const commissionBonus = roi ? Math.min(20, roi.commissionsUsd / 5) : 0;
  const focusLane =
    opportunity?.focusLane ??
    getOpportunityFocusLane({
      locale: page.locale,
      exchangeSlug: page.exchangeSlug,
      pageType: page.pageType,
    });
  return {
    locale: page.locale,
    exchangeSlug: page.exchangeSlug,
    pageType: page.pageType,
    href: `/exchanges/${page.exchangeSlug}/${page.pageType}`,
    title: page.metadata.title,
    primaryQuery: page.primaryQuery,
    source: "dynamic",
    score:
      getPageTypePriority(page.pageType) +
      page.qualityScore * 0.9 +
      (opportunity?.score ?? 0) * 0.04 +
      (opportunity?.discoveryPriority ?? 0) * 0.02 +
      clicksBonus +
      commissionBonus +
      freshnessBonus(page.publishedAt ?? page.lastReviewed) +
      (focusLane === "focus" ? 30 : focusLane === "background" ? 6 : -20),
    focusLane,
  };
}

function toTarget(candidate: Candidate): AutomationInternalLinkTarget {
  return {
    locale: candidate.locale,
    exchangeSlug: candidate.exchangeSlug,
    pageType: candidate.pageType,
    href: candidate.href,
    title: candidate.title,
    primaryQuery: candidate.primaryQuery,
    source: candidate.source,
    score: Math.round(candidate.score * 10) / 10,
  };
}

function uniqueByPageType(candidates: Candidate[]) {
  const unique = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const existing = unique.get(candidate.pageType);
    if (!existing || candidate.score > existing.score) {
      unique.set(candidate.pageType, candidate);
    }
  }
  return [...unique.values()];
}

function pickGuidesRoundRobin(
  groups: AutomationInternalLinkGroup[],
  limit: number,
  perGroupLimit = 2
) {
  const scopedGroups = groups
    .filter((group) => group.guides.length > 0)
    .map((group) => ({
      ...group,
      guides: group.guides.slice(0, perGroupLimit),
    }))
    .sort((a, b) => (b.guides[0]?.score ?? 0) - (a.guides[0]?.score ?? 0));

  const picked: AutomationInternalLinkTarget[] = [];
  const seen = new Set<string>();
  let depth = 0;

  while (picked.length < limit) {
    let addedThisRound = false;
    for (const group of scopedGroups) {
      const guide = group.guides[depth];
      if (!guide) continue;
      const key = `${guide.locale}:${guide.exchangeSlug}:${guide.pageType}`;
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(guide);
      addedThisRound = true;
      if (picked.length >= limit) break;
    }

    if (!addedThisRound) break;
    depth += 1;
  }

  return picked;
}

function buildExchangeGroup(
  state: InternalLinkState,
  locale: string,
  exchangeSlug: string,
  roiMap: Map<string, RoiEntry>
): AutomationInternalLinkGroup {
  const baseCandidates = getExchangeSeoEntriesForExchange(locale, exchangeSlug).map(
    baseCandidateFromEntry
  );
  const dynamicCandidates = state.pages
    .filter(
      (page) =>
        page.locale === locale &&
        page.exchangeSlug === exchangeSlug &&
        page.stage === "published" &&
        !isExchangeSeoPageType(page.pageType)
    )
    .map((page) => {
      const opportunity = state.opportunities.find(
        (item) =>
          item.locale === page.locale &&
          item.exchangeSlug === page.exchangeSlug &&
          item.pageType === page.pageType
      );
      const roi = roiMap.get(`${page.locale}:${page.exchangeSlug}:${page.pageType}`);
      return dynamicCandidateFromPage(page, opportunity, roi);
    });

  const guides = uniqueByPageType([...baseCandidates, ...dynamicCandidates])
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(toTarget);

  return {
    locale,
    exchangeSlug,
    guides,
  };
}

type InternalLinkState = {
  pages: AutomationSeoPage[];
  opportunities: Array<{
    locale: string;
    exchangeSlug: string;
    pageType: string;
    score: number;
    focusLane?: OpportunityFocusLane;
    discoveryPriority?: number;
  }>;
  pageRoiDaily: RoiEntry[];
};

type InternalLinkDistributionState = InternalLinkState & {
  internalLinks: AutomationInternalLinkManifest;
};

export type InternalLinkDistributionCandidate = {
  locale: string;
  exchangeSlug: string;
  pageType: string;
  routePath: string;
  title: string;
  summary: string;
  primaryQuery: string;
  source: "base" | "dynamic";
  score: number;
  tags: string[];
};

const EMPTY_INTERNAL_LINK_SLOTS: AutomationInternalLinkManifest["slots"] = {
  homepageHeroSecondary: [],
  homepageQuestionClusters: [],
  exchangeHubFocus: [],
  exchangeDetailFocus: [],
  brandSupporting: [],
};

export function getInternalLinkSlots(
  manifest?: Partial<AutomationInternalLinkManifest> | null
) {
  return {
    homepageHeroSecondary:
      manifest?.slots?.homepageHeroSecondary ?? EMPTY_INTERNAL_LINK_SLOTS.homepageHeroSecondary,
    homepageQuestionClusters:
      manifest?.slots?.homepageQuestionClusters ??
      EMPTY_INTERNAL_LINK_SLOTS.homepageQuestionClusters,
    exchangeHubFocus:
      manifest?.slots?.exchangeHubFocus ?? EMPTY_INTERNAL_LINK_SLOTS.exchangeHubFocus,
    exchangeDetailFocus:
      manifest?.slots?.exchangeDetailFocus ?? EMPTY_INTERNAL_LINK_SLOTS.exchangeDetailFocus,
    brandSupporting:
      manifest?.slots?.brandSupporting ?? EMPTY_INTERNAL_LINK_SLOTS.brandSupporting,
  };
}

export function buildInternalLinkManifest(
  state: InternalLinkState
): AutomationInternalLinkManifest {
  const roiMap = getRoiMap(state.pageRoiDaily);
  const exchangeGroups: AutomationInternalLinkGroup[] = [];

  for (const locale of new Set(state.pages.map((page) => page.locale))) {
    for (const exchange of exchanges) {
      exchangeGroups.push(buildExchangeGroup(state, locale, exchange.slug, roiMap));
    }
  }

  const focusGroups = exchangeGroups
    .filter(
      (group) =>
        isFocusLocale(group.locale) && isFocusExchangeSlug(group.exchangeSlug)
    )
    .map((group) => ({
      ...group,
      guides: group.guides.filter((guide) => isFocusPageType(guide.pageType)),
    }))
    .filter((group) => group.guides.length > 0);

  const homepageHeroSecondary = FOCUS_LOCALES.map((locale) => ({
    locale,
    guides: pickGuidesRoundRobin(
      focusGroups.filter((group) => group.locale === locale),
      6,
      2
    ),
  })).filter((slot) => slot.guides.length > 0);

  const homepageQuestionClusters = FOCUS_LOCALES.flatMap((locale) =>
    FOCUS_PAGE_TYPES.map((pageType) => ({
      locale,
      pageType,
      guides: focusGroups
        .filter((group) => group.locale === locale)
        .flatMap((group) => group.guides)
        .filter((guide) => guide.pageType === pageType)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    }))
  ).filter((slot) => slot.guides.length > 0);

  const exchangeHubFocus = FOCUS_LOCALES.map((locale) => ({
    locale,
    guides: pickGuidesRoundRobin(
      focusGroups.filter((group) => group.locale === locale),
      9,
      3
    ),
  })).filter((slot) => slot.guides.length > 0);

  const exchangeDetailFocus = focusGroups
    .map((group) => ({
      locale: group.locale,
      exchangeSlug: group.exchangeSlug,
      guides: group.guides.slice(0, 6),
    }))
    .filter((slot) => slot.guides.length > 0);

  const brandSupporting = [
    ...homepageHeroSecondary.map((slot) => ({
      locale: slot.locale,
      topic: "cryptorebate",
      guides: slot.guides.slice(0, 3),
    })),
    ...focusGroups.map((group) => ({
      locale: group.locale,
      topic: `cryptorebate-${group.exchangeSlug}`,
      guides: group.guides.slice(0, 3),
    })),
  ].filter((slot) => slot.guides.length > 0);

  return {
    refreshedAt: new Date().toISOString(),
    exchangeGroups,
    slots: {
      homepageHeroSecondary,
      homepageQuestionClusters,
      exchangeHubFocus,
      exchangeDetailFocus,
      brandSupporting,
    },
  };
}

function buildDistributionCandidate(
  state: InternalLinkDistributionState,
  guide: AutomationInternalLinkTarget,
  slotTag: string
): InternalLinkDistributionCandidate | null {
  const dynamicPage = state.pages.find(
    (page) =>
      page.locale === guide.locale &&
      page.exchangeSlug === guide.exchangeSlug &&
      page.pageType === guide.pageType &&
      page.stage === "published"
  );

  if (dynamicPage) {
    return {
      locale: guide.locale,
      exchangeSlug: guide.exchangeSlug,
      pageType: guide.pageType,
      routePath: `/exchanges/${guide.exchangeSlug}/${guide.pageType}`,
      title: dynamicPage.heroTitle,
      summary: dynamicPage.heroDescription,
      primaryQuery: dynamicPage.primaryQuery,
      source: "dynamic",
      score: guide.score,
      tags: [
        "internal-link-refresh",
        "top-opportunity",
        "focus-cluster",
        "internal-link-slot",
        "search-discovery",
        slotTag,
        dynamicPage.exchangeSlug,
        dynamicPage.pageType,
        "dynamic-guide",
      ],
    };
  }

  const baseEntry = getExchangeSeoEntry(guide.locale, guide.exchangeSlug, guide.pageType);
  if (!baseEntry) return null;

  return {
    locale: guide.locale,
    exchangeSlug: guide.exchangeSlug,
    pageType: guide.pageType,
    routePath: `/exchanges/${guide.exchangeSlug}/${guide.pageType}`,
    title: baseEntry.heroTitle,
    summary: baseEntry.heroDescription,
    primaryQuery: baseEntry.primaryQuery,
    source: "base",
    score: guide.score,
    tags: [
      "internal-link-refresh",
      "top-opportunity",
      "focus-cluster",
      "internal-link-slot",
      "search-discovery",
      slotTag,
      baseEntry.exchange.slug,
      baseEntry.pageType,
      "base-guide",
    ],
  };
}

export function getInternalLinkDistributionCandidates(
  state: InternalLinkDistributionState,
  limit = 24,
  perGroupLimit = 2
) {
  const slots = getInternalLinkSlots(state.internalLinks);
  const slotGuides = [
    ...slots.homepageHeroSecondary.flatMap((slot) =>
      slot.guides
        .slice(0, perGroupLimit)
        .map((guide) => ({ guide, slotTag: "homepage-hero-secondary" }))
    ),
    ...slots.homepageQuestionClusters.flatMap((slot) =>
      slot.guides
        .slice(0, perGroupLimit)
        .map((guide) => ({ guide, slotTag: `homepage-question-${slot.pageType}` }))
    ),
    ...slots.exchangeHubFocus.flatMap((slot) =>
      slot.guides
        .slice(0, perGroupLimit)
        .map((guide) => ({ guide, slotTag: "exchange-hub-focus" }))
    ),
    ...slots.exchangeDetailFocus.flatMap((slot) =>
      slot.guides
        .slice(0, perGroupLimit)
        .map((guide) => ({ guide, slotTag: `exchange-detail-${slot.exchangeSlug}` }))
    ),
    ...slots.brandSupporting.flatMap((slot) =>
      slot.guides
        .slice(0, perGroupLimit)
        .map((guide) => ({ guide, slotTag: `brand-support-${slot.topic}` }))
    ),
  ]
    .sort((a, b) => b.guide.score - a.guide.score)
    .filter(({ guide }) => isFocusLocale(guide.locale))
    .filter(({ guide }) => isFocusExchangeSlug(guide.exchangeSlug))
    .filter(({ guide }) => isFocusPageType(guide.pageType));

  const unique = new Map<string, { guide: AutomationInternalLinkTarget; slotTag: string }>();
  for (const item of slotGuides) {
    const key = `${item.guide.locale}:${item.guide.exchangeSlug}:${item.guide.pageType}`;
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return [...unique.values()]
    .slice(0, limit)
    .map(({ guide, slotTag }) => buildDistributionCandidate(state, guide, slotTag))
    .filter((candidate): candidate is InternalLinkDistributionCandidate =>
      Boolean(candidate)
    );
}
