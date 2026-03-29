import { describe, expect, it } from "vitest";
import type { CompetitorGapSerpWinnersArtifact } from "./types";
import {
  buildCompetitorGapDominantDomains,
  buildCompetitorGapProviderHits,
  buildDiscoveryLaneSummary,
  buildMonetizationLaneSummary,
} from "./operator-console";
import { buildAutomationState } from "./engine";

describe("operator console competitor-gap SERP helpers", () => {
  const artifact: CompetitorGapSerpWinnersArtifact = {
    status: "success" as const,
    generatedAt: "2026-03-28T00:00:00Z",
    providersRequested: ["duckduckgo-html", "serper", "brave"],
    templateCount: 2,
    totalWinnerUrls: 3,
    records: [
      {
        templateId: "finding-1",
        query: "binance official site referral code",
        exchangeSlug: "binance" as const,
        locale: "en" as const,
        topic: "binance official site / referral entry trust layer",
        providersUsed: ["duckduckgo-html", "serper"] as const,
        providerReports: [
          { provider: "duckduckgo-html" as const, status: "success" as const, resultCount: 2 },
          { provider: "serper" as const, status: "success" as const, resultCount: 2 },
          { provider: "brave" as const, status: "failed" as const, resultCount: 0 },
        ],
        dominantDomains: ["binance.com", "example-affiliate.com"],
        topResults: [],
      },
      {
        templateId: "finding-2",
        query: "okx signup referral code restrictions",
        exchangeSlug: "okx" as const,
        locale: "en" as const,
        topic: "okx signup with referral code and regional restrictions",
        providersUsed: ["duckduckgo-html"] as const,
        providerReports: [
          { provider: "duckduckgo-html" as const, status: "success" as const, resultCount: 1 },
          { provider: "serper" as const, status: "failed" as const, resultCount: 0 },
        ],
        dominantDomains: ["okx.com", "binance.com"],
        topResults: [],
      },
    ],
  };

  it("counts provider hits by template", () => {
    const summary = buildCompetitorGapProviderHits(artifact);
    expect(summary).toEqual({
      "duckduckgo-html": 2,
      serper: 1,
      brave: 0,
    });
  });

  it("ranks dominant domains across records", () => {
    const domains = buildCompetitorGapDominantDomains(artifact);
    expect(domains[0]).toEqual({ domain: "binance.com", count: 2 });
    expect(domains).toContainEqual({ domain: "okx.com", count: 1 });
  });

  it("builds separate discovery and monetization lanes", () => {
    const state = buildAutomationState();
    const discovery = buildDiscoveryLaneSummary(state);
    const monetization = buildMonetizationLaneSummary(state);

    expect(discovery.focusPagesPublished).toBeGreaterThan(0);
    expect(discovery.focusPagesSurfaced).toBeGreaterThan(0);
    expect(discovery.gscRowsFetched).toBeGreaterThanOrEqual(0);
    expect(monetization.affiliateClicks).toBe(state.attribution.clicks);
    expect(monetization.realCoverageRate).toBe(state.attribution.realCoverageRate);
  });
});
