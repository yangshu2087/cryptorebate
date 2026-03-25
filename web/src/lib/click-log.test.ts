import { describe, expect, it } from "vitest";
import { buildClickLogPayload } from "./click-log";

describe("click log payloads", () => {
  it("extracts attribution fields from the current page URL", () => {
    const payload = buildClickLogPayload(
      "exchange cta clicked",
      { content_exchange_slug: "binance" },
      {
        currentUrl:
          "https://cryptorebate.app/en/exchanges/binance/official-site?utm_source=gsc&utm_medium=organic&utm_campaign=binance-official",
        referrer: "https://www.google.com/",
        targetUrl: "https://www.binance.com/join?ref=cryptore",
        timestamp: "2026-03-25T00:00:00.000Z",
      }
    );

    expect(payload.page_url).toContain("/en/exchanges/binance/official-site");
    expect(payload.utm_source).toBe("gsc");
    expect(payload.utm_medium).toBe("organic");
    expect(payload.utm_campaign).toBe("binance-official");
    expect(payload.referrer).toBe("https://www.google.com/");
    expect(payload.target_url).toBe("https://www.binance.com/join?ref=cryptore");
    expect(payload.properties?.content_exchange_slug).toBe("binance");
  });
});
