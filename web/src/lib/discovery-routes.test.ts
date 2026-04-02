import { describe, expect, it } from "vitest";
import {
  FOCUS_SITEMAP_API_PATH,
  FOCUS_SITEMAP_XML_PATH,
  getDiscoveryAssetRewrites,
} from "./discovery-routes";

describe("getDiscoveryAssetRewrites", () => {
  it("rewrites the public focus sitemap URL to a stable API route", () => {
    expect(getDiscoveryAssetRewrites()).toContainEqual({
      source: FOCUS_SITEMAP_XML_PATH,
      destination: FOCUS_SITEMAP_API_PATH,
    });
  });
});
