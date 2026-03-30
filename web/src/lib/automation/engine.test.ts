import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { exchanges } from "@/data/exchanges";
import {
  getAutomationState,
  getTopAutomationOpportunities,
  getUnifiedSeoEntry,
  getUnifiedSeoStaticParams,
} from "./catalog";
import { AUTOMATION_DYNAMIC_PAGE_TYPES } from "./types";

describe("automation engine", () => {
  it("builds a full automation state with monetization metrics", () => {
    const state = getAutomationState();

    expect(state.metrics.totalSignals).toBeGreaterThan(1000);
    expect(state.metrics.totalOpportunities).toBeGreaterThan(1000);
    expect(state.metrics.publishedPages).toBeGreaterThan(
      exchanges.length * 6 * 11
    );
    expect(state.metrics.monthlyProjectedRevenueUsd).toBeGreaterThan(0);
    expect(state.pageRoiDaily.length).toBe(state.pages.length);
    expect(state.queryRoiDaily.length).toBe(state.pages.length);
    expect(state.earnings).toHaveLength(exchanges.length);
    expect(state.controlPlane.rolloutMode).toBe("full-automatic");
  });

  it("classifies opportunities into focus, background, and hold lanes", () => {
    const state = getAutomationState();

    const focusOpportunity = state.opportunities.find(
      (item) =>
        item.locale === "en" &&
        item.exchangeSlug === "binance" &&
        item.pageType === "official-site"
    );
    const backgroundOpportunity = state.opportunities.find(
      (item) =>
        item.locale === "zh" &&
        item.exchangeSlug === "binance" &&
        item.pageType === "official-site"
    );
    const holdOpportunity = state.opportunities.find(
      (item) =>
        item.locale === "en" &&
        item.exchangeSlug === "binance" &&
        item.pageType === "login"
    );

    expect(focusOpportunity?.focusLane).toBe("focus");
    expect(backgroundOpportunity?.focusLane).toBe("background");
    expect(holdOpportunity?.focusLane).toBe("hold");
    expect(focusOpportunity?.discoveryPriority).toBeGreaterThan(
      backgroundOpportunity?.discoveryPriority ?? 0
    );
  });

  it("exposes auto-generated dynamic SEO pages in the unified catalog", () => {
    const state = getAutomationState();
    const dynamicPage = state.pages.find((page) =>
      AUTOMATION_DYNAMIC_PAGE_TYPES.includes(
        page.pageType as (typeof AUTOMATION_DYNAMIC_PAGE_TYPES)[number]
      )
    );

    expect(dynamicPage).toBeDefined();

    const entry = getUnifiedSeoEntry(
      dynamicPage!.locale,
      dynamicPage!.exchangeSlug,
      dynamicPage!.pageType
    );

    expect(entry).toBeDefined();
    expect(entry?.automationSource).toBe("dynamic");
    expect(entry?.metadata.title.toLowerCase()).toContain(
      dynamicPage!.exchangeSlug.toLowerCase()
    );
    expect(entry?.faq.length).toBeGreaterThanOrEqual(3);
  });

  it("adds automation pages to static params and sitemap", () => {
    const params = getUnifiedSeoStaticParams();
    const topOpportunity = getTopAutomationOpportunities(undefined, 1)[0];
    const dynamicParam = params.find(
      (item) =>
        item.locale === topOpportunity.locale &&
        item.slug === topOpportunity.exchangeSlug &&
        item.pageType === topOpportunity.pageType
    );

    expect(dynamicParam).toBeDefined();

    const entries = sitemap();
    expect(
      entries.some((entry) =>
        entry.url.endsWith(
          `/${topOpportunity.locale}/exchanges/${topOpportunity.exchangeSlug}/${topOpportunity.pageType}`
        )
      )
    ).toBe(true);
  });

  it("holds expansion locales until english seed pages first enter page rows", () => {
    const state = getAutomationState();
    const enSeed = state.opportunities.find(
      (item) =>
        item.locale === "en" &&
        item.exchangeSlug === "binance" &&
        item.pageType === "referral-code"
    );
    const hiExpansion = state.opportunities.find(
      (item) =>
        item.locale === "hi" &&
        item.exchangeSlug === "binance" &&
        item.pageType === "referral-code"
    );

    expect(enSeed?.indexPolicyAction).toMatch(/observe|refresh|prune/);
    expect(enSeed?.indexPolicyAllowPromotion).toBe(true);
    expect(hiExpansion?.indexPolicyAction).toMatch(/hold|prune/);
    expect(hiExpansion?.indexPolicyAllowPromotion).toBe(false);
  });
});
