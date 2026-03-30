import { getLatestAutomationSnapshotFromDb } from "@/lib/automation/db-store";
import { getAutomationState } from "@/lib/automation/catalog";
import { buildBrandPages, type BrandSeoPage } from "@/lib/automation/brand-pages";
import { getExchangeSeoEntry, isExchangeSeoPageType } from "@/data/exchange-seo";
import { SITE_DESCRIPTION_EN, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getInternalLinkSlots } from "@/lib/automation/internal-links";
import { getGscFocusPageMonitorTargets } from "@/lib/automation/gsc-focus-page-monitor";
import type {
  AutomationInternalLinkTarget,
  AutomationSeoPage,
  AutomationState,
} from "@/lib/automation/types";

export type DiscoveryUrlEntry = {
  url: string;
  lastModified: string;
};

export type FeedItem = {
  title: string;
  description: string;
  url: string;
  pubDate: string;
  guid: string;
};

type DiscoveryPageRecord = {
  kind: "exchange" | "brand";
  title: string;
  description: string;
  url: string;
  locale: string;
  lastModified: string;
  exchangeSlug?: string;
  pageType?: string;
  topic?: string;
};

export const DISCOVERY_SITEMAP_PATHS = [
  "/sitemap.xml",
  "/focus-sitemap.xml",
  "/brand-sitemap.xml",
  "/fresh-7d-sitemap.xml",
] as const;

export const DISCOVERY_FEED_PATH = "/feed.xml";

function toAbsoluteUrl(pathname: string) {
  return pathname.startsWith("http") ? pathname : `${SITE_URL}${pathname}`;
}

function resolveDiscoverySiteUrl(siteUrl?: string) {
  const trimmed = siteUrl?.trim();
  if (!trimmed || trimmed === "/" || !/^https?:\/\//i.test(trimmed)) {
    return SITE_URL;
  }
  return trimmed.replace(/\/+$/, "");
}

function normaliseDate(value?: string | null) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const fallback = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
}

async function getDiscoveryState(): Promise<AutomationState> {
  const dbSnapshot = await getLatestAutomationSnapshotFromDb();
  if (dbSnapshot?.snapshot) {
    return dbSnapshot.snapshot;
  }

  return getAutomationState();
}

function toExchangeDiscoveryPage(page: AutomationSeoPage): DiscoveryPageRecord {
  const routePath = `/exchanges/${page.exchangeSlug}/${page.pageType}`;
  return {
    kind: "exchange",
    title: page.metadata.title,
    description: page.metadata.description,
    url: toAbsoluteUrl(`/${page.locale}${routePath}`),
    locale: page.locale,
    exchangeSlug: page.exchangeSlug,
    pageType: page.pageType,
    lastModified: normaliseDate(page.publishedAt ?? page.lastReviewed),
  };
}

function toExchangeDiscoveryPageWithOverride(
  page: AutomationSeoPage,
  lastModified?: string
): DiscoveryPageRecord {
  return {
    ...toExchangeDiscoveryPage(page),
    lastModified: normaliseDate(lastModified ?? page.publishedAt ?? page.lastReviewed),
  };
}

function toBaseExchangeDiscoveryPage(
  target: AutomationInternalLinkTarget,
  lastModified?: string
): DiscoveryPageRecord | null {
  if (!isExchangeSeoPageType(target.pageType)) {
    return null;
  }

  const entry = getExchangeSeoEntry(target.locale, target.exchangeSlug, target.pageType);
  if (!entry) {
    return null;
  }

  return {
    kind: "exchange",
    title: entry.metadata.title,
    description: entry.metadata.description,
    url: toAbsoluteUrl(`/${target.locale}/exchanges/${target.exchangeSlug}/${target.pageType}`),
    locale: target.locale,
    exchangeSlug: target.exchangeSlug,
    pageType: target.pageType,
    lastModified: normaliseDate(lastModified ?? entry.lastReviewed),
  };
}

function toBrandDiscoveryPage(page: BrandSeoPage): DiscoveryPageRecord {
  return {
    kind: "brand",
    title: page.metadata.title,
    description: page.metadata.description,
    url: toAbsoluteUrl(`/${page.locale}${page.routePath}`),
    locale: page.locale,
    topic: page.topic,
    lastModified: normaliseDate(page.publishedAt ?? page.lastReviewed),
  };
}

