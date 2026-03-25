import type { MetadataRoute } from "next";
import {
  SEO_CONTENT_LOCALES,
  SEO_PAGE_TYPES,
  getExchangeSeoPageHref,
} from "@/data/exchange-seo";
import { getAllExchangeSlugs } from "@/data/exchanges";
import { LOCALES, SITE_URL } from "@/lib/constants";
import { getLocaleAlternateUrls } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const exchangeSlugs = getAllExchangeSlugs();
  const now = new Date();

  const staticPages = ["", "/exchanges", "/calculator", "/about", "/disclosure", "/legal"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: now,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: getLocaleAlternateUrls(page),
        },
      });
    }

    for (const slug of exchangeSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/exchanges/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: getLocaleAlternateUrls(`/exchanges/${slug}`),
        },
      });
    }
  }

  for (const locale of SEO_CONTENT_LOCALES) {
    for (const slug of exchangeSlugs) {
      for (const pageType of SEO_PAGE_TYPES) {
        const pathname = getExchangeSeoPageHref(slug, pageType);
        entries.push({
          url: `${SITE_URL}/${locale}${pathname}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.75,
          alternates: {
            languages: getLocaleAlternateUrls(pathname, SEO_CONTENT_LOCALES),
          },
        });
      }
    }
  }

  return entries;
}
