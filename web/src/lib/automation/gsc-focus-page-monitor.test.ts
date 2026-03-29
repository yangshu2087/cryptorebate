import { describe, expect, it } from "vitest";
import {
  buildGscFocusPageRowFirstSeenAlert,
  buildGscFocusPageRowTelegramReminder,
  getGscFocusPageMonitorTargets,
  reconcileGscFocusPageRowMonitor,
} from "./gsc-focus-page-monitor";

describe("gsc-focus-page-monitor", () => {
  it("tracks first appearance for the 12 English focus pages", () => {
    const observedAt = "2026-03-29T14:00:00.000Z";
    const { entries, newlySeen } = reconcileGscFocusPageRowMonitor(
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
    expect(newlySeen[0]).toMatchObject({
      locale: "en",
      exchangeSlug: "binance",
      pageType: "referral-code",
      firstSeenAt: observedAt,
      seenInPageRows: true,
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
    expect(
      next.entries.find((entry) => entry.key === "focus-page-row:en:binance:referral-code")
    ).toMatchObject({
      firstSeenAt,
      lastSeenAt: observedAt,
      latestImpressions: 9,
      latestClicks: 1,
    });
  });

  it("builds admin alerts and telegram reminder payloads for first-seen events", () => {
    const entry = reconcileGscFocusPageRowMonitor(
      [],
      [
        {
          url: "https://cryptorebate.app/en/exchanges/okx/official-site",
          impressions: 4,
          clicks: 0,
          ctr: 0,
          position: 11.4,
        },
      ],
      "2026-03-29T14:00:00.000Z"
    ).newlySeen[0]!;

    const alert = buildGscFocusPageRowFirstSeenAlert(entry);
    const reminder = buildGscFocusPageRowTelegramReminder(entry);

    expect(alert.type).toBe("gsc_page_row_first_seen");
    expect(alert.href).toBe("https://cryptorebate.app/en/exchanges/okx/official-site");
    expect(alert.message).toContain("okx / official-site");
    expect(reminder.routePath).toBe("/exchanges/okx/official-site#gsc-page-row-first-seen");
    expect(reminder.payload.source).toBe("gsc-focus-page-row");
    expect(reminder.payload.tags).toContain("gsc-page-row-monitor");
  });

  it("defines the exact 12 monitored English focus pages", () => {
    const targets = getGscFocusPageMonitorTargets();
    expect(targets).toHaveLength(12);
    expect(targets[0]?.url).toContain("/en/exchanges/");
    expect(new Set(targets.map((target) => target.locale))).toEqual(new Set(["en"]));
  });
});
