
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchSearchConsolePageObservations,
  fetchSearchConsoleSignals,
  mapSearchConsoleRowsToSignals,
  normaliseSearchConsoleSitemapUrl,
} from "./external-search-console";

vi.mock("google-auth-library", () => {
  const getAccessToken = vi.fn().mockResolvedValue({ token: "test-token" });
  class JWT {
    getAccessToken = getAccessToken;
    constructor(_: unknown) {}
  }
  class OAuth2Client {
    getAccessToken = getAccessToken;
    setCredentials() {}
    constructor(_: unknown, __: unknown) {}
  }
  return { JWT, OAuth2Client, __mockedGetAccessToken: getAccessToken };
});

describe("external-search-console", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
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

  it("normalizes relative sitemap URLs before submission", () => {
    expect(normaliseSearchConsoleSitemapUrl("/sitemap.xml")).toBe(
      "https://cryptorebate.app/sitemap.xml"
    );
    expect(normaliseSearchConsoleSitemapUrl("https://cryptorebate.app/feed.xml")).toBe(
      "https://cryptorebate.app/feed.xml"
    );
    expect(normaliseSearchConsoleSitemapUrl("   ")).toBeNull();
  });

  it("falls back to page-only search analytics rows when query rows are empty", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ rows: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rows: [
              {
                keys: ["https://cryptorebate.app/"],
                clicks: 0,
                impressions: 5,
                ctr: 0,
                position: 1,
              },
              {
                keys: ["https://cryptorebate.app/en"],
                clicks: 0,
                impressions: 4,
                ctr: 0,
                position: 7,
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      );

    global.fetch = fetchMock as typeof fetch;

    const result = await fetchSearchConsoleSignals({
      enabled: true,
      property: "https://cryptorebate.app/",
      authMode: "service-account",
      submitSitemaps: true,
      startDaysAgo: 28,
      rowLimit: 1000,
      serviceAccountJson: JSON.stringify({
        client_email: "test@example.com",
        private_key: "test-private-key",
      }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.report.status).toBe("success");
    expect(result.report.rowsFetched).toBe(2);
    expect(result.report.signalsWritten).toBe(0);
    expect(result.report.note).toContain("page-only");
  });

  it("fetches exact page observations for monitored focus URLs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            rows: [
              {
                keys: ["https://cryptorebate.app/en/exchanges/binance/referral-code"],
                clicks: 1,
                impressions: 7,
                ctr: 0.142857,
                position: 6.4,
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ rows: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    global.fetch = fetchMock as typeof fetch;

    const observations = await fetchSearchConsolePageObservations(
      {
        enabled: true,
        property: "https://cryptorebate.app/",
        authMode: "service-account",
        submitSitemaps: true,
        startDaysAgo: 28,
        rowLimit: 1000,
        serviceAccountJson: JSON.stringify({
          client_email: "test@example.com",
          private_key: "test-private-key",
        }),
      },
      [
        "https://cryptorebate.app/en/exchanges/binance/referral-code",
        "https://cryptorebate.app/en/exchanges/okx/official-site",
      ]
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(observations).toEqual([
      {
        url: "https://cryptorebate.app/en/exchanges/binance/referral-code",
        clicks: 1,
        impressions: 7,
        ctr: 0.1429,
        position: 6.4,
      },
    ]);
  });
});
