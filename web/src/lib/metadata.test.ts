import { describe, expect, it } from "vitest";
import { LOCALES, SITE_URL } from "./constants";
import { getPageAlternates, getSiteIconsMetadata } from "./metadata";

describe("metadata helpers", () => {
  it("builds absolute alternates for root pages with x-default on /en", () => {
    const alternates = getPageAlternates();

    for (const locale of LOCALES) {
      expect(alternates[locale]).toBe(`${SITE_URL}/${locale}`);
    }

    expect(alternates["x-default"]).toBe(`${SITE_URL}/en`);
  });

  it("uses stable non-404 icon assets for favicon and apple touch icons", () => {
    expect(getSiteIconsMetadata()).toEqual({
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
      shortcut: ["/favicon.ico"],
    });
  });
});
