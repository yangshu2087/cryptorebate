import { describe, expect, it } from "vitest";
import type { GscFocusPageRowMonitorEntry } from "./types";
import {
  applyIndexGrowthPolicyBudget,
  evaluateIndexGrowthPolicy,
} from "./index-growth-policy";

function makeSeedEntry(
  overrides: Partial<GscFocusPageRowMonitorEntry> = {}
): GscFocusPageRowMonitorEntry {
  return {
    key: "focus-page-row:en:binance:referral-code",
    locale: "en",
    exchangeSlug: "binance",
    pageType: "referral-code",
    routePath: "/exchanges/binance/referral-code",
    url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
    seenInPageRows: false,
    monitoringStartedAt: "2026-03-01T00:00:00.000Z",
    lastCheckedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("index-growth-policy", () => {
  it("keeps seed locale in observe mode before the 7-day window closes", () => {
    const decision = evaluateIndexGrowthPolicy({
      locale: "en",
      exchangeSlug: "binance",
      pageType: "referral-code",
      focusLane: "focus",
      monitorEntries: [makeSeedEntry()],
      now: new Date("2026-03-05T00:00:00.000Z"),
    });

    expect(decision.action).toBe("observe");
    expect(decision.allowPromotion).toBe(true);
    expect(decision.allowExpansion).toBe(false);
  });

  it("moves seed locale into refresh after 14 days without a page-row hit", () => {
    const decision = evaluateIndexGrowthPolicy({
      locale: "en",
      exchangeSlug: "binance",
      pageType: "referral-code",
      focusLane: "focus",
      monitorEntries: [makeSeedEntry()],
      now: new Date("2026-03-16T00:00:00.000Z"),
    });

    expect(decision.action).toBe("refresh");
    expect(decision.allowPromotion).toBe(true);
    expect(decision.reason).toContain("14");
  });

  it("holds expansion locales until the english seed page is seen in page rows", () => {
    const decision = evaluateIndexGrowthPolicy({
      locale: "hi",
      exchangeSlug: "binance",
      pageType: "referral-code",
      focusLane: "focus",
      monitorEntries: [makeSeedEntry()],
      now: new Date("2026-03-08T00:00:00.000Z"),
    });

    expect(decision.action).toBe("hold");
    expect(decision.allowPromotion).toBe(false);
  });

  it("unlocks expansion locales after the english seed page is seen", () => {
    const decision = evaluateIndexGrowthPolicy({
      locale: "th",
      exchangeSlug: "binance",
      pageType: "referral-code",
      focusLane: "focus",
      monitorEntries: [
        makeSeedEntry({
          seenInPageRows: true,
          firstSeenAt: "2026-03-06T00:00:00.000Z",
        }),
      ],
      now: new Date("2026-03-08T00:00:00.000Z"),
    });

    expect(decision.action).toBe("expand");
    expect(decision.allowPromotion).toBe(true);
    expect(decision.allowExpansion).toBe(true);
  });

  it("prunes missed expansion after 21 days without a seed hit", () => {
    const decision = evaluateIndexGrowthPolicy({
      locale: "hi",
      exchangeSlug: "binance",
      pageType: "referral-code",
      focusLane: "focus",
      monitorEntries: [makeSeedEntry()],
      now: new Date("2026-03-24T00:00:00.000Z"),
    });

    expect(decision.action).toBe("prune");
    expect(decision.allowPromotion).toBe(false);
  });

  it("keeps background pages accessible but outside the daily promotion chain", () => {
    const decision = evaluateIndexGrowthPolicy({
      locale: "es",
      exchangeSlug: "binance",
      pageType: "official-site",
      focusLane: "background",
      monitorEntries: [makeSeedEntry()],
      now: new Date("2026-03-08T00:00:00.000Z"),
    });

    expect(decision.action).toBe("observe");
    expect(decision.allowPromotion).toBe(false);
    expect(decision.reason).toContain("默认不进入每日发布");
  });

  it("defers publish candidates beyond the daily budget", () => {
    const candidates = Array.from({ length: 14 }, (_, index) => ({
      id: `opp-${index}`,
      clusterId: `cluster-${index}`,
      locale: "en",
      exchangeSlug: index < 7 ? "binance" : "okx",
      intent: "high-intent",
      pageType: "referral-code",
      primaryQuery: `query-${index}`,
      score: 90 - index,
      recommendedAction: "publish" as const,
      stage: "validated" as const,
      focusLane: "focus" as const,
      discoveryPriority: 30_000 - index,
      indexPolicyAction: "publish" as const,
      indexPolicyReason: "seed seen in page rows",
      indexPolicyObservationDays: 8,
      indexPolicyAllowPromotion: true,
      indexPolicyAllowExpansion: true,
      indexPolicyScheduledToday: true,
      qualityScore: 90,
      projectedEpcUsd: 10,
      projectedMonthlyRevenueUsd: 1000 - index,
      observedAt: "2026-03-08T00:00:00.000Z",
    }));

    const budgeted = applyIndexGrowthPolicyBudget(candidates);
    const scheduled = budgeted.filter((item) => item.indexPolicyScheduledToday);
    const deferred = budgeted.filter((item) => !item.indexPolicyScheduledToday);

    expect(scheduled).toHaveLength(8);
    expect(
      scheduled.filter((item) => item.exchangeSlug === "binance")
    ).toHaveLength(4);
    expect(
      scheduled.filter((item) => item.exchangeSlug === "okx")
    ).toHaveLength(4);
    expect(deferred.every((item) => item.indexPolicyAllowPromotion === false)).toBe(true);
    expect(deferred[0]?.indexPolicyReason).toContain("当日发布预算已满");
  });
});
