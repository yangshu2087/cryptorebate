import { describe, expect, it } from "vitest";
import { buildCompetitorGapActionPlan, deriveCompetitorGapActions } from "./competitor-gap-actions";
import { normalizeCompetitorGapSummary } from "./competitor-gap";

const sampleSummary = normalizeCompetitorGapSummary({
  status: "success",
  generatedAt: "2026-03-28T13:15:18Z",
  summary: "sample",
  findings: [
    {
      id: "finding-binance-official-trust",
      exchangeSlug: "binance",
      locale: "en",
      topic: "binance official site / referral entry trust layer",
      competitorType: "affiliate",
      competitorPattern: "pattern",
      ourGap: "gap",
      suggestedAction: "refresh",
      confidence: "high",
    },
    {
      id: "finding-okx-signup-fallback",
      exchangeSlug: "okx",
      locale: "en",
      topic: "okx signup with referral code and regional restrictions",
      competitorType: "official",
      competitorPattern: "pattern",
      ourGap: "gap",
      suggestedAction: "refresh",
      confidence: "high",
    },
    {
      id: "finding-okx-referral-faq-cluster",
      exchangeSlug: "okx",
      locale: "en",
      topic: "okx referral faq vs dex referral confusion",
      competitorType: "official",
      competitorPattern: "pattern",
      ourGap: "gap",
      suggestedAction: "publish",
      confidence: "medium",
    },
    {
      id: "finding-cross-exchange-signup-friction",
      exchangeSlug: "cross-exchange",
      locale: "multi-locale",
      topic: "registration friction and referral-link fallback",
      competitorType: "help-center",
      competitorPattern: "pattern",
      ourGap: "gap",
      suggestedAction: "internal-link",
      confidence: "medium",
    },
  ],
});

describe("competitor gap actions", () => {
  it("derives concrete page actions from high-intent findings", () => {
    const actions = deriveCompetitorGapActions(sampleSummary);

    expect(actions.length).toBeGreaterThanOrEqual(6);
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "refresh",
          exchangeSlug: "binance",
          locale: "en",
          pageType: "official-site",
          routePath: "/exchanges/binance/official-site",
          priority: "p1",
        }),
        expect.objectContaining({
          action: "refresh",
          exchangeSlug: "binance",
          locale: "en",
          pageType: "referral-code",
          routePath: "/exchanges/binance/referral-code",
        }),
        expect.objectContaining({
          action: "refresh",
          exchangeSlug: "okx",
          locale: "en",
          pageType: "signup-kyc",
          routePath: "/exchanges/okx/signup-kyc",
        }),
        expect.objectContaining({
          action: "publish",
          exchangeSlug: "okx",
          locale: "en",
          pageType: "verification-troubleshooting",
          routePath: "/exchanges/okx/verification-troubleshooting",
        }),
      ])
    );
  });

  it("builds an action plan summary for the repo command output", () => {
    const plan = buildCompetitorGapActionPlan(sampleSummary);

    expect(plan.status).toBe("success");
    expect(plan.summaryGeneratedAt).toBe("2026-03-28T13:15:18Z");
    expect(plan.totalActions).toBeGreaterThan(0);
    expect(plan.refreshActions).toBeGreaterThanOrEqual(3);
    expect(plan.publishActions).toBeGreaterThanOrEqual(1);
  });

  it("keeps internal-link actions concrete even for cross-exchange findings", () => {
    const actions = deriveCompetitorGapActions(sampleSummary).filter(
      (action) => action.action === "internal-link"
    );

    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every((action) => action.exchangeSlug !== "cross-exchange")).toBe(true);
    expect(actions.every((action) => action.routePath.startsWith("/exchanges/"))).toBe(true);
    expect(actions.some((action) => action.pageType === "official-site")).toBe(true);
    expect(actions.some((action) => action.pageType === "signup-kyc")).toBe(true);
  });
});
