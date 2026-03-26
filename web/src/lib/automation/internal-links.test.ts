import { describe, expect, it } from "vitest";
import {
  getExchangeOpportunityGuides,
  getOpportunityQuestionGroupsForLocale,
  getTopOpportunityEntriesForLocale,
} from "./catalog";
import { buildAutomationState } from "./engine";
import { getInternalLinkDistributionCandidates } from "./internal-links";

describe("internal link refresh manifest", () => {
  it("builds exchange groups and prioritizes surfaced guides", () => {
    const state = buildAutomationState();

    expect(state.internalLinks.exchangeGroups.length).toBeGreaterThan(0);

    const binanceEnGroup = state.internalLinks.exchangeGroups.find(
      (group) => group.locale === "en" && group.exchangeSlug === "binance"
    );

    expect(binanceEnGroup).toBeDefined();
    expect(binanceEnGroup?.guides.length).toBeGreaterThan(0);
    expect(binanceEnGroup?.guides[0]?.href).toContain("/exchanges/binance/");
    expect(binanceEnGroup?.guides.some((guide) => guide.pageType === "official-site")).toBe(
      true
    );
  });

  it("exposes top-opportunity recommendation helpers for hubs and exchange detail pages", () => {
    const topEntries = getTopOpportunityEntriesForLocale("en", 6);
    const questionGroups = getOpportunityQuestionGroupsForLocale("en", 4, 5);
    const exchangeGuides = getExchangeOpportunityGuides("en", "binance", 4, 4);

    expect(topEntries.length).toBeGreaterThan(0);
    expect(new Set(topEntries.map((entry) => entry.exchange.slug)).size).toBeGreaterThan(1);
    expect(questionGroups.length).toBeGreaterThan(0);
    expect(questionGroups[0]?.guides.length).toBeGreaterThan(0);
    expect(exchangeGuides.featured.length).toBeGreaterThan(0);
  });

  it("derives distribution candidates from surfaced internal-link recommendations", () => {
    const state = buildAutomationState();
    const candidates = getInternalLinkDistributionCandidates(state, 12, 2);

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.some((item) => item.tags.includes("internal-link-refresh"))).toBe(true);
    expect(
      candidates.every((item) => item.source === "base" || item.source === "dynamic")
    ).toBe(true);
    expect(candidates.every((item) => item.routePath.startsWith("/exchanges/"))).toBe(true);
  });
});
