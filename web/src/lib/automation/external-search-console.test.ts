import { describe, expect, it } from "vitest";
import { mapSearchConsoleRowsToSignals } from "./external-search-console";

describe("external-search-console", () => {
  it("maps page-based rows to automation signals", () => {
    const signals = mapSearchConsoleRowsToSignals([
      {
        keys: [
          "Binance referral code",
          "https://cryptorebate.app/en/exchanges/binance/referral-code",
        ],
        clicks: 18,
        impressions: 220,
        ctr: 0.0818,
        position: 4.3,
      },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      source: "gsc",
      locale: "en",
      exchangeSlug: "binance",
      pageType: "referral-code",
      query: "Binance referral code",
    });
  });

  it("falls back to query inference when the page dimension is missing", () => {
    const signals = mapSearchConsoleRowsToSignals([
      {
        keys: ["币安 官网"],
        clicks: 7,
        impressions: 90,
        ctr: 0.077,
        position: 6.1,
      },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0]?.exchangeSlug).toBe("binance");
    expect(signals[0]?.pageType).toBe("official-site");
    expect(signals[0]?.locale).toBe("zh");
  });
});
