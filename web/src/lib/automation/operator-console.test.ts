import { describe, expect, it } from "vitest";
import type { CompetitorGapSerpWinnersArtifact } from "./types";
import {
  buildCompetitorGapDominantDomains,
  buildCompetitorGapProviderHits,
  buildSeoDashboardData,
  buildDiscoveryLaneSummary,
  buildDiscoverySprintSummary,
  buildGscFocusPageRowMonitorSummary,
  buildIndexGrowthPolicySummary,
  buildMonetizationLaneSummary,
  buildSearchVisibilityActionPlan,
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

  it("builds separate discovery, monetization, and index-growth policy summaries", () => {
    const state = buildAutomationState();
    const discovery = buildDiscoveryLaneSummary(state);
    const monetization = buildMonetizationLaneSummary(state);
    const indexGrowthPolicy = buildIndexGrowthPolicySummary(state);
    const focusMonitor = buildGscFocusPageRowMonitorSummary(state);
    const discoverySprint = buildDiscoverySprintSummary(state);

    expect(discovery.focusPagesPublished).toBeGreaterThan(0);
    expect(discovery.focusPagesSurfaced).toBeGreaterThan(0);
    expect(discovery.gscRowsFetched).toBeGreaterThanOrEqual(0);
    expect(monetization.affiliateClicks).toBe(state.attribution.clicks);
    expect(monetization.realCoverageRate).toBe(state.attribution.realCoverageRate);
    expect(indexGrowthPolicy.publishBudget.max).toBe(12);
    expect(indexGrowthPolicy.refreshBudget.max).toBe(18);
    expect(Array.isArray(indexGrowthPolicy.refreshOrPrunePages)).toBe(true);
    expect(Array.isArray(indexGrowthPolicy.deferredPages)).toBe(true);
    expect(focusMonitor.trackedCount).toBe(12);
    expect(focusMonitor.pendingCount).toBeGreaterThanOrEqual(0);
    expect(focusMonitor.entries).toHaveLength(12);
    expect(discoverySprint.trackedSeedPages).toBe(12);
    expect(discoverySprint.pinnedSurfaces.exchangeHub.count).toBe(12);
    expect(Array.isArray(discoverySprint.stageBuckets.observe)).toBe(true);
    expect(discoverySprint.firstImpressionForecast.day3).toHaveLength(12);
    expect(discoverySprint.firstImpressionForecast.day7).toHaveLength(12);
    expect(discoverySprint.firstImpressionForecast.day14).toHaveLength(12);
    expect(discoverySprint.firstImpressionForecast.day3[0].likelihoodScore).toBeGreaterThanOrEqual(
      discoverySprint.firstImpressionForecast.day3[1].likelihoodScore
    );
    expect(discoverySprint.firstImpressionForecast.day3[0].why.length).toBeGreaterThan(0);
    expect(discoverySprint.summary.topImpressionPage3d?.id).toBe(
      discoverySprint.firstImpressionForecast.day3[0].id
    );
  });

  it("surfaces the latest coverage audit run in status cards", async () => {
    const dashboard = await buildSeoDashboardData("en");

    expect(dashboard.discoverySprint.trackedSeedPages).toBe(12);
    expect(dashboard.operatorSummary.statusCards.discoverySprint.trackedSeedPages).toBe(12);
    expect(dashboard.operatorSummary.statusCards.coverageAudit).toMatchObject({
      issueCount: dashboard.coverageRepair.issueCount,
      redirectIssueCount: dashboard.coverageRepair.redirectIssueCount,
      notFoundIssueCount: dashboard.coverageRepair.notFoundIssueCount,
      discoveryIssueCount: dashboard.coverageRepair.discoveryIssueCount,
    });
    expect(dashboard.operatorSummary.statusCards.coverageAudit.summary).toContain("Coverage audit");
  });

  it("builds a ranked search visibility action plan for push, copy refresh, and refresh-before-expand", () => {
    const state = buildAutomationState();
    const actionPlan = buildSearchVisibilityActionPlan(state);

    expect(actionPlan.continuePush.length).toBeGreaterThan(0);
    expect(actionPlan.continuePush.every((item) => item.locale === "en")).toBe(true);
    expect(actionPlan.continuePush.every((item) => item.why.length > 0)).toBe(true);

    expect(actionPlan.titleDescriptionRefresh.length).toBeGreaterThan(0);
    expect(actionPlan.titleDescriptionRefresh.some((item) => item.copyFocus.length > 0)).toBe(true);

    expect(actionPlan.refreshInsteadOfExpand.length).toBeGreaterThan(0);
    expect(
      actionPlan.refreshInsteadOfExpand.every(
        (item) => item.observationDays >= 0 && item.why.length > 0
      )
    ).toBe(true);
  });
});
