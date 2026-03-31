import { describe, expect, it } from "vitest";
import {
  buildGscFocusPageMilestoneAlert,
  buildGscFocusPageMilestoneEvents,
  buildGscFocusPageMilestoneTelegramReminder,
  getGscFocusPageMonitorTargets,
  reconcileGscFocusPageRowMonitor,
  summarizeGscFocusPageRowMonitor,
} from "./gsc-focus-page-monitor";

describe("gsc-focus-page-monitor", () => {
  it("tracks first appearance for the 12 English focus pages", () => {
    const observedAt = "2026-03-29T14:00:00.000Z";
    const { entries, newlySeen, newlyImpressions, newlyClicks } = reconcileGscFocusPageRowMonitor(
      [],
      [
        {
          url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
          impressions: 5,
          clicks: 0,
          ctr: 0,
          position: 7.2,
        },
      ],
      observedAt
    );

    expect(entries).toHaveLength(12);
    expect(newlySeen).toHaveLength(1);
    expect(newlyImpressions).toHaveLength(1);
    expect(newlyClicks).toHaveLength(0);
    expect(newlySeen[0]).toMatchObject({
      locale: "en",
      exchangeSlug: "binance",
      pageType: "referral-code",
      monitoringStartedAt: observedAt,
      firstSeenAt: observedAt,
      firstImpressionAt: observedAt,
      seenInPageRows: true,
      seenInImpressions: true,
      seenInClicks: false,
      latestImpressions: 5,
    });
    expect(
      entries.filter((entry) => entry.seenInPageRows).map((entry) => entry.key)
    ).toEqual(["focus-page-row:en:binance:referral-code"]);
  });

  it("does not re-emit a page after it has already been seen once", () => {
    const firstSeenAt = "2026-03-29T14:00:00.000Z";
    const observedAt = "2026-03-30T14:00:00.000Z";
    const previous = reconcileGscFocusPageRowMonitor(
      [],
      [
        {
          url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
          impressions: 5,
          clicks: 0,
          ctr: 0,
          position: 7.2,
        },
      ],
      firstSeenAt
    ).entries;

    const next = reconcileGscFocusPageRowMonitor(
      previous,
      [
        {
          url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
          impressions: 9,
          clicks: 1,
          ctr: 0.1111,
          position: 6.5,
        },
      ],
      observedAt
    );

    expect(next.newlySeen).toHaveLength(0);
    expect(next.newlyImpressions).toHaveLength(0);
    expect(next.newlyClicks).toHaveLength(1);
    expect(
      next.entries.find((entry) => entry.key === "focus-page-row:en:binance:referral-code")
    ).toMatchObject({
      monitoringStartedAt: firstSeenAt,
      firstSeenAt,
      lastSeenAt: observedAt,
      firstImpressionAt: firstSeenAt,
      firstClickAt: observedAt,
      lastImpressionAt: observedAt,
      lastClickAt: observedAt,
      latestImpressions: 9,
      latestClicks: 1,
      seenInImpressions: true,
      seenInClicks: true,
    });
  });

  it("keeps monitoring start stable so 7/14/21 day policy windows do not reset on each sync", () => {
    const firstObservedAt = "2026-03-01T00:00:00.000Z";
    const observedAt = "2026-03-15T00:00:00.000Z";
    const previous = reconcileGscFocusPageRowMonitor([], [], firstObservedAt).entries;
    const next = reconcileGscFocusPageRowMonitor(previous, [], observedAt);
    const summary = summarizeGscFocusPageRowMonitor(next.entries);

    expect(
      next.entries.find((entry) => entry.key === "focus-page-row:en:binance:referral-code")
        ?.monitoringStartedAt
    ).toBe(firstObservedAt);
    expect(summary.monitoringStartedAt).toBe(firstObservedAt);
    expect(summary.observationDays).toBeGreaterThanOrEqual(13);
  });

  it("summarizes page-row, impression, and click milestones for the tracked seed pages", () => {
    const observedAt = "2026-03-29T14:00:00.000Z";
    const entries = reconcileGscFocusPageRowMonitor(
      [],
      [
        {
          url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
          impressions: 6,
          clicks: 0,
          ctr: 0,
          position: 7.1,
        },
        {
          url: "https://cryptorebate.app/en/exchanges/okx/official-site",
          impressions: 4,
          clicks: 2,
          ctr: 0.5,
          position: 6.2,
        },
      ],
      observedAt
    ).entries;

    const summary = summarizeGscFocusPageRowMonitor(entries);
    expect(summary.trackedCount).toBe(12);
    expect(summary.pageRowsSeen).toBe(2);
    expect(summary.impressionPagesSeen).toBe(2);
    expect(summary.clickPagesSeen).toBe(1);
  });

  it("compresses milestone notifications to the highest-signal event per page", () => {
    const observedAt = "2026-03-29T14:00:00.000Z";
    const { newlySeen, newlyImpressions, newlyClicks } = reconcileGscFocusPageRowMonitor(
      [],
      [
        {
          url: "https://cryptorebate.app/en/exchanges/okx/official-site",
          impressions: 4,
          clicks: 2,
          ctr: 0.5,
          position: 6.2,
        },
      ],
      observedAt
    );

    const events = buildGscFocusPageMilestoneEvents({
      pageRows: newlySeen,
      impressions: newlyImpressions,
      clicks: newlyClicks,
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      milestone: "click",
      entry: expect.objectContaining({
        exchangeSlug: "okx",
        pageType: "official-site",
      }),
    });
  });

  it("builds admin alerts and telegram reminder payloads for high-signal events only", () => {
    const entry = reconcileGscFocusPageRowMonitor(
      [],
      [
        {
          url: "https://cryptorebate.app/en/exchanges/okx/official-site",
          impressions: 4,
          clicks: 2,
          ctr: 0.5,
          position: 11.4,
        },
      ],
      "2026-03-29T14:00:00.000Z"
    ).entries.find((item) => item.exchangeSlug === "okx" && item.pageType === "official-site")!;

    const event = { milestone: "click" as const, entry };
    const alert = buildGscFocusPageMilestoneAlert(event);
    const reminder = buildGscFocusPageMilestoneTelegramReminder(event);

    expect(alert.type).toBe("gsc_click_first_seen");
    expect(alert.href).toBe("https://cryptorebate.app/en/exchanges/okx/official-site");
    expect(alert.message).toContain("首次拿到自然搜索 click");
    expect(reminder.routePath).toBe("/exchanges/okx/official-site#gsc-click-first-seen");
    expect(reminder.payload.source).toBe("gsc-focus-page-row");
    expect(reminder.payload.tags).toContain("milestone-click");
  });

  it("defines the exact 12 monitored English focus pages", () => {
    const targets = getGscFocusPageMonitorTargets();
    expect(targets).toHaveLength(12);
    expect(targets[0]?.url).toContain("/en/exchanges/");
    expect(new Set(targets.map((target) => target.locale))).toEqual(new Set(["en"]));
  });
});
