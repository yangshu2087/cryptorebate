import type { MetadataRoute } from "next";
import { getAllExchangeSlugs } from "@/data/exchanges";

const BASE_URL = "https://cryptorebate.app";
const LOCALES = ["zh", "en"];

export default function sitemap(): MetadataRoute.Sitemap {
  const exchangeSlugs = getAllExchangeSlugs();
  const now = new Date();

  const staticPages = ["", "/exchanges", "/calculator", "/about"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: now,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }

    for (const slug of exchangeSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/exchanges/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}/${l}/exchanges/${slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
