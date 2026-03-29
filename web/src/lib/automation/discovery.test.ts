import { describe, expect, it } from "vitest";
import {
  buildRssXml,
  buildSitemapXml,
  getBrandSitemapEntries,
  getDiscoveryAssetUrls,
  getFeedItems,
  getFocusSitemapEntries,
  getFreshSitemapEntries,
} from "./discovery";
import { getGscFocusPageMonitorTargets } from "./gsc-focus-page-monitor";

describe("discovery outputs", () => {
  it("returns the discovery asset URLs for sitemap submission", () => {
    expect(getDiscoveryAssetUrls("https://cryptorebate.app")).toEqual([
      "https://cryptorebate.app/sitemap.xml",
      "https://cryptorebate.app/focus-sitemap.xml",
      "https://cryptorebate.app/brand-sitemap.xml",
      "https://cryptorebate.app/fresh-7d-sitemap.xml",
      "https://cryptorebate.app/feed.xml",
    ]);
  });

  it("normalizes relative or empty site URLs to absolute discovery assets", () => {
    expect(getDiscoveryAssetUrls("")).toEqual([
      "https://cryptorebate.app/sitemap.xml",
      "https://cryptorebate.app/focus-sitemap.xml",
      "https://cryptorebate.app/brand-sitemap.xml",
      "https://cryptorebate.app/fresh-7d-sitemap.xml",
      "https://cryptorebate.app/feed.xml",
    ]);

    expect(getDiscoveryAssetUrls("/")).toEqual([
      "https://cryptorebate.app/sitemap.xml",
      "https://cryptorebate.app/focus-sitemap.xml",
      "https://cryptorebate.app/brand-sitemap.xml",
      "https://cryptorebate.app/fresh-7d-sitemap.xml",
      "https://cryptorebate.app/feed.xml",
    ]);
  });

  it("builds fresh and brand sitemap entries", async () => {
    const brandEntries = await getBrandSitemapEntries();
    const freshEntries = await getFreshSitemapEntries(7);
    const focusEntries = await getFocusSitemapEntries();
    const trackedUrls = getGscFocusPageMonitorTargets().map((target) => target.url);

    expect(brandEntries.length).toBeGreaterThan(0);
    expect(freshEntries.length).toBeGreaterThan(0);
    expect(focusEntries.length).toBeGreaterThanOrEqual(12);
    expect(brandEntries[0]?.url).toContain("/brand/");
    expect(freshEntries[0]?.url).toContain("cryptorebate.app/");
    expect(
      freshEntries.some((entry) =>
        entry.url.includes("/en/exchanges/binance/referral-code")
      )
    ).toBe(true);
    expect(trackedUrls.every((url) => focusEntries.some((entry) => entry.url === url))).toBe(
      true
    );
  });

  it("builds valid XML documents for sitemap and RSS feed", async () => {
    const sitemapXml = buildSitemapXml([
      {
        url: "https://cryptorebate.app/en/brand/cryptorebate",
        lastModified: "2026-03-26T00:00:00.000Z",
      },
    ]);
    expect(sitemapXml).toContain("<urlset");
    expect(sitemapXml).toContain("brand/cryptorebate");

    const items = await getFeedItems(3);
    const rssXml = buildRssXml(items);
    expect(rssXml).toContain("<rss");
    expect(rssXml).toContain("<channel>");
    expect(items.some((item) => item.url.includes("/exchanges/"))).toBe(true);
  });

  it("prioritizes the tracked 12 focus pages in the feed", async () => {
    const items = await getFeedItems(12);
    const trackedUrls = getGscFocusPageMonitorTargets().map((target) => target.url);

    expect(items).toHaveLength(12);
    expect(items.every((item) => trackedUrls.includes(item.url))).toBe(true);
  });
});