export function getDiscoveryAssetUrls(siteUrl = process.env.AUTOMATION_SITE_URL ?? SITE_URL) {
  const origin = resolveDiscoverySiteUrl(siteUrl);
  return [...DISCOVERY_SITEMAP_PATHS, DISCOVERY_FEED_PATH].map(
    (path) => `${origin}${path}`
  );
}

export async function getBrandDiscoveryPages() {
  const state = await getDiscoveryState();
  return buildBrandPages(state).map(toBrandDiscoveryPage);
}

function sortDiscoveryPages(a: DiscoveryPageRecord, b: DiscoveryPageRecord) {
  if (a.kind !== b.kind) {
    return a.kind === "exchange" ? -1 : 1;
  }
  const lastModifiedDelta =
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  if (lastModifiedDelta !== 0) return lastModifiedDelta;
  return a.url.localeCompare(b.url);
}

const TRACKED_DISCOVERY_RANK = new Map<string, number>(
  getGscFocusPageMonitorTargets().map((target, index) => [
    `${target.locale}:${target.exchangeSlug}:${target.pageType}`,
    index,
  ] as const)
);

function getTrackedDiscoveryRank(page: DiscoveryPageRecord) {
  if (!page.exchangeSlug || !page.pageType) return undefined;
  return TRACKED_DISCOVERY_RANK.get(
    `${page.locale}:${page.exchangeSlug}:${page.pageType}` as string
  );
}

function sortFocusDiscoveryPages(a: DiscoveryPageRecord, b: DiscoveryPageRecord) {
  const aRank = getTrackedDiscoveryRank(a);
  const bRank = getTrackedDiscoveryRank(b);
  if (aRank != null || bRank != null) {
    if (aRank == null) return 1;
    if (bRank == null) return -1;
    if (aRank !== bRank) return aRank - bRank;
  }

  return sortDiscoveryPages(a, b);
}

function buildTrackedFocusDiscoveryPages(
  state: AutomationState,
  refreshedAt: string
) {
  const opportunityMap = new Map(
    state.opportunities.map((item) => [
      `${item.locale}:${item.exchangeSlug}:${item.pageType}`,
      item,
    ] as const)
  );
  const dynamicPages = new Map(
    state.pages
      .filter((page) => page.stage === "published")
      .map((page) => [`${page.locale}:${page.exchangeSlug}:${page.pageType}`, page] as const)
  );

  return getGscFocusPageMonitorTargets()
    .map((target) => {
      const opportunity = opportunityMap.get(
        `${target.locale}:${target.exchangeSlug}:${target.pageType}`
      );
      if (opportunity && opportunity.indexPolicyAllowPromotion === false) {
        return null;
      }
      const dynamicPage = dynamicPages.get(
        `${target.locale}:${target.exchangeSlug}:${target.pageType}`
      );
      if (dynamicPage) {
        return toExchangeDiscoveryPageWithOverride(dynamicPage, refreshedAt);
      }

      return toBaseExchangeDiscoveryPage(
        {
          locale: target.locale,
          exchangeSlug: target.exchangeSlug,
          pageType: target.pageType,
          href: target.routePath,
          title: target.key,
          primaryQuery: `${target.exchangeSlug} ${target.pageType}`.replace(/-/g, " "),
          source: "base",
          score: 0,
        },
        refreshedAt
      );
    })
    .filter((page): page is DiscoveryPageRecord => Boolean(page));
}

