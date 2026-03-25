import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import {
  SEO_CONTENT_LOCALES,
  SEO_PAGE_TYPES,
  getExchangeSeoEntriesForExchange,
  getExchangeSeoPageHref,
  getExchangeSeoStaticParams,
} from "./exchange-seo";
import { exchanges } from "./exchanges";

describe("exchange GEO content", () => {
  it("generates static params for every exchange, page type, and supported locale", () => {
    const params = getExchangeSeoStaticParams();

    expect(params).toHaveLength(
      exchanges.length * SEO_PAGE_TYPES.length * SEO_CONTENT_LOCALES.length
    );

    for (const param of params) {
      expect(SEO_CONTENT_LOCALES).toContain(param.locale);
      expect(SEO_PAGE_TYPES).toContain(param.pageType);
      expect(exchanges.some((exchange) => exchange.slug === param.slug)).toBe(true);
    }
  });

  it.each(SEO_CONTENT_LOCALES)(
    "includes complete GEO content coverage for locale %s",
    (locale) => {
      for (const exchange of exchanges) {
        const entries = getExchangeSeoEntriesForExchange(locale, exchange.slug);
        expect(entries).toHaveLength(SEO_PAGE_TYPES.length);

        for (const entry of entries) {
          expect(entry.metadata.title).toBeTruthy();
          expect(entry.metadata.description).toBeTruthy();
          expect(entry.metadata.keywords.length).toBeGreaterThanOrEqual(5);
          expect(entry.heroTitle).toBeTruthy();
          expect(entry.heroDescription).toBeTruthy();
          expect(entry.primaryQuery).toBeTruthy();
          expect(entry.secondaryQueries.length).toBeGreaterThanOrEqual(3);
          expect(entry.answerBox.title).toBeTruthy();
          expect(entry.answerBox.body).toBeTruthy();
          expect(entry.answerBox.bullets.length).toBeGreaterThanOrEqual(3);
          expect(entry.factCard.length).toBeGreaterThanOrEqual(7);
          expect(entry.sections.length).toBeGreaterThanOrEqual(3);
          expect(entry.fit.goodFor.length).toBeGreaterThan(0);
          expect(entry.fit.notIdealFor.length).toBeGreaterThan(0);
          expect(entry.faq.length).toBeGreaterThanOrEqual(3);
          expect(entry.cta.label).toBeTruthy();
          expect(entry.cta.helperText).toBeTruthy();
          expect(entry.lastReviewed).toBe(exchange.lastReviewed);

          if (entry.pageType === "signup-kyc" || entry.pageType === "app-download") {
            expect(entry.howToSteps?.length).toBeGreaterThanOrEqual(4);
          } else {
            expect(entry.howToSteps).toBeUndefined();
          }
        }
      }
    }
  );

  it("uses dedicated local keyword pools for ja/ko/ru/es/pt long-tail GEO pages", () => {
    const cases = [
      { locale: "ja", pageType: "official-site", expected: "公式サイト" },
      { locale: "ja", pageType: "app-download", expected: "アプリ" },
      { locale: "ja", pageType: "safety-review", expected: "安全性" },
      { locale: "ko", pageType: "official-site", expected: "공식 사이트" },
      { locale: "ko", pageType: "app-download", expected: "앱 다운로드" },
      { locale: "ko", pageType: "safety-review", expected: "안전성" },
      { locale: "ru", pageType: "official-site", expected: "официальный сайт" },
      { locale: "ru", pageType: "app-download", expected: "скачать приложение" },
      { locale: "ru", pageType: "safety-review", expected: "безопасность" },
      { locale: "es", pageType: "official-site", expected: "sitio oficial" },
      { locale: "es", pageType: "app-download", expected: "descargar app" },
      { locale: "es", pageType: "safety-review", expected: "seguridad" },
      { locale: "pt", pageType: "official-site", expected: "site oficial" },
      { locale: "pt", pageType: "app-download", expected: "baixar app" },
      { locale: "pt", pageType: "safety-review", expected: "segurança" },
    ] as const;

    for (const { locale, pageType, expected } of cases) {
      const entry = getExchangeSeoEntriesForExchange(locale, "binance").find(
        (item) => item.pageType === pageType
      );

      expect(entry).toBeDefined();
      expect(entry?.primaryQuery.toLowerCase()).toContain(expected.toLowerCase());
      expect(
        entry?.metadata.keywords.some((keyword) =>
          keyword.toLowerCase().includes(expected.toLowerCase())
        )
      ).toBe(true);
      expect(entry?.secondaryQueries.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("adds GEO pages to sitemap for every supported locale", () => {
    const entries = sitemap();

    for (const exchange of exchanges) {
      for (const pageType of SEO_PAGE_TYPES) {
        const pathname = getExchangeSeoPageHref(exchange.slug, pageType);

        for (const locale of SEO_CONTENT_LOCALES) {
          expect(
            entries.some((entry) => entry.url.endsWith(`/${locale}${pathname}`))
          ).toBe(true);
        }
      }
    }
  });
});
