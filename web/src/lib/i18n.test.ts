import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES, SITE_URL } from "./constants";
import {
  getLanguageTag,
  getLocaleAlternates,
  getLocaleAlternateUrls,
  getLocalizedUrl,
  getOpenGraphLocale,
} from "./i18n";

describe("i18n helpers", () => {
  it("maps locale tags and Open Graph locale correctly", () => {
    expect(getLanguageTag("en")).toBe("en-US");
    expect(getOpenGraphLocale("en")).toBe("en_US");
    expect(getLanguageTag("unknown")).toBe("en-US");
  });

  it("builds localized URL for default and nested paths", () => {
    expect(getLocalizedUrl("en")).toBe(`${SITE_URL}/en`);
    expect(getLocalizedUrl("zh", "/exchanges/binance")).toBe(
      `${SITE_URL}/zh/exchanges/binance`
    );
  });

  it("returns locale alternates with x-default", () => {
    const alternates = getLocaleAlternates("/calculator/");

    for (const locale of LOCALES) {
      expect(alternates[locale]).toBe(`/${locale}/calculator`);
    }

    expect(alternates["x-default"]).toBe(`/${DEFAULT_LOCALE}/calculator`);
  });

  it("returns absolute alternate URLs with x-default", () => {
    const alternates = getLocaleAlternateUrls("/legal");

    for (const locale of LOCALES) {
      expect(alternates[locale]).toBe(`${SITE_URL}/${locale}/legal`);
    }

    expect(alternates["x-default"]).toBe(`${SITE_URL}/${DEFAULT_LOCALE}/legal`);
  });
});