export async function getFocusDiscoveryPages(limit = 36) {
  const state = await getDiscoveryState();
  const slots = getInternalLinkSlots(state.internalLinks);
  const refreshedAt = normaliseDate(state.internalLinks.refreshedAt ?? state.generatedAt);
  const targets = [
    ...slots.homepageHeroSecondary.flatMap((slot) => slot.guides),
    ...slots.homepageQuestionClusters.flatMap((slot) => slot.guides),
    ...slots.exchangeHubFocus.flatMap((slot) => slot.guides),
    ...slots.exchangeDetailFocus.flatMap((slot) => slot.guides),
  ];

  const uniqueTargets = new Map<string, AutomationInternalLinkTarget>();
  for (const target of targets) {
    uniqueTargets.set(`${target.locale}:${target.exchangeSlug}:${target.pageType}`, target);
  }

  const dynamicPages = new Map(
    state.pages
      .filter((page) => page.stage === "published")
      .map((page) => [`${page.locale}:${page.exchangeSlug}:${page.pageType}`, page] as const)
  );

  const slotPages = [...uniqueTargets.values()]
    .map((target) => {
      const dynamicPage = dynamicPages.get(
        `${target.locale}:${target.exchangeSlug}:${target.pageType}`
      );
      if (dynamicPage) {
        return toExchangeDiscoveryPageWithOverride(dynamicPage, refreshedAt);
      }

      return toBaseExchangeDiscoveryPage(target, refreshedAt);
    })
    .filter((page): page is DiscoveryPageRecord => Boolean(page));

  const uniquePages = new Map<string, DiscoveryPageRecord>();
  for (const page of [
    ...buildTrackedFocusDiscoveryPages(state, refreshedAt),
    ...slotPages,
  ]) {
    uniquePages.set(page.url, page);
  }

  return [...uniquePages.values()].sort(sortFocusDiscoveryPages).slice(0, limit);
}

export async function getFreshDiscoveryPages(days = 7) {
  const state = await getDiscoveryState();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const pages = state.pages
    .filter((page) => page.stage === "published")
    .map(toExchangeDiscoveryPage)
    .filter((page) => new Date(page.lastModified).getTime() >= cutoff);
  const brandPages = buildBrandPages(state)
    .map(toBrandDiscoveryPage)
    .filter((page) => new Date(page.lastModified).getTime() >= cutoff);
  const focusPages = (await getFocusDiscoveryPages()).filter(
    (page) => new Date(page.lastModified).getTime() >= cutoff
  );

  const unique = new Map<string, DiscoveryPageRecord>();
  for (const page of [...focusPages, ...pages, ...brandPages]) {
    unique.set(page.url, page);
  }

  return [...unique.values()].sort(sortDiscoveryPages);
}

export async function getFeedItems(limit = 40): Promise<FeedItem[]> {
  const [focusPages, freshPages] = await Promise.all([
    getFocusDiscoveryPages(limit),
    getFreshDiscoveryPages(7),
  ]);
  const orderedPages: DiscoveryPageRecord[] = [];
  const seen = new Set<string>();

  for (const page of [...focusPages, ...freshPages]) {
    if (seen.has(page.url)) continue;
    seen.add(page.url);
    orderedPages.push(page);
    if (orderedPages.length >= limit) break;
  }

  return orderedPages.map((page) => ({
    title: page.title,
    description: page.description,
    url: page.url,
    pubDate: page.lastModified,
    guid: page.url,
  }));
}

export function buildSitemapXml(entries: DiscoveryUrlEntry[]) {
  const rows = entries
    .map(
      (entry) => `  <url>\n    <loc>${escapeXml(entry.url)}</loc>\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function buildRssXml(items: FeedItem[]) {
  const rows = items
    .map(
      (item) => `    <item>\n      <title>${escapeXml(item.title)}</title>\n      <link>${escapeXml(
        item.url
      )}</link>\n      <guid>${escapeXml(item.guid)}</guid>\n      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>\n      <description>${escapeXml(
        item.description
      )}</description>\n    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(
      SITE_NAME
    )}</title>\n    <link>${escapeXml(
      SITE_URL
    )}</link>\n    <description>${escapeXml(
      SITE_DESCRIPTION_EN
    )}</description>\n${rows}\n  </channel>\n</rss>\n`;
}

export async function getBrandSitemapEntries(): Promise<DiscoveryUrlEntry[]> {
  const pages = await getBrandDiscoveryPages();
  return pages.map((page) => ({
    url: page.url,
    lastModified: page.lastModified,
  }));
}

export async function getFocusSitemapEntries(): Promise<DiscoveryUrlEntry[]> {
  const pages = await getFocusDiscoveryPages();
  return pages.map((page) => ({
    url: page.url,
    lastModified: page.lastModified,
  }));
}

export async function getFreshSitemapEntries(days = 7): Promise<DiscoveryUrlEntry[]> {
  const pages = await getFreshDiscoveryPages(days);
  return pages.map((page) => ({
    url: page.url,
    lastModified: page.lastModified,
  }));
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
