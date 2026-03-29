import { describe, expect, it } from "vitest";
import {
  buildRssXml,
  buildSitemapXml,
  getBrandSitemapEntries,
  getDiscoveryAssetUrls,
  getFeedItems,
  getFreshSitemapEntries,
} from "./discovery";

describe("discovery outputs", () => {
  it("returns the discovery asset URLs for sitemap submission", () => {
    expect(getDiscoveryAssetUrls("https://cryptorebate.app")).toEqual([
      "https://cryptorebate.app/sitemap.xml",
      "https://cryptorebate.app/brand-sitemap.xml",
      "https://cryptorebate.app/fresh-7d-sitemap.xml",
      "https://cryptorebate.app/feed.xml",
    ]);
  });

  it("normalizes relative or empty site URLs to absolute discovery assets", () => {
    expect(getDiscoveryAssetUrls("")).toEqual([
      "https://cryptorebate.app/sitemap.xml",
      "https://cryptorebate.app/brand-sitemap.xml",
      "https://cryptorebate.app/fresh-7d-sitemap.xml",
      "https://cryptorebate.app/feed.xml",
    ]);

    expect(getDiscoveryAssetUrls("/")).toEqual([
      "https://cryptorebate.app/sitemap.xml",
      "https://cryptorebate.app/brand-sitemap.xml",
      "https://cryptorebate.app/fresh-7d-sitemap.xml",
      "https://cryptorebate.app/feed.xml",
    ]);
  });

  it("builds fresh and brand sitemap entries", async () => {
    const brandEntries = await getBrandSitemapEntries();
    const freshEntries = await getFreshSitemapEntries(7);

    expect(brandEntries.length).toBeGreaterThan(0);
    expect(freshEntries.length).toBeGreaterThan(0);
    expect(brandEntries[0]?.url).toContain("/brand/");
    expect(freshEntries[0]?.url).toContain("cryptorebate.app/");
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
  });
});
