import {
  getExchangeSeoEntry,
  getExchangeSeoEntriesForExchange,
  isExchangeSeoPageType,
  type ExchangeSeoContentEntry,
} from "@/data/exchange-seo";
import { exchanges } from "@/data/exchanges";
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
  return {
    locale: entry.locale,
    exchangeSlug: entry.exchange.slug,
    pageType: entry.pageType,
    href: `/exchanges/${entry.exchange.slug}/${entry.pageType}`,
    title: entry.metadata.title,
    primaryQuery: entry.primaryQuery,
    source: "base",
    score: getPageTypePriority(entry.pageType) + freshnessBonus(entry.lastReviewed),
  };
}

function dynamicCandidateFromPage(
  page: AutomationSeoPage,
  opportunityScore: number,
  roi?: RoiEntry
): Candidate {
  const clicksBonus = roi ? Math.log1p(roi.clicks) * 2 : 0;
  const commissionBonus = roi ? Math.min(20, roi.commissionsUsd / 5) : 0;
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
      opportunityScore * 0.08 +
      clicksBonus +
      commissionBonus +
      freshnessBonus(page.publishedAt ?? page.lastReviewed),
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
      return dynamicCandidateFromPage(page, opportunity?.score ?? 0, roi);
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

  return {
    refreshedAt: new Date().toISOString(),
    exchangeGroups,
  };
}

function buildDistributionCandidate(
  state: InternalLinkDistributionState,
  guide: AutomationInternalLinkTarget
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
  const groups = [...state.internalLinks.exchangeGroups]
    .filter((group) => group.guides.length > 0)
    .map((group) => ({
      ...group,
      guides: [...group.guides]
        .sort((a, b) => b.score - a.score)
        .slice(0, perGroupLimit),
    }))
    .sort((a, b) => (b.guides[0]?.score ?? 0) - (a.guides[0]?.score ?? 0));

  const picked: AutomationInternalLinkTarget[] = [];
  const seen = new Set<string>();
  let depth = 0;

  while (picked.length < limit) {
    let addedThisRound = false;
    for (const group of groups) {
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

  return picked
    .map((guide) => buildDistributionCandidate(state, guide))
    .filter((candidate): candidate is InternalLinkDistributionCandidate =>
      Boolean(candidate)
    );
}
