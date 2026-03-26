import { getLatestAutomationSnapshotFromDb } from "@/lib/automation/db-store";
import { getAutomationState } from "@/lib/automation/catalog";
import { buildBrandPages, type BrandSeoPage } from "@/lib/automation/brand-pages";
import { SITE_DESCRIPTION_EN, SITE_NAME, SITE_URL } from "@/lib/constants";
import type { AutomationSeoPage, AutomationState } from "@/lib/automation/types";

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
  "/brand-sitemap.xml",
  "/fresh-7d-sitemap.xml",
] as const;

export const DISCOVERY_FEED_PATH = "/feed.xml";

function toAbsoluteUrl(pathname: string) {
  return pathname.startsWith("http") ? pathname : `${SITE_URL}${pathname}`;
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
  return [...DISCOVERY_SITEMAP_PATHS, DISCOVERY_FEED_PATH].map((path) => `${siteUrl}${path}`);
}

export async function getBrandDiscoveryPages() {
  const state = await getDiscoveryState();
  return buildBrandPages(state).map(toBrandDiscoveryPage);
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

  const unique = new Map<string, DiscoveryPageRecord>();
  for (const page of [...pages, ...brandPages]) {
    unique.set(page.url, page);
  }

  return [...unique.values()].sort(
    (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
}

export async function getFeedItems(limit = 40): Promise<FeedItem[]> {
  const freshPages = await getFreshDiscoveryPages(7);
  return freshPages.slice(0, limit).map((page) => ({
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
